"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, Trash2, Check, X } from "lucide-react";

// تعريف نوع البيانات لجدول categories
interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const supabase = getSupabase();

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) toast.error(error.message);
    else setCategories(data as Category[]);
  }

  async function addCategory() {
    if (!newCategory.trim())
      return toast.error("Category name cannot be empty");
    const { error } = await supabase
      .from("categories")
      .insert([{ name: newCategory }]);
    if (error) return toast.error(error.message);
    toast.success("Category Added");
    setNewCategory("");
    fetchCategories();
  }

  async function deleteCategory(id: number) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category Deleted");
    fetchCategories();
  }

  async function saveEditCategory(id: number) {
    if (!editName.trim()) return toast.error("Category name cannot be empty");
    const { error } = await supabase
      .from("categories")
      .update({ name: editName })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category Updated");
    setEditId(null);
    setEditName("");
    fetchCategories();
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-pink-600">
        Manage Categories
      </h1>

      {/* Input + Add Button */}
      <div className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter category name"
          className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm"
        />
        <button
          onClick={addCategory}
          className="w-full bg-pink-500 text-white py-3 rounded-2xl font-semibold hover:bg-pink-600 active:scale-95 transition shadow-md"
        >
          + Add Category
        </button>
      </div>

      {/* List Categories */}
      <ul className="space-y-4">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="bg-white shadow-md rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border border-gray-100"
          >
            {editId === cat.id ? (
              <div className="flex flex-col sm:flex-row flex-1 gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => saveEditCategory(cat.id)}
                    className="flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="flex items-center justify-center px-3 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-lg font-semibold text-gray-800 text-center sm:text-left">
                  {cat.name}
                </span>
                <div className="flex justify-center sm:justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditId(cat.id);
                      setEditName(cat.name);
                    }}
                    className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-sm"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="flex items-center justify-center p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
