/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

interface Checkout {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  city: string;
  region: string;
  delivery_id: number | null;
  subtotal: number;
  total: number;
  created_at: string;
}

interface CheckoutItem {
  id: number;
  checkout_id: number;
  product_id: number;
  quantity: number;
  product?: any;
}

export default function CheckoutPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    city: "",
    region: "",
    delivery_id: "",
    subtotal: "",
    total: "",
  });

  // ✅ Fetch checkouts
  async function fetchCheckouts() {
    const { data, error } = await supabase
      .from("checkouts")
      .select("*")
      .order("id", { ascending: false });

    if (error) toast.error(error.message);
    else setCheckouts(data);
  }

  // ✅ Fetch checkout_items + product data
  async function fetchCheckoutItems() {
    const { data, error } = await supabase
      .from("checkout_items")
      .select("*, product:add_products(id,name,image,price)");

    if (error) toast.error(error.message);
    else setCheckoutItems(data);
  }

  // ✅ Save new checkout
  async function handleSave() {
    try {
      if (!formData.first_name || !formData.last_name)
        return toast.error("Please fill required fields");

      const { data, error } = await supabase
        .from("checkouts")
        .insert([
          {
            ...formData,
            delivery_id: formData.delivery_id
              ? Number(formData.delivery_id)
              : null,
            subtotal: Number(formData.subtotal),
            total: Number(formData.total),
          },
        ])
        .select();

      if (error) throw error;
      toast.success("Order created!");
      setFormData({
        first_name: "",
        last_name: "",
        address: "",
        phone: "",
        city: "",
        region: "",
        delivery_id: "",
        subtotal: "",
        total: "",
      });
      fetchCheckouts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    fetchCheckouts();
    fetchCheckoutItems();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-4xl font-bold text-center mb-6 text-pink-600">
        Checkouts Management
      </h1>

      {/* Checkout Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Checkout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(formData).map(([key, value]) => (
            <input
              key={key}
              type={["subtotal", "total", "delivery_id"].includes(key) ? "number" : "text"}
              placeholder={key.replace("_", " ")}
              value={value}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
            />
          ))}
        </div>
        <button
          onClick={handleSave}
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 transition-all"
        >
          Add Checkout
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full bg-white text-sm sm:text-base">
          <thead className="bg-pink-100">
            <tr>
              {[
                "ID",
                "Customer",
                "Address",
                "Phone",
                "City",
                "Region",
                "Subtotal",
                "Total",
                "Items",
                "Date",
              ].map((title) => (
                <th key={title} className="p-3 text-left text-gray-700">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checkouts.map((order) => {
              const items = checkoutItems.filter(
                (item) => item.checkout_id === order.id
              );

              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{order.id}</td>
                  <td className="p-3">
                    {order.first_name} {order.last_name}
                  </td>
                  <td className="p-3">{order.address}</td>
                  <td className="p-3">{order.phone}</td>
                  <td className="p-3">{order.city}</td>
                  <td className="p-3">{order.region}</td>
                  <td className="p-3">{order.subtotal}$</td>
                  <td className="p-3 font-bold">{order.total}$</td>
                  <td className="p-3">
                    {items.length > 0 ? (
                      <div className="space-y-2">
                        {items.map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center gap-2 border-b pb-1 last:border-none"
                          >
                            {it.product?.image && (
                              <Image
                                src={it.product.image}
                                alt={it.product.name}
                                width={40}
                                height={40}
                                className="rounded-lg object-cover"
                              />
                            )}
                            <span>{it.product?.name}</span>
                            <span className="text-gray-600">
                              x{it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No items</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
