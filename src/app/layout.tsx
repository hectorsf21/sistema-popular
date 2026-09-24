import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistema Popular 1x10 | Registro de Patrullas',
  description: 'Sistema de gestión y organización de patrullas 1x10 con validación por padrón electoral.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
