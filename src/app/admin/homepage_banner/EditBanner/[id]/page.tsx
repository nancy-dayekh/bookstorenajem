/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function EditBannerPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const bannerId =
    params?.id && !Array.isArray(params.id) ? parseInt(params.id, 10) : null;

  useEffect(() => {
    if (!bannerId || isNaN(bannerId)) {
      toast.error("Invalid Banner ID");
      setLoading(false);
      return;
    }

    async function loadData() {
      // Fetch colors
      const { data: colorData, error: colorError } = await supabase
        .from("colors")
        .select("*")
        .order("id");
      if (colorError) toast.error(colorError.message);
      else setColors(colorData || []);

      // Fetch banner
      const { data: bannerData, error: bannerError } = await supabase
        .from("homepage_banner")
        .select("*")
        .eq("id", bannerId)
        .single();
      if (bannerError) toast.error(bannerError.message);
      else if (bannerData) {
        setTitle(bannerData.title);
        setDescription(bannerData.description);
        setImagePreview(bannerData.image_url);
      }

      setLoading(false);
    }

    loadData();
  }, [bannerId]);

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

  const handleUpdate = async () => {
    if (!bannerId) return toast.error("Invalid Banner ID");
    if (!title.trim() || !description.trim())
      return toast.error("All fields are required");

    try {
      let imageUrl = imagePreview || "";
      if (file) imageUrl = await uploadImage(file);

      const { error } = await supabase
        .from("homepage_banner")
        .update({ title, description, image_url: imageUrl })
        .eq("id", bannerId);

      if (error) throw error;

      toast.success("Banner updated!");
      router.push("/admin/homepage_banner");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!colors || colors.length === 0)
    return <div className="text-center py-20">Loading colors...</div>;

  const mainColor = colors[0];

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <Toaster />
      <h1
        className="text-2xl sm:text-3xl font-extrabold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Edit Banner
      </h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter banner title"
        className="w-full px-4 py-3 border border-gray-300 rounded-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter banner description"
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;
          setFile(selectedFile);
          if (selectedFile) setImagePreview(URL.createObjectURL(selectedFile));
        }}
        className="w-full mb-4"
      />

      {imagePreview && (
        <div className="mb-4">
          <p className="text-gray-500 mb-1">Preview:</p>
          <Image
            src={imagePreview}
            alt="Banner Preview"
            width={150}
            height={80}
            className="rounded object-contain"
          />
        </div>
      )}

      <button
        onClick={handleUpdate}
        style={{
          backgroundColor: mainColor.button_hex,
          color: mainColor.text_color,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = mainColor.button_hover_color)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = mainColor.button_hex)
        }
        className="w-full py-3 rounded-2xl font-semibold shadow-md transition-transform hover:scale-105"
      >
        Update Banner
      </button>
    </div>
  );
}
