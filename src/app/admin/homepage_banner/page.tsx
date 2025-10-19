"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

type Banner = {
  id: number;
  title: string;
  description: string;
  image_url: string;
};

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function DisplayBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  async function fetchBanners() {
    const { data, error } = await supabase
      .from("homepage_banner")
      .select("*")
      .order("id");
    if (error) toast.error(error.message);
    else setBanners(data || []);
  }

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function deleteBanner(id: number) {
    const { error } = await supabase.from("homepage_banner").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted successfully");
      fetchBanners();
    }
  }

  useEffect(() => {
    fetchBanners();
    fetchColors();
  }, []);

  if (!colors) return <div className="text-center py-20">Loading...</div>;

  const mainColor = colors[0];
  const getRowColor = (index: number) => colors[index % colors.length];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />

      <h1
        className="text-3xl sm:text-4xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        All Banners
      </h1>

      {/* Add Banner Button */}
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/homepage_banner/AddBannerPage"
          className="px-5 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          style={{
            backgroundColor: mainColor.button_hex,
            color: mainColor.text_color,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              mainColor.button_hex)
          }
        >
          + Add Banner
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead
            style={{
              backgroundColor: mainColor.button_hex,
              color: mainColor.text_color,
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Description
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {banners.map((banner, index) => {
              const color = getRowColor(index);
              return (
                <tr key={banner.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-600">{banner.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{banner.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{banner.description}</td>
                  <td className="px-4 py-3">
                    {banner.image_url && (
                      <Image
                        src={banner.image_url}
                        alt={banner.title}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-3">
                    <Link
                      href={`/admin/homepage_banner/EditBanner/${banner.id}`}
                      style={{
                        backgroundColor: color.button_hex,
                        color: color.text_color,
                      }}
                      className="px-3 py-2 rounded-xl shadow hover:opacity-80 transition flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {banners.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No banners found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
