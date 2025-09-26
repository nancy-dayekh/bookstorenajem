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

// Types
type Order = {
  id: number | string;
  total: number | string;
  created_at: string;
};

type TopProduct = {
  name: string;
  quantity: number;
};

type MonthlyData = {
  month: string;
  revenue: number;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // جلب الطلبات
        const { data: checkouts, error: checkoutsError } = await supabase
          .from<Order>("checkouts")
          .select("id,total,created_at");
        if (checkoutsError) throw checkoutsError;

        setOrders(checkouts || []);
        setOrdersCount(checkouts?.length || 0);

        const total = (checkouts || []).reduce((sum, c) => sum + Number(c.total), 0);
        setTotalRevenue(total);

        // السنوات الفريدة
        const uniqueYears = [
          ...new Set(
            (checkouts || []).map((c) => new Date(c.created_at).getFullYear())
          ),
        ];
        setYears(uniqueYears);
        calculateMonthlyRevenue(checkouts || [], selectedYear);

        // أكثر المنتجات مبيعًا
        const { data: items, error: itemsError } = await supabase
          .from("checkout_items")
          .select("quantity, add_products(name)");
        if (itemsError) throw itemsError;

        const productSales: { [key: string]: number } = {};
        (items || []).forEach((item: any) => {
          const productName = item.add_products?.name || "Unknown Product";
          productSales[productName] = (productSales[productName] || 0) + item.quantity;
        });

        const topProductsArray: TopProduct[] = Object.entries(productSales)
          .map(([name, quantity]) => ({ name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        setTopProducts(topProductsArray);

        // عدد المنتجات الفعلي
        const { data: allProducts, error: productsError } = await supabase
          .from("add_products")
          .select("id");
        if (productsError) throw productsError;

        setTotalProducts(allProducts?.length || 0);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err.message);
      }
    }

    fetchDashboardData();
  }, [selectedYear]);

  const calculateMonthlyRevenue = (checkouts: Order[], year: number) => {
    const monthly: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      revenue: 0,
    }));

    checkouts
      .filter((c) => new Date(c.created_at).getFullYear() === year)
      .forEach((c) => {
        const m = new Date(c.created_at).getMonth();
        monthly[m].revenue += Number(c.total);
      });

    setMonthlyData(monthly);
  };

  // ألوان Pink
  const COLORS = ["#ec4899", "#f472b6", "#f9a8d4", "#db2777", "#be185d"];

  return (
    <div className="p-4 sm:p-10 bg-gray-50 min-h-screen space-y-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
        🛍️ Admin Dashboard
      </h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition">
          <h2 className="text-lg font-medium text-gray-500">Total Orders</h2>
          <p className="text-4xl sm:text-5xl font-bold text-pink-500">{ordersCount}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition">
          <h2 className="text-lg font-medium text-gray-500">Total Revenue</h2>
          <p className="text-4xl sm:text-5xl font-bold text-pink-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition">
          <h2 className="text-lg font-medium text-gray-500">Average Order</h2>
          <p className="text-4xl sm:text-5xl font-bold text-pink-400">
            {ordersCount > 0 ? `$${(totalRevenue / ordersCount).toFixed(2)}` : "-"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition">
          <h2 className="text-lg font-medium text-gray-500">Total Products</h2>
          <p className="text-4xl sm:text-5xl font-bold text-pink-700">{totalProducts}</p>
        </div>
      </div>

      {/* Year Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Revenue by Month ({selectedYear})
        </h2>
        <select
          className="border rounded-xl p-2 text-gray-700 shadow-sm"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Pie Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          🏆 Top Selling Products
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topProducts}
              dataKey="quantity"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {topProducts.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
