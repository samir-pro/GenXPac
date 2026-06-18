"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PreorderStatusBadge } from "@/components/status-badge";
import { sendMessage } from "@/app/(shop)/actions";
import type { Message, Preorder, Product, Profile } from "@/types/database";

export interface Thread {
  preorder: Preorder;
  product: Product | null;
  client: Pick<Profile, "shop_name" | "full_name"> | null;
  messages: Message[];
}

export function MessagesInterface({
  threads,
  currentUserId,
  showClient = false,
}: {
  threads: Thread[];
  currentUserId: string;
  showClient?: boolean;
}) {
  const { lang } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    threads[0]?.preorder.id ?? null
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const selected = threads.find((th) => th.preorder.id === selectedId) ?? null;

  async function onSend() {
    if (!selected || !draft.trim()) return;
    setSending(true);
    try {
      await sendMessage(selected.preorder.id, draft);
      setDraft("");
      router.refresh();
    } catch {
      toast("Erreur lors de l'envoi", "error");
    } finally {
      setSending(false);
    }
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Aucune conversation. Les discussions sont liées à vos pré-commandes.
        </CardContent>
      </Card>
    );
  }

  const threadLabel = (th: Thread) =>
    showClient
      ? th.client?.shop_name ?? th.client?.full_name ?? "Boutique"
      : th.product
        ? localized(th.product, "name", lang)
        : "Produit";

  return (
    <div className="grid h-[70vh] gap-4 md:grid-cols-[280px_1fr]">
      <Card className="overflow-y-auto">
        <CardContent className="p-2">
          {threads.map((th) => (
            <button
              key={th.preorder.id}
              onClick={() => setSelectedId(th.preorder.id)}
              className={cn(
                "flex w-full flex-col gap-1 rounded-md p-3 text-start transition-colors",
                selectedId === th.preorder.id
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              )}
            >
              <span className="line-clamp-1 text-sm font-medium">
                {threadLabel(th)}
              </span>
              <span className="text-xs text-muted-foreground">
                {showClient && th.product
                  ? localized(th.product, "name", lang)
                  : `${th.preorder.quantity} unités`}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="font-medium">{threadLabel(selected)}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.product
                    ? showClient
                      ? localized(selected.product, "name", lang)
                      : `${selected.preorder.quantity} × unités`
                    : ""}
                </p>
              </div>
              <PreorderStatusBadge status={selected.preorder.status} />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {selected.messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  Aucun message. Démarrez la discussion.
                </p>
              ) : (
                selected.messages.map((m) => {
                  const mine = m.sender_id === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                          mine
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            mine
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatDate(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2 border-t p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Votre message…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <Button onClick={onSend} disabled={sending || !draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <MessageSquare className="mr-2 h-5 w-5" /> Sélectionnez une
            conversation
          </div>
        )}
      </Card>
    </div>
  );
}
