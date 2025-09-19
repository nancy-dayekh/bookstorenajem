"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  years: number | null;
  size: string;
  quantity: number | null;
  price: number | null;
  description: string;
  image: string;
  category_id: number;
  offer_status: boolean;
  numberOfOffer: number | null;
  is_new_collection: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
    else setProducts(data as Product[]);
  }

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) toast.error(error.message);
    else setCategories(data as Category[]);
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
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("An unexpected error occurred.");
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
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("An unexpected error occurred.");
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

function handleChange(
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) {
  const { name, value, type } = e.target;
  const checked =
    e.target instanceof HTMLInputElement && e.target.type === "checkbox"
      ? e.target.checked
      : undefined;

  setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked ?? false : value,
  }));
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

      {/* Form Section */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3 text-gray-700">
          {editId ? "Edit Product" : "Add Product"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="border p-2 rounded"
          />
          <input
            name="years"
            value={form.years}
            onChange={handleChange}
            placeholder="Years"
            className="border p-2 rounded"
          />
          <input
            name="size"
            value={form.size}
            onChange={handleChange}
            placeholder="Size"
            className="border p-2 rounded"
          />
          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="border p-2 rounded"
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className="border p-2 rounded"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 rounded col-span-1 sm:col-span-2"
          />
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="offer_status"
              checked={form.offer_status}
              onChange={handleChange}
            />
            Offer Status
          </label>
          <input
            name="numberOfOffer"
            value={form.numberOfOffer}
            onChange={handleChange}
            placeholder="Number Of Offer"
            className="border p-2 rounded"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_new_collection"
              checked={form.is_new_collection}
              onChange={handleChange}
            />
            New Collection
          </label>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          {editId ? "Update Product" : "Add Product"}
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full text-sm sm:text-base bg-white rounded-xl">
          <thead className="bg-pink-100">
            <tr>
              {["Name", "Year", "Size", "Qty", "Price", "Category", "Image", "Actions"].map(
                (title) => (
                  <th key={title} className="p-2 sm:p-3 text-left text-gray-700">
                    {title}
                  </th>
                )
              )}
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
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={56}
                      height={56}
                      className="h-10 w-10 sm:h-14 sm:w-14 object-cover rounded-lg"
                    />
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
