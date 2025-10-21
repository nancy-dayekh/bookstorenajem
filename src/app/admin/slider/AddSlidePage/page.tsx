"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

interface ColorForm {
  id: number;
  button_hex: string;
  text_color: string;
  button_hover_color: string;
}

export default function AddSlidePage() {
  const [file, setFile] = useState<File | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch colors from DB
  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function uploadFile(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("home-slider")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("home-slider")
      .getPublicUrl(fileName);
    return {
      url: data.publicUrl,
      type: file.type.startsWith("video") ? "video" : "image",
    };
  }

  // Handle insert
  async function handleSubmit() {
    if (!file) return toast.error("Please select an image or video.");
    setLoading(true);

    try {
      const { url, type } = await uploadFile(file);

      const { error } = await supabase.from("home_slider").insert([
        {
          media_url: url,
          media_type: type,
        },
      ]);

      if (error) throw error;

      toast.success("Slide Added!");
      setFile(null);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchColors();
  }, []);

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <Toaster position="top-right" />
      <h1
        className="text-2xl sm:text-4xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Add New Slide
      </h1>

      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 flex flex-col gap-4">
        {file && (
          <div className="text-center">
            {file.type.startsWith("video") ? (
              <video
                src={URL.createObjectURL(file)}
                controls
                className="mx-auto w-full h-64 object-cover rounded"
              />
            ) : (
              // Preview للصورة قبل الرفع
              <Image
                src={URL.createObjectURL(file)}
                alt="Slide Preview"
                width={800}
                height={400}
                className="rounded object-cover"
              />
            )}
          </div>
        )}

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border px-3 py-2 rounded-lg w-full"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 rounded-lg font-semibold transition-transform hover:scale-105 w-full"
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
          {loading ? "Adding..." : "Add Slide"}
        </button>
      </div>
    </div>
  );
}
