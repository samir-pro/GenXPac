"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StockStatusBadge } from "@/components/status-badge";
import { PreorderForm } from "@/components/shop/preorder-form";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types/database";

export function ProductDetail({
  product,
  category,
}: {
  product: Product;
  category: Category | null;
}) {
  const { t, lang } = useI18n();
  const images = product.images ?? [];
  const [active, setActive] = useState(0);
  const name = localized(product, "name", lang);
  const description = localized(product, "description", lang);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
          {images[active] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[active]}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "h-16 w-16 shrink-0 overflow-hidden rounded border-2",
                  active === i ? "border-primary" : "border-transparent"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {product.brand && (
          <p className="text-sm font-medium text-muted-foreground">
            {product.brand}
          </p>
        )}
        <h1 className="text-2xl font-bold">{name}</h1>
        <div className="flex items-center gap-3">
          <StockStatusBadge status={product.stock_status} />
          {category && (
            <Badge className="border bg-secondary text-secondary-foreground">
              {localized(category, "name", lang)}
            </Badge>
          )}
        </div>

        <div className="text-3xl font-bold text-primary">
          {formatPrice(product.selling_price, product.currency)}
          <span className="text-base font-normal text-muted-foreground">
            {" "}
            / {product.unit}
          </span>
        </div>

        <div className="text-sm text-muted-foreground">
          {t("minOrderQty")} : {product.min_order_qty} {product.unit}
        </div>

        {description && (
          <div className="prose prose-sm whitespace-pre-wrap text-foreground">
            {description}
          </div>
        )}

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                className="border bg-secondary text-secondary-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="pt-4">
          <PreorderForm product={product} />
        </div>
      </div>
    </div>
  );
}
