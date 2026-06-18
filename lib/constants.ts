import type { PreorderStatus, BatchStatus, StockStatus } from "@/types/database";

export const PREORDER_STATUS: Record<
  PreorderStatus,
  { fr: string; ar: string; en: string; className: string }
> = {
  pending: {
    fr: "En attente",
    ar: "قيد الانتظار",
    en: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  confirmed: {
    fr: "Confirmé",
    ar: "مؤكد",
    en: "Confirmed",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ordered: {
    fr: "Commandé en Chine",
    ar: "تم الطلب من الصين",
    en: "Ordered from China",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  arrived: {
    fr: "Arrivé en Tunisie",
    ar: "وصل إلى تونس",
    en: "Arrived in Tunisia",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  delivered: {
    fr: "Livré",
    ar: "تم التسليم",
    en: "Delivered",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    fr: "Annulé",
    ar: "ملغى",
    en: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export const BATCH_STATUS: Record<
  BatchStatus,
  { fr: string; ar: string; en: string; className: string }
> = {
  collecting: {
    fr: "Collecte en cours",
    ar: "قيد التجميع",
    en: "Collecting",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  confirmed: {
    fr: "Confirmé",
    ar: "مؤكد",
    en: "Confirmed",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ordered: {
    fr: "Commandé",
    ar: "تم الطلب",
    en: "Ordered",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  arrived: {
    fr: "Arrivé",
    ar: "وصل",
    en: "Arrived",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  distributed: {
    fr: "Distribué",
    ar: "تم التوزيع",
    en: "Distributed",
    className: "bg-green-100 text-green-800 border-green-200",
  },
};

export const STOCK_STATUS: Record<
  StockStatus,
  { fr: string; ar: string; en: string; className: string }
> = {
  available: {
    fr: "Disponible",
    ar: "متوفر",
    en: "Available",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  limited: {
    fr: "Stock limité",
    ar: "كمية محدودة",
    en: "Limited",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  unavailable: {
    fr: "Indisponible",
    ar: "غير متوفر",
    en: "Unavailable",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export const PREORDER_STATUS_FLOW: PreorderStatus[] = [
  "pending",
  "confirmed",
  "ordered",
  "arrived",
  "delivered",
];
