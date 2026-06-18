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
  tagline: {
    fr: "Importez de Chine, vendez en Tunisie",
    ar: "استورد من الصين، بِع في تونس",
    en: "Import from China, sell in Tunisia",
  },
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
  haveAccount: {
    fr: "Déjà un compte ?",
    ar: "لديك حساب بالفعل؟",
    en: "Already have an account?",
  },

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
