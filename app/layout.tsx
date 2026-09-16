import './globals.css';
import Header from '../app/components/header';
import Footer from '../app/components/footer';

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
        <Footer />
      </body>
    </html>
  );
}