"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

type Slide = {
  id: number;
  media_url: string;
  media_type: "image" | "video";
};

export default function HomeSliderManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [editSlide, setEditSlide] = useState<Slide | null>(null);

  // Fetch slides
  async function fetchSlides() {
    const { data, error } = await supabase
      .from<Slide>("home_slider") // Only ONE type argument
      .select("*")
      .order("id", { ascending: true });

    if (error) toast.error(error.message);
    else setSlides(data || []);
  }

  // Upload file
  async function uploadFile(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("home-slider")
      .upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("home-slider")
      .getPublicUrl(fileName);

    return {
      url: publicUrlData.publicUrl,
      type: file.type.startsWith("video") ? "video" : "image",
    };
  }

  // Add or update slide
  async function handleSubmit() {
    if (!file) return toast.error("Please select an image or video.");

    try {
      const { url, type } = await uploadFile(file);

      if (editSlide) {
        const { error } = await supabase
          .from("home_slider")
          .update({ media_url: url, media_type: type })
          .eq("id", editSlide.id);
        if (error) throw error;
        toast.success("Slide Updated!");
        setEditSlide(null);
      } else {
        const { error } = await supabase
          .from("home_slider")
          .insert([{ media_url: url, media_type: type }]);
        if (error) throw error;
        toast.success("Slide Added!");
      }

      setFile(null);
      fetchSlides();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  }

  // Delete slide
  async function deleteSlide(id: number) {
    try {
      const slide = slides.find((s) => s.id === id);
      if (!slide) return toast.error("Slide not found.");

      const fileName = slide.media_url.split("/").pop();
      await supabase.storage.from("home-slider").remove([fileName!]);

      const { error } = await supabase.from("home_slider").delete().eq("id", id);
      if (error) throw error;

      toast.success("Slide Deleted!");
      fetchSlides();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  }

  // Start editing
  function handleEditSlide(slide: Slide) {
    setEditSlide(slide);
    setFile(null);
  }

  useEffect(() => {
    fetchSlides();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center text-pink-600">
        Home Slider Management
      </h1>

      {/* Add/Edit Form */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3 text-gray-700">
          {editSlide ? "Edit Slide" : "Add New Slide"}
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border px-3 py-2 rounded-lg w-full sm:w-auto"
          />
          <button
            onClick={handleSubmit}
            className="bg-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-transform hover:scale-105 w-full sm:w-auto"
          >
            {editSlide ? "Update Slide" : "Add Slide"}
          </button>
          {editSlide && (
            <button
              onClick={() => setEditSlide(null)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 w-full sm:w-auto"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Slides List */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full text-sm sm:text-base">
            <thead className="bg-pink-100">
              <tr>
                <th className="p-3 text-left text-gray-700">ID</th>
                <th className="p-3 text-left text-gray-700">Preview</th>
                <th className="p-3 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide) => (
                <tr key={slide.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{slide.id}</td>
                  <td className="p-3">
                    {slide.media_type === "video" ? (
                      <video src={slide.media_url} controls className="w-40 h-28 object-cover rounded" />
                    ) : (
                      <div className="relative w-40 h-28">
                        <Image src={slide.media_url} alt={`Slide ${slide.id}`} fill style={{ objectFit: "cover" }} className="rounded" />
                      </div>
                    )}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEditSlide(slide)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSlide(slide.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {slides.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-gray-500">
                    No slides yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden flex flex-col gap-4 p-4">
          {slides.length === 0 && <p className="text-center text-gray-500">No slides yet.</p>}
          {slides.map((slide) => (
            <div key={slide.id} className="border rounded-lg shadow-sm p-3 flex flex-col gap-3">
              {slide.media_type === "video" ? (
                <video src={slide.media_url} controls className="w-full h-48 object-cover rounded" />
              ) : (
                <div className="relative w-full h-48">
                  <Image src={slide.media_url} alt={`Slide ${slide.id}`} fill style={{ objectFit: "cover" }} className="rounded" />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSlide(slide)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteSlide(slide.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
