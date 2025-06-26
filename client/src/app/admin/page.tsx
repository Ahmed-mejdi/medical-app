'use client';

import React, { useEffect, useState } from 'react';

type User = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', role: '', password: '' });
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', role: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/api/users')
      .then(res => {
        if (!res.ok) throw new Error('API error: ' + res.status);
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error('Erreur lors du fetch des utilisateurs:', err);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      setUsers(users.filter(user => user.user_id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'ajout');
      const newUser = await res.json();
      setUsers([newUser, ...users]);
      setForm({ first_name: '', last_name: '', email: '', role: '', password: '' });
    } catch (err) {
      alert('Erreur lors de l\'ajout');
      console.error(err);
    }
    setAdding(false);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditing(true);
    try {
      const res = await fetch(`http://localhost:5001/api/users/${editingUser.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Erreur lors de la modification');
      const updated = await res.json();
      setUsers(users.map(u => u.user_id === updated.user_id ? updated : u));
      setEditingUser(null);
    } catch (err) {
      alert('Erreur lors de la modification');
      console.error(err);
    }
    setEditing(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      <div className="w-full max-w-2xl bg-white dark:bg-[var(--card)] shadow rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter un utilisateur</h2>
        <form className="flex flex-wrap gap-4 items-end" onSubmit={handleAdd}>
          <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Prénom" className="border p-2 rounded w-40" required />
          <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Nom" className="border p-2 rounded w-40" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" className="border p-2 rounded w-52" required />
          <select name="role" value={form.role} onChange={handleChange} className="border p-2 rounded w-40" required>
            <option value="">Rôle</option>
            <option value="patient">Patient</option>
            <option value="professional">Professionnel</option>
            <option value="admin">Admin</option>
          </select>
          <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" type="password" className="border p-2 rounded w-40" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={adding}>{adding ? 'Ajout...' : 'Ajouter'}</button>
        </form>
      </div>
      <div className="w-full max-w-2xl bg-white dark:bg-[var(--card)] shadow rounded-3xl p-8">
        <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          className="border p-2 rounded w-full mb-4"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nom</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Rôle</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(user =>
                  user.first_name.toLowerCase().includes(search.toLowerCase()) ||
                  user.last_name.toLowerCase().includes(search.toLowerCase()) ||
                  user.email.toLowerCase().includes(search.toLowerCase())
                )
                .map(user => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{user.first_name} {user.last_name}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">{user.role}</td>
                    <td className="py-2 px-4 border-b">
                      <button className="text-blue-600 hover:underline mr-4" onClick={() => openEdit(user)}>Modifier</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(user.user_id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {!loading && users.length === 0 && <p className="text-center text-gray-500 mt-4">Aucun utilisateur.</p>}
      </div>
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Modifier l'utilisateur</h2>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <input name="first_name" value={editForm.first_name} onChange={handleEditChange} placeholder="Prénom" className="border p-2 rounded" required />
              <input name="last_name" value={editForm.last_name} onChange={handleEditChange} placeholder="Nom" className="border p-2 rounded" required />
              <input name="email" value={editForm.email} onChange={handleEditChange} placeholder="Email" type="email" className="border p-2 rounded" required />
              <select name="role" value={editForm.role} onChange={handleEditChange} className="border p-2 rounded" required>
                <option value="patient">Patient</option>
                <option value="professional">Professionnel</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-4 mt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={editing}>{editing ? 'Modification...' : 'Enregistrer'}</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditingUser(null)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
} 