"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

interface ColorForm {
  name: string;
  hex: string;
  text_color: string;
  hover_color: string;
  button_hex: string;
  button_text_color: string;
  button_hover_color: string;
}

export default function EditColorPage() {
  const router = useRouter();
  const params = useParams(); // ✅ get the dynamic route param
  const colorId = params?.id;

  const [form, setForm] = useState<ColorForm>({
    name: "",
    hex: "#ffffff",
    text_color: "#000000",
    hover_color: "#f0f0f0",
    button_hex: "#4f46e5",
    button_text_color: "#ffffff",
    button_hover_color: "#4338ca",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!colorId) return;

    async function fetchColor() {
      const { data, error } = await supabase
        .from<ColorForm>("colors")
        .select("*")
        .eq("id", colorId)
        .single();

      if (error) toast.error(error.message);
      else if (data) setForm(data);
    }

    fetchColor();
  }, [colorId]);

  async function handleUpdate() {
    if (!form.name || !form.hex) return toast.error("Name and Hex color required!");
    if (!colorId) return toast.error("Invalid color ID");

    try {
      setLoading(true);
      const { error } = await supabase.from<ColorForm>("colors").update(form).eq("id", colorId);
      if (error) throw error;
      toast.success("Color updated successfully!");
      router.push("/admin/colors");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6 text-center truncate"
        style={{ color: form.text_color }}
      >
        Edit Color
      </h1>

      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <input
            type="text"
            placeholder="Color Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none w-full"
          />
          <input
            type="color"
            value={form.hex}
            onChange={(e) => setForm({ ...form, hex: e.target.value })}
            className="w-full h-10 rounded-lg border"
          />
          <input
            type="color"
            value={form.text_color}
            onChange={(e) => setForm({ ...form, text_color: e.target.value })}
            className="w-full h-10 rounded-lg border"
          />
          <input
            type="color"
            value={form.hover_color}
            onChange={(e) => setForm({ ...form, hover_color: e.target.value })}
            className="w-full h-10 rounded-lg border"
          />
          <input
            type="color"
            value={form.button_hex}
            onChange={(e) => setForm({ ...form, button_hex: e.target.value })}
            className="w-full h-10 rounded-lg border"
          />
          <input
            type="color"
            value={form.button_text_color}
            onChange={(e) => setForm({ ...form, button_text_color: e.target.value })}
            className="w-full h-10 rounded-lg border"
          />
          <input
            type="color"
            value={form.button_hover_color}
            onChange={(e) => setForm({ ...form, button_hover_color: e.target.value })}
            className="w-full h-10 rounded-lg border"
          />
        </div>

        <div className="flex justify-center sm:justify-end mt-4">
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{ backgroundColor: form.button_hex, color: form.button_text_color }}
            className="px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = form.button_hover_color)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = form.button_hex)
            }
          >
            {loading ? "Saving..." : "Update Color"}
          </button>
        </div>
      </div>
    </div>
  );
}
