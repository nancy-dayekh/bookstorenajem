/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ✅ بدّلناها
import { supabase } from "../../../../../lib/supabaseClient";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params?.id; // ✅ جلب id من الـ params

  const [product, setProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");

  async function fetchProduct() {
    if (!productId) return;

    const { data, error } = await supabase
      .from("add_products")
      .select("*")
      .eq("id", Number(productId))
      .single();

    if (error) toast.error(error.message);
    else setProduct(data);
  }

  function handleAddToCart() {
    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    toast.success("Added to cart!");
    // 🔜 هون حط منطق الإضافة للسلة أو الـ DB
  }

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  if (!product)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading product...</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Section */}
        <div className="flex justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="rounded-2xl shadow-md object-cover"
          />
        </div>

        {/* Details Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>
          <p className="text-gray-700 text-lg mb-5">{product.description}</p>
          <p className="text-2xl font-semibold text-pink-600 mb-5">
            ${product.price}
          </p>

          {/* Sizes */}
          <div className="mb-5">
            <h3 className="text-lg font-medium mb-2">Select Size</h3>
            <div className="flex gap-3">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    selectedSize === size
                      ? "bg-pink-500 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-5">
            <h3 className="text-lg font-medium mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 border rounded-lg"
              >
                -
              </button>
              <span className="text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 border rounded-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-pink-700 transition-transform hover:scale-105"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
