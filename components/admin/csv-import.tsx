"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bulkImportProducts } from "@/app/(admin)/admin/products/actions";
import type { Product } from "@/types/database";

type ParsedRow = Partial<Product>;

const COLUMNS = [
  "name_en",
  "name_fr",
  "name_ar",
  "brand",
  "selling_price",
  "cost_price",
  "min_order_qty",
  "unit",
  "tags",
  "images",
];

function normalize(row: Record<string, unknown>): ParsedRow {
  const get = (k: string) => {
    const found = Object.keys(row).find(
      (key) => key.trim().toLowerCase() === k.toLowerCase()
    );
    return found ? row[found] : undefined;
  };
  const str = (k: string) => {
    const v = get(k);
    return v === undefined || v === null ? "" : String(v).trim();
  };
  const numOrNull = (k: string) => {
    const v = str(k);
    if (!v) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  return {
    name_en: str("name_en") || str("name") || str("nom"),
    name_fr: str("name_fr") || null,
    name_ar: str("name_ar") || null,
    brand: str("brand") || null,
    selling_price: numOrNull("selling_price") ?? 0,
    cost_price: numOrNull("cost_price"),
    min_order_qty: numOrNull("min_order_qty") ?? 1,
    unit: str("unit") || "pièce",
    tags: str("tags")
      ? str("tags")
          .split(/[;,]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    images: str("images")
      ? str("images")
          .split(/[;\n]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    is_published: false,
  };
}

export function CsvImport() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  async function handleFile(file: File) {
    setDone(null);
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    const parsed = json.map(normalize).filter((r) => r.name_en);
    setRows(parsed);
    if (parsed.length === 0) {
      toast("Aucune ligne valide (colonne name_en/name requise)", "error");
    }
  }

  async function onImport() {
    setImporting(true);
    const res = await bulkImportProducts(rows);
    setImporting(false);
    if (res.error) {
      toast(res.error, "error");
    } else {
      setDone(res.inserted);
      setRows([]);
      toast(`${res.inserted} produits importés`, "success");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importer un fichier CSV / Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Colonnes reconnues : <code>{COLUMNS.join(", ")}</code>. Les{" "}
            <strong>tags</strong> et <strong>images</strong> peuvent contenir
            plusieurs valeurs séparées par <code>;</code>. La colonne{" "}
            <code>name_en</code> (ou <code>name</code>) est obligatoire.
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center hover:bg-accent">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-sm text-muted-foreground">
              {fileName || "Choisir un fichier .csv, .xls ou .xlsx"}
            </span>
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>

          {done !== null && (
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              {done} produits importés avec succès.
            </div>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Aperçu ({rows.length} lignes)</CardTitle>
            <Button onClick={onImport} disabled={importing}>
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Importer {rows.length} produits
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>name_en</TableHead>
                    <TableHead>name_fr</TableHead>
                    <TableHead>brand</TableHead>
                    <TableHead>prix</TableHead>
                    <TableHead>min</TableHead>
                    <TableHead>tags</TableHead>
                    <TableHead>images</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 50).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.name_en}</TableCell>
                      <TableCell>{r.name_fr ?? "—"}</TableCell>
                      <TableCell>{r.brand ?? "—"}</TableCell>
                      <TableCell>{r.selling_price}</TableCell>
                      <TableCell>{r.min_order_qty}</TableCell>
                      <TableCell>{r.tags?.join(", ")}</TableCell>
                      <TableCell>{r.images?.length ?? 0} img</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {rows.length > 50 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Affichage des 50 premières lignes.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
