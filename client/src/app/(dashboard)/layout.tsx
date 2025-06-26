'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
    LayoutDashboard, User, Calendar, MessageSquare, LogOut, Stethoscope, Users, FileText, 
    Settings, Bell, Wrench, HelpCircle, Key, KeyRound, Shield, Plus, Edit, Home, Info, ClipboardList, UserPlus, UserCheck, FilePlus, FileEdit, UserCog, UserCircle, FileSearch, FileCheck, FileX, FileText as FileTextIcon
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect if not loading and no user is authenticated
    if (!loading && !user) {
      router.push('/login/patient');
    }
  }, [user, loading, router]);


  // While loading or if there's no user, show a loading screen.
  // This prevents a brief flash of the dashboard before redirection.
  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-gray-600">Chargement de votre espace...</div>
        </div>
    );
  }
  
  const commonLinks = [
    { name: 'Messagerie', href: '/chat', icon: MessageSquare },
    { name: 'Mes Rendez-vous', href: '/appointments', icon: Calendar },
  ];

  const patientLinks = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Mon Tableau de Bord', href: '/dashboard/patient', icon: LayoutDashboard },
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Paramètres', href: '/settings', icon: Settings },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Aide', href: '/help', icon: HelpCircle },
    { name: 'Réinitialiser le mot de passe', href: '/reset-password', icon: Key },
    { name: 'Mot de passe oublié', href: '/forgot-password', icon: KeyRound },
    { name: 'Admin', href: '/admin', icon: Shield },
    { name: 'Nouveau patient', href: '/patients/new', icon: UserPlus },
    { name: 'Nouveau professionnel', href: '/professionals/new', icon: UserPlus },
    { name: 'Nouveau rendez-vous', href: '/appointments/new', icon: Plus },
    { name: 'Nouveau prescription', href: '/prescriptions/new', icon: FilePlus },
    { name: 'Mes Patients', href: '/(dashboard)/patients', icon: Users },
    { name: 'Mes Ordonnances', href: '/prescriptions', icon: FileTextIcon },
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
    { name: 'Dashboard professionnel', href: '/dashboard/professional', icon: Stethoscope },
    { name: 'Inscription patient', href: '/(auth)/register/patient', icon: UserPlus },
    { name: 'Inscription professionnel', href: '/(auth)/register/professional', icon: UserPlus },
    { name: 'Connexion patient', href: '/(auth)/login/patient', icon: UserCheck },
    { name: 'Connexion professionnel', href: '/(auth)/login/professional', icon: UserCheck },
    ...commonLinks,
  ];

  const professionalLinks = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Tableau de Bord', href: '/dashboard/professional', icon: Stethoscope },
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Paramètres', href: '/settings', icon: Settings },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Aide', href: '/help', icon: HelpCircle },
    { name: 'Réinitialiser le mot de passe', href: '/reset-password', icon: Key },
    { name: 'Mot de passe oublié', href: '/forgot-password', icon: KeyRound },
    { name: 'Admin', href: '/admin', icon: Shield },
    { name: 'Nouveau patient', href: '/patients/new', icon: UserPlus },
    { name: 'Nouveau professionnel', href: '/professionals/new', icon: UserPlus },
    { name: 'Nouveau rendez-vous', href: '/appointments/new', icon: Plus },
    { name: 'Nouveau prescription', href: '/prescriptions/new', icon: FilePlus },
    { name: 'Mes Patients', href: '/(dashboard)/patients', icon: Users },
    { name: 'Mes Ordonnances', href: '/prescriptions', icon: FileTextIcon },
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
    { name: 'Dashboard patient', href: '/dashboard/patient', icon: LayoutDashboard },
    { name: 'Inscription patient', href: '/(auth)/register/patient', icon: UserPlus },
    { name: 'Inscription professionnel', href: '/(auth)/register/professional', icon: UserPlus },
    { name: 'Connexion patient', href: '/(auth)/login/patient', icon: UserCheck },
    { name: 'Connexion professionnel', href: '/(auth)/login/professional', icon: UserCheck },
    ...commonLinks,
  ];

  const navLinks = user.role === 'patient' ? patientLinks : professionalLinks;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl relative z-10">
        <div className="p-6 text-center border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex flex-col items-center gap-2">
            {/* Avatar ou initiales */}
            <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700 shadow-md">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <span className="text-base font-semibold text-gray-700 mt-1">{user.first_name} {user.last_name}</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-600 flex items-center justify-center mt-4">
            <Stethoscope className="mr-2 w-7 h-7"/> MediConnect
          </h1>
        </div>
        
        <nav className="mt-8 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const LinkIcon = link.icon;
            return (
                <Link key={link.name + link.href} href={link.href} className={`
                    flex items-center px-6 py-3 mx-4 my-1 rounded-lg text-gray-700 font-medium
                    transition-all duration-200 group
                    ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg scale-[1.04]' 
                        : 'hover:bg-blue-100 hover:text-blue-700 hover:scale-[1.03]'
                    }
                `}>
                    <LinkIcon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                    <span className="ml-4 font-semibold tracking-wide">{link.name}</span>
                </Link>
            );
          })}
        </nav>

        <div className="px-4"><hr className="my-4 border-gray-200"/></div>
        <div className="p-4">
           <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 font-bold text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 shadow-sm"
          >
            <LogOut className="w-5 h-5 mr-3"/>
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
} 