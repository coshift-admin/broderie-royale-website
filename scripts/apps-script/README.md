# Miroir des commandes boutique → Google Sheets

Recopie chaque commande validée sur la boutique dans une feuille Google.
Odoo ne change pas : il reçoit la commande complète comme avant. La feuille
reçoit en plus une ligne avec les quelques champs que ses en-têtes réclament.

## Pourquoi un Apps Script et pas l'API Sheets

Le storefront est **100 % statique** (Astro → `dist/`, servi par nginx) : il
n'existe aucun backend où cacher une clé. Une clé de service Google placée
dans `public/js/config.js` serait lisible par n'importe quel visiteur, qui
pourrait alors réécrire ou vider la feuille.

L'Apps Script, lui, tourne **chez Google avec les droits du propriétaire de
la feuille**. Le site ne connaît qu'une URL publique et un jeton partagé —
aucun identifiant Google ne circule côté navigateur.

Effet de bord utile : la feuille n'a **aucun lien technique avec Odoo**.

## Déploiement (une seule fois, ~3 min)

Deux chemins équivalents. Le script fonctionne pareil dans les deux cas :
`SHEET_ID` décide s'il ouvre le classeur par son ID ou prend son classeur
hôte.

**A. Projet autonome** — à privilégier quand le navigateur est connecté à
plusieurs comptes Google (`Extensions › Apps Script` tombe alors sur un
écran *« unable to open the file »* à cause de `authuser=N`) :

1. [script.google.com](https://script.google.com) → **New project**.
2. Coller le contenu de [`Code.gs`](./Code.gs).
3. Vérifier que `SHEET_ID` correspond bien au classeur visé — c'est le
   segment entre `/d/` et `/edit` dans son URL.

**B. Projet lié à la feuille** — si `Extensions › Apps Script` s'ouvre
normalement : coller le même fichier, et laisser `SHEET_ID` vide pour viser
le classeur hôte.

Puis, dans les deux cas :

4. **Déployer › Nouveau déploiement › Web app**
   - *Execute as* : **Me** (un compte ayant accès en écriture au classeur)
   - *Who has access* : **Anyone**
5. Autoriser l'accès quand Google le demande, puis copier l'URL `…/exec`.
5. La passer au conteneur du site :

   ```sh
   # .env, à côté de docker-compose.yml, sur le VPS
   BR_SHEET_URL=https://script.google.com/macros/s/AKfy…/exec
   BR_SHEET_TOKEN=<la valeur de SHARED_TOKEN dans Code.gs>
   ```

   `docker/entrypoint.sh` les injecte dans `config.js` au démarrage : changer
   l'URL ou faire tourner le jeton ne demande **aucun rebuild**.

### Vérifier avant de toucher au site

L'URL répond en GET avec un état de santé — aucune écriture :

```sh
curl -sL "https://script.google.com/macros/s/AKfy…/exec"
# {"ok":true,"version":"1.0.0","sheet":"Feuille 1",
#  "headers":["client","produit",…],"mapped":[…],"ignored":[],"rows":0}
```

`mapped` liste les colonnes reconnues, `ignored` celles qu'aucun champ ne
remplira. Si une colonne attendue apparaît dans `ignored`, ajouter son
intitulé aux `ALIASES` de `Code.gs`.

Test d'écriture :

```sh
curl -sL -X POST "https://script.google.com/macros/s/AKfy…/exec" \
  -H 'Content-Type: text/plain' \
  -d '{"token":"<SHARED_TOKEN>","order":{"commande":"TEST-1","client":"Test",
       "telephone":"0770000000","wilaya":"Alger","produit":"Essai x1",
       "amount":100,"total":100}}'
# {"ok":true,"ref":"TEST-1","row":2}   → puis supprimer la ligne à la main
```

Renvoyer le même `commande` doit répondre `{"ok":true,"duplicate":true}` sans
créer de seconde ligne.

## Piloté par les en-têtes

Le script lit la **ligne 1** et place chaque champ dans la colonne qui porte
le bon nom. Ajouter, retirer ou réordonner une colonne ne demande **aucune
modification de code**, ni ici ni sur le site.

| Champ envoyé | Intitulés reconnus (entre autres) |
|---|---|
| `date` | Date, Jour — *horodatage posé par le serveur* |
| `commande` | Commande, N° Commande, Référence, Facture |
| `client` | Client, Nom, Nom client |
| `telephone` | Téléphone, Tel, Mobile, GSM |
| `wilaya` | Wilaya, Région, Ville |
| `adresse` | Adresse, Lieu |
| `produit` | Produit, Articles, Désignation, Détails |
| `amount` | Montant, Sous-total, Prix |
| `livraison` | Livraison, Frais, Transport |
| `total` | Total, Total TTC, Net à payer |
| `paiement` | Paiement, Mode de paiement |

La comparaison ignore casse, accents, espaces et ponctuation : `N° COMMANDE`,
`n_commande` et `ncommande` sont équivalents. Les intitulés arabes courants
sont également reconnus. Une colonne inconnue est laissée intacte — pratique
pour une colonne tenue à la main.

Les montants partent en nombres, pas en texte : la feuille peut les sommer.
`date` vient du serveur Google (fuseau de la feuille), donc non falsifiable
depuis le navigateur.

## Garanties

- **La commande n'est jamais cassée.** Odoo reste la source de vérité ;
  l'appel au miroir est isolé et silencieux. Une panne Google, un antivirus
  ou un réseau coupé n'ont aucun effet visible pour le client.
- **Aucune commande perdue.** Chaque commande part d'abord dans une file
  `localStorage` et n'en sort qu'après confirmation du serveur. Les échecs
  sont rejoués à la visite suivante, ou dès le retour du réseau.
- **Aucun doublon.** La référence Odoo sert de clé : l'Apps Script ignore une
  référence déjà écrite, donc un rejeu est sans danger. Les références vues
  sont gardées dans les propriétés du script, pas dans la feuille.
- **Écritures sérialisées.** `LockService` évite que deux commandes
  simultanées visent la même ligne.
- **Désactivable.** `BR_SHEET_URL` vide ⇒ le miroir est entièrement inerte.
  Le site peut donc être déployé avant que la feuille existe.

## Le jeton n'est pas un secret

`BR_SHEET_TOKEN` finit dans le JavaScript public, comme `apiKey`. C'est un
filtre anti-spam, pas une protection. Quelqu'un qui lit le code du site peut
poster des lignes. Le risque reste borné : la feuille n'expose rien en
lecture, l'Apps Script n'écrit qu'une ligne par appel, et la déduplication
empêche le gonflage par rejeu. Pour remonter le niveau, faire tourner le
jeton (`SHARED_TOKEN` + `BR_SHEET_TOKEN`, redémarrage du conteneur, pas de
rebuild).

## CSP

`connect-src` doit autoriser `https://script.google.com` **et**
`https://script.googleusercontent.com` — une URL `/exec` redirige vers le
second domaine. Déjà en place aux deux endroits qui comptent :
`src/layouts/BaseLayout.astro` (le `<meta>`) et `docker/nginx.conf` (`$csp`,
l'en-tête qui fait autorité). Sans les deux, l'écriture échoue **en silence**.

## Tests

```sh
npm test
```

Rejoue la logique de l'Apps Script contre des doublures des services Google,
et celle du navigateur contre des doublures de `localStorage` / `fetch` :
mappage des en-têtes, déduplication, jeton refusé, feuille vide, hors ligne,
quota `localStorage`, et la commande validée pendant un rejeu.
