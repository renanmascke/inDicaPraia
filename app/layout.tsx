import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Usando The Inter Font para máxima limpeza visual
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'inDicaPraia | System',
  description: 'Enterprise Bathing Water Quality Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased bg-black text-zinc-100 selection:bg-zinc-800">
        {children}
      </body>
    </html>
  );
}
