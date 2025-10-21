"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  id: number;
  media_url: string;
  media_type: "image" | "video";
}

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function DisplaySlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  useEffect(() => {
    fetchSlides();
    fetchColors();
  }, []);

  async function fetchSlides() {
    const { data, error } = await supabase
      .from("home_slider")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setSlides(data || []);
  }

  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    const { error } = await supabase.from("home_slider").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Slide deleted!");
      setSlides(slides.filter((slide) => slide.id !== id));
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <Toaster position="top-right" />

      <h1
        className="text-2xl sm:text-4xl font-bold mb-4 text-center"
        style={{ color: mainColor.text_color }}
      >
        Home Slides
      </h1>

      {/* Add Slide Button */}
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/slider/AddSlidePage"
          style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
          className="px-5 py-2 rounded-lg font-semibold transition-transform hover:scale-105 text-sm sm:text-base"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hex)
          }
        >
          + Add Slide
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="min-w-full text-sm sm:text-base">
          <thead style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}>
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Preview</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slides.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No slides yet.
                </td>
              </tr>
            ) : (
              slides.map((slide) => (
                <tr key={slide.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{slide.id}</td>
                  <td className="p-3">
                    {slide.media_type === "video" ? (
                      <video
                        src={slide.media_url}
                        controls
                        className="w-full sm:w-40 h-48 sm:h-28 object-cover rounded"
                      />
                    ) : (
                      <Image
                        src={slide.media_url}
                        alt={`Slide ${slide.id}`}
                        width={160}
                        height={112}
                        className="object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="p-3 capitalize">{slide.media_type}</td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    <Link
                      href={`/admin/slider/EditSlider/${slide.id}`}
                      style={{
                        backgroundColor: mainColor.button_hex,
                        color: mainColor.text_color,
                      }}
                      className="px-3 py-1 rounded hover:opacity-80 text-sm sm:text-base"
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                          mainColor.button_hover_color)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                          mainColor.button_hex)
                      }
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:opacity-80 text-sm sm:text-base"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex flex-col gap-4 mt-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="border rounded-lg shadow-sm p-3 flex flex-col gap-2"
          >
            {slide.media_type === "video" ? (
              <video
                src={slide.media_url}
                controls
                className="w-full h-48 object-cover rounded"
              />
            ) : (
              <Image
                src={slide.media_url}
                alt={`Slide ${slide.id}`}
                width={400}
                height={200}
                className="object-cover rounded"
              />
            )}
            <div className="flex justify-between text-sm font-medium">
              <span>ID: {slide.id}</span>
              <span>Type: {slide.media_type}</span>
            </div>
            <div className="flex justify-end gap-2 mt-2 flex-wrap">
              <Link
                href={`/admin/slider/EditSlider/${slide.id}`}
                style={{
                  backgroundColor: mainColor.button_hex,
                  color: mainColor.text_color,
                }}
                className="px-3 py-1 rounded hover:opacity-80 text-sm"
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    mainColor.button_hover_color)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    mainColor.button_hex)
                }
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(slide.id)}
                className="px-3 py-1 rounded bg-red-500 text-white hover:opacity-80 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
