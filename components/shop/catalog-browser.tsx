"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ProductCard } from "@/components/shop/product-card";
import type { Category, Product } from "@/types/database";

export function CatalogBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const brands = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.brand).filter(Boolean) as string[])
      ).sort(),
    [products]
  );

  const filtered = products.filter((p) => {
    const name = localized(p, "name", lang).toLowerCase();
    const matchesQuery =
      !query ||
      name.includes(query.toLowerCase()) ||
      (p.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(query.toLowerCase())
      );
    const matchesCategory = !categoryId || p.category_id === categoryId;
    const matchesBrand = !brand || p.brand === brand;
    const matchesPrice = !maxPrice || p.selling_price <= Number(maxPrice);
    return matchesQuery && matchesCategory && matchesBrand && matchesPrice;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-4">
        <div className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filtres
        </div>
        <div className="space-y-2">
          <Label>{t("search")}</Label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("category")}</Label>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{t("all")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {localized(c, "name", lang)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("brand")}</Label>
          <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">{t("all")}</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prix max (TND)</Label>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="—"
          />
        </div>
      </aside>

      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          {filtered.length} produit(s)
        </p>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            Aucun produit ne correspond à votre recherche.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
