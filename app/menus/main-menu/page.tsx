import { mainMenu } from "@/data/site";
import { PageHero } from "@/components/sections/shared";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Main Menu",
  description: "View the full Main Menu at New Hong Kong, Douglas — dim sum, wok-fired classics, seafood, chef specials and more.",
  path: "/menus/main-menu",
});

export default function MainMenu() {
  return (
    <main>
      <PageHero
        eyebrow="Food & drink"
        title={mainMenu.title}
        copy="The dishes we are known for, from dim sum to wok-fired signatures."
        image="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1800&q=85"
        imageAlt="A selection of dishes from the New Hong Kong main menu"
      />
      <section className="shell py-24">
        <div className="grid gap-16 md:grid-cols-2">
          {mainMenu.sections.map((section) => (
            <div key={section.name}>
              <h2 className="display text-3xl uppercase">{section.name}</h2>
              {section.note && <p className="mt-2 text-sm text-black/60">{section.note}</p>}
              <ul className="mt-6 space-y-4">
                {section.items.map((item, i) => (
                  <li key={`${item.name}-${i}`} className="border-b border-brand-neutral pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold">{item.name}</p>
                      {item.price && <p className="shrink-0 font-semibold text-brand-red">{item.price}</p>}
                    </div>
                    {item.description && <p className="mt-1 text-sm text-black/60">{item.description}</p>}
                    {item.options.length > 0 && (
                      <p className="mt-2 text-xs uppercase tracking-wide text-black/45">
                        {item.options.join(" · ")}
                      </p>
                    )}
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
