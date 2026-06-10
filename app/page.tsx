import Header from "./components/Header";
import Hero from "./components/Hero";
import Partners from "./components/Partners";
import FeatureShowcase from "./components/FeatureShowcase";
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
      <WhyMyGraine />
      <WaitlistForm />
      <Footer />
    </main>
  );
}
