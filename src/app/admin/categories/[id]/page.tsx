"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function EditCategoryPage() {
  const [editName, setEditName] = useState('');
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  useEffect(() => {
    const loadData = async () => {
      // fetch colors
      const { data: colorData, error: colorError } = await supabase
        .from('colors')
        .select('*')
        .order('id');
      if (colorError) toast.error(colorError.message);
      else setColors(colorData || []);

      // fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      if (categoryError) toast.error(categoryError.message);
      else if (categoryData) setEditName(categoryData.name);
    };

    loadData();
  }, [categoryId]);

  const saveCategory = async () => {
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
  };

  if (!colors || colors.length === 0) {
    return <div className="text-center py-20">Loading...</div>;
  }

  const mainColor = colors[0]; // first color from table

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <Toaster />

      <h1
        className="text-2xl sm:text-3xl font-extrabold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
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
        className="w-full py-3 rounded-2xl font-semibold shadow-md transition-transform hover:scale-105"
      >
        Save Changes
      </button>
    </div>
  );
}
