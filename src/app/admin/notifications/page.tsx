/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function TodayOrdersLive() {
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [colors, setColors] = useState<ColorForm[] | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // Fetch colors from DB
  const fetchColors = useCallback(async () => {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }, []);

  // Fetch today's orders
  const fetchTodayOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("checkouts")
      .select(
        `
        *,
        items:checkout_items (
          id,
          product:add_products (id,name,price,image),
          size,
          quantity
        )
      `
      )
      .eq("status", "Pending")
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .order("id", { ascending: false });

    if (error) toast.error(error.message);
    else setTodayOrders(data || []);
  }, [today]);

  const saveNotification = async (order: any) => {
    await supabase.from("notifications").insert([
      {
        title: "New Order",
        body: `${order.first_name} ${order.last_name} - Total: $${order.total}`,
      },
    ]);
  };

  useEffect(() => {
    fetchColors();
    fetchTodayOrders();

    const subscription = supabase
      .channel("orders_today")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkouts" },
        async (payload) => {
          const newOrder: any = payload.new;
          const orderDate = newOrder.created_at.split("T")[0];

          if (orderDate === today) {
            setTodayOrders((prev) => [newOrder, ...prev]);

            toast.success(
              `New order: ${newOrder.first_name} ${newOrder.last_name} | $${newOrder.total}`,
              { duration: 5000 }
            );

            await saveNotification(newOrder);

            if (typeof window !== "undefined" && Notification.permission === "granted") {
              new Notification("New Order", {
                body: `${newOrder.first_name} ${newOrder.last_name} | Total: $${newOrder.total}`,
              });
            }

            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => console.log("Autoplay blocked by browser"));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [today, fetchTodayOrders, fetchColors]);

  const toggleDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (!colors) return <div className="text-center py-20">Loading colors...</div>;
  const mainColor = colors[0];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
      <Toaster position="top-right" />

      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center"
        style={{ color: mainColor.text_color }}
      >
        Today's Orders (Live)
      </h1>

      <div
        className="overflow-x-auto shadow-md rounded-xl border"
        style={{ borderColor: mainColor.button_hex }}
      >
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead
            style={{
              backgroundColor: mainColor.button_hex,
              color: mainColor.text_color,
            }}
          >
            <tr>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Customer</th>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Address</th>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Phone</th>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {todayOrders.map((order) => (
              <tr
                key={order.id}
                className="bg-white hover:opacity-90 cursor-pointer transition"
              >
                <td
                  colSpan={4}
                  onClick={() => toggleDetails(order.id)}
                  className="px-2 sm:px-4 py-2"
                >
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                    <span>{order.first_name} {order.last_name}</span>
                    <span>{order.address}</span>
                    <span>{order.phone}</span>
                    <span>${order.total}</span>
                  </div>

                  {expandedOrderId === order.id && (
                    <div
                      className="mt-4 p-3 rounded-md"
                      style={{ backgroundColor: mainColor.button_hover_color, color: mainColor.text_color }}
                    >
                      <h3 className="font-semibold mb-2">Product Details:</h3>
                      <div className="space-y-3">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
                          >
                            <Image
                              src={item.product?.image || "/placeholder.png"}
                              alt={item.product?.name ?? "Product image"}
                              width={80}
                              height={80}
                              className="rounded-md object-cover"
                            />
                            <div>
                              <p className="font-medium">{item.product?.name ?? "Unnamed Product"}</p>
                              <p>Size: {item.size}</p>
                              <p>Qty: {item.quantity}</p>
                              <p>Price: ${item.product?.price ?? 0}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
