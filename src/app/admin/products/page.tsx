"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Types
interface ColorForm {
  id: number;
  button_hex: string;
  text_color: string;
  button_hover_color: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductForm {
  name: string;
  years?: number | null;
  size?: string | null;
  quantity?: number | null;
  price?: number | null;
  offer_status?: boolean;
  is_new_collection?: boolean;
  category_id?: number | null;
  image?: string | null;
  description?: string | null;
}

export default function AddProductPage() {
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    years: null,
    size: "",
    quantity: null,
    price: null,
    offer_status: false,
    is_new_collection: false,
    category_id: null,
    image: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  // Fetch colors
  async function fetchColors() {
    const { data, error } = await supabase
      .from<ColorForm, ColorForm>("colors")
      .select("*")
      .order("id");

    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  // Fetch categories
  async function fetchCategories() {
    const { data, error } = await supabase
      .from<Category, Category>("categories")
      .select("*");

    if (error) toast.error(error.message);
    else setCategories(data || []);
  }

  useEffect(() => {
    fetchColors();
    fetchCategories();
  }, []);

  // Upload image
  async function uploadImage(file: File) {
    const fileName = `public/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("products-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("products-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  // Handle form change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target;

    setForm((prev) => ({
      ...prev!,
      [name]: type === "checkbox" ? checked : type === "number" ? (value ? Number(value) : null) : value,
    }));
  };

  // Submit product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.size || !form.category_id) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      let imageUrl = form.image || "";
      if (file) imageUrl = await uploadImage(file);

      const { error } = await supabase
        .from<ProductForm, ProductForm>("add_products")
        .insert([{ ...form, image: imageUrl }]);

      if (error) throw error;
      toast.success("Product added successfully!");
      router.push("/admin/products/display-products");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Unexpected error occurred.");
    }
  };

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
      <h1
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Add New Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8 flex flex-col gap-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="number"
          name="years"
          placeholder="Year"
          value={form.years ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          name="size"
          placeholder="Size"
          value={form.size}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          required
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity ?? ""}
            onChange={handleChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price ?? ""}
            onChange={handleChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description || ""}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        <select
          name="category_id"
          value={form.category_id ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="offer_status"
              checked={form.offer_status || false}
              onChange={handleChange}
            />
            Offer Status
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_new_collection"
              checked={form.is_new_collection || false}
              onChange={handleChange}
            />
            New Collection
          </label>
        </div>

        <button
          type="submit"
          style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
          className="w-full py-3 rounded-lg font-semibold text-lg mt-4 transition-transform hover:scale-105"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
