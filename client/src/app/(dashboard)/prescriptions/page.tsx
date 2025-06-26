'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Prescription {
  prescription_id: number;
  medication_name: string;
  dosage: string;
  instructions: string;
  issued_date: string;
  professional_first_name?: string;
  professional_last_name?: string;
  patient_first_name?: string;
  patient_last_name?: string;
}

export default function MyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  // Form state for creating a new prescription (for professionals)
  const [patientId, setPatientId] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions');
      setPrescriptions(response.data);
      setError('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la récupération des ordonnances.';
      if (msg !== 'Invalid user role.') setError(msg);
      else setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);
  
  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post('/prescriptions', { patientId, medicationName, dosage, instructions });
        setPatientId('');
        setMedicationName('');
        setDosage('');
        setInstructions('');
        setSuccess('Ordonnance créée avec succès !');
        setError('');
        fetchPrescriptions();
    } catch (err: any) {
        const msg = err.response?.data?.message || 'Erreur lors de la création de l\'ordonnance.';
        if (msg !== 'Invalid user role.') setError(msg);
        else setError('');
        setSuccess('');
    }
  };

  const handleDownload = async (prescriptionId: number) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/download`, {
        responseType: 'blob', // Important for file download
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ordonnance-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
      setError('Le téléchargement a échoué.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-2 sm:px-8">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-700 drop-shadow flex items-center gap-2">
        <span className="inline-block bg-blue-100 rounded-full p-2 shadow">💊</span> Mes Ordonnances
      </h1>
      {success && <p className="text-green-600 mb-4 font-semibold">{success}</p>}
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}

      {/* Form for Professionals */}
      {user?.role === 'professional' && (
        <div className="mb-10 p-8 bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto border-2 border-blue-100">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Créer une nouvelle ordonnance</h2>
          <form onSubmit={handleCreatePrescription} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-blue-700">ID du Patient</label>
              <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)} required className="mt-1 block w-full rounded-xl border-blue-200 shadow"/>
            </div>
             <div>
              <label className="block text-sm font-semibold text-blue-700">Médicament</label>
              <input type="text" value={medicationName} onChange={e => setMedicationName(e.target.value)} required className="mt-1 block w-full rounded-xl border-blue-200 shadow"/>
            </div>
             <div>
              <label className="block text-sm font-semibold text-blue-700">Dosage</label>
              <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} required className="mt-1 block w-full rounded-xl border-blue-200 shadow"/>
            </div>
             <div>
              <label className="block text-sm font-semibold text-blue-700">Instructions</label>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} className="mt-1 block w-full rounded-xl border-blue-200 shadow"></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition">Créer</button>
          </form>
        </div>
      )}

      {/* List of Prescriptions */}
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border-2 border-blue-100">
         <table className="min-w-full leading-normal">
          <thead>
             <tr>
              <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase">Date</th>
              <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase">{user?.role === 'patient' ? 'Prescrit par' : 'Patient'}</th>
              <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50 text-left text-xs font-bold text-blue-700 uppercase">Médicament</th>
              <th className="px-6 py-4 border-b-2 border-blue-100 bg-blue-50"></th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((pr, idx) => (
              <tr key={pr.prescription_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100 transition'}>
                <td className="px-6 py-4 border-b border-blue-100 text-sm font-semibold text-gray-800">{new Date(pr.issued_date).toLocaleDateString('fr-FR')}</td>
                <td className="px-6 py-4 border-b border-blue-100 text-sm">{user?.role === 'patient' 
                    ? `Dr. ${pr.professional_first_name} ${pr.professional_last_name}` 
                    : `${pr.patient_first_name} ${pr.patient_last_name}`
                  }</td>
                <td className="px-6 py-4 border-b border-blue-100 text-sm">{pr.medication_name}</td>
                <td className="px-6 py-4 border-b border-blue-100 text-sm text-right">
                  <button onClick={() => handleDownload(pr.prescription_id)} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition">Télécharger (PDF)</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 