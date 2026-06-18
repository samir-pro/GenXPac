export type UserRole = "admin" | "client";

export type PreorderStatus =
  | "pending"
  | "confirmed"
  | "ordered"
  | "arrived"
  | "delivered"
  | "cancelled";

export type BatchStatus =
  | "collecting"
  | "confirmed"
  | "ordered"
  | "arrived"
  | "distributed";

export type StockStatus = "available" | "limited" | "unavailable";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  shop_name: string | null;
  phone: string | null;
  role: UserRole;
  approved: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_fr: string | null;
  name_ar: string | null;
  slug: string;
  parent_id: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name_en: string;
  name_fr: string | null;
  name_ar: string | null;
  description_en: string | null;
  description_fr: string | null;
  description_ar: string | null;
  category_id: string | null;
  brand: string | null;
  sku: string | null;
  tags: string[] | null;
  images: string[] | null;
  cost_price: number | null;
  selling_price: number;
  currency: string;
  unit: string;
  min_order_qty: number;
  weight_kg: number | null;
  lead_time_days: number | null;
  supplier_name: string | null;
  supplier_url: string | null;
  stock_status: StockStatus;
  is_published: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  name: string;
  status: BatchStatus;
  china_order_date: string | null;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  notes: string | null;
  created_at: string;
}

export interface Preorder {
  id: string;
  product_id: string;
  client_id: string;
  quantity: number;
  agreed_price: number | null;
  notes: string | null;
  status: PreorderStatus;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  preorder_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// Joined helpers
export interface PreorderWithRelations extends Preorder {
  product: Product | null;
  client: Profile | null;
}

export interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface ProductWithMeta extends Product {
  category: Category | null;
  creator: Pick<Profile, "full_name" | "email"> | null;
  updater: Pick<Profile, "full_name" | "email"> | null;
}

// Minimal Supabase Database typing for the SSR clients.
type Row<T> = T;
type Insert<T> = Partial<T>;
type Update<T> = Partial<T>;

interface TableDef<T> {
  Row: Row<T>;
  Insert: Insert<T>;
  Update: Update<T>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      categories: TableDef<Category>;
      products: TableDef<Product>;
      batches: TableDef<Batch>;
      preorders: TableDef<Preorder>;
      messages: TableDef<Message>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
