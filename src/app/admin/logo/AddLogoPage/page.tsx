/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function AddLogoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchColors();
  }, []);

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function uploadImage(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("logos").upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleAdd() {
    if (!file) return toast.error("Please select an image.");
    try {
      const url = await uploadImage(file);
      const { error } = await supabase.from("logos").insert([{ logo_url: url }]);
      if (error) throw error;

      toast.success("Logo added!");
      router.push("/admin/logo");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center" style={{ color: mainColor.text_color }}>
        Add New Logo
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-auto"
        />
        <button
          onClick={handleAdd}
          style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
          className="px-6 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = mainColor.button_hex)
          }
        >
          Add Logo
        </button>
      </div>
    </div>
  );
}
