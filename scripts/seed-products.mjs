import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

// Parse .env.local manually
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Fetch categories
const { data: cats } = await supabase.from("categories").select("id,slug");
const cat = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

const products = [
  {
    name_en: "Wireless Bluetooth Earbuds",
    name_fr: "Écouteurs Bluetooth sans fil",
    name_ar: "سماعات بلوتوث لاسلكية",
    description_en: "High quality wireless earbuds with noise cancellation and 24h battery life.",
    description_fr: "Écouteurs sans fil haute qualité avec réduction de bruit et 24h d'autonomie.",
    description_ar: "سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء وعمر بطارية 24 ساعة.",
    brand: "GenX", tags: ["electronics","audio","bluetooth"],
    images: ["https://picsum.photos/seed/earbuds1/600/600"],
    cost_price: 12.5, selling_price: 45.0, unit: "pièce", min_order_qty: 10,
    stock_status: "available", is_published: true, category_id: cat["electronics"],
  },
  {
    name_en: "USB-C Fast Charging Cable 1m",
    name_fr: "Câble USB-C charge rapide 1m",
    name_ar: "كابل USB-C شحن سريع 1م",
    description_en: "Braided USB-C cable supporting 65W fast charging.",
    description_fr: "Câble USB-C tressé supportant la charge rapide 65W.",
    description_ar: "كابل USB-C مضفر يدعم الشحن السريع 65 واط.",
    brand: "GenX", tags: ["electronics","cable","accessory"],
    images: ["https://picsum.photos/seed/cable1/600/600"],
    cost_price: 1.8, selling_price: 8.5, unit: "pièce", min_order_qty: 50,
    stock_status: "available", is_published: true, category_id: cat["electronics"],
  },
  {
    name_en: "Portable Power Bank 10000mAh",
    name_fr: "Batterie externe 10000mAh",
    name_ar: "بطارية خارجية 10000 مللي أمبير",
    description_en: "Slim power bank with dual USB output and LED indicator.",
    description_fr: "Batterie externe slim avec double sortie USB et indicateur LED.",
    description_ar: "بطارية خارجية نحيفة بمخرجَي USB ومؤشر LED.",
    brand: "GenX", tags: ["electronics","battery","portable"],
    images: ["https://picsum.photos/seed/powerbank1/600/600"],
    cost_price: 8.0, selling_price: 32.0, unit: "pièce", min_order_qty: 10,
    stock_status: "available", is_published: true, category_id: cat["electronics"],
  },
  {
    name_en: "LED Desk Lamp",
    name_fr: "Lampe de bureau LED",
    name_ar: "مصباح مكتب LED",
    description_en: "Adjustable LED desk lamp with 3 brightness levels and USB charging port.",
    description_fr: "Lampe de bureau LED réglable avec 3 niveaux de luminosité et port USB.",
    description_ar: "مصباح مكتب LED قابل للتعديل بـ3 مستويات إضاءة ومنفذ USB.",
    brand: "BrightHome", tags: ["home","lighting","led"],
    images: ["https://picsum.photos/seed/lamp1/600/600"],
    cost_price: 9.0, selling_price: 35.0, unit: "pièce", min_order_qty: 15,
    stock_status: "available", is_published: true, category_id: cat["home-kitchen"],
  },
  {
    name_en: "Stainless Steel Water Bottle 750ml",
    name_fr: "Bouteille d'eau inox 750ml",
    name_ar: "زجاجة ماء ستانلس ستيل 750 مل",
    description_en: "Double-wall insulated bottle, keeps drinks cold 24h / hot 12h.",
    description_fr: "Bouteille isotherme double paroi, maintient le froid 24h et le chaud 12h.",
    description_ar: "زجاجة معزولة بجدارين، تحافظ على البرودة 24 ساعة والحرارة 12 ساعة.",
    brand: "AquaMax", tags: ["home","kitchen","bottle"],
    images: ["https://picsum.photos/seed/bottle1/600/600"],
    cost_price: 4.5, selling_price: 18.0, unit: "pièce", min_order_qty: 20,
    stock_status: "available", is_published: true, category_id: cat["home-kitchen"],
  },
  {
    name_en: "Cotton Unisex T-Shirt",
    name_fr: "T-shirt unisexe en coton",
    name_ar: "تيشيرت قطني للجنسين",
    description_en: "100% cotton comfortable t-shirt available in multiple colors.",
    description_fr: "T-shirt confortable 100% coton disponible en plusieurs coloris.",
    description_ar: "تيشيرت مريح 100% قطن متوفر بألوان متعددة.",
    brand: "BasicWear", tags: ["clothing","cotton","casual"],
    images: ["https://picsum.photos/seed/tshirt1/600/600"],
    cost_price: 5.0, selling_price: 22.0, unit: "pièce", min_order_qty: 20,
    stock_status: "available", is_published: true, category_id: cat["clothing"],
  },
  {
    name_en: "Silicone Phone Case iPhone 15",
    name_fr: "Coque silicone iPhone 15",
    name_ar: "غطاء سيليكون آيفون 15",
    description_en: "Soft silicone protective case with anti-shock edges for iPhone 15.",
    description_fr: "Coque de protection en silicone souple avec bords anti-choc pour iPhone 15.",
    description_ar: "غطاء حماية سيليكون ناعم بحواف مقاومة للصدمات لآيفون 15.",
    brand: "GenX", tags: ["accessories","phone","protection"],
    images: ["https://picsum.photos/seed/case1/600/600"],
    cost_price: 2.2, selling_price: 12.0, unit: "pièce", min_order_qty: 30,
    stock_status: "available", is_published: true, category_id: cat["accessories"],
  },
  {
    name_en: "Vitamin C Face Serum 30ml",
    name_fr: "Sérum visage Vitamine C 30ml",
    name_ar: "سيروم الوجه بفيتامين C 30 مل",
    description_en: "Brightening vitamin C serum that reduces dark spots and boosts radiance.",
    description_fr: "Sérum éclaircissant à la vitamine C qui réduit les taches et booste l'éclat.",
    description_ar: "سيروم فيتامين C المضيء يقلل البقع الداكنة ويعزز الإشراق.",
    brand: "GlowSkin", tags: ["beauty","skincare","serum"],
    images: ["https://picsum.photos/seed/serum1/600/600"],
    cost_price: 6.0, selling_price: 28.0, unit: "pièce", min_order_qty: 15,
    stock_status: "limited", is_published: true, category_id: cat["beauty"],
  },
];

const { data, error } = await supabase.from("products").insert(products).select("id, name_en");

if (error) {
  console.error("✗ Error:", error.message);
  process.exit(1);
}

console.log(`✓ Inserted ${data.length} products:`);
data.forEach((p) => console.log(`  - ${p.name_en}`));
