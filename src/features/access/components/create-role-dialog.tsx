import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PermissionTreeEditor } from "@/features/access/components/permission-tree-editor";
import { usePermissionCatalog, useRoleMutations } from "@/hooks/use-rbac";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateRoleDialog({ open, onOpenChange }: Props) {
  const catalog = usePermissionCatalog();
  const mutations = useRoleMutations();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const reset = () => {
    setName("");
    setDescription("");
    setPermissions([]);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const keyFromName = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64);

  const handleCreate = () => {
    const key = keyFromName(name);
    if (!key || key.length < 2) return;
    mutations.create.mutate(
      { key, name: name.trim(), description: description.trim(), permissions },
      {
        onSuccess: (res) => {
          handleClose();
          void navigate({
            to: "/settings/access/roles/$roleKey",
            params: { roleKey: res.data.key },
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : handleClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>Define a reusable role with selected permissions.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              placeholder="Family Device Viewer"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea
              id="role-desc"
              placeholder="Can view family device awareness information."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Permissions</p>
            {catalog.data && (
              <PermissionTreeEditor
                definitions={catalog.data}
                value={permissions}
                onChange={setPermissions}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || mutations.create.isPending}>
            {mutations.create.isPending ? "Creating…" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
