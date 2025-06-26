'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  appointment_id: number;
  appointment_date: string;
  reason: string;
  status: string;
  patient_first_name?: string;
  patient_last_name?: string;
  professional_first_name?: string;
  professional_last_name?: string;
}

interface Patient {
  user_id: number;
  first_name: string;
  last_name: string;
}

interface Professional {
  user_id: number;
  first_name: string;
  last_name: string;
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // State for the creation form
  const [newAppointmentDate, setNewAppointmentDate] = useState('');
  const [newAppointmentReason, setNewAppointmentReason] = useState('');
  const [myPatients, setMyPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  // targetId will hold patientId for professionals, and professionalId for patients
  const [targetId, setTargetId] = useState(''); 
  const [success, setSuccess] = useState('');


  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des rendez-vous.');
    } finally {
      setLoading(false);
    }
  };

   const fetchMyPatients = async () => {
    try {
        const response = await api.get('/patients');
        setMyPatients(response.data);
    } catch (err) {
        console.error("Failed to fetch patients:", err);
        // Non-critical error, we can just show an empty list
    }
  };

  const fetchProfessionals = async () => {
    try {
        const response = await api.get('/patients/professionals');
        setProfessionals(response.data);
    } catch (err) {
        console.error("Failed to fetch professionals:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
      if (user.role === 'professional') {
        fetchMyPatients();
      }
      if (user.role === 'patient') {
        fetchProfessionals();
      }
    }
  }, [user]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user || !targetId) {
        if(user?.role === 'professional') setError('Veuillez sélectionner un patient.');
        return
    };
    
    const payload = {
        appointmentDate: newAppointmentDate,
        reason: newAppointmentReason,
        professionalId: user.role === 'professional' ? user.id : targetId,
        patientId: user.role === 'patient' ? user.id : targetId
    };

    try {
        await api.post('/appointments', payload);
        setSuccess('Rendez-vous créé avec succès !');
        // Reset form and refetch appointments
        setNewAppointmentDate('');
        setNewAppointmentReason('');
        setTargetId('');
        fetchAppointments(); 
    } catch (err: any) {
         setError(err.response?.data?.message || 'Erreur lors de la création du rendez-vous.');
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="skeleton h-8 w-1/3 mb-6" />
      <div className="skeleton h-6 w-1/2 mb-4" />
      <div className="skeleton h-40 w-full rounded-3xl" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-2 sm:px-8">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-700 drop-shadow flex items-center gap-2">
        <span className="inline-block bg-blue-100 rounded-full p-2 shadow">📅</span> Mes Rendez-vous
      </h1>
      {/* Creation Form */}
      <div className="mb-10 p-8 bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto border-2 border-blue-100">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Planifier un nouveau rendez-vous</h2>
        <form onSubmit={handleCreateAppointment} className="space-y-5">
            <div>
                <label htmlFor="date" className="block text-sm font-semibold text-blue-700">Date et Heure</label>
                <input type="datetime-local" id="date" value={newAppointmentDate} onChange={e => setNewAppointmentDate(e.target.value)} required className="mt-1 block w-full rounded-xl border-blue-200 shadow focus:border-blue-400 focus:ring-blue-400"/>
            </div>
            
            {user?.role === 'professional' && (
                 <div>
                    <label htmlFor="patient-select" className="block text-sm font-semibold text-blue-700">Patient</label>
                    <select id="patient-select" value={targetId} onChange={e => setTargetId(e.target.value)} required className="mt-1 block w-full rounded-xl border-blue-200 shadow focus:border-blue-400">
                        <option value="">-- Sélectionnez un patient --</option>
                        {myPatients.map(patient => (
                            <option key={patient.user_id} value={patient.user_id}>
                                {patient.first_name} {patient.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {user?.role === 'patient' && (
                <div>
                    <label htmlFor="professional-select" className="block text-sm font-semibold text-blue-700">Professionnel</label>
                    <select id="professional-select" value={targetId} onChange={e => setTargetId(e.target.value)} required className="mt-1 block w-full rounded-xl border-blue-200 shadow focus:border-blue-400">
                        <option value="">-- Sélectionnez un professionnel --</option>
                        {professionals.map(pro => (
                            <option key={pro.user_id} value={pro.user_id}>
                                Dr. {pro.first_name} {pro.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
           
            <div>
                 <label htmlFor="reason" className="block text-sm font-semibold text-blue-700">Motif</label>
                <textarea id="reason" value={newAppointmentReason} onChange={e => setNewAppointmentReason(e.target.value)} required rows={3} className="mt-1 block w-full rounded-xl border-blue-200 shadow"></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition">Confirmer le rendez-vous</button>
            {success && <p className="text-green-600 text-sm mt-2 font-semibold">{success}</p>}
            {error && error !== 'Invalid user role.' && error !== 'Invalid user role' && <p className="text-red-500 text-sm mt-2 font-semibold">{error}</p>}
        </form>
      </div>

      {/* Appointments List */}
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Rendez-vous à venir</h2>
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border-2 border-blue-100">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">{user?.role === 'patient' ? 'Professionnel' : 'Patient'}</th>
              <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Motif</th>
              <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, idx) => (
              <tr key={appt.appointment_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100 transition'}>
                <td className="px-6 py-4 border-b border-blue-100 text-sm font-semibold text-gray-800">
                  {new Date(appt.appointment_date).toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 border-b border-blue-100 text-sm">
                  {user?.role === 'patient'
                    ? `Dr. ${appt.professional_first_name} ${appt.professional_last_name}`
                    : `${appt.patient_first_name} ${appt.patient_last_name}`}
                </td>
                <td className="px-6 py-4 border-b border-blue-100 text-sm text-gray-600">{appt.reason}</td>
                <td className="px-6 py-4 border-b border-blue-100 text-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{appt.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 