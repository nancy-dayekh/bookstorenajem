"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

interface ColorForm {
  id: number;
  button_hex: string;
  text_color: string;
  button_hover_color: string;
}

interface Slide {
  id: number;
  media_url: string;
  media_type: string;
}

export default function EditSlidePage() {
  const router = useRouter();
  const params = useParams();
  const slideId = Number(params.id);

  const [file, setFile] = useState<File | null>(null);
  const [slide, setSlide] = useState<Slide | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch colors
  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  // Fetch slide by ID
  async function fetchSlide() {
    const { data, error } = await supabase
      .from("home_slider")
      .select("*")
      .eq("id", slideId)
      .single();
    if (error) toast.error(error.message);
    else setSlide(data);
  }

  async function uploadFile(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("home-slider")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("home-slider").getPublicUrl(fileName);
    return {
      url: data.publicUrl,
      type: file.type.startsWith("video") ? "video" : "image",
    };
  }

  // Handle update
  async function handleUpdate() {
    if (!file) return toast.error("Please select an image or video.");
    setLoading(true);

    try {
      const { url, type } = await uploadFile(file);

      const { error } = await supabase.from("home_slider").update({
        media_url: url,
        media_type: type,
      }).eq("id", slideId);

      if (error) throw error;

      toast.success("Slide updated!");
      router.push("/admin/slider");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchColors();
    fetchSlide();
  }, []);

  if (!colors || !slide)
    return <div className="text-center py-20">Loading...</div>;

  const mainColor = colors[0];

  return (
    <div className="max-w-full sm:max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <Toaster position="top-right" />
      <h1
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Edit Slide
      </h1>

      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 flex flex-col gap-4">
        {/* Preview */}
        <div className="text-center">
          {file ? (
            file.type.startsWith("video") ? (
              <video
                src={URL.createObjectURL(file)}
                controls
                className="mx-auto w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded"
              />
            ) : (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="mx-auto w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded"
              />
            )
          ) : slide.media_type === "video" ? (
            <video
              src={slide.media_url}
              controls
              className="mx-auto w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded"
            />
          ) : (
            <img
              src={slide.media_url}
              alt="Preview"
              className="mx-auto w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded"
            />
          )}
        </div>

        {/* File input */}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border px-3 py-2 rounded-lg w-full sm:text-sm md:text-base"
        />

        {/* Update button */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105 w-full sm:text-sm md:text-base"
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
          {loading ? "Updating..." : "Update Slide"}
        </button>
      </div>
    </div>
  );
}
