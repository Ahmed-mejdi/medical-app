import React from 'react';

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">Mot de passe oublié</h1>
      <form className="card p-8 bg-white dark:bg-[var(--card)] shadow rounded-3xl w-full max-w-md">
        <label className="block mb-2 text-sm font-medium" htmlFor="email">Adresse e-mail</label>
        <input id="email" type="email" className="w-full p-2 rounded-lg border mb-4" placeholder="Votre e-mail" required />
        <button type="submit" className="btn bg-blue-600 text-white w-full py-2 rounded-lg font-semibold">Envoyer le lien</button>
      </form>
      <p className="mt-8 text-gray-500 dark:text-gray-400">Fonctionnalité à venir</p>
    </main>
  );
} 