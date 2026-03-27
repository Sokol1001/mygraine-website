import Header from "./components/Header";
import Hero from "./components/Hero";
import Partners from "./components/Partners";
import PlatformFeatures from "./components/PlatformFeatures";
import MobileApp from "./components/MobileApp";
import DiagnosticReport from "./components/DiagnosticReport";
import AiCopilot from "./components/AiCopilot";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Partners />
      <PlatformFeatures />
      <MobileApp />
      <DiagnosticReport />
      <AiCopilot />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
