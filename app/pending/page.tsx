import { Clock } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="space-y-4 p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-700" />
          </div>
          <h1 className="text-xl font-semibold">Compte en attente de validation</h1>
          <p className="text-sm text-muted-foreground">
            Votre inscription a bien été reçue. Un administrateur doit valider
            votre compte avant que vous puissiez accéder au catalogue. Vous
            serez contacté prochainement.
          </p>
          <p className="text-xs text-muted-foreground" dir="rtl">
            تم استلام تسجيلك. يجب على المسؤول الموافقة على حسابك قبل الوصول إلى
            الكتالوج.
          </p>
          <form action={logoutAction}>
            <Button variant="outline" className="w-full">
              Déconnexion
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
