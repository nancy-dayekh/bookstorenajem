/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import bcrypt from "bcryptjs"; // install bcryptjs: npm install bcryptjs

type Color = {
  hex: string;
  text_color: string;
  button_hover_color?: string;
};

export default function EditProfile() {
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState<number | null>(null);

  // Fetch admin data and colors
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch colors
        const { data: colorData } = await supabase
          .from("colors")
          .select("*")
          .order("id");
        setColors(colorData || []);

        // Fetch first admin from table
        const { data: adminData, error } = await supabase
          .from("admins")
          .select("id, email, role")
          .limit(1)
          .single();

        if (error) throw error;
        if (!adminData) {
          toast.error("No admin record found!");
          return;
        }

        setAdminId(adminData.id);
        setEmail(adminData.email || "");
        setCurrentEmail(adminData.email || "");
        setRole(adminData.role || "");
      } catch (err: any) {
        toast.error(err.message);
      }
    }

    fetchData();
  }, []);

  const mainColor = colors[0];

  async function handleUpdate() {
    if (!email) return toast.error("Email is required!");
    if (password && password !== confirmPassword)
      return toast.error("Passwords do not match!");
    if (!adminId) return toast.error("Admin ID not found!");

    setLoading(true);

    try {
      const updateData: { email?: string; role?: string; password?: string } = {};

      if (email !== currentEmail) updateData.email = email;
      updateData.role = role;

      if (password.trim() !== "") {
        const hashedPassword = bcrypt.hashSync(password, 10); // hash password
        updateData.password = hashedPassword;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("admins")
          .update(updateData)
          .eq("id", adminId);
        if (error) throw error;
      }

      toast.success("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
      setCurrentEmail(email);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 rounded-2xl shadow-lg" style={{ backgroundColor: "#fff" }}>
      <Toaster />
      <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: mainColor?.text_color }}>
        ✏️ Edit Profile
      </h1>

      {/* Email */}
      <label className="block font-medium mb-1">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded-xl px-4 py-3 mb-4 focus:outline-none"
        style={{ borderColor: mainColor?.hex }}
      />

      {/* New Password */}
      <label className="block font-medium mb-1">New Password</label>
      <div className="relative mb-4">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 focus:outline-none pr-10"
          placeholder="Leave empty to keep current"
          style={{ borderColor: mainColor?.hex }}
        />
        <span
          className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-black"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {/* Confirm Password */}
      <label className="block font-medium mb-1">Confirm Password</label>
      <div className="relative mb-4">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 focus:outline-none pr-10"
          placeholder="Re-enter new password"
          style={{ borderColor: mainColor?.hex }}
        />
        <span
          className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-black"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {/* Role */}
      <label className="block font-medium mb-1">Role</label>
      <input
        type="text"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full border rounded-xl px-4 py-3 mb-6 focus:outline-none"
        style={{ borderColor: mainColor?.hex }}
      />

      {/* Save Button */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full py-3 rounded-2xl font-semibold shadow-md transition-colors"
        style={{
          backgroundColor: mainColor?.hex,
          color: mainColor?.text_color,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            mainColor?.button_hover_color || mainColor?.hex)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = mainColor?.hex || "#000")
        }
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
