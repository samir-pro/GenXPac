"use client";

import { ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useI18n, localized } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PreorderStatusBadge } from "@/components/status-badge";
import { cancelPreorder } from "@/app/(shop)/actions";
import type { Preorder, Product } from "@/types/database";

export interface ClientPreorder extends Preorder {
  product: Product | null;
}

export function PreordersList({ preorders }: { preorders: ClientPreorder[] }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  async function onCancel(id: string) {
    try {
      await cancelPreorder(id);
      toast(t("preorderCancelled"), "success");
    } catch {
      toast(t("error"), "error");
    }
  }

  if (preorders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          {t("noPreordersClient")}{" "}
          <Link href="/catalog" className="text-primary hover:underline">
            {t("browseCatalog")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {preorders.map((po) => {
        const p = po.product;
        const unitPrice = po.agreed_price ?? p?.selling_price ?? 0;
        return (
          <Card key={po.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded border bg-muted">
                {p?.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">
                    {p ? localized(p, "name", lang) : t("deletedProduct")}
                  </h3>
                  <PreorderStatusBadge status={po.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {po.quantity} × {formatPrice(unitPrice, p?.currency)} ={" "}
                  <span className="font-semibold text-foreground">
                    {formatPrice(po.quantity * unitPrice, p?.currency)}
                  </span>
                </p>
                {po.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("notes")} : {po.notes}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(po.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/messages">
                  <Button variant="outline" size="sm" className="py-2">
                    {t("messages")}
                  </Button>
                </Link>
                {po.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="py-2"
                    onClick={() => onCancel(po.id)}
                  >
                    <X className="h-4 w-4" /> {t("cancel")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
