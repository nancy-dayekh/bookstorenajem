"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

interface CheckoutForm {
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  city: string;
  region: string;
  product_id: string;
  quantity: number;
  delivery_id: string;
  subtotal: string;
  total: string;
}

interface Book {
  id: number;
  name: string;
}

interface Delivery {
  id: number;
  salary: string;
}

export default function EditCheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const checkoutId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [form, setForm] = useState<CheckoutForm>({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    city: "",
    region: "",
    product_id: "",
    quantity: 1,
    delivery_id: "",
    subtotal: "",
    total: "",
  });

  useEffect(() => {
    fetchColors();
    fetchRelations();
    if (checkoutId) fetchCheckout(checkoutId);
  }, [checkoutId]);

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function fetchRelations() {
    const { data: booksData, error: booksError } = await supabase.from("books").select("*");
    if (booksError) toast.error(booksError.message);
    else setBooks(booksData || []);

    const { data: deliveriesData, error: deliveriesError } = await supabase
      .from("deliveries")
      .select("*");
    if (deliveriesError) toast.error(deliveriesError.message);
    else setDeliveries(deliveriesData || []);
  }

  async function fetchCheckout(id: string) {
    const { data, error } = await supabase
      .from("checkout_items")
      .select(`*, checkout:checkouts(*), product:books(*)`)
      .eq("checkout_id", id);

    if (error) toast.error(error.message);
    else if (data && data.length > 0) {
      const checkout = data[0].checkout;
      const item = data[0];
      setForm({
        first_name: checkout.first_name,
        last_name: checkout.last_name,
        address: checkout.address,
        phone: checkout.phone,
        city: checkout.city,
        region: checkout.region,
        product_id: item.product_id?.toString() || "",
        quantity: item.quantity || 1,
        delivery_id: checkout.delivery_id?.toString() || "",
        subtotal: checkout.subtotal,
        total: checkout.total,
      });
    }
  }

  async function handleSave() {
    try {
      if (!checkoutId) return toast.error("Checkout ID missing!");

      const productId = form.product_id ? Number(form.product_id) : null;
      const deliveryId = form.delivery_id ? Number(form.delivery_id) : null;

      const { error: checkoutError } = await supabase
        .from("checkouts")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          address: form.address,
          phone: form.phone,
          city: form.city,
          region: form.region,
          subtotal: form.subtotal,
          total: form.total,
          delivery_id: deliveryId,
        })
        .eq("id", checkoutId);

      if (checkoutError) throw checkoutError;

      const { data: existingItems } = await supabase
        .from("checkout_items")
        .select("*")
        .eq("checkout_id", checkoutId);

      if (existingItems && existingItems.length > 0) {
        await supabase
          .from("checkout_items")
          .update({
            product_id: productId,
            quantity: form.quantity,
          })
          .eq("id", existingItems[0].id);
      } else {
        await supabase.from("checkout_items").insert([
          {
            checkout_id: checkoutId,
            product_id: productId,
            quantity: form.quantity,
          },
        ]);
      }

      toast.success("Checkout Updated!");
      router.push("/admin/checkouts");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <Toaster />
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left"
        style={{ color: mainColor.text_color }}
      >
        Edit Checkout
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(
          [
            "first_name",
            "last_name",
            "address",
            "phone",
            "city",
            "region",
            "subtotal",
            "total",
          ] as const
        ).map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field.replace("_", " ").toUpperCase()}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="border p-3 rounded-md w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
          />
        ))}

        <select
          value={form.product_id}
          onChange={(e) => setForm({ ...form, product_id: e.target.value })}
          className="border p-3 rounded-md w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Book</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          min={1}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          className="border p-3 rounded-md w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={form.delivery_id}
          onChange={(e) => setForm({ ...form, delivery_id: e.target.value })}
          className="border p-3 rounded-md w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
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
          style={{
            backgroundColor: mainColor.button_hex,
            color: mainColor.text_color,
          }}
          className="col-span-1 sm:col-span-2 w-full py-4 rounded-2xl font-semibold transition-transform hover:scale-105 text-base sm:text-lg md:text-xl"
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
