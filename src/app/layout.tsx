import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marvel · Mapa de eventos',
  description: 'Explorá eventos seleccionados de Marvel, sus conexiones y contextos narrativos.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <html lang="es"><body>{children}</body></html>;
}
