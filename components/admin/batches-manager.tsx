"use client";

import { useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BatchStatusBadge } from "@/components/status-badge";
import { BATCH_STATUS } from "@/lib/constants";
import {
  createBatch,
  updateBatchStatus,
  deleteBatch,
} from "@/app/(admin)/admin/batches/actions";
import type { Batch, BatchStatus } from "@/types/database";

export function BatchesManager({
  batches,
  counts,
}: {
  batches: Batch[];
  counts: Record<string, { units: number; products: number }>;
}) {
  const { lang, t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  async function onStatus(id: string, status: BatchStatus) {
    try {
      await updateBatchStatus(id, status);
      toast(t("updated"), "success");
    } catch {
      toast(t("error"), "error");
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteBatch(id);
      toast(t("deleted"), "success");
    } catch {
      toast(t("error"), "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> {t("newBatch")}
        </Button>
      </div>

      {batches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t("noBatches")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {batches.map((b) => {
            const c = counts[b.id] ?? { units: 0, products: 0 };
            return (
              <Card key={b.id}>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle>{b.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("createdOn")} {formatDate(b.created_at)}
                    </p>
                  </div>
                  <BatchStatusBadge status={b.status} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {c.products} {t("products")}
                    </span>
                    <span className="font-medium">{c.units} {t("totalUnits")}</span>
                  </div>
                  {b.estimated_arrival && (
                    <p className="text-sm text-muted-foreground">
                      {t("estimatedArrival")} : {formatDate(b.estimated_arrival)}
                    </p>
                  )}
                  {b.actual_arrival && (
                    <p className="text-sm text-green-700">
                      {t("arrivedOn")} {formatDate(b.actual_arrival)}
                    </p>
                  )}
                  {b.notes && <p className="text-sm">{b.notes}</p>}
                  <div className="flex items-center gap-2 pt-2">
                    <Select
                      className="h-9"
                      defaultValue={b.status}
                      onChange={(e) =>
                        onStatus(b.id, e.target.value as BatchStatus)
                      }
                    >
                      {Object.keys(BATCH_STATUS).map((s) => (
                        <option key={s} value={s}>
                          {BATCH_STATUS[s as BatchStatus][lang]}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(b.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>{t("newBatch")}</DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            setCreating(true);
            try {
              await createBatch(fd);
              toast(t("created"), "success");
              setOpen(false);
            } catch (e) {
              toast(e instanceof Error ? e.message : t("error"), "error");
            } finally {
              setCreating(false);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>{t("batchName")}</Label>
            <Input name="name" required />
          </div>
          <div className="space-y-2">
            <Label>{t("estimatedArrival")}</Label>
            <Input name="estimated_arrival" type="date" />
          </div>
          <div className="space-y-2">
            <Label>{t("notes")}</Label>
            <Textarea name="notes" />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={creating}>
              {t("create")}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
