"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function EditProductPage() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id")); // pass id in URL ?id=1

  const [colors, setColors] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);

  // Fetch colors from DB
  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id", { ascending: true });
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  useEffect(() => {
    fetchCategories();
    fetchProduct();
    fetchColors();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) toast.error(error.message);
    else setCategories(data || []);
  }

  async function fetchProduct() {
    const { data, error } = await supabase.from("add_products").select("*").eq("id", id).single();
    if (error) toast.error(error.message);
    else setForm(data);
  }

  async function uploadImage(file: File) {
    const fileName = `public/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("products-images").upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("products-images").getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  }

  async function handleSave() {
    try {
      let imageUrl = form.image;
      if (file) imageUrl = await uploadImage(file);

      const { error } = await supabase
        .from("add_products")
        .update({
          ...form,
          years: form.years ? Number(form.years) : null,
          quantity: form.quantity ? Number(form.quantity) : null,
          price: form.price ? Number(form.price) : null,
          numberOfOffer: form.numberOfOffer ? Number(form.numberOfOffer) : null,
          category_id: form.category_id ? Number(form.category_id) : null,
          image: imageUrl,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Product Updated!");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (!form) return <div className="text-center py-20">Loading...</div>;

  const mainColor = colors[0] || { text_color: "#000", button_hex: "#4f46e5", button_text_color: "#fff" };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Toaster />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: mainColor.text_color }}>
        Edit Product
      </h1>

      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        {/* Year */}
        <input
          type="number"
          placeholder="Year"
          value={form.years || ""}
          onChange={(e) => setForm({ ...form, years: e.target.value })}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        {/* Size */}
        <input
          type="text"
          placeholder="Size"
          value={form.size || ""}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        {/* Quantity and Price */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity || ""}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price || ""}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Number of Offer */}
        <input
          type="number"
          placeholder="Number of Offer"
          value={form.numberOfOffer || ""}
          onChange={(e) => setForm({ ...form, numberOfOffer: e.target.value })}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        {/* Category */}
        <select
          value={form.category_id || ""}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Image Upload */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />

        {/* Checkboxes */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.offer_status || false}
              onChange={(e) => setForm({ ...form, offer_status: e.target.checked })}
            />
            Offer Status
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_new_collection || false}
              onChange={(e) => setForm({ ...form, is_new_collection: e.target.checked })}
            />
            New Collection
          </label>
        </div>

        {/* Save Button */}
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
