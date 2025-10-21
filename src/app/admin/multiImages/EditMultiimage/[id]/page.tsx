/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../../../../../lib/supabaseClient";
import Image from "next/image";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

type Book = { id: number; name: string }; // changed type
type ColorForm = { button_hex: string; text_color: string; button_hover_color: string };

export default function EditPage() {
  const router = useRouter();
  const { id } = useParams(); // multiimage id from URL

  const [books, setBooks] = useState<Book[]>([]); // changed from products
  const [bookId, setBookId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      // fetch books
      const { data: bookData, error: bookError } = await supabase.from("books").select("*");
      if (bookError) toast.error(bookError.message);
      else setBooks(bookData || []);

      // fetch colors
      const { data: colorData } = await supabase.from("colors").select("*").order("id");
      setColors(colorData || []);

      // fetch current multiimage
      if (id) {
        const { data: imgData, error } = await supabase.from("multimagebook").select("*").eq("id", Number(id)).single();
        if (error) toast.error(error.message);
        else {
          setBookId(String(imgData.book_id)); // changed products_id → book_id
          setExistingImage(imgData.image_path);
          setPreviewImage(imgData.image_path);
        }
      }
    }
    fetchData();
  }, [id]);

  const mainColor = colors?.[0];

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreviewImage(URL.createObjectURL(f));
  }

  async function uploadImage(file: File) {
    const fileName = `multiimages/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("products-images").upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("products-images").getPublicUrl(fileName);
    if (!data.publicUrl) throw new Error("Failed to get public URL");
    return data.publicUrl;
  }

  async function handleUpdate() {
    if (!bookId) return toast.error("Select book");
    try {
      let imageUrl = existingImage;
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const { error } = await supabase
        .from("multimagebook") // changed table
        .update({ book_id: Number(bookId), image_path: imageUrl })
        .eq("id", Number(id));

      if (error) throw error;
      toast.success("Updated successfully!");
      router.push("/admin/multiImages");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (!mainColor) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-4" style={{ color: mainColor.text_color }}>Edit MultiImage</h1>

      <select
        value={bookId}
        onChange={e => setBookId(e.target.value)}
        className="w-full px-4 py-3 rounded border mb-4"
        style={{ borderColor: mainColor.button_hex, color: mainColor.text_color }}
      >
        <option value="">Select Book</option>
        {books.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border px-4 py-3 rounded mb-4"
        style={{ borderColor: mainColor.button_hex }}
      />

      {previewImage && (
        <Image
          src={previewImage}
          alt="preview"
          width={96}
          height={96}
          className="rounded mb-4"
        />
      )}

      <button
        onClick={handleUpdate}
        className="w-full py-3 rounded-2xl font-semibold shadow-md transition-colors"
        style={{
          backgroundColor: mainColor.button_hex,
          color: mainColor.text_color
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = mainColor.button_hover_color}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = mainColor.button_hex}
      >
        Update Image
      </button>
    </div>
  );
}
