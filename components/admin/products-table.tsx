"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockStatusBadge } from "@/components/status-badge";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteProduct, togglePublish } from "@/app/(admin)/admin/products/actions";
import type { Product } from "@/types/database";

export function ProductsTable({ products }: { products: Product[] }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = products.filter((p) => {
    const name = localized(p, "name", lang).toLowerCase();
    return (
      name.includes(query.toLowerCase()) ||
      (p.brand ?? "").toLowerCase().includes(query.toLowerCase())
    );
  });

  async function onTogglePublish(p: Product) {
    try {
      await togglePublish(p.id, !p.is_published);
      toast(p.is_published ? "Produit dépublié" : "Produit publié", "success");
    } catch {
      toast("Erreur", "error");
    }
  }

  async function onConfirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteProduct(toDelete.id);
      toast("Produit supprimé", "success");
      setToDelete(null);
    } catch {
      toast("Erreur lors de la suppression", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search")}
        className="max-w-sm"
      />

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>{t("brand")}</TableHead>
              <TableHead>{t("sellingPrice")}</TableHead>
              <TableHead>{t("stockStatus")}</TableHead>
              <TableHead>{t("published")}</TableHead>
              <TableHead className="text-end">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Aucun produit.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded border bg-muted">
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {localized(p, "name", lang)}
                  </TableCell>
                  <TableCell>{p.brand ?? "—"}</TableCell>
                  <TableCell>
                    {formatPrice(p.selling_price, p.currency)}
                  </TableCell>
                  <TableCell>
                    <StockStatusBadge status={p.stock_status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTogglePublish(p)}
                      title={p.is_published ? "Publié" : "Brouillon"}
                    >
                      {p.is_published ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setToDelete(p)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogHeader>
          <DialogTitle>Supprimer le produit ?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Cette action est irréversible. «{" "}
          {toDelete ? localized(toDelete, "name", lang) : ""} » sera supprimé.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setToDelete(null)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={busy}
          >
            {t("delete")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
