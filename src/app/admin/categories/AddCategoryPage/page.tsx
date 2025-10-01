'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function AddCategoryPage() {
  const [newCategory, setNewCategory] = useState('');
  const [colors, setColors] = useState<ColorForm[] | null>(null); // null until fetched
  const router = useRouter();

  async function fetchColors() {
    const { data, error } = await supabase.from('colors').select('*').order('id');
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function addCategory() {
    if (!newCategory.trim()) return toast.error('Category name cannot be empty');
    const { error } = await supabase.from('categories').insert([{ name: newCategory }]);
    if (error) toast.error(error.message);
    else {
      toast.success('Category Added');
      router.push('/admin/categories');
    }
  }

  useEffect(() => {
    fetchColors();
  }, []);

  if (!colors) {
    // wait for colors to load before rendering
    return <div className="text-center py-20">Loading...</div>;
  }

  const mainColor = colors[0] || { button_hex: '#4f46e5', text_color: '#fff', button_hover_color: '#4338ca' };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <Toaster />
      <h1
        className="text-2xl sm:text-3xl font-extrabold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Add Category
      </h1>
      <input
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="Enter category name"
        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm mb-4"
      />
      <button
        onClick={addCategory}
        style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = mainColor.button_hover_color)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = mainColor.button_hex)}
        className="w-full py-3 rounded-2xl font-semibold shadow-md transition-colors"
      >
        + Add Category
      </button>
    </div>
  );
}
