'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AuthFormProps {
  userType: 'patient' | 'professional';
  isRegister?: boolean;
}

export default function AuthForm({ userType, isRegister = false }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister 
      ? { email, password, role: userType, firstName, lastName }
      : { email, password };

    try {
      const response = await api.post(endpoint, payload);
      
      if (isRegister) {
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        toast.success('Inscription réussie !');
      } else {
        setSuccess('Connexion réussie ! Redirection...');
        toast.success('Connexion réussie !');
        setTimeout(() => {
          login(response.data.token, response.data.user);
        }, 1000);
      }

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const title = isRegister ? 'Inscription' : 'Connexion';
  const userTypeDisplay = userType === 'patient' ? 'Patient' : 'Professionnel';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-3xl shadow-2xl border-2 border-blue-100">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 drop-shadow flex items-center gap-2">
          <span className="inline-block bg-blue-100 rounded-full p-2 shadow">{userType === 'patient' ? '👤' : '🩺'}</span> {title} - Espace {userTypeDisplay}
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">Prénom</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required={isRegister}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-blue-200 rounded-xl shadow focus:outline-none focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Nom</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required={isRegister}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-blue-200 rounded-xl shadow focus:outline-none focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Adresse Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-blue-200 rounded-xl shadow focus:outline-none focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-blue-200 rounded-xl shadow focus:outline-none focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          {success && <p className="text-sm text-green-600 font-semibold">{success}</p>}
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:bg-gray-400 transition"
            >
              {loading ? 'Chargement...' : title}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link href={isRegister ? `/login/${userType}`: `/register/${userType}`} className="font-semibold text-blue-600 hover:text-blue-800 transition">
            {isRegister ? 'Déjà un compte ? Connectez-vous' : "Pas encore de compte ? S'inscrire"}
          </Link>
          <span className="mx-2">|</span>
           <Link href="/" className="font-semibold text-blue-600 hover:text-blue-800 transition">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 