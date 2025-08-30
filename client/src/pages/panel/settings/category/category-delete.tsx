"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { InventoryCategoryType } from "@/store/category/api";
import { useCategories } from "@/store/category/query";

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block size-4 rounded-md ring-1 ring-black/10"
      style={{ background: hex }}
      aria-label={`color ${hex}`}
    />
  );
}

function TypeBadge({ type }: { type?: InventoryCategoryType["type"] }) {
  if (!type) return null;
  const variant: "secondary" | "destructive" =
    type === "immutable" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {type}
    </Badge>
  );
}

export default function CategoryDeleteDialog({
  category,
  open,
  onOpenChange,
  onDeleted,
}: {
  category: InventoryCategoryType | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleted?: () => void;
}) {
  const { toast } = useToast();
  const { deleteCategoryMutation } = useCategories();

  const handleDelete = () => {
    if (!category) return;
    deleteCategoryMutation.mutate(category._id, {
      onSuccess: () => {
        toast({ title: "Category deleted" });
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (e: unknown) =>
        toast({
          title: "Delete failed",
          description: String((e as Error)?.message ?? e),
          variant: "destructive",
        }),
    });
  };

  const immutable = category?.type === "immutable";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete category?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <ColorSwatch hex={category?.colorHex ?? "#999"} />
            <span className="font-medium">{category?.displayName ?? "—"}</span>
            {category?.name && (
              <code className="rounded bg-muted px-2 py-0.5 text-xs">
                {category.name}
              </code>
            )}
            <TypeBadge type={category?.type} />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={immutable}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            title={immutable ? "Can't delete immutable categories" : undefined}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
