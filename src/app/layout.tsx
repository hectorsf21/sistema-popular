import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '1X10 COMUNAL GUARICO | Registro de Patrullas',
  description: 'Sistema de gestión y organización de patrullas 1X10 COMUNAL GUARICO.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-[#080d1a] text-slate-100 min-h-screen selection:bg-sky-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
