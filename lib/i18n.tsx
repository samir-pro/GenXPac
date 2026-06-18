"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "fr" | "ar" | "en";

type Dict = Record<string, { fr: string; ar: string; en: string }>;

export const translations: Dict = {
  // Brand / general
  tagline: { fr: "Importez de Chine, vendez en Tunisie", ar: "استورد من الصين، بِع في تونس", en: "Import from China, sell in Tunisia" },
  loading: { fr: "Chargement…", ar: "جار التحميل…", en: "Loading…" },
  save: { fr: "Enregistrer", ar: "حفظ", en: "Save" },
  cancel: { fr: "Annuler", ar: "إلغاء", en: "Cancel" },
  delete: { fr: "Supprimer", ar: "حذف", en: "Delete" },
  edit: { fr: "Modifier", ar: "تعديل", en: "Edit" },
  search: { fr: "Rechercher…", ar: "بحث…", en: "Search…" },
  confirm: { fr: "Confirmer", ar: "تأكيد", en: "Confirm" },
  back: { fr: "Retour", ar: "رجوع", en: "Back" },
  actions: { fr: "Actions", ar: "إجراءات", en: "Actions" },
  all: { fr: "Tous", ar: "الكل", en: "All" },
  create: { fr: "Créer", ar: "إنشاء", en: "Create" },
  suspend: { fr: "Suspendre", ar: "تعليق", en: "Suspend" },
  validate: { fr: "Valider", ar: "الموافقة", en: "Approve" },
  publish: { fr: "Publier", ar: "نشر", en: "Publish" },
  unpublish: { fr: "Dépublier", ar: "إلغاء النشر", en: "Unpublish" },
  viewAll: { fr: "Voir tout", ar: "عرض الكل", en: "View all" },
  date: { fr: "Date", ar: "التاريخ", en: "Date" },
  name: { fr: "Nom", ar: "الاسم", en: "Name" },
  price: { fr: "Prix", ar: "السعر", en: "Price" },
  stock: { fr: "Stock", ar: "المخزون", en: "Stock" },
  addedBy: { fr: "Ajouté par", ar: "أضافه", en: "Added by" },
  registeredOn: { fr: "Inscrit le", ar: "مسجل في", en: "Registered" },
  change: { fr: "Changer", ar: "تغيير", en: "Change" },
  shop: { fr: "Boutique", ar: "المتجر", en: "Shop" },
  product: { fr: "Produit", ar: "المنتج", en: "Product" },
  unavailable: { fr: "Indisponible", ar: "غير متوفر", en: "Unavailable" },
  estimatedTotal: { fr: "Total estimé", ar: "المجموع المقدر", en: "Estimated total" },

  // Auth
  login: { fr: "Connexion", ar: "تسجيل الدخول", en: "Login" },
  register: { fr: "Inscription", ar: "إنشاء حساب", en: "Register" },
  logout: { fr: "Déconnexion", ar: "تسجيل الخروج", en: "Logout" },
  email: { fr: "E-mail", ar: "البريد الإلكتروني", en: "Email" },
  password: { fr: "Mot de passe", ar: "كلمة المرور", en: "Password" },
  fullName: { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  shopName: { fr: "Nom de la boutique", ar: "اسم المتجر", en: "Shop name" },
  phone: { fr: "Téléphone", ar: "الهاتف", en: "Phone" },
  noAccount: { fr: "Pas de compte ?", ar: "ليس لديك حساب؟", en: "No account?" },
  haveAccount: { fr: "Déjà un compte ?", ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  approved: { fr: "Validé", ar: "موثق", en: "Approved" },
  pendingApproval: { fr: "En attente", ar: "قيد الانتظار", en: "Pending" },
  accountPending: { fr: "Compte en attente de validation", ar: "الحساب قيد المراجعة", en: "Account pending review" },
  accountPendingDesc: { fr: "Votre inscription a bien été reçue. Un administrateur doit valider votre compte avant que vous puissiez accéder au catalogue. Vous serez contacté prochainement.", ar: "تم استلام تسجيلك. يجب على المسؤول الموافقة على حسابك قبل الوصول إلى الكتالوج. سيتم التواصل معك قريباً.", en: "Your registration has been received. An administrator must approve your account before you can access the catalog. You will be contacted soon." },

  // Nav
  dashboard: { fr: "Tableau de bord", ar: "لوحة القيادة", en: "Dashboard" },
  products: { fr: "Produits", ar: "المنتجات", en: "Products" },
  import: { fr: "Importer", ar: "استيراد", en: "Import" },
  orders: { fr: "Commandes", ar: "الطلبات", en: "Orders" },
  clients: { fr: "Clients", ar: "العملاء", en: "Clients" },
  batches: { fr: "Lots Chine", ar: "دفعات الصين", en: "Batches" },
  catalog: { fr: "Catalogue", ar: "الكتالوج", en: "Catalog" },
  myOrders: { fr: "Mes commandes", ar: "طلباتي", en: "My orders" },
  messages: { fr: "Messages", ar: "الرسائل", en: "Messages" },

  // Products
  addProduct: { fr: "Ajouter un produit", ar: "إضافة منتج", en: "Add product" },
  brand: { fr: "Marque", ar: "العلامة التجارية", en: "Brand" },
  category: { fr: "Catégorie", ar: "الفئة", en: "Category" },
  tags: { fr: "Étiquettes", ar: "الوسوم", en: "Tags" },
  images: { fr: "Images", ar: "الصور", en: "Images" },
  costPrice: { fr: "Prix d'achat (CNY)", ar: "سعر الشراء", en: "Cost price (CNY)" },
  sellingPrice: { fr: "Prix de vente (TND)", ar: "سعر البيع", en: "Selling price (TND)" },
  unit: { fr: "Unité", ar: "الوحدة", en: "Unit" },
  minOrderQty: { fr: "Quantité min.", ar: "أدنى كمية", en: "Min. quantity" },
  published: { fr: "Publié", ar: "منشور", en: "Published" },
  stockStatus: { fr: "État du stock", ar: "حالة المخزون", en: "Stock status" },
  description: { fr: "Description", ar: "الوصف", en: "Description" },

  // Products table UI
  totalProductsStat: { fr: "Total produits", ar: "إجمالي المنتجات", en: "Total products" },
  publishedStat: { fr: "Publiés", ar: "منشورة", en: "Published" },
  draftsStat: { fr: "Brouillons", ar: "مسودات", en: "Drafts" },
  limitedStock: { fr: "Stock limité", ar: "مخزون محدود", en: "Limited stock" },
  publishedTab: { fr: "Publiés", ar: "منشورة", en: "Published" },
  draftsTab: { fr: "Brouillons", ar: "مسودات", en: "Drafts" },
  limitedTab: { fr: "Stock ⚠", ar: "مخزون ⚠", en: "Low stock ⚠" },
  selectedItems: { fr: "sélectionné(s)", ar: "محدد(ة)", en: "selected" },
  noProducts: { fr: "Aucun produit", ar: "لا توجد منتجات", en: "No products" },
  noResultsFor: { fr: "Aucun résultat pour", ar: "لا نتائج لـ", en: "No results for" },
  confirmDeletion: { fr: "Confirmer la suppression", ar: "تأكيد الحذف", en: "Confirm deletion" },
  deleteProductConfirm: { fr: "Supprimer ce produit ? Cette action est irréversible.", ar: "حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.", en: "Delete this product? This action cannot be undone." },
  deleteBulkConfirm: { fr: "Supprimer les produits sélectionnés ? Cette action est irréversible.", ar: "حذف المنتجات المحددة؟ لا يمكن التراجع عن هذا الإجراء.", en: "Delete selected products? This action cannot be undone." },

  // Clients (admin)
  pendingRequests: { fr: "En attente de validation", ar: "طلبات قيد الموافقة", en: "Pending approval" },
  validatedClients: { fr: "Clients validés", ar: "عملاء موثقون", en: "Approved clients" },
  noPending: { fr: "Aucune demande en attente.", ar: "لا توجد طلبات معلقة.", en: "No pending requests." },
  noApproved: { fr: "Aucun client validé.", ar: "لا يوجد عملاء موثقون.", en: "No approved clients." },

  // Batches
  newBatch: { fr: "Nouveau lot", ar: "دفعة جديدة", en: "New batch" },
  noBatches: { fr: "Aucun lot. Créez-en un pour regrouper des produits.", ar: "لا توجد دفعات. أنشئ دفعة لتجميع المنتجات.", en: "No batches yet. Create one to group products." },
  batchName: { fr: "Nom du lot", ar: "اسم الدفعة", en: "Batch name" },
  estimatedArrival: { fr: "Arrivée estimée", ar: "الوصول المتوقع", en: "Estimated arrival" },
  arrivedOn: { fr: "Arrivé le", ar: "وصل في", en: "Arrived on" },
  createdOn: { fr: "Créé le", ar: "أنشئ في", en: "Created on" },
  batchChina: { fr: "Lot Chine", ar: "دفعة الصين", en: "China batch" },

  // Orders
  noPreorders: { fr: "Aucune pré-commande pour le moment.", ar: "لا توجد طلبات مسبقة حالياً.", en: "No pre-orders yet." },
  globalStatus: { fr: "Statut global", ar: "الحالة العامة", en: "Global status" },
  changeForAll: { fr: "Changer pour tous…", ar: "تغيير للجميع…", en: "Change for all…" },

  // Dashboard
  totalProducts: { fr: "Produits", ar: "المنتجات", en: "Products" },
  pendingOrders: { fr: "Pré-commandes en attente", ar: "الطلبات المعلقة", en: "Pending pre-orders" },
  unitsToOrder: { fr: "Unités à commander", ar: "وحدات للطلب", en: "Units to order" },
  clientsToValidate: { fr: "Clients à valider", ar: "عملاء للموافقة", en: "Clients to validate" },
  potentialRevenue: { fr: "Chiffre d'affaires potentiel (commandes actives)", ar: "الإيرادات المحتملة (الطلبات النشطة)", en: "Potential revenue (active orders)" },
  recentActivity: { fr: "Activité récente", ar: "النشاط الأخير", en: "Recent activity" },
  basedOn: { fr: "Basé sur", ar: "بناءً على", en: "Based on" },
  preorderedUnits: { fr: "unités pré-commandées", ar: "وحدات محجوزة", en: "pre-ordered units" },
  orderedVerb: { fr: "a commandé", ar: "طلب", en: "ordered" },
  noRecentActivity: { fr: "Aucune pré-commande pour le moment.", ar: "لا توجد طلبات مسبقة حالياً.", en: "No pre-orders yet." },

  // Messaging
  selectConversation: { fr: "Sélectionnez une conversation", ar: "اختر محادثة", en: "Select a conversation" },
  noConversations: { fr: "Aucune conversation. Les discussions sont liées à vos pré-commandes.", ar: "لا توجد محادثات. النقاشات مرتبطة بطلباتك المسبقة.", en: "No conversations. Discussions are linked to your pre-orders." },
  noMessages: { fr: "Aucun message. Démarrez la discussion.", ar: "لا توجد رسائل. ابدأ النقاش.", en: "No messages. Start the conversation." },
  yourMessage: { fr: "Votre message…", ar: "رسالتك…", en: "Your message…" },

  // Pre-orders (client)
  noPreordersClient: { fr: "Vous n'avez pas encore de pré-commande.", ar: "ليس لديك أي طلبات مسبقة بعد.", en: "You have no pre-orders yet." },
  browseCatalog: { fr: "Parcourir le catalogue", ar: "تصفح الكتالوج", en: "Browse the catalog" },
  deletedProduct: { fr: "Produit supprimé", ar: "منتج محذوف", en: "Deleted product" },
  preorderCancelled: { fr: "Pré-commande annulée", ar: "تم إلغاء الطلب المسبق", en: "Pre-order cancelled" },
  preorderSaved: { fr: "Pré-commande enregistrée", ar: "تم تسجيل الطلب المسبق", en: "Pre-order saved" },

  // Orders / preorder
  preorder: { fr: "Pré-commander", ar: "حجز مسبق", en: "Pre-order" },
  quantity: { fr: "Quantité", ar: "الكمية", en: "Quantity" },
  totalUnits: { fr: "Unités totales", ar: "إجمالي الوحدات", en: "Total units" },
  shopsCount: { fr: "Boutiques", ar: "المتاجر", en: "Shops" },
  status: { fr: "Statut", ar: "الحالة", en: "Status" },
  notes: { fr: "Notes", ar: "ملاحظات", en: "Notes" },
  agreedPrice: { fr: "Prix convenu", ar: "السعر المتفق عليه", en: "Agreed price" },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof translations) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      window.localStorage.getItem("lang")) as Lang | null;
    if (saved === "fr" || saved === "ar" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("lang", l);
  };

  const t = (key: keyof typeof translations) =>
    translations[key]?.[lang] ?? String(key);

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Pick the localized field of a product/category based on language. */
export function localized(obj: unknown, base: string, lang: Lang): string {
  const o = obj as Record<string, unknown> | null | undefined;
  if (!o) return "";
  const val = o[`${base}_${lang}`] as string | null;
  return val || (o[`${base}_en`] as string) || (o[`${base}_fr`] as string) || "";
}
