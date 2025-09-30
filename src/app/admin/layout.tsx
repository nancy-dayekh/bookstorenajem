/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  Box,
  Package,
  Truck,
  CreditCard,
  Bell,
  Palette,
  Image as IconImage,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [secondLogoUrl, setSecondLogoUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<any[]>([]);

  const pathname = usePathname();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id", { ascending: true });
    if (error) toast.error(error.message);
    else setColors(data || []);
  }
  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (!auth) {
      router.push("/login");
      return;
    }

    // Fetch logos
    const fetchLogos = async () => {
      try {
        const { data, error } = await supabase
          .from("logos")
          .select("logo_url")
          .order("id", { ascending: false })
          .limit(2);
        if (error) throw error;

        setLogoUrl(data?.[0]?.logo_url || null);
        setSecondLogoUrl(data?.[1]?.logo_url || null);
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    // Fetch new orders count
    const fetchNewOrdersCount = async () => {
      try {
        const { count, error } = await supabase
          .from("checkouts")
          .select("*", { count: "exact", head: true })
          .eq("status", "Pending")
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`);

        if (!error) setNewOrdersCount(count || 0);
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    // Fetch colors
    const fetchAll = async () => {
      await fetchLogos();
      await fetchColors();
      await fetchNewOrdersCount();
    };

    fetchAll();

    // Subscribe to new orders
    const subscription = supabase
      .channel("orders_today")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkouts" },
        (payload) => {
          const orderDate = payload.new.created_at.split("T")[0];
          if (orderDate === today) setNewOrdersCount((prev) => prev + 1);
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(subscription).catch((err) => console.error(err));
    };
  }, [router, today]);

  const links = [
    { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/admin/categories", label: "Categories", Icon: Box },
    { href: "/admin/products", label: "Products", Icon: Package },
    { href: "/admin/deliveries", label: "Deliveries", Icon: Truck },
    { href: "/admin/checkouts", label: "Checkouts", Icon: CreditCard },
    { href: "/admin/logo", label: "Logos", Icon: Package },
    { href: "/admin/colors", label: "Colors", Icon: Palette },
    { href: "/admin/slider", label: "Slider", Icon: IconImage },
    {
      href: "/admin/homepage_banner",
      label: "Home Banner",
      Icon: LayoutDashboard,
    },
    {
      href: "/admin/notifications",
      label: "Notifications",
      Icon: Bell,
      hasCount: true,
    },
    { href: "/admin/multiImages", label: "MultiImages", Icon: Package },
  ];

  if (!colors[0]) return null;
  const mainColor = colors[0];

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ backgroundColor: mainColor.hex, color: mainColor.text_color }}
    >
      <Toaster position="top-right" />

      {/* Mobile Navbar */}
      <header
        className="md:hidden flex items-center justify-start shadow px-4 py-3 sticky top-0 z-50 gap-2"
        style={{ backgroundColor: mainColor.hex, color: mainColor.text_color }}
      >
        <div className="flex gap-2">
          {logoUrl && (
            <div className="relative w-[100px] h-[60px] sm:w-[100px] sm:h-[70px]">
              <Image
                src={logoUrl}
                alt="Logo 1"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
          {secondLogoUrl && (
            <div className="relative w-[70px] h-[60px] sm:w-[80px] sm:h-[70px]">
              <Image
                src={secondLogoUrl}
                alt="Logo 2"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto p-2 rounded-md hover:bg-gray-100 focus:outline-none transition"
        >
          {isOpen ? (
            <X className="h-6 w-6" style={{ color: mainColor.text_color }} />
          ) : (
            <Menu className="h-6 w-6" style={{ color: mainColor.text_color }} />
          )}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full shadow-xl flex flex-col transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ backgroundColor: mainColor.hex, color: mainColor.text_color }}
      >
        <div className="flex items-center justify-start gap-2 h-24 px-6">
          {logoUrl && (
            <div className="relative w-[200px] h-[80px] md:w-[220px] md:h-[100px] sm:w-[100px] sm:h-[100px]">
              <Image
                src={logoUrl}
                alt="Logo 1"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
          {secondLogoUrl && (
            <div className="relative w-[100px] h-[80px] md:w-[120px] md:h-[80px] sm:w-[100px] sm:h-[100px]">
              <Image
                src={secondLogoUrl}
                alt="Logo 2"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>

        <nav className="flex flex-col mt-6 px-4 space-y-3 font-sans text-base">
          {links.map(({ href, label, Icon, hasCount }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between gap-4 py-3 px-3 rounded-lg transition-all duration-300`}
                style={{
                  backgroundColor: isActive
                    ? mainColor.hover_color
                    : "transparent",
                  color: mainColor.text_color,
                  borderLeft: isActive
                    ? `4px solid ${mainColor.text_color}`
                    : "4px solid transparent",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="h-6 w-6"
                    style={{ color: mainColor.text_color }}
                  />
                  <span>{label}</span>
                </div>
                {hasCount && newOrdersCount > 0 && (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold animate-bounce shadow-md"
                    style={{
                      backgroundColor: mainColor.text_color,
                      color: mainColor.hex,
                    }}
                  >
                    {newOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mt-14 md:mt-0 p-6 md:p-8">{children}</main>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
