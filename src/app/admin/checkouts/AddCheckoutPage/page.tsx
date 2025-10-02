"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function InsertCheckoutPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    city: "",
    region: "",
    product_id: "",
    size: "",
    quantity: 1,
    delivery_id: "",
    subtotal: "",
    total: "",
  });

  useEffect(() => {
    async function fetchRelations() {
      const { data: productsData } = await supabase.from("add_products").select("*");
      setProducts(productsData || []);
      const { data: deliveriesData } = await supabase.from("deliveries").select("*");
      setDeliveries(deliveriesData || []);
    }
    fetchRelations();
    fetchColors();
  }, []);

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function handleSave() {
    try {
      if (!form.first_name || !form.last_name) return toast.error("All fields required!");

      const { data: newCheckout, error } = await supabase
        .from("checkouts")
        .insert([
          {
            first_name: form.first_name,
            last_name: form.last_name,
            address: form.address,
            phone: form.phone,
            city: form.city,
            region: form.region,
            subtotal: form.subtotal,
            total: form.total,
            delivery_id: Number(form.delivery_id) || null,
            status: "Pending",
          },
        ])
        .select("*")
        .single();
      if (error) throw error;

      await supabase.from("checkout_items").insert([
        {
          checkout_id: newCheckout.id,
          product_id: Number(form.product_id),
          size: form.size,
          quantity: Number(form.quantity),
        },
      ]);

      toast.success("Checkout Added!");
      setForm({
        first_name: "",
        last_name: "",
        address: "",
        phone: "",
        city: "",
        region: "",
        product_id: "",
        size: "",
        quantity: 1,
        delivery_id: "",
        subtotal: "",
        total: "",
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;

  const mainColor = colors[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Toaster />
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Add Checkout
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          "first_name",
          "last_name",
          "address",
          "phone",
          "city",
          "region",
          "subtotal",
          "total",
        ].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field.replace("_", " ").toUpperCase()}
            value={(form as any)[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
          />
        ))}

        <select
          value={form.product_id}
          onChange={(e) => setForm({ ...form, product_id: e.target.value })}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Size"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
        />

        <select
          value={form.delivery_id}
          onChange={(e) => setForm({ ...form, delivery_id: e.target.value })}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
        >
          <option value="">Select Delivery</option>
          {deliveries.map((d) => (
            <option key={d.id} value={d.id}>
              {d.salary}
            </option>
          ))}
        </select>

        <button
          onClick={handleSave}
          style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
          className="col-span-1 sm:col-span-2 py-3 rounded-2xl font-semibold text-lg transition-transform hover:scale-105"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              mainColor.button_hover_color)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              mainColor.button_hex)
          }
        >
          Add Checkout
        </button>
      </div>
    </div>
  );
}
