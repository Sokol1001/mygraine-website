import Header from "./components/Header";
import Hero from "./components/Hero";
import Partners from "./components/Partners";
import Benefits from "./components/Benefits";
import WhyMyGraine from "./components/WhyMyGraine";
import WaitlistForm from "./components/WaitlistForm";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Partners />
      <Benefits />
      <WhyMyGraine />
      <WaitlistForm />
      <Footer />
    </main>
  );
}
