/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddColorPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    hex: "#ffffff",
    text_color: "#000000",
    hover_color: "#f0f0f0",
    button_hex: "#4f46e5",
    button_text_color: "#ffffff",
    button_hover_color: "#4338ca",
  });
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<any[]>([]); // Fetch colors from DB

  // Fetch colors from DB
  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id", { ascending: true });
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  useEffect(() => {
    fetchColors();
  }, []);

  async function handleSave() {
    if (!form.name || !form.hex)
      return toast.error("Name and Hex color required!");

    try {
      setLoading(true);
      const { error } = await supabase.from("colors").insert([form]);
      if (error) throw error;
      toast.success("Color added successfully!");
      router.push("/admin/colors"); // Redirect
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Use first DB color for dynamic styling or fallback
  const mainColor = colors[0] || {
    text_color: "#000000",
    button_hex: "#4f46e5",
    button_text_color: "#ffffff",
    button_hover_color: "#4338ca",
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6 text-center truncate"
        style={{ color: mainColor.text_color }}
      >
        Add New Color
      </h1>

      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6">
        {/* Responsive Form Grid */}
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
            onChange={(e) =>
              setForm({ ...form, button_text_color: e.target.value })
            }
            className="w-full h-10 rounded-lg border"
          />
          <input
            type="color"
            value={form.button_hover_color}
            onChange={(e) =>
              setForm({ ...form, button_hover_color: e.target.value })
            }
            className="w-full h-10 rounded-lg border"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-center sm:justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              backgroundColor: form.button_hex,
              color: form.button_text_color,
            }}
            className="px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                form.button_hover_color)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                form.button_hex)
            }
          >
            {loading ? "Saving..." : "Add Color"}
          </button>
        </div>
      </div>
    </div>
  );
}