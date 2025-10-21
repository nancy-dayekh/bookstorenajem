"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { Trash2, Edit2, Plus } from "lucide-react";

type Book = { id: number; name: string };
type MultiImage = {
  id: number;
  book_id: number;
  image_path: string;
  book_name?: string;
};
type ColorForm = {
  button_hex: string;
  text_color: string;
  button_hover_color: string;
};

export default function MultiImagesPage() {
  const [multiImages, setMultiImages] = useState<MultiImage[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [books, setBooks] = useState<Book[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  useEffect(() => {
    async function fetchColors() {
      const { data } = await supabase.from("colors").select("*").order("id");
      setColors(data || []);
    }

    async function fetchData() {
      // Fetch books from "books" table
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("id,name");
      if (bookError) toast.error(bookError.message);
      else setBooks(bookData || []);

      // Fetch multi-image records
      const { data: imgs } = await supabase
        .from("multimagebook")
        .select("*")
        .order("id", { ascending: false });
      const mapped =
        imgs?.map((img: MultiImage) => ({
          ...img,
          book_name:
            bookData?.find((b) => b.id === img.book_id)?.name || "Unknown",
        })) || [];
      setMultiImages(mapped);
    }

    fetchColors();
    fetchData();
  }, []);

  async function deleteImage(id: number) {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const { error } = await supabase
      .from("multimagebook")
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Image deleted successfully!");
      setMultiImages((prev) => prev.filter((img) => img.id !== id));
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl sm:text-3xl font-extrabold"
          style={{ color: mainColor.text_color }}
        >
          MultiImages
        </h1>
        <Link
          href="/admin/multiImages/addmultiimage"
          className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          style={{
            backgroundColor: mainColor.button_hex,
            color: mainColor.text_color,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hex)
          }
        >
          <Plus className="w-4 h-4" /> Add Image
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead
            style={{
              backgroundColor: mainColor.button_hex,
              color: mainColor.text_color,
            }}
          >
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">#</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Book</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Image</th>
              <th className="px-6 py-3 text-center text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {multiImages.map((img, index) => {
              const color = colors[index % colors.length];
              return (
                <tr key={img.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                    {img.book_name}
                  </td>
                  <td className="px-6 py-4">
                    <Image
                      src={img.image_path}
                      alt="book"
                      width={96}
                      height={96}
                      className="rounded object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <Link
                      href={`/admin/multiImages/EditMultiimage/${img.id}`}
                      style={{
                        backgroundColor: color.button_hex,
                        color: color.text_color,
                      }}
                      className="px-4 py-2 rounded-xl shadow hover:opacity-80 transition flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </Link>
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {multiImages.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No images found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
