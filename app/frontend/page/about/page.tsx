import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-8">
        A propos de nous
      </main>
      <Footer />
    </div>
  );
}
