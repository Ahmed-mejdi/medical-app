'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Patient {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
}

export default function MyPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'professional') {
      const fetchPatients = async () => {
        try {
          const response = await api.get('/patients');
          setPatients(response.data);
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Erreur lors de la récupération des patients.';
          if (msg !== 'Invalid user role.' && msg !== 'Invalid user role') setError(msg);
          else setError('');
        } finally {
          setLoading(false);
        }
      };
      fetchPatients();
    } else {
        setLoading(false);
        setError("Vous n'êtes pas autorisé à voir cette page.");
    }
  }, [user]);

  if (loading) return <div className="text-center mt-8">Chargement des patients...</div>;
  if (error && error !== 'Invalid user role.' && error !== 'Invalid user role') return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-2 sm:px-8">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-700 drop-shadow flex items-center gap-2">
        <span className="inline-block bg-blue-100 rounded-full p-2 shadow">👥</span> Mes Patients
      </h1>
      {patients.length > 0 ? (
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border-2 border-blue-100">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Date de Naissance</th>
                <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, idx) => (
                <tr key={patient.user_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100 transition'}>
                  <td className="px-6 py-4 border-b border-blue-100 text-sm font-semibold text-gray-800">{patient.first_name} {patient.last_name}</td>
                  <td className="px-6 py-4 border-b border-blue-100 text-sm">{patient.email}</td>
                  <td className="px-6 py-4 border-b border-blue-100 text-sm">{new Date(patient.date_of_birth).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 border-b border-blue-100 text-sm text-right">
                    <Link href={`/patients/${patient.user_id}`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition">Voir le dossier</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Vous n'avez aucun patient pour le moment.</p>
      )}
    </div>
  );
} 