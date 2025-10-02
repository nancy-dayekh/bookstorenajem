"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { Trash2 } from "lucide-react";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null); // null until loaded

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setCategories(data as Category[]);
  }

  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function deleteCategory(id: number) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Category Deleted");
      fetchCategories();
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchColors();
  }, []);

  if (!colors) {
    // while colors are loading, show a placeholder or spinner
    return <div className="text-center py-20">Loading...</div>;
  }

  const getCategoryColor = (index: number) =>
    colors.length
      ? colors[index % colors.length]
      : {
          button_hex: "#4f46e5",
          text_color: "#fff",
          button_hover_color: "#4338ca",
        };

  const mainColor = colors[0] || {
    button_hex: "#4f46e5",
    text_color: "#fff",
    button_hover_color: "#4338ca",
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <Toaster />

      <h1
        className="text-2xl sm:text-3xl font-extrabold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Categories
      </h1>

      {/* Add Category Button */}
      <div className="mb-4 flex justify-end">
        {colors[0] && (
          <Link
            href="/admin/categories/AddCategoryPage"
            style={{
              backgroundColor: colors[0].button_hex,
              color: colors[0].text_color,
            }}
            className="px-5 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                colors[0].button_hover_color)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                colors[0].button_hex)
            }
          >
            + Add Category
          </Link>
        )}
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
              <th className="px-6 py-3 text-left text-sm font-medium">#</th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Category Name
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {categories.map((cat, index) => {
              const color = getCategoryColor(index);
              return (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      style={{
                        backgroundColor: color.button_hex,
                        color: color.text_color,
                      }}
                      className="px-4 py-2 rounded-xl shadow hover:opacity-80 transition font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow flex items-center justify-center"
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
