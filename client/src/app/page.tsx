import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-700 drop-shadow-lg flex items-center gap-3">
          <span className="inline-block bg-blue-100 rounded-full p-3 shadow-md">🩺</span> MediConnect
        </h1>

        <p className="mt-3 text-2xl text-gray-700 font-medium">
          Votre plateforme de gestion des soins et de la communication médicale.
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-8 sm:w-full gap-8">
          <Link href="/login/patient" className="p-8 mt-6 text-left border-2 border-blue-100 w-80 rounded-2xl bg-white shadow-xl hover:shadow-2xl hover:border-blue-400 hover:scale-105 transition-all duration-200 group">
            <h3 className="text-2xl font-bold text-blue-700 group-hover:text-blue-900 flex items-center gap-2">Espace Patient <span className="text-3xl">👤</span></h3>
            <p className="mt-4 text-lg text-gray-600 group-hover:text-blue-700">
              Accédez à votre dossier, vos rendez-vous et communiquez avec vos médecins.
            </p>
            <button className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Connexion Patient</button>
          </Link>

          <Link href="/login/professional" className="p-8 mt-6 text-left border-2 border-blue-100 w-80 rounded-2xl bg-white shadow-xl hover:shadow-2xl hover:border-blue-400 hover:scale-105 transition-all duration-200 group">
            <h3 className="text-2xl font-bold text-blue-700 group-hover:text-blue-900 flex items-center gap-2">Espace Professionnel <span className="text-3xl">🩺</span></h3>
            <p className="mt-4 text-lg text-gray-600 group-hover:text-blue-700">
              Gérez vos patients, votre agenda et vos communications en toute sécurité.
            </p>
            <button className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Connexion Pro</button>
          </Link>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t mt-12 bg-white/70 shadow-inner">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} <span className="font-bold text-blue-700">MediConnect</span>. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
