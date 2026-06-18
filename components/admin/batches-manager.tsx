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
  const { lang } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  async function onStatus(id: string, status: BatchStatus) {
    try {
      await updateBatchStatus(id, status);
      toast("Statut du lot mis à jour", "success");
    } catch {
      toast("Erreur", "error");
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteBatch(id);
      toast("Lot supprimé", "success");
    } catch {
      toast("Erreur", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nouveau lot
        </Button>
      </div>

      {batches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucun lot. Créez un lot pour regrouper des produits à commander en
            Chine.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {batches.map((b) => {
            const c = counts[b.id] ?? { units: 0, products: 0 };
            return (
              <Card key={b.id}>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle>{b.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Créé le {formatDate(b.created_at)}
                    </p>
                  </div>
                  <BatchStatusBadge status={b.status} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {c.products} produits
                    </span>
                    <span className="font-medium">{c.units} unités</span>
                  </div>
                  {b.estimated_arrival && (
                    <p className="text-sm text-muted-foreground">
                      Arrivée estimée : {formatDate(b.estimated_arrival)}
                    </p>
                  )}
                  {b.actual_arrival && (
                    <p className="text-sm text-green-700">
                      Arrivé le {formatDate(b.actual_arrival)}
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
          <DialogTitle>Nouveau lot Chine</DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            setCreating(true);
            try {
              await createBatch(fd);
              toast("Lot créé", "success");
              setOpen(false);
            } catch (e) {
              toast(e instanceof Error ? e.message : "Erreur", "error");
            } finally {
              setCreating(false);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Nom du lot</Label>
            <Input name="name" placeholder="Commande Juin 2026" required />
          </div>
          <div className="space-y-2">
            <Label>Arrivée estimée</Label>
            <Input name="estimated_arrival" type="date" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea name="notes" />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={creating}>
              Créer
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
