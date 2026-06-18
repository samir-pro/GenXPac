"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockStatusBadge } from "@/components/status-badge";
import type { Product } from "@/types/database";

export function ProductCard({
  product,
  listMode = false,
}: {
  product: Product;
  listMode?: boolean;
}) {
  const { lang } = useI18n();
  const name = localized(product, "name", lang);
  const desc = localized(product, "description", lang);

  if (listMode) {
    return (
      <Link href={`/catalog/${product.id}`}>
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
          <div className="flex gap-4 p-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
              {product.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              {product.brand && (
                <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
              )}
              <h3 className="font-medium leading-tight">{name}</h3>
              {desc && (
                <p className="line-clamp-2 text-xs text-muted-foreground">{desc}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-base font-bold text-primary">
                  {formatPrice(product.selling_price, product.currency)}
                </span>
                <StockStatusBadge status={product.stock_status} />
                <Badge className="border bg-secondary text-secondary-foreground text-xs">
                  Min. {product.min_order_qty} unités
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/catalog/${product.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute end-2 top-2">
            <StockStatusBadge status={product.stock_status} />
          </div>
        </div>
        <CardContent className="space-y-2 p-4">
          {product.brand && (
            <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
          )}
          <h3 className="line-clamp-2 font-medium leading-tight">{name}</h3>
          {(product.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(product.tags ?? []).slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.selling_price, product.currency)}
            </span>
            <Badge className="border bg-secondary text-secondary-foreground text-xs">
              Min. {product.min_order_qty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
