/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function LogoManager() {
  const [logos, setLogos] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  // Fetch logos
  async function fetchLogos() {
    const { data, error } = await supabase
      .from("logos")
      .select("*")
      .order("id", { ascending: true });

    if (error) toast.error(error.message);
    else setLogos(data || []);
  }

  // Upload image
  async function uploadImage(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("logos")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  // Add logo
  async function handleAddLogo() {
    if (!file) return toast.error("Please select an image.");
    try {
      const imageUrl = await uploadImage(file);
      const { error } = await supabase.from("logos").insert([{ logo_url: imageUrl }]);
      if (error) throw error;

      toast.success("Logo Added!");
      setFile(null);
      fetchLogos();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Delete logo
  async function deleteLogo(id: number) {
    try {
      const logo = logos.find((l) => l.id === id);
      if (!logo) return toast.error("Logo not found.");

      const fileName = logo.logo_url.split("/").pop();
      const { error: storageError } = await supabase.storage.from("logos").remove([fileName!]);
      if (storageError) throw storageError;

      const { error } = await supabase.from("logos").delete().eq("id", id);
      if (error) throw error;

      toast.success("Logo Deleted!");
      fetchLogos();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Start editing
  function startEdit(logo: any) {
    setEditingId(logo.id);
    setEditFile(null);
    setEditPreview(logo.logo_url);
  }

  // Cancel edit
  function cancelEdit() {
    setEditingId(null);
    setEditFile(null);
    setEditPreview(null);
  }

  // Save edited logo
  async function saveEdit(id: number) {
    if (!editFile) return toast.error("Please select an image to update.");

    try {
      const logo = logos.find((l) => l.id === id);
      if (!logo) return toast.error("Logo not found.");

      // Delete old file
      const oldFileName = logo.logo_url.split("/").pop();
      await supabase.storage.from("logos").remove([oldFileName!]);

      // Upload new file
      const newImageUrl = await uploadImage(editFile);

      // Update DB
      const { error } = await supabase.from("logos").update({ logo_url: newImageUrl }).eq("id", id);
      if (error) throw error;

      toast.success("Logo Updated!");
      setEditingId(null);
      setEditFile(null);
      setEditPreview(null);
      fetchLogos();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    fetchLogos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center text-pink-600">
        Logo Management
      </h1>

      {/* Upload Card */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">
          Add New Logo
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-auto"
          />
          <button
            onClick={handleAddLogo}
            className="bg-pink-500 text-white py-2 px-5 rounded-lg font-semibold hover:bg-pink-600 transition-transform hover:scale-105"
          >
            Add Logo
          </button>
        </div>
      </div>

      {/* Logos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center gap-4"
          >
            {editingId === logo.id ? (
              <>
                {editPreview && (
                  <img
                    src={editPreview}
                    alt="Preview"
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditFile(file);
                    if (file) setEditPreview(URL.createObjectURL(file));
                  }}
                  className="border border-gray-300 px-2 py-1 rounded-lg w-full"
                />
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => saveEdit(logo.id)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <img
                  src={logo.logo_url}
                  alt={`Logo ${logo.id}`}
                  className="w-24 h-24 object-contain rounded-lg"
                />
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => startEdit(logo)}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLogo(logo.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {logos.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No logos yet.
          </p>
        )}
      </div>
    </div>
  );
}
