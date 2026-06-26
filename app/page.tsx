import Header from "./components/Header";
import Hero from "./components/Hero";
import Partners from "./components/Partners";
import Stats from "./components/Stats";
import FeatureShowcase from "./components/FeatureShowcase";
import WhyMyGraine from "./components/WhyMyGraine";
import BigStatement from "./components/BigStatement";
import WaitlistForm from "./components/WaitlistForm";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Partners />
      <Stats />
      <FeatureShowcase />
      <WhyMyGraine />
      <BigStatement />
      <WaitlistForm />
      <Footer />
    </main>
  );
}
