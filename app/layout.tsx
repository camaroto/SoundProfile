import './globals.css';
import { Header } from '../app/components/header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">

        <Header />

        {children}
      </body>
    </html>
  );
}