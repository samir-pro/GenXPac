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
      toast(approved ? t("approved") : t("suspend"), "success");
    } catch {
      toast(t("error"), "error");
    }
  }

  const pending = clients.filter((c) => !c.approved);
  const approved = clients.filter((c) => c.approved);

  const renderCards = (list: Profile[]) =>
    list.map((c) => (
      <div key={c.id} className="rounded-lg border bg-background p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold truncate">{c.shop_name ?? "—"}</p>
            <p className="text-sm text-muted-foreground truncate">{c.full_name ?? "—"}</p>
          </div>
          {c.approved ? (
            <Badge className="shrink-0 border-green-200 bg-green-100 text-green-800">
              {t("approved")}
            </Badge>
          ) : (
            <Badge className="shrink-0 border-yellow-200 bg-yellow-100 text-yellow-800">
              {t("pendingApproval")}
            </Badge>
          )}
        </div>
        <p className="text-sm truncate text-muted-foreground">{c.email}</p>
        {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
        <p className="text-xs text-muted-foreground">
          {t("registeredOn")} {formatDate(c.created_at)}
        </p>
        <div className="pt-1">
          {c.approved ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => approve(c.id, false)}
            >
              <X className="h-4 w-4" /> {t("suspend")}
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full"
              onClick={() => approve(c.id, true)}
            >
              <Check className="h-4 w-4" /> {t("validate")}
            </Button>
          )}
        </div>
      </div>
    ));

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
              {t("approved")}
            </Badge>
          ) : (
            <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
              {t("pendingApproval")}
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
              <X className="h-4 w-4" /> {t("suspend")}
            </Button>
          ) : (
            <Button size="sm" onClick={() => approve(c.id, true)}>
              <Check className="h-4 w-4" /> {t("validate")}
            </Button>
          )}
        </TableCell>
      </TableRow>
    ));

  return (
    <div className="space-y-8">
      {/* Pending section */}
      <section className="space-y-3">
        <h3 className="font-semibold">
          {t("pendingRequests")} ({pending.length})
        </h3>

        {/* Mobile card view */}
        <div className="block sm:hidden space-y-3">
          {pending.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">{t("noPending")}</p>
          ) : (
            renderCards(pending)
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("shopName")}</TableHead>
                <TableHead>{t("fullName")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead>{t("registeredOn")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t("noPending")}
                  </TableCell>
                </TableRow>
              ) : (
                renderRows(pending)
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Approved section */}
      <section className="space-y-3">
        <h3 className="font-semibold">
          {t("validatedClients")} ({approved.length})
        </h3>

        {/* Mobile card view */}
        <div className="block sm:hidden space-y-3">
          {approved.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">{t("noApproved")}</p>
          ) : (
            renderCards(approved)
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("shopName")}</TableHead>
                <TableHead>{t("fullName")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead>{t("registeredOn")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approved.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t("noApproved")}
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
