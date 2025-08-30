"use client";

import { GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/ui/sortable";

import { Badge } from "@/components/ui/badge";
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

import { useToast } from "@/hooks/use-toast";
import type {
  InventoryCategoryType,
  PrecedenceItem,
} from "@/store/category/api";
import { useCategories } from "@/store/category/query";

import { CenterWrapper } from "@/components/custom ui/center-page";
import ErrorCard, { AccessDenied } from "@/components/custom ui/error-display";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { CustomAxiosError } from "@/utils/types/axios";
import CategoryDeleteDialog from "./category-delete";
import CategoryFormDialog from "./category-form";

/** ---------------------- Small UI bits ---------------------- */
function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block size-4 rounded-md ring-1 ring-black/10"
      style={{ background: hex }}
      aria-label={`color ${hex}`}
    />
  );
}

function TypeBadge({ type }: { type: InventoryCategoryType["type"] }) {
  const variant: "secondary" | "destructive" =
    type === "immutable" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {type}
    </Badge>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
      <p className="text-sm text-muted-foreground">No categories yet.</p>
      <Button className="mt-3" onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" /> New category
      </Button>
    </div>
  );
}

/** ---------------------- Row ---------------------- */
function CategoryRow({
  c,
  onEdit,
  onAskDelete,
}: {
  c: InventoryCategoryType;
  onEdit: (c: InventoryCategoryType) => void;
  onAskDelete: (c: InventoryCategoryType) => void;
}) {
  return (
    <SortableItem value={c._id} asChild>
      <TableRow className="transition-transform">
        {/* precedence (with drag handle) */}
        <TableCell>
          <div className="flex items-center gap-2">
            <SortableDragHandle size="icon" variant="ghost" aria-label="Drag">
              <GripVertical className="h-4 w-4" />
            </SortableDragHandle>
            <span className="text-xs text-muted-foreground">
              #{c.precedence + 1}
            </span>
          </div>
        </TableCell>

        {/* display name */}
        <TableCell className="font-medium">
          <span className="truncate">{c.displayName}</span>
        </TableCell>

        {/* name */}
        <TableCell>
          <code className="truncate rounded bg-muted px-2 py-1 text-xs w-fit">
            {c.name}
          </code>
        </TableCell>

        {/* type */}
        <TableCell>
          <TypeBadge type={c.type} />
        </TableCell>

        {/* color */}
        <TableCell>
          <div className="flex items-center gap-2">
            <ColorSwatch hex={c.colorHex} />
            <span className="text-xs text-muted-foreground">{c.colorHex}</span>
          </div>
        </TableCell>

        {/* actions */}
        <TableCell className="w-[100px] text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(c)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title={
                c.type === "immutable" ? "Can't delete immutable" : "Delete"
              }
              disabled={c.type === "immutable"}
              onClick={() => onAskDelete(c)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </SortableItem>
  );
}

/** ---------------------- Table ---------------------- */
export default function CategoryTable() {
  const { toast } = useToast();
  const {
    useCategoriesList,
    setPrecedenceMutation, // server commit
  } = useCategories();
  const { logout: handleLogout, combinedRole } = useAuth(true);
  const showCategories = hasPermission(
    combinedRole,
    "Settings",
    "view-category",
  );

  // Fetch from server
  const {
    data: categories = [],
    isLoading,
    isFetching,
    error,
  } = useCategoriesList();

  // Local ordered list (source of truth while dragging)
  const [ordered, setOrdered] = React.useState<InventoryCategoryType[]>([]);
  React.useEffect(() => {
    setOrdered([...categories].sort((a, b) => a.precedence - b.precedence));
  }, [categories]);

  // Create / Edit dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<InventoryCategoryType | null>(
    null,
  );

  const openCreate = () => {
    setEditing(null);
    setFormMode("create");
    setFormOpen(true);
  };
  const openEdit = (c: InventoryCategoryType) => {
    setEditing(c);
    setFormMode("edit");
    setFormOpen(true);
  };

  // Delete dialog state
  const [pendingDelete, setPendingDelete] =
    React.useState<InventoryCategoryType | null>(null);

  // Commit precedence once (drag end)
  const commitPrecedence = React.useCallback(
    (next: InventoryCategoryType[]) => {
      const payload: PrecedenceItem[] = next.map((c, idx) => ({
        id: c._id,
        precedence: idx, // 0-based
      }));
      setPrecedenceMutation.mutate(payload, {
        onError: (e: unknown) =>
          toast({
            title: "Reorder failed",
            description: String((e as Error)?.message ?? e),
            variant: "destructive",
          }),
      });
    },
    [setPrecedenceMutation, toast],
  );

  // value for Sortable (memoized)
  const sortableValue = React.useMemo(
    () => ordered.map((c) => ({ id: c._id })),
    [ordered],
  );

  if (!showCategories)
    return (
      <CenterWrapper>
        <AccessDenied />
      </CenterWrapper>
    );

  if (error) {
    const { response, message } = error as CustomAxiosError;
    let errMsg = response?.data.error ?? message;
    if (errMsg === "Access denied. No token provided")
      errMsg = "Access denied. No token provided please login again";
    if (errMsg === "Network Error")
      errMsg =
        "Connection issue detected. Please check your internet or try again later.";
    return (
      <CenterWrapper className="px-2 gap-2 text-center">
        <ErrorCard
          title="Error occured"
          description={errMsg}
          btnTitle="Go to Login"
          onAction={handleLogout}
        />
      </CenterWrapper>
    );
  }

  return (
    <Card className="w-[90svw] lg:w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Categories</CardTitle>
        <div className="flex items-center gap-2">
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : ordered.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Precedence</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Display Name
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <Sortable
                value={sortableValue}
                onValueChange={(next) => {
                  // next is the reordered array of { id }
                  setOrdered((prev) => {
                    const byId = new Map(prev.map((c) => [c._id, c]));
                    // Rebuild the ordered list from ids
                    const reordered = next
                      .map((v) => byId.get(String(v.id)))
                      .filter(Boolean) as InventoryCategoryType[];

                    // (Optional) append any leftover items (in case data changed mid-drag)
                    const leftovers = prev.filter(
                      (c) => !next.some((v) => v.id === c._id),
                    );
                    const finalOrder = [...reordered, ...leftovers];

                    // Commit once, on drop
                    commitPrecedence(finalOrder);
                    return finalOrder;
                  });
                }}
                overlay={
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="rounded-md border bg-primary/10 shadow">
                          <TableCell colSpan={6} className="h-12" />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                }
              >
                <TableBody>
                  {ordered.map((c) => (
                    <CategoryRow
                      key={c._id}
                      c={c}
                      onEdit={openEdit}
                      onAskDelete={setPendingDelete}
                    />
                  ))}
                </TableBody>
              </Sortable>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Create / Edit dialog */}
      <CategoryFormDialog
        mode={formMode}
        preset={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      {/* Delete dialog */}
      <CategoryDeleteDialog
        category={pendingDelete}
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        onDeleted={() => setPendingDelete(null)}
      />
    </Card>
  );
}
