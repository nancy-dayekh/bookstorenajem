/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function AddBannerPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchColors();
  }, []);

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function uploadImage(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("homepage_banner")
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("homepage_banner")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !description || !imageFile) {
      toast.error("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const image_url = await uploadImage(imageFile);

      const { error } = await supabase
        .from("homepage_banner")
        .insert([{ title, description, image_url }]);

      if (error) throw error;

      toast.success("🎉 Banner added successfully!");
      setTimeout(() => router.push("/admin/homepage_banner"), 1500);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (!colors) return <div className="text-center py-20">Loading colors...</div>;
  const mainColor = colors[0];

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-8">
        <h1
          className="text-xl sm:text-2xl font-bold text-center mb-6"
          style={{ color: mainColor.text_color }}
        >
          Add New Banner
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium text-sm">Title</label>
            <input
              type="text"
              placeholder="Enter banner title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium text-sm">Description</label>
            <textarea
              placeholder="Enter banner description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium text-sm">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setImageFile(file || null);
                setImagePreview(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full border border-gray-300 rounded-lg p-2 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="flex justify-center mt-4">
              <Image
                src={imagePreview}
                alt="Preview"
                width={200}
                height={120}
                className="rounded-lg shadow-sm object-cover"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="w-full py-2 rounded-lg font-semibold text-sm transition-transform transform hover:scale-105 shadow-md"
              style={{
                backgroundColor: mainColor.button_hex,
                color: mainColor.text_color,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  mainColor.button_hover_color)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  mainColor.button_hex)
              }
            >
              Add Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
