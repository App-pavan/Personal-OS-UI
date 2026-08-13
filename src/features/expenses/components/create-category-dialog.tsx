import { useState } from "react";
import { GlassButton, GlassInput } from "./glass";
import { useCategoryMutations } from "@/hooks/use-expenses";

export function CreateCategoryDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (categoryId: string) => void;
}) {
  const [name, setName] = useState("");
  const mutations = useCategoryMutations();

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const cat = await mutations.create.mutateAsync({ name: trimmed });
    setName("");
    onCreated(cat.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="glass-panel w-full max-w-md rounded-2xl border border-hairline/80 p-6 shadow-elevation-2"
      >
        <h2 className="text-lg font-semibold">Create category</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a category and assign a budget limit immediately.
        </p>
        <label className="mt-4 block">
          <span className="label-eyebrow">Name</span>
          <GlassInput
            className="mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Subscriptions"
            autoFocus
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" disabled={mutations.create.isPending || !name.trim()}>
            Create category
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
