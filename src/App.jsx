import { useState } from 'react';
import { useContent } from './hooks/useContent.js';
import { useRevealScan } from './hooks/useRevealScan.js';

import Hud from './components/Hud.jsx';
import Hero from './components/Hero.jsx';
import Quiz from './components/Quiz.jsx';
import Offers from './components/Offers.jsx';
import EquipmentLab from './components/EquipmentLab.jsx';
import StatsCoach from './components/StatsCoach.jsx';
import Cardiac from './components/Cardiac.jsx';
import Plans from './components/Plans.jsx';
import Gamification from './components/Gamification.jsx';
import Testimonials from './components/Testimonials.jsx';
import StoreInstagram from './components/StoreInstagram.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import OverloadPill from './components/OverloadPill.jsx';
import FloatingWhatsApp from './components/FloatingWhatsApp.jsx';
import ClientDashboard from './components/ClientDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import AuthModal from './components/AuthModal.jsx';


export default function App() {
  const { data } = useContent();
  const [currentView, setCurrentView] = useState('public'); // 'public' | 'client' | 'admin'

  // Feed content data so all `.reveal-init` cards are registered as deps settle.
  useRevealScan([data, currentView]);

  return (
    <>
      <Hud currentView={currentView} onSelectView={setCurrentView} />

      <main id="main-content">
        {currentView === 'client' && (
          <ClientDashboard onNavigateToWebsite={() => setCurrentView('public')} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onNavigateToWebsite={() => setCurrentView('public')} />
        )}

        {currentView === 'public' && (
          <>
            <Hero />
            <Quiz questions={data.questions} />
            <Offers offers={data.offers} />
            <EquipmentLab equipment={data.equipment} />
            <StatsCoach stats={data.stats} />
            <Cardiac />
            <Plans plans={data.plans} />
            <Gamification gameIdeas={data.gameIdeas} badges={data.badges} />
            <Testimonials testimonials={data.testimonials} />
            <StoreInstagram />
            <Contact />
          </>
        )}
      </main>

      <Footer />

      {/* Global Authentication Modal */}
      <AuthModal
        onLoginSuccess={(loggedInUser) => {
          if (loggedInUser.role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('client');
          }
        }}
      />

      {/* Global floating elements */}
      {currentView === 'public' && (
        <>
          <OverloadPill />
          <FloatingWhatsApp />
        </>
      )}
    </>
  );
}

