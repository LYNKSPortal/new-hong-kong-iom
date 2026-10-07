import { GiftCardForm } from "@/components/forms/gift-card-form";
import { PageHero } from "@/components/sections/shared";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gift Cards",
  description: "Give the gift of great food. New Hong Kong gift cards are available from £10 to £500, redeemable for dine-in or takeaway in Douglas, Isle of Man.",
  path: "/gift-cards",
});

export default function GiftCards() {
  return (
    <main>
      <PageHero
        eyebrow="Give the gift of good food"
        title="New Hong Kong Gift Cards."
        copy="Treat someone to an evening of authentic Asian flavours. Choose an amount, tell us who it's for, and we'll take care of the rest."
        image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=85"
        imageAlt="A gift-wrapped dining experience at New Hong Kong"
      />
      <section className="shell grid gap-12 py-24 lg:grid-cols-[.72fr_1.28fr]">
        <div>
          <p className="eyebrow">Good to know</p>
          <h2 className="display mt-3 text-5xl uppercase">A gift worth sharing.</h2>
          <div className="mt-8 space-y-5 text-sm leading-6 text-black/65">
            <p>Gift cards are available from £10 up to £500, in any amount you choose.</p>
            <p>Once your request is confirmed, we'll email the gift card code to the recipient with your message.</p>
            <p>
              For any questions, please telephone{" "}
              <a href="tel:+441624621059" className="font-bold text-black underline">
                +44 1624 621059
              </a>
              .
            </p>
          </div>
        </div>
        <GiftCardForm />
      </section>
    </main>
  );
}
