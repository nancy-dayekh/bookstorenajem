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
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // تحقق من وجود auth
    const auth = localStorage.getItem("admin-auth");
    if (!auth) router.push("/login");

    // جلب عدد الطلبات الجديدة اليوم
    const fetchNewOrdersCount = async () => {
      const { count, error } = await supabase
        .from("checkouts")
        .select("*", { count: "exact", head: true })
        .eq("status", "Pending")
        .gte("created_at", today + "T00:00:00")
        .lte("created_at", today + "T23:59:59");

      if (!error) setNewOrdersCount(count || 0);
    };

    fetchNewOrdersCount();

    // Realtime subscription للطلبات الجديدة
    const subscription = supabase
      .channel("orders_today")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkouts" },
        (payload) => {
          const orderDate = payload.new.created_at.split("T")[0];
          if (orderDate === today) {
            setNewOrdersCount((prev) => prev + 1);

            // Web Notification
            if (Notification.permission === "granted") {
              new Notification("طلب جديد", {
                body: `${payload.new.first_name} ${payload.new.last_name} | إجمالي: $${payload.new.total}`,
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  new Notification("طلب جديد", {
                    body: `${payload.new.first_name} ${payload.new.last_name} | إجمالي: $${payload.new.total}`,
                  });
                }
              });
            }
          }
        }
      )
      .subscribe();

    // ✅ FIX: do NOT return a Promise from cleanup
    return () => {
      supabase.removeChannel(subscription); // no await here!
    };
  }, [router, today]); // ✅ add today as dependency

  const links = [
    { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/admin/categories", label: "Categories", Icon: Box },
    { href: "/admin/products", label: "Products", Icon: Package },
    { href: "/admin/deliveries", label: "Deliveries", Icon: Truck },
    { href: "/admin/checkouts", label: "Checkouts", Icon: CreditCard },
    { href: "/admin/logo", label: "Logos", Icon: Package }, // <-- new logo link

    {
      href: "/admin/notifications",
      label: "Notifications",
      Icon: Bell,
      hasCount: true,
    },
    { href: "/admin/multiImages", label: "MultiImages", Icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between bg-white shadow px-4 py-3 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-pink-600">Admin</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="hidden md:block p-4 text-2xl font-bold border-b text-pink-600">
          Admin
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {links.map(({ href, label, Icon, hasCount }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between gap-3 p-2 rounded font-medium transition
                  ${
                    isActive
                      ? "bg-pink-100 text-pink-600 font-semibold"
                      : "hover:bg-pink-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "text-pink-600" : "text-gray-600"
                    }`}
                  />
                  {label}
                </div>

                {hasCount && newOrdersCount > 0 && (
                  <span className="ml-2 bg-pink-600 text-white rounded-full px-2 text-xs animate-pulse">
                    {newOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 mt-14 md:mt-0">{children}</main>

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
