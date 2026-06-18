"use server";

type Lang = "fr" | "ar" | "en";

async function callMyMemory(text: string, from: Lang, to: Lang): Promise<string> {
  if (!text.trim()) return "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`MyMemory error ${res.status}`);
  const json = await res.json();
  const translated = json?.responseData?.translatedText as string | undefined;
  if (!translated || json?.responseStatus !== 200) throw new Error("Traduction échouée");
  return translated;
}

export interface TranslateResult {
  name_fr: string;
  name_ar: string;
  name_en: string;
  description_fr: string;
  description_ar: string;
  description_en: string;
}

export async function autoTranslate(
  sourceLang: Lang,
  name: string,
  description: string
): Promise<TranslateResult> {
  const targets: Lang[] = (["fr", "ar", "en"] as Lang[]).filter((l) => l !== sourceLang);

  const [name1, name2, desc1, desc2] = await Promise.all([
    callMyMemory(name, sourceLang, targets[0]),
    callMyMemory(name, sourceLang, targets[1]),
    callMyMemory(description, sourceLang, targets[0]),
    callMyMemory(description, sourceLang, targets[1]),
  ]);

  const names: Record<Lang, string> = { [sourceLang]: name } as Record<Lang, string>;
  names[targets[0]] = name1;
  names[targets[1]] = name2;

  const descs: Record<Lang, string> = { [sourceLang]: description } as Record<Lang, string>;
  descs[targets[0]] = desc1;
  descs[targets[1]] = desc2;

  return {
    name_fr: names.fr,
    name_ar: names.ar,
    name_en: names.en,
    description_fr: descs.fr,
    description_ar: descs.ar,
    description_en: descs.en,
  };
}
