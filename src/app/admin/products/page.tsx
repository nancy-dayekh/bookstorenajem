"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ColorForm {
  id: number;
  button_hex: string;
  text_color: string;
  button_hover_color: string;
}

export default function DisplayBooksPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [books, setBooks] = useState<any[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBooks();
    fetchColors();
  }, []);

  async function fetchBooks() {
    const { data, error } = await supabase.from("books").select("*");
    if (error) toast.error(error.message);
    else setBooks(data || []);
  }

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function deleteBook(id: number) {
    if (!confirm("Are you sure you want to delete this book?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Book deleted!");
      fetchBooks();
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];
  const getRowColor = (index: number) => colors[index % colors.length];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: mainColor.text_color }}>
        Books List
      </h1>

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => router.push("/admin/products/AddProductPage")}
          style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
          className="px-6 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = mainColor.button_hex)
          }
        >
          + Add Book
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md bg-white">
        <table className="min-w-full text-sm sm:text-base border-collapse">
          <thead style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}>
            <tr>
              {["Name", "Quantity", "Price", "Offer",  "New Collection", "Stock", "Image", "Actions"].map((t) => (
                <th key={t} className="p-2 sm:p-3 text-left">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? (
              books.map((b, index) => {
                const rowColor = getRowColor(index);
                return (
                  <tr key={b.id} className="border-b hover:brightness-95 transition-all">
                    <td className="p-2 sm:p-3">{b.name}</td>
                    <td className="p-2 sm:p-3">{b.quantity}</td>
                    <td className="p-2 sm:p-3">{b.price}</td>
                    <td className="p-2 sm:p-3">{b.offer_status ? "Yes" : "No"}</td>
                    <td className="p-2 sm:p-3">{b.numberOfOffer}</td>
                    <td className="p-2 sm:p-3">{b.is_new_collection ? "Yes" : "No"}</td>
                    <td className="p-2 sm:p-3">{b.stock}</td>
                    <td className="p-2 sm:p-3">
                      {b.image && <Image src={b.image} alt={b.name} width={50} height={50} className="object-cover rounded" />}
                    </td>
                    <td className="p-2 sm:p-3 flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => router.push(`/admin/products/EditProductPage?id=${b.id}`)}
                        style={{ backgroundColor: rowColor.button_hex, color: rowColor.text_color }}
                        className="px-4 py-1 rounded-lg font-semibold transition-transform hover:scale-105"
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.backgroundColor = rowColor.button_hover_color)
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.backgroundColor = rowColor.button_hex)
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBook(b.id)}
                        style={{ backgroundColor: "#f43f5e", color: "#fff" }}
                        className="px-4 py-1 rounded-lg font-semibold transition-transform hover:scale-105"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="p-3 text-center text-gray-500">
                  No books available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
