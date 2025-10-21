"use client";

import { useState, useEffect } from "react";
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

export default function AddBookPage() {
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number | undefined>();
  const [price, setPrice] = useState<number | undefined>();
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [offerStatus, setOfferStatus] = useState(false);
  const [isNewCollection, setIsNewCollection] = useState(true);
  const [stock, setStock] = useState<number | undefined>();
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchColors();
    fetchCategories();
  }, []);

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*");
    if (error) toast.error(error.message);
    else setColors((data || []) as ColorForm[]);
  }

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) toast.error(error.message);
    else setCategories((data || []) as Category[]);
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !categoryId) return toast.error("Please fill all required fields.");

    let imageUrl = "";
    if (file) imageUrl = await uploadImage(file);

    const { error } = await supabase.from("books").insert({
      name,
      quantity: quantity ?? 0,
      price: price ?? 0,
      description: description ?? "",
      image: imageUrl,
      category_id: categoryId,
      offer_status: offerStatus,
      is_new_collection: isNewCollection,
      stock: stock ?? 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (error) toast.error(error.message);
    else {
      toast.success("Book added successfully!");
      router.push("/admin/products");
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      <Toaster position="top-right" />
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Add New Book
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <input
          type="text"
          placeholder="Book Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 col-span-1 md:col-span-2"
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity ?? ""}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="number"
          placeholder="Price"
          value={price ?? ""}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock ?? ""}
          onChange={(e) => setStock(Number(e.target.value))}
          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 col-span-1 md:col-span-2"
        />

        <select
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
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
          className="border p-2 rounded-lg w-full"
        />

        <label className="flex items-center gap-2 col-span-1 md:col-span-2">
          <input
            type="checkbox"
            checked={offerStatus}
            onChange={(e) => setOfferStatus(e.target.checked)}
          />
          Offer Status
        </label>

        <label className="flex items-center gap-2 col-span-1 md:col-span-2">
          <input
            type="checkbox"
            checked={isNewCollection}
            onChange={(e) => setIsNewCollection(e.target.checked)}
          />
          New Collection
        </label>

        <button
          type="submit"
          style={{
            backgroundColor: mainColor.button_hex,
            color: mainColor.text_color,
          }}
          className="w-full py-3 rounded-lg font-semibold text-lg transition-transform hover:scale-105 col-span-1 md:col-span-2"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              mainColor.button_hex)
          }
        >
          Add Book
        </button>
      </form>
    </div>
  );
}
