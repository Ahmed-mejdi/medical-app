import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '600', '700'] 
});

export const metadata: Metadata = {
  title: "MediConnect",
  description: "Plateforme de gestion des soins et de la communication médicale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <title>MediConnect</title>
        <meta name="description" content="Plateforme médicale moderne pour patients et professionnels de santé." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={poppins.className}>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '1rem', fontWeight: 'bold', fontFamily: 'inherit' } }} />
          <main id="main-content">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
