import React from 'react';

export default function EditProfessionalPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">Modifier Professionnel</h1>
      <form className="card p-8 bg-white dark:bg-[var(--card)] shadow rounded-3xl w-full max-w-md">
        <input className="w-full p-2 rounded-lg border mb-4" placeholder="Nom" required />
        <input className="w-full p-2 rounded-lg border mb-4" placeholder="Prénom" required />
        <input className="w-full p-2 rounded-lg border mb-4" placeholder="E-mail" type="email" required />
        <button type="submit" className="btn bg-blue-600 text-white w-full py-2 rounded-lg font-semibold">Enregistrer</button>
      </form>
      <p className="mt-8 text-gray-500 dark:text-gray-400">Fonctionnalité à venir</p>
    </main>
  );
} 