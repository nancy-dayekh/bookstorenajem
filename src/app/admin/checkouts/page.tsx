/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function CheckoutsPage() {
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    city: "",
    region: "",
    product_id: "",
    delivery_id: "",
    subtotal: "",
    total: "",
  });

  const [editId, setEditId] = useState<number | null>(null);

  async function fetchCheckouts() {
    const { data, error } = await supabase
      .from("checkouts")
      .select("*")
      .order("id", { ascending: false });
    if (error) toast.error(error.message);
    else setCheckouts(data || []);
  }

  async function fetchRelations() {
    const { data: productsData } = await supabase
      .from("add_products")
      .select("id,name,years,quantity,image");
    const { data: deliveriesData } = await supabase
      .from("deliveries")
      .select("id,salary");

    setProducts(productsData || []);
    setDeliveries(deliveriesData || []);
  }

  async function handleSave() {
    try {
      if (!form.first_name || !form.last_name || !form.address || !form.phone) {
        return toast.error("All required fields must be filled.");
      }

      const checkoutData = {
        ...form,
        product_id: form.product_id ? Number(form.product_id) : null,
        delivery_id: form.delivery_id ? Number(form.delivery_id) : null,
      };

      if (editId) {
        const { error } = await supabase
          .from("checkouts")
          .update(checkoutData)
          .eq("id", editId);
        if (error) throw error;
        toast.success("Checkout Updated!");
        setEditId(null);
      } else {
        const { error } = await supabase
          .from("checkouts")
          .insert([checkoutData]);
        if (error) throw error;
        toast.success("Checkout Added!");
      }

      resetForm();
      fetchCheckouts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function deleteCheckout(id: number) {
    try {
      const { error } = await supabase.from("checkouts").delete().eq("id", id);
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
      delivery_id: "",
      subtotal: "",
      total: "",
    });
  }

  useEffect(() => {
    fetchCheckouts();
    fetchRelations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6 text-center text-pink-600">
        Checkout Management
      </h1>

      {/* ✅ Form with baby pink inputs */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3 text-gray-700">
          Add / Edit Checkout
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "first_name", placeholder: "First Name" },
            { name: "last_name", placeholder: "Last Name" },
            { name: "address", placeholder: "Address" },
            { name: "phone", placeholder: "Phone" },
            { name: "city", placeholder: "City" },
            { name: "region", placeholder: "Region" },
            { name: "subtotal", placeholder: "Subtotal" },
            { name: "total", placeholder: "Total" },
          ].map((input) => (
            <input
              key={input.name}
              type="text"
              placeholder={input.placeholder}
              value={(form as any)[input.name]}
              onChange={(e) =>
                setForm({ ...form, [input.name]: e.target.value })
              }
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

      {/* ✅ Table */}
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
                "Product",
                "Years",
                "Quantity",
                "Image",
                "Subtotal",
                "Total",
                "Delivery / Actions",
              ].map((title) => (
                <th key={title} className="px-4 py-3 text-left">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {checkouts.map((c) => {
              const product = products.find((p) => p.id === c.product_id);
              const delivery = deliveries.find(
                (d) => d.id === Number(c.delivery_id)
              );

              return (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 font-medium">
                    {c.first_name} {c.last_name}
                  </td>
                  <td className="px-4 py-3">{c.address}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3">{c.region}</td>
                  <td className="px-4 py-3">{product?.name || "-"}</td>
                  <td className="px-4 py-3">{product?.years || "-"}</td>
                  <td className="px-4 py-3">{product?.quantity || "-"}</td>
                  <td className="px-4 py-3">
                    {product?.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48} // 12 * 4 (tailwind rem -> px)
                        height={48}
                        className="rounded-lg shadow-sm object-cover"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">{c.subtotal}</td>
                  <td className="px-4 py-3">{c.total}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {delivery ? `$${delivery.salary}` : "-"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditId(c.id);
                            setForm({
                              ...c,
                              product_id: c.product_id
                                ? String(c.product_id)
                                : "",
                              delivery_id: c.delivery_id
                                ? String(c.delivery_id)
                                : "",
                            });
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCheckout(c.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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
