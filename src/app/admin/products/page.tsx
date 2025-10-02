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

export default function DisplayProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchColors();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from("add_products").select("*");
    if (error) toast.error(error.message);
    else setProducts(data || []);
  }

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function deleteProduct(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("add_products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Product deleted!");
      fetchProducts();
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  const getRowColor = (index: number) => colors[index % colors.length];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: mainColor.text_color }}>
        Products List
      </h1>

      {/* Add Product Button */}
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
          + Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl shadow-md bg-white">
        <table className="min-w-full text-sm sm:text-base border-collapse">
          <thead style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}>
            <tr>
              {["Name", "Year", "Size", "Qty", "Price", "Offer", "New Collection", "Image", "Actions"].map((t) => (
                <th key={t} className="p-2 sm:p-3 text-left">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p, index) => {
                const rowColor = getRowColor(index);
                return (
                  <tr key={p.id} className="border-b hover:brightness-95 transition-all">
                    <td className="p-2 sm:p-3">{p.name}</td>
                    <td className="p-2 sm:p-3">{p.years}</td>
                    <td className="p-2 sm:p-3">{p.size}</td>
                    <td className="p-2 sm:p-3">{p.quantity}</td>
                    <td className="p-2 sm:p-3">{p.price}</td>
                    <td className="p-2 sm:p-3">{p.offer_status ? "Yes" : "No"}</td>
                    <td className="p-2 sm:p-3">{p.is_new_collection ? "Yes" : "No"}</td>
                    <td className="p-2 sm:p-3">
                      {p.image && <Image src={p.image} alt={p.name} width={50} height={50} className="object-cover rounded" />}
                    </td>
                    <td className="p-2 sm:p-3 flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => router.push(`/admin/products/EditProductPage?id=${p.id}`)}
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
                        onClick={() => deleteProduct(p.id)}
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
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
