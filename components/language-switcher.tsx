"use client";

import { Globe } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "ع" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      <Globe className="mx-1 h-4 w-4 text-muted-foreground" />
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            "rounded px-2 py-1 text-xs font-medium transition-colors",
            lang === l.code
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
