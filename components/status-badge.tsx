"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { PREORDER_STATUS, BATCH_STATUS, STOCK_STATUS } from "@/lib/constants";
import type {
  PreorderStatus,
  BatchStatus,
  StockStatus,
} from "@/types/database";

export function PreorderStatusBadge({ status }: { status: PreorderStatus }) {
  const { lang } = useI18n();
  const s = PREORDER_STATUS[status];
  return <Badge className={s.className}>{s[lang]}</Badge>;
}

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const { lang } = useI18n();
  const s = BATCH_STATUS[status];
  return <Badge className={s.className}>{s[lang]}</Badge>;
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const { lang } = useI18n();
  const s = STOCK_STATUS[status];
  return <Badge className={s.className}>{s[lang]}</Badge>;
}
