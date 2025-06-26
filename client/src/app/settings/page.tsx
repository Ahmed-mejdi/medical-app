'use client';
import React, { useState } from 'react';
import { Mail, KeyRound } from 'lucide-react';

export default function SettingsPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
      <form className="bg-white dark:bg-[var(--card)] shadow-xl rounded-3xl p-8 w-full max-w-md flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="block font-medium flex items-center gap-2"><Mail className="w-5 h-5" /> Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} className="border p-2 rounded w-full mb-2" required />
        <label className="block font-medium flex items-center gap-2"><KeyRound className="w-5 h-5" /> Nouveau mot de passe</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} className="border p-2 rounded w-full mb-2" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Enregistrer</button>
        {success && <p className="text-green-600 mt-4">Modifications enregistrées !</p>}
      </form>
    </main>
  );
} 