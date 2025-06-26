'use client';
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { q: 'Comment prendre un rendez-vous ?', a: 'Allez dans la section Rendez-vous et cliquez sur "Nouveau rendez-vous".' },
  { q: 'Comment contacter mon médecin ?', a: 'Utilisez la messagerie intégrée pour envoyer un message à votre professionnel de santé.' },
  { q: 'Comment réinitialiser mon mot de passe ?', a: 'Utilisez la page "Réinitialiser le mot de passe" accessible depuis la page de connexion.' },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2"><HelpCircle className="w-7 h-7 text-blue-600" /> Aide & FAQ</h1>
      <div className="w-full max-w-xl bg-white dark:bg-[var(--card)] shadow-xl rounded-3xl p-8">
        <ul className="space-y-4">
          {faqs.map((faq, i) => (
            <li key={i}>
              <button type="button" className="flex items-center justify-between w-full font-semibold text-left" onClick={() => setOpen(open === i ? null : i)}>
                {faq.q}
                {open === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {open === i && <div className="text-gray-700 mt-2 pl-2 border-l-2 border-blue-200">{faq.a}</div>}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
} 