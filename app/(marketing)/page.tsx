import Community from './_components/Community';
import Hero from './_components/Hero';
import Shop from './_components/Shop';

export default function LandingPage() {
  return (
    <div>
      <section>
        <Hero />
      </section>
      <div className="max-w-screen-xl mx-auto pb-24">
        <section id="community">
          <Community />
        </section>
        <section id="shop">
          <Shop />
        </section>
      </div>
    </div>
  );
}
