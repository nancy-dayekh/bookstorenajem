'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

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
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />
      
      <h1 className="text-3xl font-bold mb-6 text-center text-pink-600">
        Manage Deliveries
      </h1>

      {/* Input + Add Button */}
      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={newSalary}
          onChange={(e) => setNewSalary(e.target.value)}
          placeholder="Enter salary"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          onClick={addDelivery}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
        >
          Add
        </button>
      </div>

      {/* List Deliveries */}
      <ul className="space-y-3">
        {deliveries.map((d) => (
          <li
            key={d.id}
            className="flex justify-between items-center bg-white p-3 rounded-lg shadow"
          >
            {editId === d.id ? (
              // Editing Mode
              <div className="flex flex-1 gap-2">
                <input
                  type="number"
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={() => saveEditDelivery(d.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              // Normal View
              <>
                <span className="text-gray-700 font-semibold">${d.salary}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditId(d.id); setEditSalary(d.salary); }}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDelivery(d.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
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
