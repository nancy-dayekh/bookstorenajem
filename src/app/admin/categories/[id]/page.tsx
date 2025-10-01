'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';

// Local ColorForm type
interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function EditCategoryPage() {
  const [editName, setEditName] = useState('');
  const [colors, setColors] = useState<ColorForm[]>([]);
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  async function fetchCategory() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    if (error) toast.error(error.message);
    else if (data) setEditName(data.name);
  }

  async function fetchColors() {
    const { data, error } = await supabase.from('colors').select('*').order('id');
    if (error) toast.error(error.message);
    else if (data) setColors(data as ColorForm[]);
  }

  async function saveCategory() {
    if (!editName.trim()) return toast.error('Category name cannot be empty');
    const { error } = await supabase
      .from('categories')
      .update({ name: editName })
      .eq('id', categoryId);
    if (error) toast.error(error.message);
    else {
      toast.success('Category Updated');
      router.push('/admin/categories');
    }
  }

  useEffect(() => {
    fetchColors();
    fetchCategory();
  }, []);

  const mainColor = colors[0] || { button_hex: '#4f46e5', text_color: '#fff', button_hover_color: '#4338ca' };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <Toaster />
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center" style={{ color: mainColor.text_color }}>
        Edit Category
      </h1>
      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Enter category name"
        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm mb-4"
      />
      <button
        onClick={saveCategory}
        style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = mainColor.button_hover_color)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = mainColor.button_hex)}
        className="w-full py-3 rounded-2xl font-semibold shadow-md"
      >
        Save Changes
      </button>
    </div>
  );
}
