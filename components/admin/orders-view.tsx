"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PreorderStatusBadge } from "@/components/status-badge";
import { PREORDER_STATUS_FLOW, PREORDER_STATUS } from "@/lib/constants";
import {
  updatePreorderStatus,
  updateProductPreordersStatus,
  assignToBatch,
} from "@/app/(admin)/admin/orders/actions";
import type {
  Preorder,
  Product,
  Profile,
  Batch,
  PreorderStatus,
} from "@/types/database";

export interface PreorderRow extends Preorder {
  product: Product | null;
  client: Pick<Profile, "id" | "shop_name" | "full_name"> | null;
}

interface ProductGroup {
  product: Product;
  rows: PreorderRow[];
  totalUnits: number;
  shops: number;
}

export function OrdersView({
  groups,
  batches,
}: {
  groups: ProductGroup[];
  batches: Batch[];
}) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PreorderStatus | "">("");
  const [batchFilter, setBatchFilter] = useState<string>("");

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (batchFilter && !g.rows.some((r) => r.batch_id === batchFilter)) return false;
      if (statusFilter && !g.rows.some((r) => r.status === statusFilter && r.status !== "cancelled")) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const nameMatch = localized(g.product, "name", lang).toLowerCase().includes(q);
        const shopMatch = g.rows.some(
          (r) =>
            (r.client?.shop_name ?? "").toLowerCase().includes(q) ||
            (r.client?.full_name ?? "").toLowerCase().includes(q)
        );
        if (!nameMatch && !shopMatch) return false;
      }
      return true;
    });
  }, [groups, batchFilter, statusFilter, orderSearch, lang]);

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          {t("noPreorders")}
        </CardContent>
      </Card>
    );
  }

  async function bulkStatus(productId: string, status: PreorderStatus) {
    try {
      await updateProductPreordersStatus(productId, status);
      toast(t("updated"), "success");
    } catch {
      toast(t("error"), "error");
    }
  }

  async function rowStatus(id: string, status: PreorderStatus) {
    try {
      await updatePreorderStatus(id, status);
      toast(t("updated"), "success");
    } catch {
      toast(t("error"), "error");
    }
  }

  async function onAssignBatch(productId: string, batchId: string) {
    try {
      await assignToBatch(productId, batchId || null);
      toast(t("updated"), "success");
    } catch {
      toast(t("error"), "error");
    }
  }

  return (
    <div className="space-y-0">
      {/* ── Filter bar ── */}
      <div className="mb-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder={t("search")}
            className="ps-9 h-9"
          />
        </div>
        {/* Status filter */}
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PreorderStatus | "")}
          className="h-9 w-48"
        >
          <option value="">{t("status")} — {t("all")}</option>
          {PREORDER_STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {PREORDER_STATUS[s][lang]}
            </option>
          ))}
        </Select>
        {/* Batch filter */}
        {batches.length > 0 && (
          <Select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="h-9 w-48"
          >
            <option value="">{t("batchChina")} — {t("all")}</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        )}
        {/* Active filter chips + reset */}
        {(orderSearch || statusFilter || batchFilter) && (
          <button
            type="button"
            onClick={() => { setOrderSearch(""); setStatusFilter(""); setBatchFilter(""); }}
            className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> {t("cancel")}
          </button>
        )}
      </div>

      {/* Empty filtered state */}
      {filteredGroups.length === 0 && groups.length > 0 && (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          {t("noResultsFor")} « {orderSearch || statusFilter || batchFilter} »
        </div>
      )}

      {filteredGroups.length > 0 && (
        <div className="overflow-x-auto rounded-md border bg-background">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("totalUnits")}</TableHead>
                <TableHead>{t("shopsCount")}</TableHead>
                <TableHead>{t("batchChina")}</TableHead>
                <TableHead>{t("globalStatus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((g) => {
                const isOpen = expanded === g.product.id;
                return (
                  <>
                    <TableRow
                      key={g.product.id}
                      className="cursor-pointer"
                      onClick={() =>
                        setExpanded(isOpen ? null : g.product.id)
                      }
                    >
                      <TableCell>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {localized(g.product, "name", lang)}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{g.totalUnits}</span>{" "}
                        <span className="text-muted-foreground">
                          {g.product.unit}
                        </span>
                      </TableCell>
                      <TableCell>{g.shops}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          className="h-8 w-40"
                          defaultValue={g.rows[0]?.batch_id ?? ""}
                          onChange={(e) =>
                            onAssignBatch(g.product.id, e.target.value)
                          }
                        >
                          <option value="">—</option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          className="h-8 w-44"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value)
                              bulkStatus(
                                g.product.id,
                                e.target.value as PreorderStatus
                              );
                          }}
                        >
                          <option value="">{t("changeForAll")}</option>
                          {PREORDER_STATUS_FLOW.map((s) => (
                            <option key={s} value={s}>
                              {PREORDER_STATUS[s][lang]}
                            </option>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow key={`${g.product.id}-detail`}>
                        <TableCell colSpan={6} className="bg-muted/30 p-0">
                          <div className="p-4 overflow-x-auto">
                            <Table className="min-w-[500px]">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("shop")}</TableHead>
                                  <TableHead>{t("quantity")}</TableHead>
                                  <TableHead>{t("agreedPrice")}</TableHead>
                                  <TableHead>{t("notes")}</TableHead>
                                  <TableHead>{t("status")}</TableHead>
                                  <TableHead>{t("change")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {g.rows.map((r) => (
                                  <TableRow key={r.id}>
                                    <TableCell className="font-medium">
                                      {r.client?.shop_name ??
                                        r.client?.full_name ??
                                        "—"}
                                    </TableCell>
                                    <TableCell>{r.quantity}</TableCell>
                                    <TableCell>
                                      {formatPrice(
                                        r.agreed_price ??
                                          g.product.selling_price,
                                        g.product.currency
                                      )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                      {r.notes ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                      <PreorderStatusBadge status={r.status} />
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        className="h-8 w-40"
                                        defaultValue={r.status}
                                        onChange={(e) =>
                                          rowStatus(
                                            r.id,
                                            e.target.value as PreorderStatus
                                          )
                                        }
                                      >
                                        {Object.keys(PREORDER_STATUS).map((s) => (
                                          <option key={s} value={s}>
                                            {
                                              PREORDER_STATUS[
                                                s as PreorderStatus
                                              ][lang]
                                            }
                                          </option>
                                        ))}
                                      </Select>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
