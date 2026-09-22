// 1. Quita 'use client' de este archivo (layout.tsx)
import AuthGuard from "../components/authGuard";
import Sidebar from "../components/sidebar";
import "../globals.css";


export const metadata = {
  title: 'SAPPE',
  manifest: '/manifest.json',
  themeColor: '#0047AB',
  icons: {
    icon: '/images/icon-192x192.png',
    apple: '/images/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100 antialiased text-slate-900">
        {/* Usamos un cliente componente solo para la lógica de redirección */}
        <AuthGuard> 
          <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <main className="p-4 md:p-10 overflow-y-auto w-full">
                {children}
              </main>
            </div>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}