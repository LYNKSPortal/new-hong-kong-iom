import { menus } from "@/data/site";
import { MenuCard } from "@/components/cards/cards";
import { PageHero, SectionHeading } from "@/components/sections/shared";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Menus",
  description: "Explore the Main Menu, Lunch & Drinks, Takeaway and Spirits menus at New Hong Kong, Douglas. Authentic Chinese and Asian dishes for every occasion.",
  path: "/menus",
});

export default function Menus() {
  return (
    <main>
      <PageHero
        eyebrow="Food & drink"
        title="Menus made for gathering."
        copy="From light lunches to long, leisurely dinners, explore the menus at New Hong Kong."
        image="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1800&q=85"
        imageAlt="A beautifully plated Asian dish at New Hong Kong"
      />
      <section className="shell py-24">
        <SectionHeading
          eyebrow="Download a menu"
          title="Find your favourites."
          copy="Our menus are updated regularly. Please speak to the team about allergies or dietary requirements."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {menus.map((menu) => (
            <MenuCard key={menu.title} menu={menu} />
          ))}
        </div>
      </section>
    </main>
  );
}
