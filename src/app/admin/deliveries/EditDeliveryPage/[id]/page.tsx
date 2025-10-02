"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

export default function EditDeliveryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [salary, setSalary] = useState("");
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  interface ColorForm {
    id: number;
    button_hex: string;
    text_color: string;
    button_hover_color: string;
  }

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function fetchDelivery() {
    const { data, error } = await supabase.from("deliveries").select("*").eq("id", id).single();
    if (error) toast.error(error.message);
    else setSalary(data.salary);
  }

  async function saveDelivery() {
    if (!salary.trim()) return toast.error("Salary cannot be empty");
    const { error } = await supabase.from("deliveries").update({ salary }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Salary Updated");
    router.push("/admin/deliveries");
  }

  useEffect(() => {
    fetchColors();
    fetchDelivery();
  }, []);

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
      <Toaster />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 sm:p-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 text-center"
          style={{ color: mainColor.text_color }}
        >
          Edit Delivery
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Enter salary"
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm"
          />
          <button
            onClick={saveDelivery}
            style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
            className="w-full py-3 rounded-2xl font-semibold transition-transform hover:scale-105 text-lg"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = mainColor.button_hover_color)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = mainColor.button_hex)
            }
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
