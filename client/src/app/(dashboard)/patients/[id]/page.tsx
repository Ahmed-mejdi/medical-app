'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface PatientDetails {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  address: string | null;
  phone_number: string | null;
}

interface Prescription {
  prescription_id: number;
  medication_name: string;
  dosage: string;
  instructions: string;
  issued_date: string;
  professional_first_name?: string;
  professional_last_name?: string;
}

export default function PatientDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();

  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescLoading, setPrescLoading] = useState(true);
  const [prescError, setPrescError] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prescSuccess, setPrescSuccess] = useState('');

  // Déplacer fetchPrescriptions ici pour l'utiliser ailleurs
  const fetchPrescriptions = async () => {
    try {
      setPrescLoading(true);
      const response = await api.get(`/prescriptions/patient/${id}`);
      setPrescriptions(response.data);
    } catch (err: any) {
      setPrescError(err.response?.data?.message || 'Erreur lors de la récupération des ordonnances.');
    } finally {
      setPrescLoading(false);
    }
  };

  useEffect(() => {
    if (id && user?.role === 'professional') {
      const fetchPatientDetails = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/patients/${id}`);
          setPatient(response.data);
        } catch (err: any) {
          setError(err.response?.data?.msg || 'Erreur lors de la récupération du dossier patient.');
        } finally {
          setLoading(false);
        }
      };
      fetchPatientDetails();
      fetchPrescriptions();
    }
  }, [id, user]);

  if (loading) return <div className="text-center mt-8">Chargement du dossier...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!patient) return <div className="text-center mt-8">Dossier non trouvé.</div>;
  
  const birthDate = new Date(patient.date_of_birth);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  const startConversation = async () => {
    try {
      // Assuming you have an endpoint to create a conversation
      await api.post('/chat/conversations', { recipientId: patient.user_id });
      // Redirect to chat page, or maybe the chat page will now show the new conversation
      window.location.href = '/chat';
    } catch (err) {
      console.error("Failed to start conversation", err);
      alert("Could not start conversation.");
    }
  };

  // Téléchargement PDF ordonnance
  const handleDownload = async (prescriptionId: number) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ordonnance-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Le téléchargement a échoué.');
    }
  };

  // Création d'une ordonnance
  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrescError('');
    setPrescSuccess('');
    try {
      await api.post('/prescriptions', {
        patientId: id,
        medicationName,
        dosage,
        instructions,
      });
      setMedicationName('');
      setDosage('');
      setInstructions('');
      setPrescSuccess('Ordonnance créée avec succès !');
      fetchPrescriptions();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur lors de la création de l'ordonnance.";
      setPrescError(msg);
      setPrescSuccess('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-2 sm:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-700 drop-shadow flex items-center gap-2">
          <span className="inline-block bg-blue-100 rounded-full p-2 shadow">👤</span> Dossier de {patient.first_name} {patient.last_name}
        </h1>
        <Link href="/patients" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition">
          &larr; Retour à la liste des patients
        </Link>
      </div>
      {/* Patient Info Card */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl mb-8 border-2 border-blue-100">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">Informations Personnelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><strong>Nom:</strong> {patient.first_name} {patient.last_name}</div>
          <div><strong>Âge:</strong> {age} ans</div>
          <div><strong>Date de naissance:</strong> {birthDate.toLocaleDateString('fr-FR')}</div>
          <div><strong>Email:</strong> <a href={`mailto:${patient.email}`} className="text-blue-600 underline">{patient.email}</a></div>
          <div><strong>Téléphone:</strong> {patient.phone_number || 'Non renseigné'}</div>
          <div className="md:col-span-2"><strong>Adresse:</strong> {patient.address || 'Non renseignée'}</div>
        </div>
        <div className="mt-6 pt-4 border-t">
          <button onClick={startConversation} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow hover:bg-green-700 transition">Démarrer une conversation</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-blue-100">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Historique des Rendez-vous</h2>
          <p className="text-gray-500">Fonctionnalité à venir...</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-blue-100">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Ordonnances</h2>
          {/* Formulaire de création d'ordonnance */}
          <form onSubmit={handleCreatePrescription} className="mb-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-blue-700">Médicament</label>
              <input type="text" value={medicationName} onChange={e => setMedicationName(e.target.value)} required className="mt-1 block w-full rounded-xl border-blue-200 shadow" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700">Dosage</label>
              <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} required className="mt-1 block w-full rounded-xl border-blue-200 shadow" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700">Instructions</label>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={2} className="mt-1 block w-full rounded-xl border-blue-200 shadow"></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition">Créer l'ordonnance</button>
            {prescSuccess && <p className="text-green-600 text-sm mt-2 font-semibold">{prescSuccess}</p>}
            {prescError && <p className="text-red-500 text-sm mt-2 font-semibold">{prescError}</p>}
          </form>
          {prescLoading ? (
            <p className="text-gray-500">Chargement des ordonnances...</p>
          ) : prescError ? (
            <p className="text-red-500">{prescError}</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-gray-500">Aucune ordonnance trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Prescrit par</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Médicament</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((pr) => (
                    <tr key={pr.prescription_id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(pr.issued_date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">Dr. {pr.professional_first_name} {pr.professional_last_name}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pr.medication_name}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                        <button onClick={() => handleDownload(pr.prescription_id)} className="text-indigo-600 hover:text-indigo-900">
                          Télécharger (PDF)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 