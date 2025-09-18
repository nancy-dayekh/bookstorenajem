"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

type CategoryType = {
  id: number;
  name: string;
};

type ProductType = {
  id: number;
  name: string;
  years?: number;
  size?: string;
  quantity?: number;
  price?: number;
  description?: string;
  image?: string;
  category_id?: number;
  offer_status?: boolean;
  numberOfOffer?: number;
  is_new_collection?: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [form, setForm] = useState({
    name: "",
    years: "",
    size: "",
    quantity: "",
    price: "",
    description: "",
    image: "",
    category_id: "",
    offer_status: false,
    numberOfOffer: "",
    is_new_collection: false,
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("add_products")
      .select("*")
      .order("id", { ascending: true });
    if (error) toast.error(error.message);
    else setProducts(data as ProductType[]);
  }

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) toast.error(error.message);
    else setCategories(data as CategoryType[]);
  }

  async function uploadImage(file: File) {
    const fileName = `public/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("products-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("products-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  async function handleSave() {
    try {
      if (!form.category_id) return toast.error("Please select a category.");

      let imageUrl = form.image;
      if (file) imageUrl = await uploadImage(file);

      const productData = {
        ...form,
        image: imageUrl,
        category_id: Number(form.category_id),
        years: form.years ? Number(form.years) : null,
        quantity: form.quantity ? Number(form.quantity) : null,
        price: form.price ? Number(form.price) : null,
        numberOfOffer: form.numberOfOffer ? Number(form.numberOfOffer) : null,
      };

      if (editId) {
        const { error } = await supabase
          .from("add_products")
          .update(productData)
          .eq("id", editId);
        if (error) throw error;
        toast.success("Product Updated!");
        setEditId(null);
      } else {
        const { error } = await supabase
          .from("add_products")
          .insert([productData]);
        if (error) throw error;
        toast.success("Product Added!");
      }

      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function deleteProduct(id: number) {
    try {
      const { error } = await supabase
        .from("add_products")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Product Deleted!");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      years: "",
      size: "",
      quantity: "",
      price: "",
      description: "",
      image: "",
      category_id: "",
      offer_status: false,
      numberOfOffer: "",
      is_new_collection: false,
    });
    setFile(null);
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center text-pink-600">
        Products Management
      </h1>

      {/* Form Card */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3 text-gray-700">
          Add / Edit Product
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
          />
          <input
            type="number"
            placeholder="Year"
            value={form.years}
            onChange={(e) => setForm({ ...form, years: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
          />
          <input
            type="text"
            placeholder="Size"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border px-3 py-2 rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
          />
          <button
            onClick={handleSave}
            className="bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-transform hover:scale-105"
          >
            {editId ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full text-sm sm:text-base bg-white rounded-xl">
          <thead className="bg-pink-100">
            <tr>
              {[
                "Name",
                "Year",
                "Size",
                "Qty",
                "Price",
                "Category",
                "Image",
                "Actions",
              ].map((title) => (
                <th key={title} className="p-2 sm:p-3 text-left text-gray-700">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 border-b">
                <td className="p-2 sm:p-3">{p.name}</td>
                <td className="p-2 sm:p-3">{p.years}</td>
                <td className="p-2 sm:p-3">{p.size}</td>
                <td className="p-2 sm:p-3">{p.quantity}</td>
                <td className="p-2 sm:p-3">{p.price}</td>
                <td className="p-2 sm:p-3">
                  <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs sm:text-sm">
                    {categories.find((c) => c.id === p.category_id)?.name || ""}
                  </span>
                </td>
                <td className="p-2 sm:p-3">
                  {p.image ? (
                    <div className="h-10 w-10 sm:h-14 sm:w-14 relative rounded-lg overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name || "Product Image"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2 sm:p-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditId(p.id);
                      setForm({
                        ...p,
                        category_id: String(p.category_id),
                        years: p.years ? String(p.years) : "",
                        quantity: p.quantity ? String(p.quantity) : "",
                        price: p.price ? String(p.price) : "",
                        numberOfOffer: p.numberOfOffer
                          ? String(p.numberOfOffer)
                          : "",
                      });
                    }}
                    className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
