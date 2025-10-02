"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function DisplayDeliveriesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  async function fetchDeliveries() {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .order("id", { ascending: true });
    if (error) toast.error(error.message);
    else setDeliveries(data);
  }

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function deleteDelivery(id: number) {
    const { error } = await supabase.from("deliveries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Delivery deleted");
    fetchDeliveries();
  }

  useEffect(() => {
    fetchDeliveries();
    fetchColors();
  }, []);

  if (!colors) return <div className="text-center py-20">Loading...</div>;

  const mainColor = colors[0];
  const getRowColor = (index: number) =>
    colors.length ? colors[index % colors.length] : mainColor;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <Toaster />

      <h1
        className="text-2xl sm:text-3xl font-extrabold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Deliveries
      </h1>

      {/* Add Delivery Button */}
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/deliveries/AddDeliveryPage"
          style={{
            backgroundColor: mainColor.button_hex,
            color: mainColor.text_color,
          }}
          className="px-5 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hex)
          }
        >
          + Add New Delivery
        </Link>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead
            style={{
              backgroundColor: mainColor.button_hex,
              color: mainColor.text_color,
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Salary</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {deliveries.map((d, index) => {
              const color = getRowColor(index);
              return (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    ${d.salary}
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-2 sm:gap-3">
                    <Link
                      href={`/admin/deliveries/EditDeliveryPage/${d.id}`}
                      style={{
                        backgroundColor: color.button_hex,
                        color: color.text_color,
                      }}
                      className="px-3 py-2 rounded-xl shadow hover:opacity-80 transition font-medium flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteDelivery(d.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
