import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Custom UI wrappers (parity with VisitForm style)
import { Combobox, ComboboxOption } from "@/components/custom ui/combobox";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";

import { useToast } from "@/hooks/use-toast";

import type {
  CreateCategoryBody,
  InventoryCategoryType,
  UpdateCategoryBody,
} from "@/store/category/api";
import { useCategories } from "@/store/category/query";

// Optional utils used in VisitForm pattern
import { formatZodErrors } from "@/utils/func/zodUtils";
import { CustomAxiosError } from "@/utils/types/axios";

/** ---------------------- Schema & types ---------------------- */
const CategoryFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(64),
  name: z
    .string()
    .min(1, "Name is required")
    .max(64)
    .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, - or _"),
  colorHex: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Enter a valid hex color like #AABBCC",
    ),
  type: z.union([z.literal("mutable"), z.literal("immutable")]),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

/** ---------------------- Small UI helpers ---------------------- */
function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block size-4 rounded-md ring-1 ring-black/10"
      style={{ background: hex }}
      aria-label={`color ${hex}`}
    />
  );
}

/** ---------------------- Component ---------------------- */
export default function CategoryFormDialogLikeVisitForm({
  mode,
  preset,
  open,
  onOpenChange,
  onSubmitted,
}: {
  mode: "create" | "edit";
  preset?: InventoryCategoryType | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmitted?: (createdOrUpdated: InventoryCategoryType) => void;
}) {
  const isEdit = mode === "edit";
  const { toast } = useToast();
  const { useCategoriesList, createCategoryMutation, updateCategoryMutation } =
    useCategories();
  const { data: categories = [] } = useCategoriesList();

  // ---------------------- Options ----------------------
  const typeOptions: ComboboxOption[] = [
    { label: "Mutable", value: "mutable" },
    { label: "Immutable", value: "immutable" },
  ];

  // ---------------------- Defaults & State ----------------------
  const defaultValues = useMemo<CategoryFormValues>(
    () => ({
      displayName: preset?.displayName ?? "",
      name: preset?.name ?? "",
      colorHex: preset?.colorHex ?? "#999999",
      type: (preset?.type as CategoryFormValues["type"]) ?? "mutable",
    }),
    [preset?.displayName, preset?.name, preset?.colorHex, preset?.type],
  );

  const [formData, setFormData] = useState<CategoryFormValues>(defaultValues);
  const [oldData, setOldData] = useState<CategoryFormValues>(defaultValues);

  const originallyImmutable = preset?.type === "immutable";
  const stillImmutable =
    isEdit && originallyImmutable && formData.type === "immutable";
  const fieldsDisabled = stillImmutable;

  // ---------------------- Handlers ----------------------
  const handleInitialLoad = useCallback(() => {
    if (isEdit && preset) {
      const value: CategoryFormValues = {
        displayName: preset.displayName ?? "",
        name: preset.name ?? "",
        colorHex: preset.colorHex ?? "#999999",
        type: (preset.type as CategoryFormValues["type"]) ?? "mutable",
      };
      setFormData(value);
      setOldData(value);
    } else {
      setFormData(defaultValues);
      setOldData(defaultValues);
    }
  }, [isEdit, preset, defaultValues]);

  const handleInput = (
    field: keyof Omit<CategoryFormValues, "type">,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as CategoryFormValues["type"],
    }));
  };

  const handleCancel = () => {
    onOpenChange(false);
    handleInitialLoad();
  };

  const handleSubmit = () => {
    // normalize name like original RHF onBlur would
    const normalized: CategoryFormValues = {
      ...formData,
      name: (formData.name ?? "").trim().toLowerCase(),
    };

    const validation = CategoryFormSchema.safeParse(normalized);
    if (!validation.success) {
      const errorMessages = formatZodErrors
        ? formatZodErrors(validation.error.errors)
        : validation.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("\n");
      toast({
        title: "Form validation error",
        description: `Please correct the following errors:\n${errorMessages}`,
        variant: "warning",
      });
      return;
    }

    try {
      if (isEdit && preset?._id) {
        const id = preset._id;
        const data: UpdateCategoryBody = {
          displayName: normalized.displayName,
          colorHex: normalized.colorHex,
          name: normalized.name,
          type: normalized.type,
        };
        updateCategoryMutation.mutate(
          { id, data },
          {
            onSuccess: (updated) => {
              toast({
                title: "Category updated",
                description: "Your changes were saved.",
                variant: "success",
              });
              onOpenChange(false);
              onSubmitted?.(updated as unknown as InventoryCategoryType);
            },
            onError: (e: unknown) =>
              toast({
                title: "Update failed",
                description: String((e as Error)?.message ?? e),
                variant: "destructive",
              }),
          },
        );
      } else {
        const body: CreateCategoryBody = {
          ...normalized,
          precedence: categories.length, // append at end (0-based)
        } as CreateCategoryBody;
        createCategoryMutation.mutate(body, {
          onSuccess: (created) => {
            toast({
              title: "Category created",
              description: "New category added.",
              variant: "success",
            });
            onOpenChange(false);
            onSubmitted?.(created as unknown as InventoryCategoryType);
          },
          onError: (e: unknown) => {
            const err = e as CustomAxiosError;
            toast({
              title: "Create failed",
              description: err?.response?.data.error ?? err.message,
              variant: "destructive",
            });
          },
        });
      }
    } catch (e) {
      toast({
        title: "Unexpected error",
        description: String(e),
        variant: "destructive",
      });
    }
  };

  // ---------------------- Effects ----------------------
  useEffect(() => {
    if (open) handleInitialLoad();
  }, [open, handleInitialLoad]);

  // ---------------------- Derived ----------------------
  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const isDataUnchanged = isEdit ? isEqual(formData, oldData) : false;
  const dialogTitle = isEdit ? "Edit category" : "New category";
  const dialogDescription = !isEdit
    ? "Fill the form to create a category."
    : fieldsDisabled
      ? "This category is immutable. Change Type to ‘Mutable’ to edit other fields."
      : "Update fields and save your changes.";

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent
        className="w-[92vw] max-w-md sm:max-w-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 py-2">
            {/* Display Name */}
            <FormFieldWrapper
              LabelText="Display name"
              Important
              ImportantSide="right"
            >
              <Input
                id="displayName"
                value={formData.displayName}
                disabled={fieldsDisabled}
                onChange={(e) => handleInput("displayName", e.target.value)}
              />
            </FormFieldWrapper>

            {/* Name */}
            <FormFieldWrapper LabelText="Name" Important ImportantSide="right">
              <Input
                id="name"
                placeholder="e.g. electronics"
                value={formData.name}
                disabled={fieldsDisabled}
                onChange={(e) => handleInput("name", e.target.value)}
                onBlur={(e) => {
                  if (!fieldsDisabled) {
                    const v = (e.target.value ?? "").toString();
                    handleInput("name", v.trim().toLowerCase());
                  }
                }}
              />
            </FormFieldWrapper>

            {/* Type */}
            <FormFieldWrapper LabelText="Type" Important ImportantSide="right">
              <Combobox
                value={formData.type}
                width="w-full"
                options={typeOptions}
                onChange={handleTypeChange}
                placeholder="Choose"
                emptyMessage="No options"
              />
            </FormFieldWrapper>

            {/* Color */}
            <FormFieldWrapper LabelText="Color" Important ImportantSide="right">
              <div className="flex items-center gap-2">
                <Input
                  id="colorHex"
                  className="flex-1"
                  value={formData.colorHex}
                  disabled={fieldsDisabled}
                  onChange={(e) => handleInput("colorHex", e.target.value)}
                />
                <ColorSwatch hex={formData.colorHex || "#999999"} />
              </div>
            </FormFieldWrapper>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse justify-center items-stretch gap-3 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isDataUnchanged}
            >
              {isSubmitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
