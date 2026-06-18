"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronRight, LayoutGrid, List, Search } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import type { Category, Product } from "@/types/database";

type SortKey = "newest" | "price-asc" | "price-desc" | "name";

interface CategoryNode extends Category {
  children: CategoryNode[];
}

function buildTree(categories: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function CategoryTree({
  nodes,
  selected,
  onSelect,
  lang,
  depth = 0,
}: {
  nodes: CategoryNode[];
  selected: string;
  onSelect: (id: string) => void;
  lang: string;
  depth?: number;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = open[node.id] ?? false;
        const isSelected = selected === node.id;
        const name = localized(node, "name", lang as "fr" | "ar" | "en");

        return (
          <li key={node.id}>
            <div
              className="flex items-center gap-1"
              style={{ paddingLeft: `${depth * 12}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => setOpen((prev) => ({ ...prev, [node.id]: !isOpen }))}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              ) : (
                <span className="w-3 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => onSelect(isSelected ? "" : node.id)}
                className={`flex-1 rounded px-2 py-1 text-start text-sm transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted"
                }`}
              >
                {name}
              </button>
            </div>
            {hasChildren && isOpen && (
              <CategoryTree
                nodes={node.children}
                selected={selected}
                onSelect={onSelect}
                lang={lang}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Collect all descendant IDs of a category node (for filtering subcategories)
function collectIds(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(collectIds)];
}

function findNode(nodes: CategoryNode[], id: string): CategoryNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

export function CatalogBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const { lang } = useI18n();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tree = useMemo(() => buildTree(categories), [categories]);

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean) as string[])).sort(),
    [products]
  );

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) =>
      (p.tags ?? []).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1))
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);
  }, [products]);

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  // Resolve selected category + all its descendants for filtering
  const selectedCatIds = useMemo(() => {
    if (!categoryId) return null;
    const node = findNode(tree, categoryId);
    return node ? new Set(collectIds(node)) : new Set([categoryId]);
  }, [categoryId, tree]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const name = localized(p, "name", lang).toLowerCase();
      const desc = localized(p, "description", lang).toLowerCase();
      const matchesQuery =
        !query ||
        name.includes(query.toLowerCase()) ||
        desc.includes(query.toLowerCase()) ||
        (p.brand ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = !selectedCatIds || (p.category_id ? selectedCatIds.has(p.category_id) : false);
      const matchesBrand = !brand || p.brand === brand;
      const matchesMin = !minPrice || p.selling_price >= Number(minPrice);
      const matchesMax = !maxPrice || p.selling_price <= Number(maxPrice);
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((t) => (p.tags ?? []).includes(t));
      return matchesQuery && matchesCategory && matchesBrand && matchesMin && matchesMax && matchesTags;
    });

    result = [...result].sort((a, b) => {
      if (sort === "price-asc") return a.selling_price - b.selling_price;
      if (sort === "price-desc") return b.selling_price - a.selling_price;
      if (sort === "name") return localized(a, "name", lang).localeCompare(localized(b, "name", lang));
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [products, query, selectedCatIds, brand, minPrice, maxPrice, activeTags, sort, lang]);

  const hasFilters = query || categoryId || brand || minPrice || maxPrice || activeTags.length > 0;

  function resetFilters() {
    setQuery("");
    setCategoryId("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setActiveTags([]);
  }

  const selectedCatName = useMemo(() => {
    if (!categoryId) return "";
    const node = findNode(tree, categoryId);
    return node ? localized(node, "name", lang) : "";
  }, [categoryId, tree, lang]);

  const Sidebar = (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher…"
          className="ps-9"
        />
      </div>

      {/* Categories tree */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Catégories
        </p>
        <button
          type="button"
          onClick={() => setCategoryId("")}
          className={`mb-1 w-full rounded px-2 py-1 text-start text-sm transition-colors ${
            !categoryId ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"
          }`}
        >
          Tous les produits
        </button>
        <CategoryTree nodes={tree} selected={categoryId} onSelect={setCategoryId} lang={lang} />
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Marque
          </p>
          <div className="flex flex-wrap gap-1.5">
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrand(brand === b ? "" : b)}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                  brand === b
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Prix (TND)
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-0 flex-1"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-0 flex-1"
          />
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                  activeTags.includes(tag)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full text-destructive">
          <X className="me-1 h-3 w-3" /> Effacer les filtres
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Active filters chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {query && (
            <button type="button" onClick={() => setQuery("")} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium hover:bg-muted/70">
              «{query}» <X className="h-3 w-3" />
            </button>
          )}
          {selectedCatName && (
            <button type="button" onClick={() => setCategoryId("")} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium hover:bg-muted/70">
              {selectedCatName} <X className="h-3 w-3" />
            </button>
          )}
          {brand && (
            <button type="button" onClick={() => setBrand("")} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium hover:bg-muted/70">
              {brand} <X className="h-3 w-3" />
            </button>
          )}
          {(minPrice || maxPrice) && (
            <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium hover:bg-muted/70">
              {minPrice || "0"} – {maxPrice || "∞"} TND <X className="h-3 w-3" />
            </button>
          )}
          {activeTags.map((tag) => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium hover:bg-muted/70">
              #{tag} <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">{Sidebar}</aside>

        <div className="space-y-4">
          {/* Top bar: results count + sort + view toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <SlidersHorizontal className="me-1 h-4 w-4" />
              Filtres {hasFilters && `(${[query, categoryId, brand, minPrice || maxPrice, ...activeTags].filter(Boolean).length})`}
            </Button>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filtered.length}</span> produit(s)
            </p>

            <div className="ms-auto flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border bg-background px-3 py-1.5 text-sm"
              >
                <option value="newest">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom A–Z</option>
              </select>

              <div className="flex rounded-md border">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="rounded-lg border bg-card p-4 lg:hidden">
              {Sidebar}
            </div>
          )}

          {/* Product grid / list */}
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
              <p className="font-medium">Aucun produit trouvé</p>
              {hasFilters && (
                <Button variant="link" onClick={resetFilters} className="mt-2">
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} listMode />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
