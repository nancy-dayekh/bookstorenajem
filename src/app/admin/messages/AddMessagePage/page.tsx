"use client";

import { useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function AddMessagePage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    comment: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("messages").insert([form]);
    if (error) toast.error(error.message);
    else {
      toast.success("Message added successfully!");
      setForm({ name: "", phone: "", email: "", comment: "" });
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4 text-center">Add New Message</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          required
          className="border rounded-md p-2 h-28"
        ></textarea>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Message
        </button>

        <Link href="/admin/messages" className="text-blue-600 text-center mt-2">
          ← Back to Messages
        </Link>
      </form>
    </div>
  );
}
