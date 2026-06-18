"use client";

import { Check, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setClientApproval } from "@/app/(admin)/admin/clients/actions";
import type { Profile } from "@/types/database";

export function ClientsTable({ clients }: { clients: Profile[] }) {
  const { t } = useI18n();
  const { toast } = useToast();

  async function approve(id: string, approved: boolean) {
    try {
      await setClientApproval(id, approved);
      toast(approved ? "Client validé" : "Accès suspendu", "success");
    } catch {
      toast("Erreur", "error");
    }
  }

  const pending = clients.filter((c) => !c.approved);
  const approved = clients.filter((c) => c.approved);

  const renderRows = (list: Profile[]) =>
    list.map((c) => (
      <TableRow key={c.id}>
        <TableCell className="font-medium">{c.shop_name ?? "—"}</TableCell>
        <TableCell>{c.full_name ?? "—"}</TableCell>
        <TableCell>{c.email}</TableCell>
        <TableCell>{c.phone ?? "—"}</TableCell>
        <TableCell>{formatDate(c.created_at)}</TableCell>
        <TableCell>
          {c.approved ? (
            <Badge className="border-green-200 bg-green-100 text-green-800">
              Validé
            </Badge>
          ) : (
            <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
              En attente
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-end">
          {c.approved ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => approve(c.id, false)}
            >
              <X className="h-4 w-4" /> Suspendre
            </Button>
          ) : (
            <Button size="sm" onClick={() => approve(c.id, true)}>
              <Check className="h-4 w-4" /> Valider
            </Button>
          )}
        </TableCell>
      </TableRow>
    ));

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="font-semibold">
          En attente de validation ({pending.length})
        </h3>
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("shopName")}</TableHead>
                <TableHead>{t("fullName")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucune demande en attente.
                  </TableCell>
                </TableRow>
              ) : (
                renderRows(pending)
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Clients validés ({approved.length})</h3>
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("shopName")}</TableHead>
                <TableHead>{t("fullName")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approved.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucun client validé.
                  </TableCell>
                </TableRow>
              ) : (
                renderRows(approved)
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
