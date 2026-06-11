/* ============================================================
   i18n — FR (primary) · AR (RTL) · EN
   Every visible string keyed; switching flips dir + fonts.
   ============================================================ */
var I18N = {
  // ---- nav ----
  "nav.maison":   { fr: "La Maison",   ar: "الدار",        en: "The House" },
  "nav.geste":    { fr: "Le Geste",    ar: "الحرفة",       en: "The Craft" },
  "nav.metiers":  { fr: "Les Métiers", ar: "المهن",        en: "Crafts" },
  "nav.drapeau":  { fr: "Le Drapeau",  ar: "العَلَم",       en: "The Flag" },
  "nav.references":{ fr: "Références",  ar: "مراجعنا",      en: "References" },
  "nav.catalogue":{ fr: "Catalogue",   ar: "الكتالوج",     en: "Catalogue" },

  // ---- overture ----
  "ov.line": { fr: "MAISON DU DRAPEAU · DEPUIS 1986", ar: "دار العَلَم · منذ 1986", en: "HOUSE OF THE FLAG · SINCE 1986" },

  // ---- hero ----
  "hero.eyebrow": { fr: "MAISON DU DRAPEAU · DEPUIS 1986", ar: "دار العَلَم · منذ 1986", en: "HOUSE OF THE FLAG · SINCE 1986" },
  "hero.title": {
    fr: "Nous brodons l’âme <em>d’une Nation.</em>",
    ar: "نُطرّز <em>روح الأمّة.</em>",
    en: "We embroider the soul <em>of a Nation.</em>"
  },
  "hero.sub": {
    fr: "Communication visuelle par le textile de haute qualité. Drapeaux, écussons et broderie d’exception — signés à Alger depuis près de quarante ans.",
    ar: "تواصل بصري عبر النسيج الفاخر. أعلام وشارات وتطريز استثنائي — يُصنع في الجزائر منذ ما يقارب أربعين عامًا.",
    en: "Visual communication through high-quality textile. Flags, crests and exceptional embroidery — crafted in Algiers for nearly forty years."
  },
  "hero.scroll": { fr: "Suivez le fil", ar: "تتبّع الخيط", en: "Follow the thread" },

  // ---- heritage ----
  "her.num":   { fr: "I — La Maison",  ar: "١ — الدار",   en: "I — The House" },
  "her.title": { fr: "Une maison familiale de référence.", ar: "دارٌ عائلية مرجعية.", en: "A family house of reference." },
  "her.body": {
    fr: "Depuis 1986, Broderie Royale Algérie cultive un savoir-faire rare : donner aux institutions, aux corps constitués et aux marques une identité textile durable, conçue pour marquer les esprits.",
    ar: "منذ عام 1986، تصون الطرز الملكي الجزائري حرفةً نادرة: منح المؤسسات والهيئات الرسمية والعلامات هويةً نسيجيةً دائمة، صُمّمت لتبقى في الأذهان.",
    en: "Since 1986, Broderie Royale Algérie has cultivated a rare savoir-faire: giving institutions, official bodies and brands a lasting textile identity, designed to leave a mark."
  },
  "her.v1": { fr: "Excellence", ar: "تميّز",   en: "Excellence" },
  "her.v2": { fr: "Précision",  ar: "دقّة",    en: "Precision" },
  "her.v3": { fr: "Tradition",  ar: "أصالة",   en: "Tradition" },
  "her.v4": { fr: "Prestige",   ar: "رِفعة",   en: "Prestige" },
  "her.s1n": { fr: "1986", ar: "1986", en: "1986" },
  "her.s1l": { fr: "L’année fondatrice", ar: "عام التأسيس", en: "The founding year" },
  "her.s2n": { fr: "≈ 40", ar: "≈ 40", en: "≈ 40" },
  "her.s2l": { fr: "Années de savoir-faire", ar: "عامًا من الخبرة", en: "Years of savoir-faire" },
  "her.s3n": { fr: "2", ar: "2", en: "2" },
  "her.s3l": { fr: "Maisons — Alger & Djelfa", ar: "داران — الجزائر والجلفة", en: "Showrooms — Algiers & Djelfa" },

  // ---- atelier ----
  "at.num":   { fr: "II — Le Geste", ar: "٢ — الحرفة", en: "II — The Craft" },
  "at.title": { fr: "Le fil, l’aiguille, la main.", ar: "الخيط، الإبرة، اليد.", en: "The thread, the needle, the hand." },
  "at.body": {
    fr: "Chaque écusson naît d’un geste précis, répété des milliers de fois. Le fil d’or épouse le tissu, point après point, jusqu’à révéler la couronne. La broderie est notre signature ; le détail, notre obsession.",
    ar: "تُولد كل شارة من حركةٍ دقيقة، تتكرّر آلاف المرّات. يعانق الخيط الذهبي النسيج، غرزةً بعد غرزة، حتى يكشف التاج. التطريز توقيعنا، والتفصيل هَوَسُنا.",
    en: "Every crest is born of a precise gesture, repeated thousands of times. Gold thread embraces the cloth, stitch after stitch, until the crown appears. Embroidery is our signature; detail, our obsession."
  },
  "at.cap": { fr: "Broderie machine multi-têtes — Atelier d’Alger", ar: "تطريز آلي متعدد الرؤوس — مشغل الجزائر", en: "Multi-head machine embroidery — Algiers atelier" },

  // ---- metiers ----
  "me.num":   { fr: "III — Les Métiers", ar: "٣ — المهن", en: "III — The Crafts" },
  "me.title": { fr: "Six métiers, une exigence.", ar: "ستّ مهنٍ،<br>معيارٌ واحد.", en: "Six crafts, one standard." },
  "me.sub":   { fr: "Faites glisser pour explorer.", ar: "اسحب للاستكشاف.", en: "Drag to explore." },
  "me.1n": { fr: "Drapeaux", ar: "الأعلام", en: "Flags" },
  "me.1d": { fr: "Drapeaux nationaux, internationaux, de table et de mât, sur supports haute résistance.", ar: "أعلام وطنية ودولية، مكتبية وعلى السواري، على دعائم عالية المتانة.", en: "National, international, table and mast flags on high-resistance supports." },
  "me.2n": { fr: "Écussons", ar: "الشارات", en: "Crests" },
  "me.2d": { fr: "Patches et insignes brodés, fil d’or sur tissu, pour corps et clubs.", ar: "شاراتٌ وأوسمةٌ مطرّزة، خيطٌ ذهبي على القماش، للهيئات والأندية.", en: "Embroidered patches and insignia, gold thread on cloth, for corps and clubs." },
  "me.3n": { fr: "Fanions", ar: "الرايات", en: "Pennants" },
  "me.3d": { fr: "Fanions cérémoniels et décoratifs, frange dorée, finition main.", ar: "راياتٌ احتفالية وزخرفية، شراريب ذهبية، تشطيبٌ يدوي.", en: "Ceremonial and decorative pennants, gold fringe, hand-finished." },
  "me.4n": { fr: "Broderie", ar: "التطريز", en: "Embroidery" },
  "me.4d": { fr: "Personnalisation premium : polos, t-shirts, casquettes et vêtements de travail.", ar: "تخصيصٌ فاخر: قمصان بولو، تيشيرتات، قبعات وملابس العمل.", en: "Premium personalisation: polos, t-shirts, caps and workwear." },
  "me.5n": { fr: "Impression polyester", ar: "طباعة البوليستر", en: "Polyester printing" },
  "me.5d": { fr: "Impression numérique sur tissu polyester, couleurs éclatantes et tenue durable.", ar: "طباعة رقمية على نسيج البوليستر، ألوانٌ زاهية وثباتٌ دائم.", en: "Digital printing on polyester fabric, vivid colours and lasting hold." },
  "me.6n": { fr: "Impression coton", ar: "طباعة القطن", en: "Cotton printing" },
  "me.6d": { fr: "Impression numérique sur tissu coton, douceur et précision du détail.", ar: "طباعة رقمية على نسيج القطن، نعومةٌ ودقّةٌ في التفاصيل.", en: "Digital printing on cotton fabric, softness and fine detail." },

  // ---- flag ----
  "fl.num":   { fr: "IV — Le Drapeau", ar: "٤ — العَلَم", en: "IV — The Flag" },
  "fl.quote": {
    fr: "Du salon d’honneur à la tribune officielle, nos drapeaux portent <em>haut les couleurs.</em>",
    ar: "من قاعة الشرف إلى المنصّة الرسمية، تحمل أعلامنا <em>الألوان عاليًا.</em>",
    en: "From the hall of honour to the official tribune, our flags carry <em>the colours high.</em>"
  },
  "fl.body": {
    fr: "Conception et fabrication de drapeaux institutionnels, événementiels et publicitaires. La Maison du Drapeau, au service de la Nation.",
    ar: "تصميم وصناعة الأعلام المؤسسية والاحتفالية والإعلانية. دار العَلَم، في خدمة الوطن.",
    en: "Design and manufacture of institutional, event and advertising flags. The House of the Flag, in service of the Nation."
  },

  // ---- prestige ----
  "pr.num":   { fr: "V — La Confiance", ar: "٥ — الثقة", en: "V — Trust" },
  "pr.title": { fr: "Ils nous ont fait confiance.", ar: "وضعوا ثقتهم فينا.", en: "They placed their trust in us." },
  "pr.lead":  { fr: "Des commandes officielles et de grande envergure, portées par la même exigence.", ar: "طلباتٌ رسمية وكبرى، تحملها العناية نفسها.", en: "Official, large-scale commissions, carried by the same exacting standard." },
  "pr.1n": { fr: "XVIIᵉ Conférence ministérielle du Mouvement des Non-Alignés", ar: "المؤتمر الوزاري السابع عشر لحركة عدم الانحياز", en: "XVII Ministerial Conference of the Non-Aligned Movement" },
  "pr.1p": { fr: "Palais des Nations · Club des Pins", ar: "قصر الأمم · نادي الصنوبر", en: "Palais des Nations · Club des Pins" },
  "pr.2n": { fr: "Algerian Scholar Award", ar: "جائزة الباحث الجزائري", en: "Algerian Scholar Award" },
  "pr.2p": { fr: "Distinction nationale", ar: "تكريم وطني", en: "National distinction" },
  "pr.3n": { fr: "Finale de la Coupe d’Algérie", ar: "نهائي كأس الجزائر", en: "Algerian Cup Final" },
  "pr.3p": { fr: "Football national", ar: "كرة القدم الوطنية", en: "National football" },
  "pr.4n": { fr: "Journée de l’Afrique", ar: "يوم إفريقيا", en: "Africa Day" },
  "pr.4p": { fr: "Célébration continentale", ar: "احتفال قارّي", en: "Continental celebration" },
  "pr.5n": { fr: "Salon International de l’Automobile", ar: "المعرض الدولي للسيارات", en: "International Automobile Salon" },
  "pr.5p": { fr: "Alger", ar: "الجزائر", en: "Algiers" },

  // ---- serve ----
  "sv.num":   { fr: "VI — Au Service de", ar: "٦ — في خدمة", en: "VI — In Service Of" },
  "sv.title": { fr: "Au service de ceux qui représentent.", ar: "في خدمة من يُمثّلون.", en: "In service of those who represent." },
  "sv.1": { fr: "Corps constitués & institutions de l’État", ar: "الهيئات الرسمية ومؤسسات الدولة", en: "Constituted bodies & State institutions" },
  "sv.2": { fr: "Collectivités locales", ar: "الجماعات المحلية", en: "Local authorities" },
  "sv.3": { fr: "Sociétés de sécurité & de gardiennage", ar: "شركات الأمن والحراسة", en: "Security & guarding companies" },
  "sv.4": { fr: "Hôtels & restaurants", ar: "الفنادق والمطاعم", en: "Hotels & restaurants" },
  "sv.5": { fr: "Clubs sportifs", ar: "الأندية الرياضية", en: "Sports clubs" },
  "sv.6": { fr: "Particuliers", ar: "الأفراد", en: "Private individuals" },

  // ---- catalogue / contact ----
  "ca.num":   { fr: "VII — Le Catalogue", ar: "٧ — الكتالوج", en: "VII — The Catalogue" },
  "ca.title": { fr: "Explorez le catalogue.", ar: "اكتشف الكتالوج.", en: "Explore the catalogue." },
  "ca.lead":  { fr: "Six familles de produits, un seul niveau d’exigence. Donnez à votre identité une visibilité d’exception.", ar: "ستّ عائلات من المنتجات، مستوى واحد من الإتقان. امنح هويتك حضورًا استثنائيًا.", en: "Six product families, one standard of excellence. Give your identity exceptional visibility." },
  "ca.cta":   { fr: "Explorer le catalogue", ar: "تصفّح الكتالوج", en: "Explore the catalogue" },

  "ms.alger.l": { fr: "Showroom principal", ar: "صالة العرض الرئيسية", en: "Main showroom" },
  "ms.alger.t": { fr: "Alger", ar: "الجزائر", en: "Algiers" },
  "ms.djelfa.l": { fr: "Showroom", ar: "صالة العرض", en: "Showroom" },
  "ms.djelfa.t": { fr: "Djelfa", ar: "الجلفة", en: "Djelfa" },

  "fb.tag": { fr: "Maison du Drapeau · depuis 1986", ar: "دار العَلَم · منذ 1986", en: "House of the Flag · since 1986" },
  "fb.legal": { fr: "© Broderie Royale Algérie — Tous droits réservés.", ar: "© الطرز الملكي الجزائري — جميع الحقوق محفوظة.", en: "© Broderie Royale Algérie — All rights reserved." },
  "fb.credit": { fr: "Conçu & développé par", ar: "تصميم وتطوير", en: "Designed & developed by" },

  // ============ SHOP ============
  "nav.boutique": { fr: "Boutique", ar: "المتجر", en: "Boutique" },
  "nav.histoire": { fr: "L’Histoire", ar: "الحكاية", en: "The Story" },
  "nav.panier":   { fr: "Panier",   ar: "السلة",   en: "Cart" },

  "bo.eyebrow": { fr: "BOUTIQUE EN LIGNE · MAISON DU DRAPEAU", ar: "متجر إلكتروني · دار العَلَم", en: "ONLINE BOUTIQUE · HOUSE OF THE FLAG" },
  "bo.title":   { fr: "La Boutique Royale.", ar: "المتجر الملكي.", en: "The Royal Boutique." },
  "bo.sub":     { fr: "Drapeaux, écussons et broderie d’exception, livrés chez vous. Paiement à la livraison, partout en Algérie.", ar: "أعلام وشارات وتطريز استثنائي، يصلكم إلى باب منزلكم. الدفع عند الاستلام، في كامل الجزائر.", en: "Exceptional flags, crests and embroidery, delivered to you. Cash on delivery, everywhere in Algeria." },
  "bo.all":     { fr: "Tout", ar: "الكل", en: "All" },
  "bo.count":   { fr: "produits", ar: "منتجات", en: "products" },
  "bo.empty":   { fr: "Aucun produit dans cette catégorie.", ar: "لا توجد منتجات في هذه الفئة.", en: "No products in this category." },

  "shop.add":     { fr: "Ajouter au panier", ar: "أضف إلى السلة", en: "Add to cart" },
  "shop.added":   { fr: "Ajouté ✓", ar: "أُضيف ✓", en: "Added ✓" },
  "shop.view":    { fr: "Voir le produit", ar: "عرض المنتج", en: "View product" },
  "shop.from":    { fr: "à partir de", ar: "ابتداءً من", en: "from" },

  "pd.back":      { fr: "← Retour à la boutique", ar: "→ العودة إلى المتجر", en: "← Back to boutique" },
  "pd.ref":       { fr: "Référence", ar: "المرجع", en: "Reference" },
  "pd.desc":      { fr: "Description", ar: "الوصف", en: "Description" },
  "pd.options":   { fr: "Options", ar: "الخيارات", en: "Options" },
  "pd.qty":       { fr: "Quantité", ar: "الكمية", en: "Quantity" },
  "pd.addcart":   { fr: "Ajouter au panier", ar: "أضف إلى السلة", en: "Add to cart" },
  "pd.buy":       { fr: "Commander maintenant", ar: "اطلب الآن", en: "Order now" },
  "pd.delivery":  { fr: "Paiement à la livraison", ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  "pd.deliverysub": { fr: "Réglez en espèces à la réception. Livraison partout en Algérie.", ar: "ادفع نقدًا عند الاستلام. التوصيل في كامل الجزائر.", en: "Pay in cash on receipt. Delivery everywhere in Algeria." },
  "pd.related":   { fr: "Vous aimerez aussi", ar: "قد يعجبك أيضًا", en: "You may also like" },
  "pd.notfound":  { fr: "Produit introuvable.", ar: "المنتج غير موجود.", en: "Product not found." },

  "pa.eyebrow":   { fr: "VOTRE COMMANDE", ar: "طلبكم", en: "YOUR ORDER" },
  "pa.title":     { fr: "Votre Panier", ar: "سلّتكم", en: "Your Cart" },
  "pa.empty":     { fr: "Votre panier est vide.", ar: "سلّتكم فارغة.", en: "Your cart is empty." },
  "pa.continue":  { fr: "Continuer mes achats", ar: "متابعة التسوّق", en: "Continue shopping" },
  "pa.remove":    { fr: "Retirer", ar: "إزالة", en: "Remove" },
  "pa.summary":   { fr: "Récapitulatif", ar: "الملخّص", en: "Summary" },
  "pa.subtotal":  { fr: "Sous-total", ar: "المجموع الفرعي", en: "Subtotal" },
  "pa.delivery":  { fr: "Livraison", ar: "التوصيل", en: "Delivery" },
  "pa.total":     { fr: "Total", ar: "المجموع", en: "Total" },
  "pa.checkout":  { fr: "Passer la commande", ar: "إتمام الطلب", en: "Proceed to checkout" },
  "pa.payinfo":   { fr: "Paiement à la livraison uniquement", ar: "الدفع عند الاستلام فقط", en: "Cash on delivery only" },

  "co.eyebrow":   { fr: "FINALISER", ar: "إتمام الطلب", en: "CHECKOUT" },
  "co.title":     { fr: "Vos coordonnées", ar: "معلوماتكم", en: "Your details" },
  "co.sub":       { fr: "Nous vous appelons pour confirmer avant l’expédition.", ar: "سنتّصل بكم للتأكيد قبل الإرسال.", en: "We call you to confirm before dispatch." },
  "co.name":      { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  "co.phone":     { fr: "Téléphone", ar: "الهاتف", en: "Phone" },
  "co.wilaya":    { fr: "Wilaya", ar: "الولاية", en: "Wilaya" },
  "co.wilayaph":  { fr: "Choisir une wilaya", ar: "اختر ولاية", en: "Select a wilaya" },
  "co.commune":   { fr: "Commune", ar: "البلدية", en: "Commune" },
  "co.address":   { fr: "Adresse de livraison", ar: "عنوان التوصيل", en: "Delivery address" },
  "co.notes":     { fr: "Notes (optionnel)", ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  "co.payment":   { fr: "Mode de paiement", ar: "طريقة الدفع", en: "Payment method" },
  "co.cod":       { fr: "Paiement à la livraison", ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  "co.codsub":    { fr: "En espèces, à la réception de votre commande.", ar: "نقدًا، عند استلام طلبكم.", en: "In cash, upon receiving your order." },
  "co.online":    { fr: "Paiement en ligne", ar: "الدفع الإلكتروني", en: "Online payment" },
  "co.soon":      { fr: "Bientôt disponible", ar: "قريبًا", en: "Coming soon" },
  "co.summary":   { fr: "Votre commande", ar: "طلبكم", en: "Your order" },
  "co.confirm":   { fr: "Confirmer la commande", ar: "تأكيد الطلب", en: "Confirm order" },
  "co.required":  { fr: "Merci de remplir les champs requis.", ar: "يرجى ملء الحقول المطلوبة.", en: "Please fill the required fields." },
  "co.qty":       { fr: "Qté", ar: "الكمية", en: "Qty" },

  "cf.title":     { fr: "Merci pour votre commande !", ar: "شكرًا على طلبكم!", en: "Thank you for your order!" },
  "cf.msg":       { fr: "Votre commande a bien été enregistrée. Notre équipe vous contactera très prochainement pour la confirmer.", ar: "تم تسجيل طلبكم بنجاح. سيتواصل معكم فريقنا قريبًا جدًا للتأكيد.", en: "Your order has been registered. Our team will contact you very soon to confirm it." },
  "cf.order":     { fr: "N° de commande", ar: "رقم الطلب", en: "Order number" },
  "cf.pay":       { fr: "Paiement à la livraison", ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  "cf.total":     { fr: "Total à régler", ar: "المبلغ الإجمالي", en: "Total due" },
  "cf.backshop":  { fr: "Retour à la boutique", ar: "العودة إلى المتجر", en: "Back to boutique" },
  "cf.home":      { fr: "Retour à l’accueil", ar: "العودة إلى الرئيسية", en: "Back home" },

  // ============ CONTACT ============
  "nav.contact": { fr: "Contact", ar: "اتصل بنا", en: "Contact" },
  "ct.eyebrow":  { fr: "NOUS CONTACTER · MAISON DU DRAPEAU", ar: "تواصلوا معنا · دار العَلَم", en: "GET IN TOUCH · HOUSE OF THE FLAG" },
  "ct.title":    { fr: "Parlons de votre projet.", ar: "لنتحدّث عن مشروعكم.", en: "Let’s talk about your project." },
  "ct.sub":      { fr: "Une commande, un devis ou une simple question — écrivez-nous, nous vous répondrons rapidement.", ar: "طلب، تسعيرة أو مجرّد سؤال — راسلونا وسنردّ عليكم سريعًا.", en: "An order, a quote, or simply a question — write to us and we’ll reply promptly." },
  "ct.tab_devis":   { fr: "Demander un devis", ar: "طلب عرض سعر", en: "Request a quote" },
  "ct.tab_message": { fr: "Nous écrire", ar: "راسلونا", en: "Write to us" },
  "ct.form_h":   { fr: "Envoyez-nous un message", ar: "أرسلوا لنا رسالة", en: "Send us a message" },
  "ct.name":     { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  "ct.phone":    { fr: "Téléphone", ar: "الهاتف", en: "Phone" },
  "ct.email":    { fr: "Email", ar: "البريد الإلكتروني", en: "Email" },
  "ct.message":  { fr: "Votre message", ar: "رسالتكم", en: "Your message" },
  "ct.send":     { fr: "Envoyer le message", ar: "إرسال الرسالة", en: "Send message" },
  "ct.required": { fr: "Merci de remplir les champs requis.", ar: "يرجى ملء الحقول المطلوبة.", en: "Please fill the required fields." },
  "ct.sent_h":   { fr: "Message envoyé.", ar: "تم إرسال الرسالة.", en: "Message sent." },
  "ct.sent_p":   { fr: "Merci de nous avoir écrit. Notre équipe vous répondra très prochainement.", ar: "شكرًا لمراسلتكم. سيردّ عليكم فريقنا قريبًا جدًا.", en: "Thank you for writing. Our team will get back to you very soon." },
  "ct.coords":   { fr: "Nos coordonnées", ar: "بيانات التواصل", en: "Our details" },
  "ct.alger":    { fr: "Showroom Alger", ar: "صالة العرض — الجزائر", en: "Showroom Algiers" },
  "ct.djelfa":   { fr: "Showroom Djelfa", ar: "صالة العرض — الجلفة", en: "Showroom Djelfa" },
  "ct.phones":   { fr: "Téléphones", ar: "الهواتف", en: "Telephones" },
  "ct.messaging":{ fr: "Mobile · Viber · WeChat · WhatsApp", ar: "موبايل · فايبر · وي‌شات · واتساب", en: "Mobile · Viber · WeChat · WhatsApp" },
  "ct.svc_print":{ fr: "Service print & drapeaux", ar: "خدمة الطباعة والأعلام", en: "Print & flags service" },
  "ct.svc_brod": { fr: "Service broderie", ar: "خدمة التطريز", en: "Embroidery service" },
  "ct.svc_bill": { fr: "Service facturation", ar: "خدمة الفوترة", en: "Billing service" },
  "ct.services": { fr: "Services dédiés", ar: "خدمات مخصّصة", en: "Dedicated services" },
  "ct.map_eyebrow": { fr: "DEUX MAISONS", ar: "داران", en: "TWO HOUSES" },
  "ct.map_title":{ fr: "Alger & Aïn Ouessara.", ar: "الجزائر وعين وسارة.", en: "Algiers & Aïn Ouessara." },
  "ct.map_sub":  { fr: "Deux ateliers, une même exigence — au cœur de l’Algérie.", ar: "مشغلان، معيارٌ واحد — في قلب الجزائر.", en: "Two ateliers, one standard — at the heart of Algeria." },

  // ============ NAV (added) ============
  "nav.galerie": { fr: "Galerie", ar: "المعرض", en: "Gallery" },
  "nav.devis":   { fr: "Devis", ar: "طلب عرض", en: "Quote" },

  // ============ PARTNERS (homepage band) ============
  "pt.eyebrow": { fr: "PARTENAIRES & RÉFÉRENCES", ar: "شركاء ومراجع", en: "PARTNERS & REFERENCES" },
  "pt.title":   { fr: "La confiance des institutions.", ar: "ثقة المؤسسات.", en: "Trusted by institutions." },
  "pt.sub":     { fr: "Corps constitués, collectivités, clubs et grandes marques nous confient leur image depuis près de quarante ans.", ar: "الهيئات الرسمية والجماعات والأندية والعلامات الكبرى تأتمننا على صورتها منذ ما يقارب أربعين عامًا.", en: "Constituted bodies, authorities, clubs and major brands have entrusted us with their image for nearly forty years." },

  // ============ TESTIMONIALS ============
  "ts.eyebrow": { fr: "TÉMOIGNAGES", ar: "شهادات", en: "TESTIMONIALS" },
  "ts.title":   { fr: "La voix de nos clients.", ar: "صوت عملائنا.", en: "The voice of our clients." },
  "ts.sub":     { fr: "Quelques retours de ceux qui nous ont confié leur identité textile.", ar: "مختارات من آراء من ائتمنونا على هويتهم النسيجية.", en: "A few words from those who entrusted us with their textile identity." },

  // ============ FAQ ============
  "fq.eyebrow": { fr: "QUESTIONS FRÉQUENTES", ar: "الأسئلة المتكرّرة", en: "FREQUENTLY ASKED" },
  "fq.title":   { fr: "Bon à savoir.", ar: "ما ينبغي معرفته.", en: "Good to know." },
  "fq.sub":     { fr: "Les réponses aux questions que l’on nous pose le plus souvent.", ar: "إجابات على الأسئلة التي تُطرح علينا أكثر من غيرها.", en: "Answers to the questions we’re asked most often." },

  // ============ GALERIE ============
  "ga.eyebrow": { fr: "RÉALISATIONS · MAISON DU DRAPEAU", ar: "إنجازات · دار العَلَم", en: "REALISATIONS · HOUSE OF THE FLAG" },
  "ga.title":   { fr: "La Galerie.", ar: "المعرض.", en: "The Gallery." },
  "ga.sub":     { fr: "Une sélection de commandes officielles, d’écussons brodés et de drapeaux d’exception, signés de notre fil d’or.", ar: "مختارات من الطلبات الرسمية والشارات المطرّزة والأعلام الاستثنائية، موقّعة بخيطنا الذهبي.", en: "A selection of official commissions, embroidered crests and exceptional flags, signed with our golden thread." },
  "ga.all":     { fr: "Tout", ar: "الكل", en: "All" },
  "ga.f_flags": { fr: "Drapeaux", ar: "الأعلام", en: "Flags" },
  "ga.f_crest": { fr: "Écussons", ar: "الشارات", en: "Crests" },
  "ga.f_event": { fr: "Événements", ar: "الفعاليات", en: "Events" },
  "ga.f_brod":  { fr: "Broderie", ar: "التطريز", en: "Embroidery" },
  "ga.cta_h":   { fr: "Un projet sur-mesure ?", ar: "مشروع حسب الطلب؟", en: "A bespoke project?" },
  "ga.cta_p":   { fr: "Confiez-nous votre identité textile. Demandez un devis personnalisé.", ar: "ائتمنونا على هويتكم النسيجية. اطلبوا عرض سعر مخصّصًا.", en: "Entrust us with your textile identity. Request a tailored quote." },
  "ga.g1": { fr: "Drapeau national de cérémonie", ar: "علم وطني للمراسم", en: "National ceremonial flag" },
  "ga.g2": { fr: "Écusson brodé fil d’or", ar: "شارة مطرّزة بخيط ذهبي", en: "Gold-thread embroidered crest" },
  "ga.g3": { fr: "Mouvement des Non-Alignés", ar: "حركة عدم الانحياز", en: "Non-Aligned Movement" },
  "ga.g4": { fr: "Fanion cérémoniel", ar: "راية احتفالية", en: "Ceremonial pennant" },
  "ga.g5": { fr: "Broderie corporate premium", ar: "تطريز مؤسسي فاخر", en: "Premium corporate embroidery" },
  "ga.g6": { fr: "Drapeaux internationaux", ar: "أعلام دولية", en: "International flags" },
  "ga.g7": { fr: "Coupe d’Algérie — finale", ar: "كأس الجزائر — النهائي", en: "Algerian Cup — final" },
  "ga.g8": { fr: "Insigne de corps constitué", ar: "وسام هيئة رسمية", en: "Constituted-body insignia" },
  "ga.g9": { fr: "Drapeau de mât institutionnel", ar: "علم سارية مؤسسي", en: "Institutional mast flag" },

  // ============ DEVIS (custom quote) ============
  "dv.eyebrow": { fr: "DEVIS SUR-MESURE", ar: "عرض سعر حسب الطلب", en: "BESPOKE QUOTE" },
  "dv.title":   { fr: "Demandez votre devis.", ar: "اطلبوا عرض سعركم.", en: "Request your quote." },
  "dv.sub":     { fr: "Pour les commandes institutionnelles, les grandes quantités et les pièces entièrement personnalisées, la boutique ne suffit pas — parlons de votre projet.", ar: "للطلبات المؤسسية والكميات الكبيرة والقطع المخصّصة بالكامل، لا يكفي المتجر — لنتحدّث عن مشروعكم.", en: "For institutional orders, large quantities and fully bespoke pieces, the boutique isn’t enough — let’s talk about your project." },
  "dv.why_h":   { fr: "Pourquoi un devis ?", ar: "لماذا عرض سعر؟", en: "Why a quote?" },
  "dv.why1":    { fr: "Grandes quantités à tarif dégressif", ar: "كميات كبيرة بسعر تنازلي", en: "Large quantities at degressive pricing" },
  "dv.why2":    { fr: "Conception entièrement personnalisée", ar: "تصميم مخصّص بالكامل", en: "Fully bespoke design" },
  "dv.why3":    { fr: "Accompagnement & validation d’épreuve", ar: "مرافقة والتحقق من العيّنة", en: "Guidance & proof validation" },
  "dv.step":    { fr: "Étape", ar: "خطوة", en: "Step" },
  "dv.s1":      { fr: "Le produit", ar: "المنتج", en: "The product" },
  "dv.s2":      { fr: "Les détails", ar: "التفاصيل", en: "The details" },
  "dv.s3":      { fr: "Vos coordonnées", ar: "معلوماتكم", en: "Your details" },
  "dv.product": { fr: "Type de produit", ar: "نوع المنتج", en: "Product type" },
  "dv.qty":     { fr: "Quantité estimée", ar: "الكمية المقدّرة", en: "Estimated quantity" },
  "dv.branding":{ fr: "Personnalisation souhaitée", ar: "التخصيص المطلوب", en: "Desired customisation" },
  "dv.branding_ph": { fr: "Logo, texte, couleurs, emplacement de la broderie…", ar: "شعار، نص، ألوان، موضع التطريز…", en: "Logo, text, colours, embroidery placement…" },
  "dv.deadline":{ fr: "Échéance souhaitée", ar: "الأجل المطلوب", en: "Desired deadline" },
  "dv.name":    { fr: "Nom / Organisation", ar: "الاسم / المؤسسة", en: "Name / Organisation" },
  "dv.phone":   { fr: "Téléphone", ar: "الهاتف", en: "Phone" },
  "dv.email":   { fr: "Email", ar: "البريد الإلكتروني", en: "Email" },
  "dv.next":    { fr: "Continuer", ar: "متابعة", en: "Continue" },
  "dv.back":    { fr: "Retour", ar: "رجوع", en: "Back" },
  "dv.submit":  { fr: "Envoyer la demande", ar: "إرسال الطلب", en: "Send request" },
  "dv.required":{ fr: "Merci de compléter cette étape.", ar: "يرجى إكمال هذه الخطوة.", en: "Please complete this step." },
  "dv.sent_h":  { fr: "Demande envoyée.", ar: "تم إرسال الطلب.", en: "Request sent." },
  "dv.sent_p":  { fr: "Merci. Notre équipe étudie votre projet et vous recontacte avec une proposition sur-mesure.", ar: "شكرًا. يدرس فريقنا مشروعكم ويعاود الاتصال بكم بعرض مخصّص.", en: "Thank you. Our team is studying your project and will return to you with a bespoke proposal." },
  "dv.opt_flags":{ fr: "Drapeaux", ar: "أعلام", en: "Flags" },
  "dv.opt_crest":{ fr: "Écussons brodés", ar: "شارات مطرّزة", en: "Embroidered crests" },
  "dv.opt_pennant":{ fr: "Fanions", ar: "رايات", en: "Pennants" },
  "dv.opt_apparel":{ fr: "Broderie textile", ar: "تطريز نسيجي", en: "Apparel embroidery" },
  "dv.opt_print":{ fr: "Impression", ar: "طباعة", en: "Printing" },
  "dv.opt_other":{ fr: "Autre", ar: "أخرى", en: "Other" },

  // ============ 404 ============
  "nf.code":   { fr: "404", ar: "404", en: "404" },
  "nf.title":  { fr: "Cette page s’est égarée.", ar: "هذه الصفحة ضلّت الطريق.", en: "This page has lost its thread." },
  "nf.sub":    { fr: "Le fil mène ailleurs. Revenons à la Maison.", ar: "الخيط يقود إلى مكان آخر. لنعد إلى الدار.", en: "The thread leads elsewhere. Let’s return home." },
  "nf.home":   { fr: "Retour à l’accueil", ar: "العودة إلى الرئيسية", en: "Back home" },
  "nf.shop":   { fr: "La Boutique", ar: "المتجر", en: "The Boutique" },
};

var LANGS = ["fr", "ar", "en"];
window.I18N = I18N;

function applyLang(lang){
  if (!LANGS.includes(lang)) lang = "fr";
  const html = document.documentElement;
  // Skip the no-op case: when the lang we're applying already matches what
  // the page is rendered in (e.g. on initial load with localStorage agreeing
  // with the SSG default), DOM rewrites and the langchange event are pure
  // waste — shop-data.js refetches products/categories on every dispatch.
  const noop = html.getAttribute("lang") === lang && html.getAttribute("dir") === (lang === "ar" ? "rtl" : "ltr");
  if (noop) {
    document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
    return;
  }
  html.setAttribute("lang", lang);
  html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const entry = I18N[key];
    if (!entry) return;
    const val = entry[lang] ?? entry.fr;
    if (el.hasAttribute("data-i18n-html") || /<em>|<br/.test(val)) el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const entry = I18N[el.getAttribute("data-i18n-ph")];
    if (entry) el.setAttribute("placeholder", entry[lang] ?? entry.fr);
  });
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  try { localStorage.setItem("br_lang", lang); } catch(e){}
  window.dispatchEvent(new CustomEvent("br:langchange", { detail: { lang } }));
}

function initLang(){
  let lang = "fr";
  try { lang = localStorage.getItem("br_lang") || "fr"; } catch(e){}
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });
  applyLang(lang);
}

// Ready-state guarded so this works on both initial load AND Astro ClientRouter
// re-execution (where DOMContentLoaded has already fired by the time the script
// runs on the new page). Without this guard, [data-i18n] divs on SPA-navigated
// pages stay empty until a manual reload — e.g. the "Type de produit" cards on
// the contact page.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initLang);
else initLang();
