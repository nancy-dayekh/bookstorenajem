/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ColorForm {
  id?: number;
  button_hex: string;
  button_hover_color: string;
  text_color: string;
}

export default function CheckoutsPage() {
  const [colors, setColors] = useState<ColorForm[] | null>(null);
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  async function fetchCheckouts() {
    const { data, error } = await supabase
      .from("checkout_items")
      .select(
        `id, quantity, size,
         checkout:checkouts(id, first_name, last_name, address, phone, city, region, subtotal, total, delivery_id, status),
         product:add_products(id, name, years, image, price)`
      )
      .order("checkout_id", { ascending: false })
      .order("id", { ascending: true });

    if (error) toast.error(error.message);
    else setCheckouts(data || []);
  }

  async function fetchColors() {
    const { data, error } = await supabase.from("colors").select("*").order("id");
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  async function fetchRelations() {
    const { data: deliveriesData, error: deliveriesError } = await supabase.from("deliveries").select("*");
    if (deliveriesError) toast.error(deliveriesError.message);
    else setDeliveries(deliveriesData || []);
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

  async function updateStatus(checkoutId: number, newStatus: string) {
    const { error } = await supabase.from("checkouts").update({ status: newStatus }).eq("id", checkoutId);
    if (error) toast.error(error.message);
    else {
      toast.success(`Status updated to ${newStatus}`);
      fetchCheckouts();
    }
  }

  function generateInvoice(checkout: any) {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.text("INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text("Customer Details:", 20, 55);
    doc.text(`Name: ${checkout.first_name} ${checkout.last_name}`, 20, 63);
    doc.text(`Phone: ${checkout.phone}`, 20, 70);
    doc.text(`Address: ${checkout.address}`, 20, 77);
    doc.text(`Status: ${checkout.status}`, 20, 84);

    const tableData = checkout.items.map((item: any, index: number) => {
      const price = Number(item.product?.price) || 0;
      const total = price * (Number(item.quantity) || 0);
      return [index + 1, item.product?.name || "N/A", item.size || "-", item.quantity || 0, `$${price.toFixed(2)}`, `$${total.toFixed(2)}`];
    });

    autoTable(doc, {
      startY: 95,
      head: [["#", "Product", "Size", "Qty", "Price", "Total"]],
      body: tableData,
      styles: { halign: "center" },
      headStyles: { fillColor: [33, 150, 243], textColor: 255, fontSize: 12 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Grand Total: $${checkout.total}`, 160, finalY, { align: "right" });
    doc.save(`invoice-${checkout.id}.pdf`);
  }

  function generateAllInvoices() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("All Orders", 105, 20, { align: "center" });

    let startY = 30;
    groupedCheckouts.forEach((checkout, idx) => {
      doc.setFontSize(12);
      doc.text(`Order #${checkout.id} - ${checkout.first_name} ${checkout.last_name}`, 20, startY);
      doc.text(`Total: $${checkout.total}`, 160, startY);
      startY += 10;

      const tableData = checkout.items.map((item: any, index: number) => [index + 1, item.product?.name || "N/A", item.size || "-", item.quantity || 0, `$${Number(item.product?.price || 0).toFixed(2)}`]);
      autoTable(doc, {
        startY,
        head: [["#", "Product", "Size", "Qty", "Price"]],
        body: tableData,
        styles: { halign: "center" },
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontSize: 11 },
      });

      startY = (doc as any).lastAutoTable.finalY + 15;
      if (startY > 270 && idx !== groupedCheckouts.length - 1) {
        doc.addPage();
        startY = 30;
      }
    });

    doc.save("all-orders.pdf");
  }

  useEffect(() => {
    fetchCheckouts();
    fetchRelations();
    fetchColors();
  }, []);

  if (!colors) return <div className="text-center py-20">Loading...</div>;
  const mainColor = colors[0];

  const groupedCheckouts = checkouts.reduce((acc: any[], item) => {
    const existing = acc.find((c) => c.id === item.checkout.id);
    if (existing) existing.items.push(item);
    else acc.push({ ...item.checkout, items: [item] });
    return acc;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: mainColor.text_color }}>
        Checkout Management
      </h1>

      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <Link
          href="/admin/checkouts/AddCheckoutPage"
          style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
          className="px-4 sm:px-5 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
        >
          + Add Order
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateAllInvoices}
            style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
            className="px-3 sm:px-4 py-2 rounded-md hover:opacity-80 transition"
          >
            Export All PDF
          </button>
          <button
            onClick={() => { if (confirm("Delete ALL orders?")) checkouts.forEach((c) => deleteCheckout(c.checkout.id)); }}
            style={{ backgroundColor: mainColor.button_hex, color: mainColor.text_color }}
            className="px-3 sm:px-4 py-2 rounded-md hover:opacity-80 transition"
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead className="bg-pink-100 text-gray-700">
            <tr>
              {["Customer", "Address", "Phone", "City", "Region", "Products", "Size", "Quantity", "Image", "Subtotal", "Total", "Status", "Delivery / Actions"].map((title) => (
                <th key={title} className="px-2 sm:px-4 py-2 text-left">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedCheckouts.map((checkout, orderIndex) => (
              <>
                <tr className="bg-gray-100">
                  <td colSpan={13} className="px-2 sm:px-4 py-2 font-semibold text-gray-700 truncate">
                    Order #{orderIndex + 1} — {checkout.first_name} {checkout.last_name}
                  </td>
                </tr>

                {checkout.items.map((item: any, index: number) => (
                  <tr key={item.id} className={`transition-colors duration-150 ${index % 2 === 0 ? "bg-white hover:bg-pink-50" : "bg-pink-50 hover:bg-pink-100"}`}>
                    {index === 0 && (
                      <>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2 font-medium">{checkout.first_name} {checkout.last_name}</td>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2 truncate max-w-[120px]">{checkout.address}</td>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2">{checkout.phone}</td>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2">{checkout.city}</td>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2">{checkout.region}</td>
                      </>
                    )}
                    <td className="px-2 sm:px-4 py-2 truncate max-w-[100px]">{item.product?.name || "-"}</td>
                    <td className="px-2 sm:px-4 py-2">{item.size || "-"}</td>
                    <td className="px-2 sm:px-4 py-2">{item.quantity}</td>
                    <td className="px-2 sm:px-4 py-2">
                      {item.product?.image ? <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="rounded-lg shadow-sm object-cover" /> : "-"}
                    </td>
                    {index === 0 && (
                      <>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2">{checkout.subtotal}</td>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2">{checkout.total}</td>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2">
                          <select value={checkout.status || "Pending"} onChange={(e) => updateStatus(checkout.id, e.target.value)} className="border border-gray-300 rounded-md text-sm px-2 py-1 w-full">
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                        </td>
                        <td rowSpan={checkout.items.length} className="px-2 sm:px-4 py-2 text-center">
                          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center flex-wrap">
                            <span className="text-sm text-gray-600">
                              {deliveries.find((d) => d.id === checkout.delivery_id) ? `$${deliveries.find((d) => d.id === checkout.delivery_id).salary}` : "-"}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => deleteCheckout(checkout.id)} className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Delete</button>
                              <button onClick={() => generateInvoice(checkout)} className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition">PDF</button>
                              <Link href={`/admin/checkouts/EditCheckoutPage/${checkout.id}`} className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">Edit</Link>
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
