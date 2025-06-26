import React from 'react';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page non trouvée</p>
      <a href="/" className="btn bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Retour à l'accueil</a>
    </main>
  );
} 