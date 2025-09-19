"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
};

type MultiImage = {
  id: number;
  products_id: number;
  image_path: string;
  product_name?: string;
};

export default function CreateMultiImage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsId, setProductsId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [multiImages, setMultiImages] = useState<MultiImage[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch products
  async function fetchProducts() {
    const { data, error } = await supabase.from("add_products").select("id,name");
    if (error) return toast.error("Failed to load products");
    setProducts(data || []);
  }

  // Fetch multi-images with product names
  async function fetchMultiImages() {
    const { data: images, error: imagesError } = await supabase
      .from("multiimages")
      .select("*")
      .order("id", { ascending: false });

    if (imagesError) return toast.error("Failed to load images");

    const { data: productsData, error: productsError } = await supabase
      .from("add_products")
      .select("id,name");

    if (productsError) return toast.error("Failed to load products");

    const mapped: MultiImage[] =
      images?.map((img) => ({
        ...img,
        product_name:
          productsData?.find((p) => p.id === img.products_id)?.name || "Unknown",
      })) || [];

    setMultiImages(mapped);
  }

  useEffect(() => {
    fetchProducts();
    fetchMultiImages();
  }, []);

  async function uploadImage(file: File): Promise<string> {
    const fileName = `multiimages/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("products-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("products-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  async function handleCreateOrUpdate() {
    if (!productsId || (!file && !previewImage)) {
      toast.error("Please select a product and choose an image");
      return;
    }

    try {
      const imageUrl = file ? await uploadImage(file) : (previewImage as string);

      if (editingId) {
        const { error } = await supabase
          .from("multiimages")
          .update({ products_id: Number(productsId), image_path: imageUrl })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Image updated successfully!");
        setEditingId(null);
        setPreviewImage(null);
      } else {
        const { error } = await supabase.from("multiimages").insert([
          { products_id: Number(productsId), image_path: imageUrl },
        ]);
        if (error) throw error;
        toast.success("Image added successfully!");
      }

      setProductsId("");
      setFile(null);
      fetchMultiImages();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(errorMessage);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const { error } = await supabase.from("multiimages").delete().eq("id", id);
    if (error) return toast.error("Failed to delete");
    toast.success("Deleted successfully!");
    fetchMultiImages();
  }

  function handleEdit(image: MultiImage) {
    setEditingId(image.id);
    setProductsId(String(image.products_id));
    setPreviewImage(image.image_path);
    setFile(null);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">
        {editingId ? "Edit MultiImage" : "Add New MultiImage"}
      </h2>

      {/* Form */}
      <div className="flex flex-col gap-4">
        <select
          value={productsId}
          onChange={(e) => setProductsId(e.target.value)}
          className="w-full border border-pink-200 bg-pink-50 px-4 py-3 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-gray-700"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] ?? null;
              setFile(selectedFile);
              if (selectedFile) {
                setPreviewImage(URL.createObjectURL(selectedFile));
              }
            }}
            className="w-full border border-pink-200 bg-pink-50 px-4 py-3 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-gray-700"
          />
          {previewImage && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Image
                src={previewImage}
                alt="Preview"
                width={64}
                height={64}
                className="rounded border border-gray-300 object-cover"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleCreateOrUpdate}
          className="w-full bg-pink-400 hover:bg-pink-500 text-white py-3 rounded-lg font-semibold transition duration-200"
        >
          {editingId ? "Update Image" : "Add Image"}
        </button>
      </div>

      {/* Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border border-gray-200 text-left min-w-[600px]">
          <thead className="bg-pink-50">
            <tr>
              <th className="px-4 py-3 border">ID</th>
              <th className="px-4 py-3 border">Product</th>
              <th className="px-4 py-3 border">Image</th>
              <th className="px-4 py-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {multiImages.map((img) => (
              <tr key={img.id}>
                <td className="px-4 py-3 border">{img.id}</td>
                <td className="px-4 py-3 border">{img.product_name}</td>
                <td className="px-4 py-3 border">
                  <Image
                    src={img.image_path}
                    alt="product"
                    width={96}
                    height={96}
                    className="rounded object-cover"
                  />
                </td>
                <td className="px-4 py-3 border flex flex-col sm:flex-row sm:gap-2">
                  <button
                    onClick={() => handleEdit(img)}
                    className="mb-1 sm:mb-0 px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {multiImages.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
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
