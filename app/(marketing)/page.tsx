import Community from './_components/Community';
import Tickets from './_components/Tickets';
import Staff from './_components/Staff';
import Panel from './_components/Panel';
import Hero from './_components/Hero';
import Shop from './_components/Shop';

export default function LandingPage() {
  return (
    <div className="pb-24 overflow-x-hidden">
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
        <section id="panel">
          <Panel />
        </section>
        <section id="tickets">
          <Tickets />
        </section>
        <section id="staff">
          <Staff />
        </section>
      </div>
    </div>
  );
}
