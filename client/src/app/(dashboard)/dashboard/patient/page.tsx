'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Appointment {
  appointment_id: number;
  appointment_date: string;
  reason: string;
  status: string;
  professional_first_name?: string;
  professional_last_name?: string;
}

interface Prescription {
  prescription_id: number;
  medication_name: string;
  issued_date: string;
  professional_first_name?: string;
  professional_last_name?: string;
}

export default function PatientDashboardPage() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [apptRes, prescRes, chatRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/prescriptions'),
          api.get('/chat/conversations'),
        ]);
        setAppointments(apptRes.data.slice(0, 2));
        setPrescriptions(prescRes.data.slice(0, 2));
        // Compter les conversations avec des messages non lus (à adapter si backend le permet)
        setUnreadCount(chatRes.data.filter((c: any) => c.unread_count && c.unread_count > 0).length);
      } catch (err) {
        setAppointments([]);
        setPrescriptions([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-2 sm:px-8">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-700 drop-shadow flex items-center gap-2">
        <span className="inline-block bg-blue-100 rounded-full p-2 shadow">👤</span> Bienvenue, {user?.first_name || 'Patient'} !
      </h1>
      <p className="mt-2 text-lg">Ceci est votre tableau de bord personnel.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Prochains Rendez-vous */}
        <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-blue-100">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Prochains Rendez-vous</h2>
          {loading ? (
            <p className="mt-2 text-gray-500">Chargement...</p>
          ) : appointments.length === 0 ? (
            <p className="mt-2">Vous n'avez aucun rendez-vous à venir.</p>
          ) : (
            <ul className="mt-2">
              {appointments.map(appt => (
                <li key={appt.appointment_id} className="mb-2">
                  <span className="font-semibold">{new Date(appt.appointment_date).toLocaleString('fr-FR')}</span>
                  {appt.professional_first_name && (
                    <> avec Dr. {appt.professional_first_name} {appt.professional_last_name}</>
                  )}
                  <br />
                  <span className="text-gray-600 text-sm">{appt.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Dernières Ordonnances */}
        <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-blue-100">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Dernières Ordonnances</h2>
          {loading ? (
            <p className="mt-2 text-gray-500">Chargement...</p>
          ) : prescriptions.length === 0 ? (
            <p className="mt-2">Aucune ordonnance récente.</p>
          ) : (
            <ul className="mt-2">
              {prescriptions.map(pr => (
                <li key={pr.prescription_id} className="mb-2">
                  <span className="font-semibold">{new Date(pr.issued_date).toLocaleDateString('fr-FR')}</span>
                  {pr.professional_first_name && (
                    <> par Dr. {pr.professional_first_name} {pr.professional_last_name}</>
                  )}
                  <br />
                  <span className="text-gray-600 text-sm">{pr.medication_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Messages non lus */}
        <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-blue-100">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Messages non lus</h2>
          {loading ? (
            <p className="mt-2 text-gray-500">Chargement...</p>
          ) : unreadCount === 0 ? (
            <p className="mt-2">Vous n'avez aucun nouveau message.</p>
          ) : (
            <p className="mt-2">Vous avez {unreadCount} conversation(s) non lue(s).</p>
          )}
        </div>
      </div>
    </div>
  );
} 