'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Box, Package, Truck, CreditCard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/admin/categories", label: "Categories", Icon: Box },
    { href: "/admin/products", label: "Products", Icon: Package },
    { href: "/admin/deliveries", label: "Deliveries", Icon: Truck },
    { href: "/admin/checkouts", label: "Checkouts", Icon: CreditCard },
    { href: "/admin/multiImages", label: "MultiImages", Icon: Package }, // added MultiImages link
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
          {links.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded font-medium transition
                  ${isActive ? "bg-pink-100 text-pink-600 font-semibold" : "hover:bg-pink-50"}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-pink-600" : "text-gray-600"}`} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 mt-14 md:mt-0">
        {children}
      </main>

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
