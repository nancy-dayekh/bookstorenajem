/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import React from "react";

export default function TodayOrdersLive() {
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const fetchTodayOrders = async () => {
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
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59")
      .order("id", { ascending: false });

    if (error) toast.error(error.message);
    else setTodayOrders(data || []);
  };

  const saveNotification = async (order: any) => {
    await supabase.from("notifications").insert([
      {
        title: "New Order",
        body: `${order.first_name} ${order.last_name} - Total: $${order.total}`,
      },
    ]);
  };

  useEffect(() => {
    fetchTodayOrders();

    const subscription = supabase
      .channel("orders_today")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkouts" },
        async (payload) => {
          const newOrder = payload.new;
          const orderDate = newOrder.created_at.split("T")[0];

          if (orderDate === today) {
            setTodayOrders((prev) => [newOrder, ...prev]);

            toast.success(
              `New order: ${newOrder.first_name} ${newOrder.last_name} | $${newOrder.total}`,
              { duration: 5000 }
            );

            await saveNotification(newOrder);

            if (Notification.permission === "granted") {
              new Notification("New Order", {
                body: `${newOrder.first_name} ${newOrder.last_name} | Total: $${newOrder.total}`,
              });
            }

            const audio = new Audio("/notification.mp3");
            audio.play();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const toggleDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center text-pink-600">
        Today's Orders (Live)
      </h1>

      <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead className="bg-pink-100 text-gray-700">
            <tr>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Customer</th>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Address</th>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Phone</th>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {todayOrders.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  onClick={() => toggleDetails(order.id)}
                  className="bg-white hover:bg-pink-50 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-2 sm:px-4 py-2">{order.first_name} {order.last_name}</td>
                  <td className="px-2 sm:px-4 py-2">{order.address}</td>
                  <td className="px-2 sm:px-4 py-2">{order.phone}</td>
                  <td className="px-2 sm:px-4 py-2">${order.total}</td>
                </tr>

                {expandedOrderId === order.id && (
                  <tr className="bg-pink-50">
                    <td colSpan={4} className="px-2 sm:px-4 py-4">
                      <h3 className="font-semibold mb-2">Product Details:</h3>
                      <div className="space-y-3">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
                          >
                            <img
                              src={item.product?.image}
                              alt={item.product?.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                            />
                            <div>
                              <p className="font-medium">{item.product?.name}</p>
                              <p>Size: {item.size}</p>
                              <p>Qty: {item.quantity}</p>
                              <p>Price: ${item.product?.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
