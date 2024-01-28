import Community from './_components/Community';
import Hero from './_components/Hero';

export default function LandingPage() {
  return (
    <div>
      <section>
        <Hero />
      </section>
      <div className="max-w-screen-xl mx-auto pb-24">
        <section>
          <Community />
        </section>
      </div>
    </div>
  );
}
