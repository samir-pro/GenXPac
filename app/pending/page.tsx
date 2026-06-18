"use client";

import { Clock } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function PendingPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="space-y-5 p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-700" />
          </div>
          <h1 className="text-xl font-semibold">{t("accountPending")}</h1>
          <p className="text-sm text-muted-foreground">{t("accountPendingDesc")}</p>
          <form action={logoutAction}>
            <Button variant="outline" className="w-full">
              {t("logout")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
