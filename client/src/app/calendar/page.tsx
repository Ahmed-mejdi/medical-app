import React from 'react';

export default function CalendarPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">Calendrier</h1>
      <div className="card p-8 bg-white dark:bg-[var(--card)] shadow rounded-3xl w-full max-w-md animate-pulse">
        <div className="skeleton h-32 w-full mb-4" />
        <div className="skeleton h-6 w-2/3 mx-auto mb-2" />
      </div>
      <p className="mt-8 text-gray-500 dark:text-gray-400">Fonctionnalité à venir</p>
    </main>
  );
} 