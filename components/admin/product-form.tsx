"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2 } from "lucide-react";
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
import type { Category, Product } from "@/types/database";

export function ProductForm({
  categories,
  product,
  action,
}: {
  categories: Category[];
  product?: Product;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <form
      action={async (fd) => {
        setSubmitting(true);
        fd.set("images", images.join("\n"));
        try {
          await action(fd);
        } catch (e) {
          setSubmitting(false);
          toast(e instanceof Error ? e.message : "Erreur", "error");
        }
      }}
      className="space-y-6"
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Tabs defaultValue="fr">
            <TabsList>
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="fr" className="space-y-3">
              <div className="space-y-2">
                <Label>Nom (FR)</Label>
                <Input name="name_fr" defaultValue={product?.name_fr ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Description (FR)</Label>
                <Textarea
                  name="description_fr"
                  defaultValue={product?.description_fr ?? ""}
                />
              </div>
            </TabsContent>
            <TabsContent value="ar" className="space-y-3" dir="rtl">
              <div className="space-y-2">
                <Label>الاسم (AR)</Label>
                <Input name="name_ar" defaultValue={product?.name_ar ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>الوصف (AR)</Label>
                <Textarea
                  name="description_ar"
                  defaultValue={product?.description_ar ?? ""}
                />
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-3">
              <div className="space-y-2">
                <Label>Name (EN) *</Label>
                <Input
                  name="name_en"
                  required
                  defaultValue={product?.name_en ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (EN)</Label>
                <Textarea
                  name="description_en"
                  defaultValue={product?.description_en ?? ""}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("brand")}</Label>
            <Input name="brand" defaultValue={product?.brand ?? ""} />
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
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("tags")} (séparées par des virgules)</Label>
            <Input
              name="tags"
              defaultValue={product?.tags?.join(", ") ?? ""}
              placeholder="électronique, gadget, usb"
            />
          </div>
        </CardContent>
      </Card>

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
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
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

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("costPrice")}</Label>
            <Input
              name="cost_price"
              type="number"
              step="0.001"
              defaultValue={product?.cost_price ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("sellingPrice")} *</Label>
            <Input
              name="selling_price"
              type="number"
              step="0.001"
              required
              defaultValue={product?.selling_price ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("unit")}</Label>
            <Input name="unit" defaultValue={product?.unit ?? "pièce"} />
          </div>
          <div className="space-y-2">
            <Label>{t("minOrderQty")}</Label>
            <Input
              name="min_order_qty"
              type="number"
              min="1"
              defaultValue={product?.min_order_qty ?? 1}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("stockStatus")}</Label>
            <Select
              name="stock_status"
              defaultValue={product?.stock_status ?? "available"}
            >
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
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? "…" : t("save")}
        </Button>
      </div>
    </form>
  );
}
