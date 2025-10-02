"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

interface ColorForm {
  id?: number;
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
  const params = useParams();
  const colorId = params?.id ? parseInt(params.id as string, 10) : null;

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
        .from("colors")
        .select("*")
        .eq("id", colorId)
        .single();

      if (error) {
        toast.error(error.message);
      } else if (data) {
        setForm(data);
      }
    }

    fetchColor();
  }, [colorId]);

  // Minimal update first (only 'name') to ensure connection works
  async function handleUpdate() {
    if (!form.name) return toast.error("Name is required!");
    if (!colorId) return toast.error("Invalid color ID");

    try {
      setLoading(true);

      const updateData = {
        name: form.name,
        // نقدر نضيف باقي الحقول تدريجياً بعد نجاح هذا التحديث
      };

      const { error } = await supabase
        .from("colors")
        .update(updateData)
        .eq("id", colorId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("✅ Color updated successfully!");
      router.push("/admin/colors");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unexpected error occurred");
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center truncate">
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
        </div>

        <div className="flex justify-center sm:justify-end mt-4">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            {loading ? "Saving..." : "Update Color"}
          </button>
        </div>
      </div>
    </div>
  );
}
