import React from 'react';

export default function Avatar({ name, src, size = 48 }: { name?: string; src?: string; size?: number }) {
  if (src) {
    return <img src={src} alt={name || 'Avatar'} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <div className="bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold" style={{ width: size, height: size, fontSize: size / 2 }}>
      {initials}
    </div>
  );
} 