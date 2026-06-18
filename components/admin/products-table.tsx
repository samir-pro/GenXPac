"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Pencil, Trash2, Eye, EyeOff, Search, LayoutGrid, List,
  ChevronUp, ChevronDown, ChevronsUpDown, ImageIcon, CheckSquare, Square,
} from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockStatusBadge } from "@/components/status-badge";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteProduct, togglePublish, bulkPublish, bulkDelete } from "@/app/(admin)/admin/products/actions";
import type { ProductWithMeta } from "@/types/database";

type Tab = "all" | "published" | "draft" | "limited";
type SortCol = "name" | "price" | "date" | "stock";
type SortDir = "asc" | "desc";
type ViewMode = "table" | "grid";

function SortIcon({ col, active, dir }: { col: SortCol; active: SortCol; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown className="ms-1 inline h-3 w-3 text-muted-foreground" />;
  return dir === "asc"
    ? <ChevronUp className="ms-1 inline h-3 w-3" />
    : <ChevronDown className="ms-1 inline h-3 w-3" />;
}

export function ProductsTable({ products }: { products: ProductWithMeta[] }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [sortCol, setSortCol] = useState<SortCol>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<ProductWithMeta | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     products.length,
    published: products.filter((p) => p.is_published).length,
    draft:     products.filter((p) => !p.is_published).length,
    limited:   products.filter((p) => p.stock_status === "limited" || p.stock_status === "unavailable").length,
  }), [products]);

  // ── Filter + sort ──────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const name = localized(p, "name", lang).toLowerCase();
      const q = query.toLowerCase();
      if (q && !name.includes(q) && !(p.brand ?? "").toLowerCase().includes(q) && !(p.sku ?? "").toLowerCase().includes(q)) return false;
      if (tab === "published" && !p.is_published) return false;
      if (tab === "draft"     &&  p.is_published) return false;
      if (tab === "limited"   && p.stock_status === "available") return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "name")  cmp = localized(a, "name", lang).localeCompare(localized(b, "name", lang));
      if (sortCol === "price") cmp = a.selling_price - b.selling_price;
      if (sortCol === "date")  cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortCol === "stock") cmp = a.stock_status.localeCompare(b.stock_status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [products, query, tab, sortCol, sortDir, lang]);

  // ── Sort toggle ────────────────────────────────────────────
  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  // ── Selection helpers ──────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const someSelected = selected.size > 0;

  function toggleOne(id: string) {
    setSelected((prev) => { const s = new Set(prev); if (s.has(id)) { s.delete(id); } else { s.add(id); } return s; });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((p) => p.id)));
  }

  // ── Actions ────────────────────────────────────────────────
  async function onTogglePublish(p: ProductWithMeta) {
    try { await togglePublish(p.id, !p.is_published); toast(p.is_published ? "Dépublié" : "Publié", "success"); }
    catch { toast("Erreur", "error"); }
  }

  async function onConfirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    try { await deleteProduct(toDelete.id); toast("Produit supprimé", "success"); setToDelete(null); }
    catch { toast("Erreur", "error"); }
    finally { setBusy(false); }
  }

  async function onBulkPublish(publish: boolean) {
    setBusy(true);
    try { await bulkPublish(Array.from(selected), publish); toast(`${selected.size} produit(s) ${publish ? "publiés" : "dépubliés"}`, "success"); setSelected(new Set()); }
    catch { toast("Erreur", "error"); }
    finally { setBusy(false); }
  }

  async function onBulkDelete() {
    setBusy(true);
    try { await bulkDelete(Array.from(selected)); toast(`${selected.size} produit(s) supprimés`, "success"); setSelected(new Set()); setBulkDeleteConfirm(false); }
    catch { toast("Erreur", "error"); }
    finally { setBusy(false); }
  }

  // ── Tab config ─────────────────────────────────────────────
  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    { key: "all",       label: "Tous",          count: stats.total,     color: "" },
    { key: "published", label: "Publiés",        count: stats.published, color: "text-green-600" },
    { key: "draft",     label: "Brouillons",     count: stats.draft,     color: "text-muted-foreground" },
    { key: "limited",   label: "Stock ⚠",        count: stats.limited,   color: "text-amber-600" },
  ];

  return (
    <div className="space-y-4">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total produits", value: stats.total,     color: "bg-primary/10 text-primary" },
          { label: "Publiés",        value: stats.published, color: "bg-green-50 text-green-700" },
          { label: "Brouillons",     value: stats.draft,     color: "bg-muted text-muted-foreground" },
          { label: "Stock limité",   value: stats.limited,   color: "bg-amber-50 text-amber-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, SKU, marque…" className="ps-9" />
        </div>
        <div className="ms-auto flex rounded-md border">
          <button type="button" onClick={() => setViewMode("table")} className={`p-2 transition-colors ${viewMode === "table" ? "bg-muted" : "hover:bg-muted/50"}`} title="Vue tableau">
            <List className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`} title="Vue grille">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => { setTab(tb.key); setSelected(new Set()); }}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === tb.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tb.label}
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${tab === tb.key ? "bg-primary/10" : "bg-muted"} ${tb.color}`}>
              {tb.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Bulk action bar ── */}
      {someSelected && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/60 px-4 py-2">
          <span className="text-sm font-medium">{selected.size} sélectionné(s)</span>
          <div className="ms-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onBulkPublish(true)} disabled={busy}>
              <Eye className="me-1 h-3 w-3" /> Publier
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkPublish(false)} disabled={busy}>
              <EyeOff className="me-1 h-3 w-3" /> Dépublier
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteConfirm(true)} disabled={busy}>
              <Trash2 className="me-1 h-3 w-3" /> Supprimer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Annuler</Button>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">Aucun produit</p>
          {query && <p className="mt-1 text-sm">Aucun résultat pour « {query} »</p>}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === "table" && filtered.length > 0 && (
        <div className="rounded-md border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <button type="button" onClick={toggleAll} className="flex items-center">
                    {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("name")} className="flex items-center font-semibold">
                    Nom <SortIcon col="name" active={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>{t("brand")}</TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("price")} className="flex items-center font-semibold">
                    Prix <SortIcon col="price" active={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("stock")} className="flex items-center font-semibold">
                    Stock <SortIcon col="stock" active={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>Ajouté par</TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("date")} className="flex items-center font-semibold">
                    Date <SortIcon col="date" active={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>{t("published")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className={selected.has(p.id) ? "bg-muted/40" : ""}>
                  <TableCell>
                    <button type="button" onClick={() => toggleOne(p.id)}>
                      {selected.has(p.id)
                        ? <CheckSquare className="h-4 w-4 text-primary" />
                        : <Square className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded border bg-muted shrink-0">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                        : <div className="flex h-full items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[180px]">
                    <span className="line-clamp-2">{localized(p, "name", lang)}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.sku ?? "—"}</TableCell>
                  <TableCell>{p.brand ?? "—"}</TableCell>
                  <TableCell className="font-semibold text-primary">{formatPrice(p.selling_price, p.currency)}</TableCell>
                  <TableCell><StockStatusBadge status={p.stock_status} /></TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {p.creator ? (p.creator.full_name || p.creator.email) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(p.created_at)}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onTogglePublish(p)}
                      title={p.is_published ? "Publié — cliquer pour dépublier" : "Brouillon — cliquer pour publier"}
                      className={`flex h-6 w-11 items-center rounded-full transition-colors ${p.is_published ? "bg-green-500" : "bg-muted-foreground/30"}`}
                    >
                      <span className={`ms-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p.is_published ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Modifier"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" title="Supprimer" onClick={() => setToDelete(p)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => {
            const name = localized(p, "name", lang);
            const isSelected = selected.has(p.id);
            return (
              <div
                key={p.id}
                className={`group relative rounded-lg border bg-card transition-shadow hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleOne(p.id)}
                  className="absolute start-2 top-2 z-10 rounded bg-white/90 p-0.5 shadow"
                >
                  {isSelected
                    ? <CheckSquare className="h-4 w-4 text-primary" />
                    : <Square className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />}
                </button>

                {/* Publish toggle */}
                <button
                  type="button"
                  onClick={() => onTogglePublish(p)}
                  className="absolute end-2 top-2 z-10 rounded bg-white/90 p-1 shadow"
                  title={p.is_published ? "Publié" : "Brouillon"}
                >
                  {p.is_published
                    ? <Eye className="h-3.5 w-3.5 text-green-600" />
                    : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>

                {/* Image */}
                <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={name} className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                    : <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1.5">
                  {p.brand && <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{p.brand}</p>}
                  <p className="line-clamp-2 text-sm font-medium leading-tight">{name}</p>
                  {p.sku && <p className="text-[10px] text-muted-foreground">SKU: {p.sku}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-primary">{formatPrice(p.selling_price, p.currency)}</span>
                    <StockStatusBadge status={p.stock_status} />
                  </div>
                </div>

                {/* Hover actions */}
                <div className="absolute inset-x-0 bottom-0 flex translate-y-1 gap-1 rounded-b-lg bg-background/95 p-2 opacity-0 shadow-md transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  <Link href={`/admin/products/${p.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Pencil className="h-3 w-3" /> Modifier
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => setToDelete(p)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete single ── */}
      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogHeader><DialogTitle>Supprimer le produit ?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          « {toDelete ? localized(toDelete, "name", lang) : ""} » sera définitivement supprimé.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setToDelete(null)}>{t("cancel")}</Button>
          <Button variant="destructive" onClick={onConfirmDelete} disabled={busy}>{t("delete")}</Button>
        </div>
      </Dialog>

      {/* ── Bulk delete confirm ── */}
      <Dialog open={bulkDeleteConfirm} onClose={() => setBulkDeleteConfirm(false)}>
        <DialogHeader><DialogTitle>Supprimer {selected.size} produit(s) ?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setBulkDeleteConfirm(false)}>{t("cancel")}</Button>
          <Button variant="destructive" onClick={onBulkDelete} disabled={busy}>Supprimer tout</Button>
        </div>
      </Dialog>
    </div>
  );
}
