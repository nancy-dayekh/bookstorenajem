"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function MessagesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("id", { ascending: false });

    if (error) toast.error(error.message);
    else setMessages(data || []);
  }

  async function deleteMessage(id: number) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Message deleted!");
      fetchMessages();
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4 text-center">Messages</h1>

      <div className="flex justify-end mb-4">
        <Link
          href="/admin/messages/AddMessagePage"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Add Message
        </Link>
      </div>

      <div className="overflow-x-auto shadow-md border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Comment</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, i) => (
              <tr key={msg.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{msg.name}</td>
                <td className="px-4 py-2">{msg.phone || "-"}</td>
                <td className="px-4 py-2">{msg.email || "-"}</td>
                <td className="px-4 py-2">{msg.comment}</td>
                <td className="px-4 py-2">
                  {new Date(msg.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    <Link
                      href={`/admin/messages/EditMessagePage/${msg.id}`}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
