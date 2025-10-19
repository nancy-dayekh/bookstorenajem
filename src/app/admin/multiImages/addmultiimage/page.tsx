"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import Image from "next/image";
import toast from "react-hot-toast";

type Product = { id: number; name: string };
type ColorForm = { button_hex: string; text_color: string; button_hover_color: string };

export default function AddPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsId, setProductsId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: prod } = await supabase.from("add_products").select("*");
      setProducts(prod || []);

      const { data: colorData } = await supabase.from("colors").select("*").order("id");
      setColors(colorData || []);
    }
    fetchData();
  }, []);

  const mainColor = colors?.[0];

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreviewImage(URL.createObjectURL(f));
  }

  async function uploadImage(file: File) {
    const fileName = `multiimages/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("products-images").upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("products-images").getPublicUrl(fileName);
    if (!data.publicUrl) throw new Error("Failed to get public URL");
    return data.publicUrl;
  }

  async function handleAdd() {
    if (!productsId || !file) return toast.error("Select product & image");
    try {
      const imageUrl = await uploadImage(file);
      const { error } = await supabase.from("multiimages").insert([
        { products_id: Number(productsId), image_path: imageUrl }
      ]);
      if (error) throw error;
      toast.success("Added successfully!");
      setProductsId("");
      setFile(null);
      setPreviewImage(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (!mainColor) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-4" style={{ color: mainColor.text_color }}>Add MultiImage</h1>

      <select
        value={productsId}
        onChange={e => setProductsId(e.target.value)}
        className="w-full px-4 py-3 rounded border mb-4"
        style={{ borderColor: mainColor.button_hex, color: mainColor.text_color }}
      >
        <option value="">Select Product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border px-4 py-3 rounded mb-4"
        style={{ borderColor: mainColor.button_hex }}
      />

      {previewImage && (
        <Image
          src={previewImage}
          alt="preview"
          width={96}
          height={96}
          className="rounded mb-4"
        />
      )}

      <button
        onClick={handleAdd}
        style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = mainColor.button_hover_color)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = mainColor.button_hex)}
        className="w-full py-3 rounded-2xl font-semibold shadow-md transition-colors"
      >
        Add Image
      </button>
    </div>
  );
}
