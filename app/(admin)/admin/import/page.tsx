import { CsvImport } from "@/components/admin/csv-import";

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold">Import en masse</h2>
      <CsvImport />
    </div>
  );
}
