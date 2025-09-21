"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function CheckoutsPage() {
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

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

  // Fetch all checkouts with their items and products
  async function fetchCheckouts() {
    const { data, error } = await supabase
      .from("checkout_items")
      .select(`
        id,
        quantity,
        size,
        checkout:checkouts (
          id,
          first_name,
          last_name,
          address,
          phone,
          city,
          region,
          subtotal,
          total,
          delivery_id
        ),
        product:add_products (
          id,
          name,
          years,
          image
        )
      `)
      .order("checkout_id", { ascending: false })
      .order("id", { ascending: true });

    if (error) toast.error(error.message);
    else setCheckouts(data || []);
  }

  async function fetchRelations() {
    const { data: productsData, error: productsError } = await supabase
      .from("add_products")
      .select("id,name,years,image");
    if (productsError) toast.error(productsError.message);
    else setProducts(productsData || []);

    const { data: deliveriesData, error: deliveriesError } = await supabase
      .from("deliveries")
      .select("*");
    if (deliveriesError) toast.error(deliveriesError.message);
    else setDeliveries(deliveriesData || []);
  }

  async function handleSave() {
    try {
      if (!form.first_name || !form.last_name || !form.address || !form.phone) {
        return toast.error("All required fields must be filled.");
      }

      let checkoutId = editId;

      if (!editId) {
        const { data: newCheckout, error } = await supabase
          .from("checkouts")
          .insert([{
            first_name: form.first_name,
            last_name: form.last_name,
            address: form.address,
            phone: form.phone,
            city: form.city,
            region: form.region,
            subtotal: form.subtotal,
            total: form.total,
            delivery_id: form.delivery_id ? Number(form.delivery_id) : null
          }])
          .select("*")
          .single();
        if (error) throw error;
        checkoutId = newCheckout.id;
      } else {
        const { error } = await supabase
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
            delivery_id: form.delivery_id ? Number(form.delivery_id) : null
          })
          .eq("id", editId);
        if (error) throw error;
      }

      if (!editId) {
        const { error } = await supabase
          .from("checkout_items")
          .insert([{
            checkout_id: checkoutId,
            product_id: Number(form.product_id),
            size: form.size,
            quantity: Number(form.quantity)
          }]);
        if (error) throw error;
        toast.success("Checkout Added!");
      } else {
        const item = checkouts.find((i) => i.checkout.id === editId);
        if (item) {
          const { error } = await supabase
            .from("checkout_items")
            .update({
              product_id: Number(form.product_id),
              size: form.size,
              quantity: Number(form.quantity)
            })
            .eq("id", item.id);
          if (error) throw error;
          toast.success("Checkout Updated!");
        }
      }

      resetForm();
      setEditId(null);
      fetchCheckouts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function deleteCheckout(checkoutId: number) {
    try {
      const { error } = await supabase.from("checkouts").delete().eq("id", checkoutId);
      if (error) throw error;
      toast.success("Checkout Deleted!");
      fetchCheckouts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function resetForm() {
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
  }

  useEffect(() => {
    fetchCheckouts();
    fetchRelations();
  }, []);

  // Group checkouts by customer
  const groupedCheckouts = checkouts.reduce((acc: any[], item) => {
    const existing = acc.find(c => c.id === item.checkout.id);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ ...item.checkout, items: [item] });
    }
    return acc;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6 text-center text-pink-600">
        Checkout Management
      </h1>

      {/* Form */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3 text-gray-700">
          Add / Edit Checkout
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["first_name", "last_name", "address", "phone", "city", "region", "subtotal", "total"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.replace("_", " ").toUpperCase()}
              value={(form as any)[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="border border-pink-200 bg-pink-50 text-gray-800 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
            />
          ))}

          <select
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            className="border border-pink-200 bg-pink-50 text-gray-800 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Size"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="border border-pink-200 bg-pink-50 text-gray-800 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
          />

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            min={1}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            className="border border-pink-200 bg-pink-50 text-gray-800 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
          />

          <select
            value={form.delivery_id}
            onChange={(e) => setForm({ ...form, delivery_id: e.target.value })}
            className="border border-pink-200 bg-pink-50 text-gray-800 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
          >
            <option value="">Select Delivery</option>
            {deliveries.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.salary}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            className="col-span-1 sm:col-span-2 bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-transform hover:scale-105"
          >
            {editId ? "Save Changes" : "Add Checkout"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pink-100 text-gray-700">
            <tr>
              {[
                "Customer",
                "Address",
                "Phone",
                "City",
                "Region",
                "Products",
                "Size",
                "Quantity",
                "Image",
                "Subtotal",
                "Total",
                "Delivery / Actions",
              ].map((title) => (
                <th key={title} className="px-4 py-3 text-left">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedCheckouts.map((checkout) => (
              <>
                {checkout.items.map((item: any, index: number) => (
                  <tr
                    key={item.id}
                    className={`transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white hover:bg-pink-50" : "bg-pink-50 hover:bg-pink-100"
                    }`}
                  >
                    {index === 0 && (
                      <>
                        <td className="px-4 py-3 font-medium" rowSpan={checkout.items.length}>
                          {checkout.first_name} {checkout.last_name}
                        </td>
                        <td className="px-4 py-3" rowSpan={checkout.items.length}>{checkout.address}</td>
                        <td className="px-4 py-3" rowSpan={checkout.items.length}>{checkout.phone}</td>
                        <td className="px-4 py-3" rowSpan={checkout.items.length}>{checkout.city}</td>
                        <td className="px-4 py-3" rowSpan={checkout.items.length}>{checkout.region}</td>
                      </>
                    )}
                    <td className="px-4 py-3">{item.product?.name || "-"}</td>
                    <td className="px-4 py-3">{item.size || "-"}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">
                      {item.product?.image ? (
                        <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="rounded-lg shadow-sm object-cover" />
                      ) : "-"}
                    </td>
                    {index === 0 && (
                      <>
                        <td className="px-4 py-3" rowSpan={checkout.items.length}>{checkout.subtotal}</td>
                        <td className="px-4 py-3" rowSpan={checkout.items.length}>{checkout.total}</td>
                        <td className="px-4 py-3 text-center" rowSpan={checkout.items.length}>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {deliveries.find(d => d.id === checkout.delivery_id)
                                ? `$${deliveries.find(d => d.id === checkout.delivery_id).salary}`
                                : "-"}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditId(checkout.id);
                                  const firstItem = checkout.items[0];
                                  setForm({
                                    first_name: checkout.first_name,
                                    last_name: checkout.last_name,
                                    address: checkout.address,
                                    phone: checkout.phone,
                                    city: checkout.city,
                                    region: checkout.region,
                                    subtotal: checkout.subtotal,
                                    total: checkout.total,
                                    product_id: firstItem.product?.id ? String(firstItem.product.id) : "",
                                    size: firstItem.size,
                                    quantity: firstItem.quantity,
                                    delivery_id: checkout.delivery_id ? String(checkout.delivery_id) : "",
                                  });
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteCheckout(checkout.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
