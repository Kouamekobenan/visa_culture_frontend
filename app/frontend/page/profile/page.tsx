import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import ProfileUser from '../../components/pages/profile/Profile';

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <ProfileUser />
      {/* <main className="flex flex-col text-title font-bold items-center justify-center flex-1 px-4 py-12 text-center"></main> */}
      <Footer />
    </div>
  );
}
