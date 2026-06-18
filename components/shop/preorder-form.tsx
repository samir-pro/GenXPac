"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createPreorder } from "@/app/(shop)/actions";
import type { Product } from "@/types/database";

export function PreorderForm({ product }: { product: Product }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.min_order_qty);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const disabled = product.stock_status === "unavailable";

  async function submit() {
    if (quantity < product.min_order_qty) {
      toast(`Quantité minimum : ${product.min_order_qty}`, "error");
      return;
    }
    setBusy(true);
    try {
      await createPreorder(product.id, quantity, notes);
      toast("Pré-commande enregistrée", "success");
      setOpen(false);
      router.push("/preorders");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        size="lg"
        className="w-full"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <ShoppingBag className="h-4 w-4" />
        {disabled ? "Indisponible" : t("preorder")}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>{t("preorder")}</DialogTitle>
          <DialogDescription>
            {formatPrice(product.selling_price, product.currency)} /{" "}
            {product.unit}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              {t("quantity")} (min. {product.min_order_qty})
            </Label>
            <Input
              type="number"
              min={product.min_order_qty}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            Total estimé :{" "}
            <span className="font-bold">
              {formatPrice(quantity * product.selling_price, product.currency)}
            </span>
          </div>
          <div className="space-y-2">
            <Label>{t("notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Couleur, taille, demande de prix…"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "…" : t("confirm")}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
