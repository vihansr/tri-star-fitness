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

export default function App() {
  const { data } = useContent();

  // Feed content data so all `.reveal-init` cards are registered as deps settle.
  useRevealScan([data]);

  return (
    <>
      <Hud />

      <main id="main-content">
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
      </main>

      <Footer />

      {/* Global elements */}
      <OverloadPill />
      <FloatingWhatsApp />
    </>
  );
}
