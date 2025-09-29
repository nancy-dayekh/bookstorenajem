"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function BannerManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingBanner, setEditingBanner] = useState<any>(null);

  // Fetch banners
  async function fetchBanners() {
    const { data, error } = await supabase
      .from("homepage_banner")
      .select("*")
      .order("id", { ascending: true });
    if (error) toast.error(error.message);
    else setBanners(data || []);
  }

  // Upload image
  async function uploadImage(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("homepage_banner")
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("homepage_banner")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // Add or Update banner
  async function handleSaveBanner() {
    if (!title || !file && !editingBanner) return toast.error("Title and Image are required.");

    try {
      let imageUrl = editingBanner?.image_url || "";
      if (file) imageUrl = await uploadImage(file);

      if (editingBanner) {
        // Update
        const { error } = await supabase
          .from("homepage_banner")
          .update({ title, description, image_url: imageUrl })
          .eq("id", editingBanner.id);
        if (error) throw error;
        toast.success("Banner updated!");
      } else {
        // Insert
        const { error } = await supabase
          .from("homepage_banner")
          .insert([{ title, description, image_url: imageUrl }]);
        if (error) throw error;
        toast.success("Banner added!");
      }

      setTitle("");
      setDescription("");
      setFile(null);
      setEditingBanner(null);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Delete banner
  async function deleteBanner(id: number) {
    try {
      const { error } = await supabase.from("homepage_banner").delete().eq("id", id);
      if (error) throw error;
      toast.success("Banner deleted!");
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Start editing
  function startEdit(banner: any) {
    setEditingBanner(banner);
    setTitle(banner.title);
    setDescription(banner.description);
    setFile(null);
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center text-pink-600">
        Homepage Banner Management
      </h1>

      {/* Add/Edit Form */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3 text-gray-700">
          {editingBanner ? "Edit Banner" : "Add New Banner"}
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full sm:w-auto"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full sm:w-auto"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border px-3 py-2 rounded-lg w-full sm:w-auto"
          />
        </div>
        <button
          onClick={handleSaveBanner}
          className="bg-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-transform hover:scale-105"
        >
          {editingBanner ? "Update Banner" : "Add Banner"}
        </button>
      </div>

      {/* Banner Table */}
      <div className="overflow-x-auto rounded-xl shadow-md bg-white">
        <table className="min-w-full text-sm sm:text-base">
          <thead className="bg-pink-100">
            <tr>
              <th className="p-3 text-left text-gray-700">ID</th>
              <th className="p-3 text-left text-gray-700">Title</th>
              <th className="p-3 text-left text-gray-700">Description</th>
              <th className="p-3 text-left text-gray-700">Image</th>
              <th className="p-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{banner.id}</td>
                <td className="p-3">{banner.title}</td>
                <td className="p-3">{banner.description}</td>
                <td className="p-3">
                  {banner.image_url && (
                    <img
                      src={banner.image_url}
                      alt={`Banner ${banner.id}`}
                      className="w-20 h-20 object-contain rounded"
                    />
                  )}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => startEdit(banner)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  No banners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
