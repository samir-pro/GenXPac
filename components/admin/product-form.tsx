"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2, Languages, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { autoTranslate } from "@/app/(admin)/admin/products/translate";
import type { Category, Product } from "@/types/database";

type Lang = "fr" | "ar" | "en";

export function ProductForm({
  categories,
  product,
  allTags,
  action,
}: {
  categories: Category[];
  product?: Product;
  allTags: string[];
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useI18n();
  const { toast } = useToast();

  // Controlled state for translatable fields
  const [fields, setFields] = useState({
    name_fr: product?.name_fr ?? "",
    name_ar: product?.name_ar ?? "",
    name_en: product?.name_en ?? "",
    description_fr: product?.description_fr ?? "",
    description_ar: product?.description_ar ?? "",
    description_en: product?.description_en ?? "",
  });

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState<Lang>("fr");

  // Tag chip state
  const [tags, setTags] = useState<string[]>((product as (Product & { tags?: string[] }) | undefined)?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestOpen, setTagSuggestOpen] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setTagSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const setField = (key: keyof typeof fields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const addUrl = () => {
    const url = urlInput.trim();
    if (url) {
      setImages((prev) => [...prev, url]);
      setUrlInput("");
    }
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const onDrop = useCallback(
    async (files: File[]) => {
      setUploading(true);
      const supabase = createClient();
      const uploaded: string[] = [];
      for (const file of files) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: true });
        if (error) {
          toast(`Erreur upload: ${error.message}`, "error");
          continue;
        }
        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
      setUploading(false);
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  async function handleTranslate() {
    const name = fields[`name_${sourceLang}` as keyof typeof fields];
    if (!name.trim()) {
      toast(`Remplissez d'abord le nom en ${sourceLang.toUpperCase()}`, "error");
      return;
    }
    setTranslating(true);
    try {
      const result = await autoTranslate(
        sourceLang,
        name,
        fields[`description_${sourceLang}` as keyof typeof fields]
      );
      setFields(result);
      toast("Traduction effectuée ✓", "success");
    } catch {
      toast("Erreur de traduction — vérifiez votre connexion", "error");
    } finally {
      setTranslating(false);
    }
  }

  return (
    <form
      action={async (fd) => {
        setSubmitting(true);
        // Inject controlled fields into FormData
        Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
        fd.set("images", images.join("\n"));
        fd.set("tags", tags.join(","));
        try {
          await action(fd);
        } catch (e) {
          setSubmitting(false);
          toast(e instanceof Error ? e.message : "Erreur", "error");
        }
      }}
      className="space-y-6"
    >
      {/* ── Multilingual names & descriptions ── */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Auto-translate toolbar */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
            <Languages className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Traduire depuis :</span>
            <Select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value as Lang)}
              className="w-32"
            >
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTranslate}
              disabled={translating}
              className="ms-auto"
            >
              {translating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Traduire automatiquement"
              )}
            </Button>
          </div>

          <Tabs defaultValue="fr">
            <TabsList>
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="fr" className="space-y-3">
              <div className="space-y-2">
                <Label>Nom (FR)</Label>
                <Input
                  value={fields.name_fr}
                  onChange={(e) => setField("name_fr", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (FR)</Label>
                <Textarea
                  value={fields.description_fr}
                  onChange={(e) => setField("description_fr", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="ar" className="space-y-3" dir="rtl">
              <div className="space-y-2">
                <Label>الاسم (AR)</Label>
                <Input
                  value={fields.name_ar}
                  onChange={(e) => setField("name_ar", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>الوصف (AR)</Label>
                <Textarea
                  value={fields.description_ar}
                  onChange={(e) => setField("description_ar", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-3">
              <div className="space-y-2">
                <Label>Name (EN) *</Label>
                <Input
                  value={fields.name_en}
                  onChange={(e) => setField("name_en", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description (EN)</Label>
                <Textarea
                  value={fields.description_en}
                  onChange={(e) => setField("description_en", e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ── Brand, SKU, category, tags ── */}
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("brand")}</Label>
            <Input name="brand" defaultValue={product?.brand ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>SKU / Référence</Label>
            <Input name="sku" defaultValue={product?.sku ?? ""} placeholder="EX-001" />
          </div>
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            <Select name="category_id" defaultValue={product?.category_id ?? ""}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_fr || c.name_en}
                </option>
              ))}
            </Select>
          </div>

          {/* Tag chip input with autocomplete */}
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("tags")}</Label>
            {/* Selected tag chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-1 text-xs font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                      className="ml-0.5 rounded-full hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Tag autocomplete input */}
            <div className="relative" ref={tagRef}>
              <Input
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setTagSuggestOpen(true);
                }}
                onFocus={() => setTagSuggestOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const val = tagInput.trim().replace(/,$/, "").toLowerCase();
                    if (val && !tags.includes(val)) setTags((prev) => [...prev, val]);
                    setTagInput("");
                    setTagSuggestOpen(false);
                  } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
                    setTags((prev) => prev.slice(0, -1));
                  }
                }}
                placeholder={tags.length === 0 ? "Tapez un tag et appuyez sur Entrée…" : "Ajouter un tag…"}
              />
              {tagSuggestOpen && tagInput.trim() && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                  <div className="max-h-48 overflow-y-auto p-1">
                    {/* Matching existing tags */}
                    {allTags
                      .filter(
                        (t) =>
                          t.toLowerCase().includes(tagInput.toLowerCase()) &&
                          !tags.includes(t)
                      )
                      .slice(0, 8)
                      .map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setTags((prev) => [...prev, suggestion]);
                            setTagInput("");
                            setTagSuggestOpen(false);
                          }}
                          className="flex w-full items-center rounded px-3 py-1.5 text-sm hover:bg-accent"
                        >
                          {suggestion}
                        </button>
                      ))}
                    {/* Option to add new tag not in list */}
                    {tagInput.trim() &&
                      !allTags.some(
                        (t) => t.toLowerCase() === tagInput.trim().toLowerCase()
                      ) && (
                        <button
                          type="button"
                          onClick={() => {
                            const val = tagInput.trim().toLowerCase();
                            if (!tags.includes(val)) setTags((prev) => [...prev, val]);
                            setTagInput("");
                            setTagSuggestOpen(false);
                          }}
                          className="flex w-full items-center gap-1.5 rounded px-3 py-1.5 text-sm hover:bg-accent text-muted-foreground"
                        >
                          <Plus className="h-3 w-3" /> Créer « {tagInput.trim()} »
                        </button>
                      )}
                    {allTags.filter(
                      (t) =>
                        t.toLowerCase().includes(tagInput.toLowerCase()) &&
                        !tags.includes(t)
                    ).length === 0 &&
                      (allTags.some(
                        (t) => t.toLowerCase() === tagInput.trim().toLowerCase()
                      ) ||
                        !tagInput.trim()) && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          Aucune suggestion
                        </p>
                      )}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Appuyez sur Entrée ou virgule pour ajouter. Cliquez sur un tag existant pour sélectionner.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Supplier info ── */}
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Fournisseur Chine</Label>
            <Input name="supplier_name" defaultValue={product?.supplier_name ?? ""} placeholder="Shenzhen Electronics Co." />
          </div>
          <div className="space-y-2">
            <Label>Lien fournisseur (Alibaba / 1688)</Label>
            <Input name="supplier_url" type="url" defaultValue={product?.supplier_url ?? ""} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Poids (kg)</Label>
            <Input name="weight_kg" type="number" step="0.001" defaultValue={product?.weight_kg ?? ""} placeholder="0.250" />
          </div>
          <div className="space-y-2">
            <Label>Délai livraison Chine (jours)</Label>
            <Input name="lead_time_days" type="number" min="1" defaultValue={product?.lead_time_days ?? ""} placeholder="30" />
          </div>
        </CardContent>
      </Card>

      {/* ── Images ── */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Label>{t("images")}</Label>
          <div
            {...getRootProps()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-accent"
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              {isDragActive
                ? "Déposez les images ici…"
                : "Glissez-déposez des images ou cliquez"}
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Coller une URL d'image"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addUrl}>
              Ajouter
            </Button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-md border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute end-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Pricing & stock ── */}
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("costPrice")}</Label>
            <Input name="cost_price" type="number" step="0.001" defaultValue={product?.cost_price ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>{t("sellingPrice")} *</Label>
            <Input name="selling_price" type="number" step="0.001" required defaultValue={product?.selling_price ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>{t("unit")}</Label>
            <Input name="unit" defaultValue={product?.unit ?? "pièce"} />
          </div>
          <div className="space-y-2">
            <Label>{t("minOrderQty")}</Label>
            <Input name="min_order_qty" type="number" min="1" defaultValue={product?.min_order_qty ?? 1} />
          </div>
          <div className="space-y-2">
            <Label>{t("stockStatus")}</Label>
            <Select name="stock_status" defaultValue={product?.stock_status ?? "available"}>
              <option value="available">Disponible</option>
              <option value="limited">Stock limité</option>
              <option value="unavailable">Indisponible</option>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-8">
            <input
              id="is_published"
              name="is_published"
              type="checkbox"
              defaultChecked={product?.is_published ?? false}
              className="h-4 w-4"
            />
            <Label htmlFor="is_published">{t("published")}</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting || uploading || translating}>
          {submitting ? "…" : t("save")}
        </Button>
      </div>
    </form>
  );
}
