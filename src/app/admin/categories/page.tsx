/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) toast.error(error.message);
    else setCategories(data);
  }

  async function addCategory() {
    if (!newCategory.trim()) return toast.error('Category name cannot be empty');
    const { error } = await supabase.from('categories').insert([{ name: newCategory }]);
    if (error) return toast.error(error.message);
    toast.success('Category Added');
    setNewCategory('');
    fetchCategories();
  }

  async function deleteCategory(id: number) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Category Deleted');
    fetchCategories();
  }

  async function saveEditCategory(id: number) {
    if (!editName.trim()) return toast.error('Category name cannot be empty');
    const { error } = await supabase.from('categories').update({ name: editName }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Category Updated');
    setEditId(null);
    setEditName('');
    fetchCategories();
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />
      
      <h1 className="text-3xl font-bold mb-6 text-center text-pink-600">
        Manage Categories
      </h1>

      {/* Input + Add Button */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter new category"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          onClick={addCategory}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
        >
          Add
        </button>
      </div>

      {/* List Categories */}
      <ul className="space-y-3">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex justify-between items-center bg-white p-3 rounded-lg shadow"
          >
            {editId === cat.id ? (
              // Editing Mode
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={() => saveEditCategory(cat.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              // Normal View
              <>
                <span className="text-gray-700">{cat.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
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
