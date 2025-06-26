import React from 'react';
import { Bell, FileText, MessageSquare } from 'lucide-react';

const notifications = [
  { id: 1, title: 'Nouveau rendez-vous', message: 'Vous avez un rendez-vous demain à 10h.', type: 'event' },
  { id: 2, title: 'Ordonnance disponible', message: 'Votre ordonnance est prête à être téléchargée.', type: 'file' },
  { id: 3, title: 'Message du médecin', message: 'Dr. Martin vous a envoyé un message.', type: 'message' },
];

const iconMap = {
  event: <Bell className="w-6 h-6 text-blue-500" />,
  file: <FileText className="w-6 h-6 text-green-500" />,
  message: <MessageSquare className="w-6 h-6 text-purple-500" />,
};

export default function NotificationsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>
      <div className="w-full max-w-md bg-white dark:bg-[var(--card)] shadow-xl rounded-3xl p-8">
        {notifications.length === 0 ? (
          <p className="text-gray-500">Aucune notification.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map(n => (
              <li key={n.id} className="flex items-center gap-4 border-b pb-2">
                <span>{iconMap[n.type]}</span>
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-gray-600 text-sm">{n.message}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
} 