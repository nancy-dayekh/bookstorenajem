"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import Image from "next/image";

export default function LogoManager() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoId, setLogoId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const BUCKET_NAME = "products-images"; // Your Supabase bucket
  const FOLDER_NAME = "public"; // Upload folder

  // Fetch the latest logo on page load
  useEffect(() => {
    async function fetchLogo() {
      const { data, error } = await supabase
        .from("logos")
        .select("id, logo_url")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching logo:", error);
      } else if (data && data.length > 0) {
        setLogoUrl(data[0].logo_url);
        setLogoId(data[0].id);
      }
    }
    fetchLogo();
  }, []);

  // Upload or update logo
  async function handleUpload() {
    if (!file) return;
    setLoading(true);

    try {
      // 1️⃣ Check all buckets
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log("Buckets:", buckets?.map(b => b.name));

      const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);
      if (!bucketExists) {
        throw new Error(`Bucket "${BUCKET_NAME}" not found. Create it in Supabase Storage.`);
      }

      // 2️⃣ Upload file to Storage in public folder
      const fileName = `${FOLDER_NAME}/logo-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 3️⃣ Get public URL
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      const publicUrl = publicData.publicUrl;
      if (!publicUrl) throw new Error("Failed to get public URL.");

      // 4️⃣ Insert or update in logos table
      let dbResponse;
      if (logoId) {
        dbResponse = await supabase
          .from("logos")
          .update({ logo_url: publicUrl })
          .eq("id", logoId)
          .select();
      } else {
        dbResponse = await supabase
          .from("logos")
          .insert([{ logo_url: publicUrl }])
          .select();
      }

      if (dbResponse.error) throw dbResponse.error;

      // 5️⃣ Update state
      setLogoUrl(publicUrl);
      if (dbResponse.data && dbResponse.data.length > 0) {
        setLogoId(dbResponse.data[0].id);
      }
      setFile(null);

      alert("Upload successful!");
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-xl rounded-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center">
        🖼️ Manage Site Logo
      </h1>

      {/* Display current logo */}
      {logoUrl ? (
        <div className="flex justify-center">
          <Image
            src={logoUrl}
            alt="Current Logo"
            width={150}
            height={150}
            className="rounded-xl"
          />
        </div>
      ) : (
        <p className="text-center text-gray-500">No logo set yet.</p>
      )}

      {/* Upload input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 rounded-xl w-full"
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md w-full"
      >
        {loading ? "Uploading..." : logoId ? "Update Logo" : "Upload Logo"}
      </button>
    </div>
  );
}
