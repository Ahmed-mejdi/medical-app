'use client';
import React, { useEffect, useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/users/1')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  if (!user) return <div className="flex justify-center items-center min-h-[60vh]">Chargement...</div>;

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white dark:bg-[var(--card)] shadow-xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center">
        <div className="bg-blue-100 rounded-full p-4 mb-4">
          <User className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{user.first_name} {user.last_name}</h1>
        <div className="flex items-center text-gray-600 mb-2">
          <Mail className="w-5 h-5 mr-2" /> {user.email}
        </div>
        <div className="flex items-center text-gray-600">
          <Shield className="w-5 h-5 mr-2" /> {user.role}
        </div>
      </div>
    </main>
  );
} 