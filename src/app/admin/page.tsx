"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

type Order = {
  id: string | number;
  total: number | string;
  created_at: string;
};
type CheckoutItem = { quantity: number; add_products?: { name: string } };
type TopProduct = { name: string; quantity: number };
type MonthlyData = { month: string; revenue: number };

type Color = {
  hex: string;
  text_color: string;
  hover_color?: string;
};

export default function AdminDashboard() {
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [userName, setUserName] = useState<string>("Admin");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [colors, setColors] = useState<Color[]>([]);

  async function fetchColors() {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("id");
    setColors((data as Color[]) || []);
    if (error) toast.error(error.message);
    else setColors(data || []);
  }

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("name")
          .limit(1)
          .single();
        if (!adminError && adminData) setUserName(adminData.name || "Admin");

        const { data: checkouts } = await supabase
          .from("checkouts")
          .select("id,total,created_at");
        const typedCheckouts = (checkouts || []) as Order[];
        setOrdersCount(typedCheckouts.length);
        setTotalRevenue(
          typedCheckouts.reduce((sum, c) => sum + Number(c.total), 0)
        );

        setYears([
          ...new Set(
            typedCheckouts.map((c) => new Date(c.created_at).getFullYear())
          ),
        ]);

        calculateMonthlyRevenue(typedCheckouts, selectedYear);

        const { data: items } = await supabase
          .from("checkout_items")
          .select("quantity, add_products(name)");
        const typedItems = (items || []) as unknown as CheckoutItem[];
        const productSales: Record<string, number> = {};
        typedItems.forEach((item) => {
          const name = item.add_products?.name || "Unknown";
          productSales[name] = (productSales[name] || 0) + item.quantity;
        });
        setTopProducts(
          Object.entries(productSales)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)
        );

        const { data: allProducts } = await supabase
          .from("add_products")
          .select("id");
        setTotalProducts(allProducts?.length || 0);
      } catch (err) {
        console.error(err);
      }
    }

    fetchDashboardData();
    fetchColors();
  }, [selectedYear]);

  const calculateMonthlyRevenue = (checkouts: Order[], year: number) => {
    const monthly: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      revenue: 0,
    }));
    checkouts
      .filter((c) => new Date(c.created_at).getFullYear() === year)
      .forEach(
        (c) =>
          (monthly[new Date(c.created_at).getMonth()].revenue += Number(
            c.total
          ))
      );
    setMonthlyData(monthly);
  };

  if (colors.length === 0) return null;
  const mainColor = colors[0];

  const handleLogout = () => (window.location.href = "/login");

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1
          className="text-3xl sm:text-4xl font-bold px-4 py-2 rounded-xl"
          style={{
            backgroundColor: mainColor.hex,
            color: mainColor.text_color,
          }}
        >
          🛍️ Admin Dashboard
        </h1>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-3 rounded-full shadow hover:shadow-md transition"
            style={{
              backgroundColor: mainColor.hex,
              color: mainColor.text_color,
            }}
          >
            👤
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-48 border rounded-xl shadow-lg z-10"
              style={{
                backgroundColor: mainColor.hex,
                color: mainColor.text_color,
              }}
            >
              <div className="px-4 py-3 text-sm">
                Signed in as <strong>{userName}</strong>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2"
                style={{ color: "red", backgroundColor: mainColor.hover_color }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Total Orders", value: ordersCount },
          { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
          { title: "Total Products", value: totalProducts },
        ].map((card, idx) => {
          const cardColor = colors[idx % colors.length];
          return (
            <div
              key={card.title}
              className="rounded-3xl shadow-lg p-6 sm:p-8 flex flex-col justify-center items-center hover:shadow-2xl transition transform hover:-translate-y-1"
              style={{
                backgroundColor: cardColor.hex,
                color: cardColor.text_color,
              }}
            >
              <p className="font-semibold uppercase tracking-wide">
                {card.title}
              </p>
              <p className="mt-3 text-3xl sm:text-5xl font-bold">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Year Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
        <h2
          className="text-xl sm:text-2xl font-semibold px-4 py-2 rounded-xl"
          style={{
            backgroundColor: mainColor.hex,
            color: mainColor.text_color,
          }}
        >
          Revenue by Month ({selectedYear})
        </h2>
        <select
          className="border rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 transition"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={{
            backgroundColor: mainColor.hex,
            color: mainColor.text_color,
          }}
        >
          {years.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Revenue BarChart */}
      <div className="rounded-3xl shadow-lg p-4 sm:p-6 hover:shadow-2xl transition mt-6">
        <h2 className="text-lg font-semibold mb-4">Revenue by Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid
              stroke={mainColor.text_color}
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="month"
              stroke={mainColor.text_color}
              tick={{ fill: mainColor.text_color }}
            />
            <YAxis
              stroke={mainColor.text_color}
              tick={{ fill: mainColor.text_color }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: mainColor.hex,
                color: mainColor.text_color,
                borderRadius: "12px",
              }}
              itemStyle={{ color: mainColor.text_color }}
              labelStyle={{ color: mainColor.text_color }}
            />
            <Bar
              dataKey="revenue"
              fill={mainColor.hover_color || "#ec4899"}
              radius={[12, 12, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Pie Chart */}
      <div
        className="rounded-3xl shadow-lg p-6 mt-6 transition-all duration-300 relative overflow-hidden hover:shadow-2xl"
        style={{
          backgroundColor: mainColor.hex,
          color: mainColor.text_color,
        }}
      >
        {/* دائرة Hover شفافة */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>

        <h2 className="text-xl sm:text-2xl font-semibold mb-4 relative z-10">
          🏆 Top Selling Products
        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
          className="relative z-10"
        >
          <PieChart>
            <Pie
              data={topProducts}
              dataKey="quantity"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, percent }) =>
                `${name} ${(Number(percent) * 100).toFixed(0)}%`
              }
            >
              {topProducts.map((_, index) => {
                const zaraColors = [
                  "#222222",
                  "#555555",
                  "#999999",
                  "#ffffff",
                  "#f5f5f5",
                ];
                const color = zaraColors[index % zaraColors.length];
                return <Cell key={index} fill={color} stroke="#000" />;
              })}
            </Pie>
            <Legend wrapperStyle={{ color: mainColor.text_color }} />
            <Tooltip
              contentStyle={{
                backgroundColor: mainColor.hex,
                color: mainColor.text_color,
                borderRadius: "12px",
              }}
              itemStyle={{ color: mainColor.text_color }}
              labelStyle={{ color: mainColor.text_color }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
