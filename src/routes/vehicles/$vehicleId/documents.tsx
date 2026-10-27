import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Can } from "@/features/capabilities/can";
import { DataPanel, SemanticBadge } from "@/components/future";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { GlassButton, GlassInput } from "@/features/expenses/components/glass";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useVehicleDocuments, useVehicleRecordMutations } from "@/hooks/use-vehicles";
import { vehicleApi } from "@/lib/api/vehicle-service";
import type { DocumentType } from "@/lib/api/vehicle-types";
import { PERM } from "@/lib/permissions";

export const Route = createFileRoute("/vehicles/$vehicleId/documents")({
  component: VehicleDocumentsPage,
});

function VehicleDocumentsPage() {
  const { vehicleId } = Route.useParams();
  const docs = useVehicleDocuments(vehicleId);
  const m = useVehicleRecordMutations(vehicleId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("insurance");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (docs.isLoading) return <RowsSkeleton rows={3} />;
  if (docs.isError) {
    return <ErrorState error={docs.error} onRetry={() => docs.refetch()} />;
  }

  const submit = async () => {
    if (!file || !name.trim()) return;
    setUploading(true);
    try {
      const presign = await vehicleApi.files.presignUpload(vehicleId, {
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        purpose: "document",
      });
      await fetch(presign.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      m.createDocument.mutate(
        {
          documentType,
          name: name.trim(),
          storageKey: presign.storageKey,
          contentType: file.type,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        },
        { onSuccess: () => setOpen(false) },
      );
    } finally {
      setUploading(false);
    }
  };

  const docStatus = (expiry?: string) => {
    if (!expiry) return null;
    const exp = new Date(expiry);
    const now = new Date();
    if (exp < now) return <SemanticBadge tone="danger">Expired</SemanticBadge>;
    if (exp.getTime() - now.getTime() < 30 * 86400000) {
      return <SemanticBadge tone="warning">Expiring soon</SemanticBadge>;
    }
    return <SemanticBadge tone="success">Valid</SemanticBadge>;
  };

  return (
    <>
      <DataPanel
        title="Documents"
        accent="info"
        action={
          <Can permission={PERM.VEHICLES_MANAGE}>
            <GlassButton onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Upload
            </GlassButton>
          </Can>
        }
      >
        {!docs.data?.length ? (
          <EmptyState title="No documents" line="Upload registration, insurance, or PUC certificates." />
        ) : (
          <ul className="divide-y divide-hairline/40">
            {docs.data.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{d.documentType.replace(/_/g, " ")}</p>
                  {d.expiryDate ? (
                    <p className="text-xs">Expires {new Date(d.expiryDate).toLocaleDateString()}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {docStatus(d.expiryDate)}
                  <button
                    type="button"
                    className="text-xs text-primary"
                    onClick={async () => {
                      const url = await vehicleApi.files.downloadUrl(vehicleId, d.storageKey);
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Download
                  </button>
                  <Can permission={PERM.VEHICLES_MANAGE}>
                    <button
                      type="button"
                      aria-label="Delete document"
                      onClick={() => {
                        if (window.confirm("Delete this document?")) m.deleteDocument.mutate(d.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </Can>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DataPanel>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Upload document</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-3">
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Name *</span>
              <GlassInput value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Type</span>
              <select
                className="h-10 w-full rounded-md border border-hairline bg-transparent px-2 text-sm"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              >
                {(["registration", "insurance", "puc", "purchase_invoice", "other"] as const).map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Expiry date</span>
              <GlassInput type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">File *</span>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <GlassButton onClick={() => void submit()} disabled={uploading || m.createDocument.isPending}>
              Upload
            </GlassButton>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
