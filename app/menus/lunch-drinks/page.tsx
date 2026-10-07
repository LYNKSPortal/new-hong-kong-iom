import { lunchDrinksMenu } from "@/data/site";
import { PageHero } from "@/components/sections/shared";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Lunch & Drinks Menu",
  description: "View the Lunch & Drinks menu at New Hong Kong, Douglas — easy afternoon classics, noodle dishes, rice dishes, steamed buns, teas and more.",
  path: "/menus/lunch-drinks",
});

export default function LunchDrinksMenu() {
  return (
    <main>
      <PageHero
        eyebrow="Food & drink"
        title={lunchDrinksMenu.title}
        copy="Easy afternoons, bright plates and a considered drinks list."
        image="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1800&q=85"
        imageAlt="A selection of lunch dishes and drinks at New Hong Kong"
      />
      <section className="shell py-24">
        <div className="grid gap-16 md:grid-cols-2">
          {lunchDrinksMenu.sections.map((section) => (
            <div key={section.name}>
              <h2 className="display text-3xl uppercase">{section.name}</h2>
              {section.note && <p className="mt-2 text-sm text-black/60">{section.note}</p>}
              <ul className="mt-6 space-y-4">
                {section.items.map((item, i) => (
                  <li key={`${item.name}-${i}`} className="flex items-start justify-between gap-4 border-b border-brand-neutral pb-4">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {item.description && <p className="mt-1 text-sm text-black/60">{item.description}</p>}
                    </div>
                    {item.price && <p className="shrink-0 font-semibold text-brand-red">{item.price}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
