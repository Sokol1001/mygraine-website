import Header from "./components/Header";
import Hero from "./components/Hero";
import Partners from "./components/Partners";
import FeatureShowcase from "./components/FeatureShowcase";
import HowItWorks from "./components/HowItWorks";
import WhyMyGraine from "./components/WhyMyGraine";
import WaitlistForm from "./components/WaitlistForm";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Partners />
      <FeatureShowcase />
      <HowItWorks />
      <WhyMyGraine />
      <WaitlistForm />
      <Footer />
    </main>
  );
}
