"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface Color {
  id: number;
  text_color: string;
  button_hex: string;
  button_text_color: string;
  button_hover_color?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Book {
  id: number;
  name: string;
  quantity?: number | null;
  price?: number | null;
  category_id?: number | null;
  image?: string | null;
  description?: string | null;
  offer_status?: boolean;
  is_new_collection?: boolean;
  stock?: number;
}

export default function EditBookPage() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [colors, setColors] = useState<Color[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Book | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchColors() {
      const { data, error } = await supabase.from("colors").select("*");
      if (error) toast.error(error.message);
      else setColors(data || []);
    }

    async function fetchCategories() {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) toast.error(error.message);
      else setCategories(data || []);
    }

    async function fetchBook() {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();
      if (error) toast.error(error.message);
      else setForm(data as Book);
    }

    fetchColors();
    fetchCategories();
    fetchBook();
  }, [id]);

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
  async function handleSave() {
    if (!form) return;

    try {
      let imageUrl = form.image || "";
      if (file) imageUrl = await uploadImage(file);

      const { error } = await supabase
        .from("books")
        .update({
          ...form,
          quantity: form.quantity ? Number(form.quantity) : null,
          price: form.price ? Number(form.price) : null,
          category_id: form.category_id ? Number(form.category_id) : null,
          image: imageUrl,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Book Updated!");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Unexpected error");
    }
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const name = target.name;
    const type = target.type;

    let value: string | number | boolean | null = target.value;

    if (type === "checkbox" && "checked" in target) {
      value = target.checked;
    } else if (type === "number") {
      value = target.value ? Number(target.value) : null;
    }

    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  if (!form) return <div className="text-center py-20">Loading...</div>;

  const mainColor = colors[0] || {
    text_color: "#000",
    button_hex: "#4f46e5",
    button_text_color: "#fff",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Toaster />
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Edit Book
      </h1>

      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name || ""}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
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

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={form.stock ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        <select
          name="category_id"
          value={form.category_id ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
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
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description || ""}
          onChange={handleChange}
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
          onClick={handleSave}
          style={{
            backgroundColor: mainColor.button_hex,
            color: mainColor.button_text_color,
          }}
          className="w-full py-3 rounded-lg font-semibold text-lg mt-4 transition-transform hover:scale-105"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
