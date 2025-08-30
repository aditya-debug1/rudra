// src/api/categoryApi.ts
import newRequest from "@/utils/func/request";

/** Mirror of the Mongoose schema (including timestamps) */
export interface InventoryCategoryType {
  _id: string;
  displayName: string;
  name: string; // unique, lowercase (server-enforced)
  colorHex: string; // e.g. "#AABBCC"
  precedence: number; // >= 0
  type: "mutable" | "immutable";
  createdAt: string; // ISO string (timestamps: true)
  updatedAt: string; // ISO string
}

/** Bulk precedence payload item */
export type PrecedenceItem = { id: string; precedence: number };

export interface CreateCategoryBody {
  displayName: string;
  name: string;
  colorHex: string;
  precedence: number;
  type: "mutable" | "immutable";
}

export type UpdateCategoryBody = Partial<CreateCategoryBody>;

export interface CreateCategoryResponse {
  message: string;
  categoryId: string;
}

export interface SetPrecedenceResponse {
  message: string;
  matched: number;
  modified: number;
  updated: InventoryCategoryType[];
}

export const categoryApi = {
  /** GET /categories (sorted by precedence asc, createdAt desc) */
  getCategories: async () => {
    const res = await newRequest.get<InventoryCategoryType[]>("/category");
    return res.data;
  },

  /** POST /categories */
  createCategory: async (body: CreateCategoryBody) => {
    const res = await newRequest.post<CreateCategoryResponse>(
      "/category",
      body,
    );
    return res.data;
  },

  /** PUT /categories/:id */
  updateCategory: async (id: string, body: UpdateCategoryBody) => {
    const res = await newRequest.put<InventoryCategoryType>(
      `/category/${id}`,
      body,
    );
    return res.data;
  },

  /** DELETE /categories/:id */
  deleteCategory: async (id: string) => {
    const res = await newRequest.delete<{ message: string }>(`/category/${id}`);
    return res.data;
  },

  /** PATCH /categories/precedence */
  setPrecedence: async (items: PrecedenceItem[]) => {
    const res = await newRequest.patch<SetPrecedenceResponse>(
      "/category/precedence",
      {
        items,
      },
    );
    return res.data;
  },
};
