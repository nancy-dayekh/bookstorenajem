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

  // Fetch dynamic colors from database
  useEffect(() => {
    fetchColors();
  }, []);

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  // Upload image to Supabase Storage
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

  // Handle form submission
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
      setTimeout(() => router.push("/admin/banner/DisplayBanners"), 1500);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (!colors) return <div className="text-center py-20">Loading colors...</div>;
  const mainColor = colors[0];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-gray-100">
        {/* Title */}
        <h1
          className="text-4xl font-extrabold text-center mb-8 tracking-wide"
          style={{ color: mainColor.text_color }}
        >
          Add New Banner
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block mb-2 text-gray-700 font-semibold">Title</label>
            <input
              type="text"
              placeholder="Enter banner title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-gray-400 focus:outline-none"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block mb-2 text-gray-700 font-semibold">
              Description
            </label>
            <textarea
              placeholder="Enter banner description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-gray-400 focus:outline-none resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-gray-700 font-semibold">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setImageFile(file || null);
                setImagePreview(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full border border-gray-300 rounded-xl p-2 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="flex justify-center mt-4">
              <Image
                src={imagePreview}
                alt="Preview"
                width={250}
                height={200}
                className="rounded-2xl shadow-md object-cover"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl font-semibold text-lg transition-transform transform hover:scale-105 shadow-md"
              style={{
                backgroundColor: mainColor.button_hex,
                color: mainColor.text_color,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  mainColor.button_hover_color)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonButtonElement).style.backgroundColor =
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
