"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ColorsPage() {
  const [colors, setColors] = useState<any[]>([]);
  const router = useRouter();

  // Fetch colors from DB
  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id", { ascending: true });
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  // Delete color
  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this color?")) return;
    const { error } = await supabase.from("colors").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Color deleted!");
      fetchColors();
    }
  }

  useEffect(() => {
    fetchColors();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <h1
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: colors[0]?.text_color || "#000000" }}
      >
        Colors Display
      </h1>

      {/* Add Color Button */}
      <div className="mb-4 flex justify-end">
        {colors[0] && (
          <button
            onClick={() => router.push("/admin/colors/addcolors")}
            style={{
              backgroundColor: colors[0]?.button_hex || "#4f46e5",
              color: colors[0]?.button_text_color || "#ffffff",
            }}
            className="px-5 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                colors[0]?.button_hover_color || "#4338ca")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                colors[0]?.button_hex || "#4f46e5")
            }
          >
            Add Color
          </button>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl shadow-md bg-white">
        <table className="min-w-full text-sm sm:text-base border-collapse">
          <thead className="bg-pink-100">
            <tr>
              <th className="p-2 sm:p-3 text-left">ID</th>
              <th className="p-2 sm:p-3 text-left">Name</th>
              <th className="p-2 sm:p-3 text-left">Color</th>
              <th className="p-2 sm:p-3 text-left">Text Color</th>
              <th className="p-2 sm:p-3 text-left">Hover Color</th>
              <th className="p-2 sm:p-3 text-left">Button Hex</th>
              <th className="p-2 sm:p-3 text-left">Button Text</th>
              <th className="p-2 sm:p-3 text-left">Button Hover</th>
              <th className="p-2 sm:p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {colors.length > 0 ? (
              colors.map((color) => (
                <tr
                  key={color.id}
                  className="border-b transition-all hover:brightness-90"
                  style={{
                    backgroundColor: color.hex,
                    color: color.text_color,
                  }}
                >
                  <td className="p-2 sm:p-3">{color.id}</td>
                  <td className="p-2 sm:p-3">{color.name}</td>
                  <td className="p-2 sm:p-3">{color.hex}</td>
                  <td className="p-2 sm:p-3">{color.text_color}</td>
                  <td className="p-2 sm:p-3">{color.hover_color}</td>
                  <td className="p-2 sm:p-3">{color.button_hex}</td>
                  <td className="p-2 sm:p-3">{color.button_text_color}</td>
                  <td className="p-2 sm:p-3">{color.button_hover_color}</td>
                  <td className="p-2 sm:p-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    {/* Edit Button */}
                    <button
                      onClick={() => router.push(`/admin/colors/${color.id}`)}
                      style={{
                        backgroundColor: color.button_hex,
                        color: color.button_text_color,
                      }}
                      className="px-3 py-1 rounded-lg font-semibold transition-transform hover:scale-105"
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          color.button_hover_color)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          color.button_hex)
                      }
                    >
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(color.id)}
                      style={{
                        backgroundColor: color.button_hex,
                        color: color.button_text_color,
                      }}
                      className="px-3 py-1 rounded-lg font-semibold transition-transform hover:scale-105"
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          color.button_hover_color)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          color.button_hex)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-3 text-center text-gray-500">
                  No colors available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
