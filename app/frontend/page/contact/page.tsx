import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import ContactForm from '../../components/pages/contact/Contact';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-8">
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
