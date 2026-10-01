import { Clock3, MapPin, Phone } from "lucide-react";
import { BookingForm } from "@/components/forms/booking-form";
import { PageHero } from "@/components/sections/shared";
import { restaurant } from "@/data/site";

export const metadata = { title: "Book a Table" };

export default function Booking() {
  return (
    <main>
      <PageHero
        eyebrow="Reservations"
        title="Your table awaits."
        copy="Tell us when you would like to join us and our team will be in touch to confirm your booking."
        image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="shell grid gap-12 py-24 lg:grid-cols-[.72fr_1.28fr]">
        <div>
          <p className="eyebrow">Good to know</p>
          <h2 className="display mt-3 text-5xl uppercase">A relaxed evening starts here.</h2>
          <div className="mt-8 space-y-5 text-sm leading-6 text-black/65">
            <p>Reservations are subject to availability. We will confirm every request personally.</p>
            <p>We ask for a minimum of four hours’ notice for online booking requests.</p>
            <p>
              For groups of six or more, please telephone{" "}
              <a href="tel:+441624621059" className="font-bold text-black underline">
                +44 1624 621059
              </a>
              .
            </p>
          </div>
          <p className="eyebrow mt-10">Visit us</p>
          <h2 className="display mt-3 text-4xl uppercase">Castle Street, Douglas.</h2>
          <div className="mt-6 space-y-5 text-sm leading-6 text-black/70">
            <p className="flex gap-3">
              <MapPin className="mt-1 text-brand-red" size={17} />
              <span>{restaurant.address.map((x) => <span key={x} className="block">{x}</span>)}</span>
            </p>
            <a href={restaurant.phoneHref} className="flex gap-3 font-semibold text-black">
              <Phone className="text-brand-red" size={17} />
              {restaurant.phone}
            </a>
            <p className="flex gap-3">
              <Clock3 className="mt-1 text-brand-red" size={17} />
              <span>{restaurant.hours.map((x) => <span key={x} className="block">{x}</span>)}</span>
            </p>
          </div>
          <div className="mt-8 min-h-64 rounded-2xl bg-brand-neutral p-6">
            <p className="pill bg-white">Map</p>
            <p className="mt-24 font-display text-3xl uppercase">
              35 Castle Street
              <br />
              Douglas, IM1 2HA
            </p>
          </div>
        </div>
        <BookingForm />
      </section>
    </main>
  );
}
