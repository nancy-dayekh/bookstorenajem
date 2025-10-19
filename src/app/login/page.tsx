"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import bcrypt from "bcryptjs";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // toggle password
  const router = useRouter();

  async function handleLogin() {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) return toast.error("Invalid login credentials");

      const isValid = await bcrypt.compare(password, data.password);
      if (!isValid) return toast.error("Invalid login credentials");

      localStorage.setItem(
        "admin-auth",
        JSON.stringify({
          id: data.id,
          email: data.email,
        })
      );

      toast.success("Welcome back!");
      router.push("/admin");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <Toaster position="top-right" />
      <div className="bg-pink-100 p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-center text-pink-700">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base"
        />

        {/* Password input with toggle */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base pr-10"
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-black"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-pink-500 text-white py-2 sm:py-3 rounded-lg hover:bg-pink-600 transition-all duration-300 font-semibold shadow-md text-sm sm:text-base"
        >
          Login
        </button>
      </div>
    </div>
  );
}
