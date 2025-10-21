"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function EditMessagePage() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    comment: "",
  });

  // Fetch message data
  useEffect(() => {
    async function fetchMessage() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      // Only store editable fields (exclude id)
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        comment: data.comment || "",
      });
    }

    if (id) fetchMessage();
  }, [id]);

  // Handle form update
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from("messages")
      .update({
        name: form.name,
        phone: form.phone,
        email: form.email,
        comment: form.comment,
      })
      .eq("id", Number(id)); // Filter by id, do not include id in update

    if (error) toast.error(error.message);
    else toast.success("Message updated successfully!");
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4 text-center">Edit Message</h1>

      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border rounded-md p-2"
        />

        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border rounded-md p-2"
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded-md p-2"
        />

        <textarea
          placeholder="Comment"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="border rounded-md p-2 h-28"
        ></textarea>

        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Update Message
        </button>

        <Link href="/admin/messages" className="text-blue-600 text-center mt-2">
          ← Back to Messages
        </Link>
      </form>
    </div>
  );
}
