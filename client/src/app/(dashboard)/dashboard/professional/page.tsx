'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Patient {
  user_id: number;
  first_name: string;
  last_name: string;
}

interface Appointment {
  appointment_id: number;
  appointment_date: string;
  patient_first_name: string;
  patient_last_name: string;
  reason: string;
}

export default function ProfessionalDashboardPage() {
  const { user } = useAuth();
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [patientsRes, appointmentsRes] = await Promise.all([
          api.get('/patients?limit=5'), // Assuming the patients endpoint can take a limit
          api.get('/appointments/today')
        ]);
        setRecentPatients(patientsRes.data);
        setTodaysAppointments(appointmentsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-2 sm:px-8">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-700 drop-shadow flex items-center gap-2">
        <span className="inline-block bg-blue-100 rounded-full p-2 shadow">🩺</span> Bienvenue, Dr. {user?.last_name || 'Professionnel'} !
      </h1>
      <p className="mt-2 text-lg">Voici votre tableau de bord professionnel.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-blue-100">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Patients Récents</h2>
            {loading ? <p>Chargement...</p> : recentPatients.length > 0 ? (
              <ul>
                {recentPatients.map(p => <li key={p.user_id}>{p.first_name} {p.last_name}</li>)}
              </ul>
            ) : (
              <p className="mt-2">Aucun patient consulté récemment.</p>
            )}
        </div>
        <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-blue-100">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Rendez-vous du jour</h2>
            {loading ? <p>Chargement...</p> : todaysAppointments.length > 0 ? (
              <ul>
                {todaysAppointments.map(a => (
                  <li key={a.appointment_id}>
                    {a.patient_first_name} {a.patient_last_name} - {new Date(a.appointment_date).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2">Aucun rendez-vous prévu pour aujourd'hui.</p>
            )}
        </div>
        <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-blue-100">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Tâches en attente</h2>
            <p className="mt-2">Aucune tâche en attente.</p>
        </div>
      </div>
    </div>
  );
} 