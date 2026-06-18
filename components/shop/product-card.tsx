"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockStatusBadge } from "@/components/status-badge";
import type { Product } from "@/types/database";

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useI18n();
  const name = localized(product, "name", lang);

  return (
    <Link href={`/catalog/${product.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={name}
              className="h-full w-full object-cover"
            />
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
            <p className="text-xs font-medium text-muted-foreground">
              {product.brand}
            </p>
          )}
          <h3 className="line-clamp-2 font-medium leading-tight">{name}</h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.selling_price, product.currency)}
            </span>
            <Badge className="border bg-secondary text-secondary-foreground">
              {t("minOrderQty")}: {product.min_order_qty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
