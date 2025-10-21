"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function EditLogoPage() {
  const params = useParams();
  const router = useRouter();

  // Normalize id to string
  const logoId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  useEffect(() => {
    fetchColors();
    if (logoId) fetchLogo(logoId);
  }, [logoId]);

  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function fetchLogo(id: string) {
    const { data, error } = await supabase
      .from("logos")
      .select("*")
      .eq("id", id)
      .single();
    if (error) toast.error(error.message);
    else setPreview(data.logo_url);
  }

  async function uploadImage(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSave() {
    if (!file) return toast.error("Please select an image to update.");

    try {
      // Delete old file if exists
      if (preview) {
        const oldFileName = preview.split("/").pop();
        if (oldFileName) {
          await supabase.storage.from("logos").remove([oldFileName]);
        }
      }

      const newUrl = await uploadImage(file);

      if (!logoId) return toast.error("Logo ID missing!");

      const { error } = await supabase
        .from("logos")
        .update({ logo_url: newUrl })
        .eq("id", logoId);
      if (error) throw error;

      toast.success("Logo updated!");
      router.push("/admin/logos/LogoDisplayPage");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("An unexpected error occurred");
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Toaster position="top-right" />
      <h1
        className="text-2xl sm:text-4xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Edit Logo
      </h1>

      {preview && (
        <div className="w-32 h-32 mb-4 mx-auto relative rounded-lg overflow-hidden">
          <Image
            src={preview}
            alt="Preview"
            fill // Image يغطي container
            style={{ objectFit: "contain" }}
            priority // أفضل للصور المهمة مثل شعار
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f) setPreview(URL.createObjectURL(f));
          }}
          className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-auto"
        />
        <button
          onClick={handleSave}
          style={{
            backgroundColor: mainColor.button_hex,
            color: mainColor.text_color,
          }}
          className="px-6 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              mainColor.button_hex)
          }
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
