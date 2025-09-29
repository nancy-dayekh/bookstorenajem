/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function ColorsPage() {
  const [colors, setColors] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    hex: "#ffffff",
    text_color: "#000000",
    hover_color: "#f0f0f0",
  });
  const [editId, setEditId] = useState<number | null>(null);

  // Fetch colors
  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id", { ascending: true });

    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  // Add / Edit color
  async function handleSave() {
    try {
      if (!form.name || !form.hex) {
        return toast.error("Name and Hex color are required!");
      }

      if (editId) {
        const { error } = await supabase
          .from("colors")
          .update(form)
          .eq("id", editId);
        if (error) throw error;
        toast.success("Color updated!");
      } else {
        const { error } = await supabase.from("colors").insert([form]);
        if (error) throw error;
        toast.success("Color added!");
      }

      setForm({ name: "", hex: "#ffffff", text_color: "#000000", hover_color: "#f0f0f0" });
      setEditId(null);
      fetchColors();
    } catch (err: any) {
      toast.error(err.message);
    }
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

  // Start editing
  function startEdit(color: any) {
    setEditId(color.id);
    setForm({
      name: color.name,
      hex: color.hex,
      text_color: color.text_color || "#000000",
      hover_color: color.hover_color || "#f0f0f0",
    });
  }

  useEffect(() => {
    fetchColors();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6 text-center text-pink-600">Colors Management</h1>

      {/* Add/Edit Form */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">
          {editId ? "Edit Color" : "Add New Color"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Color Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
          />
          <input
            type="color"
            placeholder="Hex Color"
            value={form.hex}
            onChange={(e) => setForm({ ...form, hex: e.target.value })}
            className="border rounded-lg w-full h-10 p-0"
          />
          <input
            type="color"
            placeholder="Text Color"
            value={form.text_color}
            onChange={(e) => setForm({ ...form, text_color: e.target.value })}
            className="border rounded-lg w-full h-10 p-0"
          />
          <input
            type="color"
            placeholder="Hover Color"
            value={form.hover_color}
            onChange={(e) => setForm({ ...form, hover_color: e.target.value })}
            className="border rounded-lg w-full h-10 p-0"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 transition-transform hover:scale-105"
          >
            {editId ? "Save Changes" : "Add Color"}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({ name: "", hex: "#ffffff", text_color: "#000000", hover_color: "#f0f0f0" });
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Colors Table */}
      <div className="overflow-x-auto rounded-xl shadow-md bg-white">
        <table className="min-w-full text-sm sm:text-base">
          <thead className="bg-pink-100">
            <tr>
              <th className="p-3 text-left text-gray-700">ID</th>
              <th className="p-3 text-left text-gray-700">Name</th>
              <th className="p-3 text-left text-gray-700">Color</th>
              <th className="p-3 text-left text-gray-700">Text Color</th>
              <th className="p-3 text-left text-gray-700">Hover Color</th>
              <th className="p-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <tr
                key={color.id}
                style={{ backgroundColor: color.hex, color: color.text_color }}
                className="border-b hover:brightness-90 transition"
              >
                <td className="p-3">{color.id}</td>
                <td className="p-3">{color.name}</td>
                <td className="p-3">{color.hex}</td>
                <td className="p-3">{color.text_color}</td>
                <td className="p-3">{color.hover_color}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => startEdit(color)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(color.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {colors.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-500">
                  No colors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
