import React from 'react';

export default function MaintenancePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">Maintenance en cours</h1>
      <p className="text-lg mb-8">Le site est temporairement indisponible pour maintenance.<br/>Merci de revenir plus tard.</p>
      <div className="skeleton h-24 w-24 rounded-full mx-auto mb-4" />
    </main>
  );
} 