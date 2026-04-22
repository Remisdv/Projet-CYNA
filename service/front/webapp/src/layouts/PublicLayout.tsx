import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function PublicLayout() {
  return (
    <div className="flex flex-col bg-white">
      <Header />
      <main className="min-h-screen flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
