import Header from "./components/Header";
import Hero from "./components/Hero";
import Ticker from "./components/Ticker";
import Partners from "./components/Partners";
import BigStatement from "./components/BigStatement";
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
      <Ticker />
      <Partners />
      <BigStatement />
      <FeatureShowcase />
      <HowItWorks />
      <WhyMyGraine />
      <WaitlistForm />
      <Footer />
    </main>
  );
}
