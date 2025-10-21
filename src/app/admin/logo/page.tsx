"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function LogoDisplayPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logos, setLogos] = useState<any[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  useEffect(() => {
    fetchLogos();
    fetchColors();
  }, []);

  async function fetchLogos() {
    const { data, error } = await supabase
      .from("logos")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setLogos(data || []);
  }

  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function deleteLogo(id: number) {
    const logo = logos.find((l) => l.id === id);
    if (!logo) return toast.error("Logo not found.");

    const fileName = logo.logo_url.split("/").pop();
    await supabase.storage.from("logos").remove([fileName!]);

    const { error } = await supabase.from("logos").delete().eq("id", id);
    if (error) return toast.error(error.message);

    toast.success("Logo deleted");
    fetchLogos();
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];
  const getRowColor = (index: number) => colors[index % colors.length];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <Toaster />

      <h1
        className="text-2xl sm:text-4xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Logo Management
      </h1>

      {/* Add Logo Button */}
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/logo/AddLogoPage"
          style={{
            backgroundColor: mainColor.button_hex,
            color: mainColor.text_color,
          }}
          className="px-5 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hex)
          }
        >
          + Add Logo
        </Link>
      </div>

      {/* Logos Table */}
      <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead
            style={{
              backgroundColor: mainColor.button_hex,
              color: mainColor.text_color,
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Logo</th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {logos.map((logo, index) => {
              const color = getRowColor(index);
              return (
                <tr key={logo.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={logo.logo_url}
                        alt={`Logo ${logo.id}`}
                        fill
                        style={{ objectFit: "contain" }}
                        priority
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 flex justify-center gap-2 sm:gap-3">
                    <Link
                      href={`/admin/logo/EditLogoPage/${logo.id}`}
                      style={{
                        backgroundColor: color.button_hex,
                        color: color.text_color,
                      }}
                      className="px-3 py-2 rounded-xl shadow hover:opacity-80 transition flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteLogo(logo.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {logos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                  No logos found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
