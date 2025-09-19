'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { Pencil, Trash2, Check, X } from 'lucide-react';

export default function DeliveriesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [newSalary, setNewSalary] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editSalary, setEditSalary] = useState('');

  async function fetchDeliveries() {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('id', { ascending: true });

    if (error) toast.error(error.message);
    else setDeliveries(data);
  }

  async function addDelivery() {
    if (!newSalary.trim()) return toast.error('Salary cannot be empty');
    const { error } = await supabase.from('deliveries').insert([{ salary: newSalary }]);
    if (error) return toast.error(error.message);
    toast.success('Salary Added');
    setNewSalary('');
    fetchDeliveries();
  }

  async function deleteDelivery(id: number) {
    const { error } = await supabase.from('deliveries').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Salary Deleted');
    fetchDeliveries();
  }

  async function saveEditDelivery(id: number) {
    if (!editSalary.trim()) return toast.error('Salary cannot be empty');
    const { error } = await supabase.from('deliveries').update({ salary: editSalary }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Salary Updated');
    setEditId(null);
    setEditSalary('');
    fetchDeliveries();
  }

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-pink-600">
        Manage Deliveries
      </h1>

      {/* Input + Add Button */}
      <div className="flex flex-col gap-3 mb-6">
        <input
          type="number"
          value={newSalary}
          onChange={(e) => setNewSalary(e.target.value)}
          placeholder="Enter salary"
          className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm"
        />
        <button
          onClick={addDelivery}
          className="w-full bg-pink-500 text-white py-3 rounded-2xl font-semibold hover:bg-pink-600 active:scale-95 transition shadow-md"
        >
          + Add Delivery
        </button>
      </div>

      {/* List Deliveries */}
      <ul className="space-y-4">
        {deliveries.map((d) => (
          <li
            key={d.id}
            className="bg-white shadow-md rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border border-gray-100"
          >
            {editId === d.id ? (
              <div className="flex flex-col sm:flex-row flex-1 gap-3">
                <input
                  type="number"
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => saveEditDelivery(d.id)}
                    className="flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="flex items-center justify-center px-3 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-lg font-semibold text-gray-800 text-center sm:text-left">
                  ${d.salary}
                </span>
                <div className="flex justify-center sm:justify-end gap-3">
                  <button
                    onClick={() => { setEditId(d.id); setEditSalary(d.salary); }}
                    className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-sm"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteDelivery(d.id)}
                    className="flex items-center justify-center p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
