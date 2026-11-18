export const restaurant = { name: "New Hong Kong", subtitle: "Asian Food Bar", phone: "+44 1624 621059", phoneHref: "tel:+441624621059", address: ["35 Castle Street", "Douglas", "Isle of Man", "IM1 2HA"], hours: ["Monday – Tuesday · 17:00 – 22:00", "Wednesday · 17:00 – 22:30", "Thursday · 12:00 – 14:00 & 17:00 – 22:30", "Friday – Saturday · 12:00 – 14:00 & 17:00 – 23:00", "Sunday · Closed"] };

// Opening hours by day of week (0 = Sunday … 6 = Saturday), used to drive bookable time slots.
export type DayHours = { lunch?: [string, string]; dinner: [string, string] } | null;
export const openingHours: Record<number, DayHours> = {
  0: null, // Sunday - closed
  1: { dinner: ["17:00", "22:00"] }, // Monday
  2: { dinner: ["17:00", "22:00"] }, // Tuesday
  3: { dinner: ["17:00", "22:30"] }, // Wednesday
  4: { lunch: ["12:00", "14:00"], dinner: ["17:00", "22:30"] }, // Thursday
  5: { lunch: ["12:00", "14:00"], dinner: ["17:00", "23:00"] }, // Friday
  6: { lunch: ["12:00", "14:00"], dinner: ["17:00", "23:00"] }, // Saturday
};

function timeSlotsFor([open, close]: [string, string], stepMinutes = 30, lastSlotBufferMinutes = 30): string[] {
  const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const toTime = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  const slots: string[] = [];
  for (let m = toMinutes(open); m <= toMinutes(close) - lastSlotBufferMinutes; m += stepMinutes) {
    slots.push(toTime(m));
  }
  return slots;
}

// Times that are always treated as fully booked, regardless of day, so they can't be
// requested online. 18:30 gets disproportionately picked out of habit by customers.
export const BLOCKED_TIMES = ["18:30"];

function allSlotsFor(dayOfWeek: number): string[] {
  const hours = openingHours[dayOfWeek];
  if (!hours) return [];
  return [...(hours.lunch ? timeSlotsFor(hours.lunch) : []), ...timeSlotsFor(hours.dinner)];
}

/** Returns the bookable (non-blocked) time slots for a given day of week (0 = Sunday … 6 = Saturday). */
export function getAvailableTimeSlots(dayOfWeek: number): string[] {
  return allSlotsFor(dayOfWeek).filter((t) => !BLOCKED_TIMES.includes(t));
}

export type TimeSlotOption = { time: string; available: boolean };

/** Returns every slot for the day, including blocked ones, for rendering a disabled "fully booked" option. */
export function getTimeSlotOptions(dayOfWeek: number): TimeSlotOption[] {
  return allSlotsFor(dayOfWeek).map((time) => ({ time, available: !BLOCKED_TIMES.includes(time) }));
}

/** Returns whether a given time on a given day falls in the lunch or dinner sitting (for display only). */
export function getSessionLabel(dayOfWeek: number, time: string): "Lunch" | "Dinner" | null {
  const hours = openingHours[dayOfWeek];
  if (!hours || !time) return null;
  const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const t = toMinutes(time);
  if (hours.lunch && t >= toMinutes(hours.lunch[0]) && t < toMinutes(hours.lunch[1])) return "Lunch";
  if (t >= toMinutes(hours.dinner[0]) && t < toMinutes(hours.dinner[1])) return "Dinner";
  return null;
}

export const nav = [{ href: "/", label: "Home" }, { href: "/menus", label: "Menus" }, { href: "/reviews", label: "Reviews" }, { href: "/gift-cards", label: "Gift Cards" }];

export const dishes = [
  { name: "Steamed Dim Sum", image: "/dish-02.jpg", tag: "Delicate & handmade" },
  { name: "Singapore Noodles", image: "/dish-04.jpg", tag: "Wok-fried classics" },
  { name: "Chilli Oil Wontons", image: "/dish-09.jpg", tag: "Spicy & savoury" },
  { name: "Crispy Chilli Chicken", image: "/dish-08.jpg", tag: "House special" },
  { name: "Crispy Aromatic Duck", image: "/dish-05.jpg", tag: "Made for sharing" },
  { name: "Salt & Pepper King Prawns", image: "/dish-03.jpg", tag: "A house favourite" },
  { name: "Black Pepper Beef", image: "/dish-07.jpg", tag: "Deep, warming spice" },
  { name: "Roast Pork", image: "/dish-06.jpg", tag: "Classic Cantonese" }
];

export const menus = [{ title:"Main Menu", description:"The dishes we are known for, from dim sum to wok-fired signatures.", updated:"November 2026", slug:"main-menu", pdf:"/Menus/New Hong Kong - Classics and Specials Menus.pdf" }, { title:"Lunch & Drinks", description:"Easy afternoons, bright plates and a considered drinks list.", updated:"November 2026", slug:"lunch-drinks", pdf:"/Menus/New Hong Kong - Lunch Drinks Menu.pdf" }, { title:"Takeaway", description:"Your New Hong Kong favourites, ready for collection.", updated:"November 2026", slug:"takeaway", pdf:"/Menus/New Hong Kong - Take Away Menu.pdf" }];

export const mainMenu = {title:"Main Menu", sections:[
  {name:"Steamed Bao", note:"£5.50 each. The kitchen works in a high-gluten environment and cannot guarantee that food leaving the kitchen is 100% gluten-free — please let your server know of any food sensitivities before ordering. Warning: some dishes may contain bones.", items:[
    {name:"Crispy Chicken", description:"Crispy fried chicken, coriander, pickled carrot, wasabi", price:"£5.50", options:[]},
    {name:"Pork Belly", description:"Slices of pork belly, pickled cucumber, caramelised peanut, hoisin sauce", price:"£5.50", options:[]},
    {name:"Tempura King Prawn", description:"Crispy king prawn, sweet chilli & mint sauce, pickled fennel", price:"£5.50", options:[]},
    {name:"Char Siu", description:"Char siu, crispy fried shallot, spring onion", price:"£5.50", options:[]},
    {name:"Deep Fried Tofu", description:"Fried tofu, kimchi, hot sriracha sauce, spring onion", price:"£5.50", options:[]}
  ]},
  {name:"Soups", items:[
    {name:"Chicken & Sweetcorn", description:"", price:"£5.50", options:[]},
    {name:"Kimchi Rice & Salted Pork", description:"", price:"£5.50", options:[]},
    {name:"Hot & Sour", description:"Vegetarian", price:"£5.50", options:[]},
    {name:"Hot & Sour", description:"Meat", price:"£5.90", options:[]},
    {name:"Wonton Soup", description:"", price:"£5.90", options:[]}
  ]},
  {name:"Small Bites", items:[
    {name:"Mixed Starter", description:"For two people: mini spring rolls, fried chicken wings, chicken skewers, barbecue ribs and edamame", price:"£16.50", options:[]},
    {name:"Edamame", description:"Wok-fried in soy sauce & chilli, topped with toasted sesame seeds", price:"£6.00", options:[]},
    {name:"Mini Spring Rolls", description:"With a sweet chilli and mint dip", price:"£6.00", options:[]},
    {name:"Spring Rolls", description:"With a sweet chilli and mint dip", price:"£6.90", options:[]},
    {name:"Sichuan Dumplings", description:"In a soy, black vinegar and red oil sauce", price:"£7.90", options:[]},
    {name:"Poached Wontons", description:"In a soy, black vinegar and red oil sauce", price:"£7.90", options:[]},
    {name:"Chicken Skewers", description:"Coated in a satay sauce", price:"£7.90", options:[]},
    {name:"Fried Chicken Wings", description:"With a sweet and spicy vinaigrette", price:"£7.90", options:[]},
    {name:"BBQ Pork Ribs", description:"In a sweet & sour sauce", price:"£7.90", options:[]},
    {name:"Salt & Chilli Pork Ribs", description:"Topped with golden syrup", price:"£7.90", options:[]},
    {name:"Salt & Chilli Crispy Chicken", description:"Wok-fried with onions and dried chillies", price:"£7.90", options:[]},
    {name:"Salt & Chilli Chicken Wings", description:"Wok-fried with onions and dried chillies", price:"£7.90", options:[]},
    {name:"Prawn Toast", description:"With a sweet chilli and mint dip", price:"£9.20", options:[]},
    {name:"Salt & Chilli King Prawn", description:"Wok-fried with onions and dried chillies", price:"£8.90", options:[]}
  ]},
  {name:"Aromatic Shredded Duck", note:"Served with cucumber, spring onion and hoisin sauce. The quarter portion comes with 3 buns, the half portion with 6 buns.", items:[
    {name:"Steamed Buns", description:"Quarter portion / Half portion", price:"£15.50 / £29.00", options:[]},
    {name:"Pancakes", description:"Quarter portion / Half portion", price:"£13.90 / £26.00", options:[]}
  ]},
  {name:"Classics", note:"Dietary indicators: green = vegetarian / can be made vegetarian, red chilli = spicy, multiple red chillies = higher spiciness. Please let your server know of any allergies or intolerances.", items:[
    {name:"Chicken or Pork", description:"", price:"£11.90", options:["Curry","Black Bean","Spring Onion & Oyster","Sichuan","Satay"]},
    {name:"Beef", description:"", price:"£12.90", options:["Curry","Black Bean","Spring Onion & Oyster","Sichuan","Satay"]},
    {name:"Crispy Chicken or Crispy Pork", description:"Also available: Salt & Chilli Chicken (Crispy)", price:"£12.90", options:["Curry","Sweet & Sour","Kung Po","Black Bean","Black Pepper","Spring Onion & Oyster","Sichuan","Satay","Garlic","Lemon","Orange"]},
    {name:"Crispy Beef", description:"", price:"£13.50", options:["Chilli Beef","Curry","Sweet & Sour","Kung Po","Black Bean","Black Pepper","Spring Onion & Oyster","Sichuan","Satay"]},
    {name:"King Prawn", description:"Also available: Salt & Chilli King Prawn", price:"£13.50", options:["Curry","Black Bean","Black Pepper","Spring Onion & Oyster","Sichuan","Satay"]},
    {name:"Roast Duck", description:"Extra option: with BBQ pork +£1.50", price:"£12.90", options:["Curry","Black Bean","Sichuan","Satay","Orange"]}
  ]},
  {name:"Seafood", items:[
    {name:"Salt & Chilli Scallops", description:"", price:"£15.50", options:[]},
    {name:"Scallops in Oyster Sauce", description:"", price:"£15.50", options:[]},
    {name:"Scallops in Garlic Sauce", description:"", price:"£15.50", options:[]},
    {name:"Salt & Chilli Squid", description:"", price:"£14.90", options:[]},
    {name:"Fried Squid in Sweet & Sour Sauce", description:"", price:"£14.90", options:[]},
    {name:"Squid in Black Bean Sauce", description:"", price:"£14.90", options:[]},
    {name:"Squid in Ginger & Oyster Sauce", description:"", price:"£14.90", options:[]},
    {name:"Squid in Sichuan Sauce", description:"", price:"£14.90", options:[]}
  ]},
  {name:"Sides", items:[
    {name:"Steamed Rice", description:"", price:"£3.50", options:[]},
    {name:"Fried Rice", description:"", price:"£3.50", options:[]},
    {name:"Chips", description:"", price:"£3.50", options:[]},
    {name:"Egg Noodles", description:"", price:"£6.50", options:[]},
    {name:"Rice Noodles", description:"", price:"£6.50", options:[]},
    {name:"Salt & Chilli Chips", description:"", price:"£4.80", options:[]},
    {name:"English Mushrooms", description:"", price:"£4.80", options:[]},
    {name:"Broccoli & Garlic", description:"", price:"£6.90", options:[]},
    {name:"Chinese Greens", description:"", price:"£6.90", options:[]},
    {name:"Kimchi", description:"", price:"£3.00", options:[]},
    {name:"Sauce", description:"Curry, Sweet & Sour, etc.", price:"£2.00", options:[]},
    {name:"Prawn Crackers", description:"", price:"£2.50", options:[]},
    {name:"Chopped Chilli", description:"", price:"£1.00", options:[]}
  ]},
  {name:"Rice Dishes", items:[
    {name:"Roast Pork Two Ways", description:"Pork belly & char siu on blanched Chinese leaf, and sweet soy", price:"£13.50", options:[]},
    {name:"Roast Duck with Plum & Chilli Sauce", description:"Roast duck topped with sweet soy and sesame oil on blanched Chinese leaf", price:"£13.90", options:[]},
    {name:"Deep Fried Tofu", description:"Satay or Sichuan, with vegetables and steamed rice", price:"£13.90", options:[]},
    {name:"Red Coconut Curry", description:"Spicy red coconut curry and vegetables — Vegetarian", price:"£12.50", options:[]},
    {name:"Red Coconut Curry", description:"Spicy red coconut curry and vegetables with chicken", price:"£13.90", options:[]},
    {name:"Grilled Chilli Beef Rice", description:"Sliced flank steak on kimchi rice with Chinese greens and a chilli & sake sauce", price:"£21.50", options:[]},
    {name:"Chicken Pancetta", description:"Smoked pancetta & chicken, topped with a fried egg and nori", price:"£13.90", options:[]},
    {name:"Golden Duck Fried Rice", description:"Roast duck on fried rice with Chinese sausage and shiitake mushroom", price:"£17.50", options:[]},
    {name:"Kimchi Fried Rice", description:"Kimchi, shiitake mushrooms, fried rice topped with a fried egg, nori and toasted sesame", price:"£13.90", options:[]}
  ]},
  {name:"Noodle Dishes", items:[
    {name:"Pork Ramen", description:"Roasted pork belly, kimchi, soft-boiled egg, spring onions and nori on ramen noodles with a pork and chicken broth", price:"£16.00", options:[]},
    {name:"Power Up Pork Ramen", description:"Doubled-up pork ramen, with char siu and crispy shallots — for big appetites", price:"£17.50", options:[]},
    {name:"Roast Duck Ramen", description:"Roast duck, pickled fennel and ramen noodles in a pork and chicken broth", price:"£17.50", options:[]},
    {name:"Malaysian Laksa Noodles", description:"King prawns, deep-fried tofu, fish balls, crunchy beansprouts and soft-boiled egg in a creamy coconut curry", price:"£17.50", options:[]},
    {name:"Teriyaki Salmon", description:"Salmon fillet, king prawns and stir-fried vegetables on top of soba noodles in a teriyaki sauce", price:"£19.50", options:[]},
    {name:"Chilli Beef Noodles", description:"Sliced flank steak on stir-fried egg noodles with Chinese greens and a chilli & sake sauce", price:"£21.50", options:[]},
    {name:"Singapore Noodles Veg", description:"Stir-fried rice noodles with vegetables, mango sauce and a lime wedge", price:"£13.50", options:[]},
    {name:"Singapore Noodles Mixed Meat", description:"Stir-fried rice noodles with king prawns, char siu and chicken", price:"£15.50", options:[]},
    {name:"Honey Sriracha Chicken Noodles", description:"Honey stir-fried chicken and vegetable chow mein with sriracha sauce", price:"£13.90", options:[]},
    {name:"Chow Mein", description:"Stir-fried egg noodles with vegetables and chicken", price:"£13.50", options:[]},
    {name:"Chow Mein", description:"Stir-fried egg noodles with vegetables and beef", price:"£13.50", options:[]},
    {name:"Chow Mein", description:"Stir-fried egg noodles with vegetables and char siu", price:"£13.50", options:[]},
    {name:"King Prawn Chow Mein", description:"Stir-fried egg noodles with vegetables and king prawns", price:"£14.50", options:[]}
  ]},
  {name:"Desserts", items:[
    {name:"Dessert of the Day", description:"Feel free to ask us for the dessert of the day", price:"£7.50", options:[]},
    {name:"Banana Fritters", description:"Battered banana pieces, topped with golden syrup, served with a scoop of vanilla ice cream", price:"£5.50", options:[]},
    {name:"Ice Cream", description:"Vanilla, strawberry, chocolate and flavour of the month — just ask. Priced per scoop", price:"£1.70", options:[]},
    {name:"Fried Bao Ice Cream", description:"Choose any ice cream filling in a delicious crispy bao", price:"£4.50", options:[]}
  ]},
  {name:"Beer & Cider", note:"The source menu labels alcohol percentages as AVB; these are presented as ABV for readability.", items:[
    {name:"Tsing Tao", description:"China · 4.70% ABV", price:"£3.90", options:[]},
    {name:"Asahi", description:"Beer · 5.00% ABV", price:"£3.90", options:[]},
    {name:"Tiger", description:"Lager · 4.80% ABV", price:"£3.90", options:[]},
    {name:"Hitachino Nest", description:"White Ale · 5.00% ABV", price:"£6.00", options:[]},
    {name:"Peroni", description:"Gluten free · 5.10% ABV", price:"£4.50", options:[]},
    {name:"Krombacher", description:"Low alcohol · 0.0% ABV", price:"£3.90", options:[]},
    {name:"Samuel Smith", description:"Cider · UK · 4.00% ABV · 550ml", price:"£5.50", options:[]},
    {name:"Rekorderlig Wild Berries", description:"Cider · Sweden · 4.50% ABV · 500ml", price:"£4.50", options:[]}
  ]},
  {name:"Red Wine", items:[
    {name:"Montepulciano", description:"12.5% ABV · Dark ruby-red wine with a characteristic fragrance", price:"175ml £5.90 / 250ml £6.90 / Bottle £20", options:[]},
    {name:"Merlot", description:"12.5% ABV · The velvety textures of this wine make it an ideal partner for red meat and pork dishes", price:"175ml £5.90 / 250ml £6.90 / Bottle £20", options:[]},
    {name:"Malbec", description:"13.5% ABV · Red fruit wine with black pepper, tannins with medium intensity", price:"Bottle £24", options:[]},
    {name:"Rioja", description:"13.5% ABV · Ruby red wine, well structured and balanced", price:"Bottle £26", options:[]}
  ]},
  {name:"Rosé Wine", items:[
    {name:"White Zinfandel", description:"USA · 10.5% ABV", price:"175ml £5.90 / 250ml £6.90 / Bottle £20", options:[]},
    {name:"Pinot Grigio Blush", description:"12.0% ABV", price:"Bottle £24", options:[]}
  ]},
  {name:"White Wine", items:[
    {name:"Chardonnay", description:"13.0% ABV · Bright yellow with greenish hues in colour, with a fresh fruit aroma", price:"175ml £5.90 / 250ml £6.90 / Bottle £20", options:[]},
    {name:"Sauvignon Blanc", description:"12.0% ABV · A light, fresh and crisp dry white wine with hints of citrus and gooseberry on the palate", price:"175ml £5.90 / 250ml £6.90 / Bottle £20", options:[]},
    {name:"Pinot Grigio", description:"12.0% ABV", price:"Bottle £24", options:[]},
    {name:"Viognier", description:"France · 13.5% ABV · Apricots, honey and tropical fruits — fruity and persistent", price:"Bottle £26", options:[]}
  ]},
  {name:"Sparkling Wine & Champagne", items:[
    {name:"Prosecco", description:"11.0% ABV", price:"75cl Bottle £23", options:[]},
    {name:"House Champagne", description:"France · 12.0% ABV · Light and fresh, youthful Champagne", price:"75cl Bottle £36", options:[]},
    {name:"Le Contesse Prosecchino", description:"11.0% ABV", price:"20cl Bottle £6.90", options:[]},
    {name:"Pinot Rosé Brut Sparkling", description:"11.0% ABV", price:"20cl Bottle £6.90", options:[]}
  ]}
]};

export const lunchDrinksMenu = {title:"Lunch & Drinks", sections:[
  {name:"Noodle Dishes", note:"Black Pepper Udon can be ordered with chicken or beef.", items:[
    {name:"Crispy Chicken Ramen", description:"Sweetcorn, spring onions, Sriracha", price:"£12.50"},
    {name:"Pork Ramen", description:"Pork belly, egg, pork broth, spring onions", price:"£12.50"},
    {name:"Spicy Beef Ramen", description:"Chilli broth, egg, broccoli, spring onions", price:"£12.50"},
    {name:"Sichuan Pulled Pork Ramen", description:"Black vinegar, red oil, Sichuan pepper, coriander", price:"£12.50"},
    {name:"Black Pepper Udon", description:"Stir-fried vegetables; choice of chicken or beef", price:"£10.50"},
    {name:"Beef in Soy Sauce & Sesame", description:"Stir-fried vegetables, egg noodles", price:"£9.20"},
    {name:"Singapore Noodles (Vegetable)", description:"Stir-fried curry rice noodles, vegetables, mango sauce, lime wedge", price:"£9.20"},
    {name:"Spicy King Prawn Udon", description:"Stir-fried vegetables", price:"£10.90"},
    {name:"Singapore Noodles (Mixed Meat)", description:"Stir-fried curry rice noodles, char siu, chicken, king prawns", price:"£9.90"},
    {name:"Malaysian Laksa Noodles", description:"King prawns, tofu, fish cakes, rice noodles, coconut curry broth, beansprouts", price:"£12.90"}
  ]},
  {name:"Classics", note:"All classics are served with a choice of steamed rice or fried rice. Upgrade to noodles +£1.50. Go crispy (on applicable protein dishes) +£0.40.", items:[
    {name:"Crispy Chilli Beef", description:"Beef", price:"£9.90"},
    {name:"Crispy Salt & Chilli Chicken", description:"Chicken", price:"£9.90"},
    {name:"Kung Po Sauce", description:"Chicken or pork", price:"£9.50"},
    {name:"Satay Sauce", description:"Chicken, pork or beef", price:"£9.50"},
    {name:"Curry Sauce", description:"Chicken, pork or beef", price:"£9.50"},
    {name:"Oyster Sauce", description:"Chicken, pork or beef", price:"£9.50"},
    {name:"Sweet & Sour Sauce", description:"Chicken, pork or beef", price:"£9.50"},
    {name:"Sichuan Sauce", description:"Chicken, pork or beef", price:"£9.50"},
    {name:"Black Bean Sauce", description:"Chicken, pork or beef", price:"£9.50"}
  ]},
  {name:"Starters, Sides & Extras", items:[
    {name:"Kimchi", description:"", price:"£3.00"},
    {name:"Spring Rolls", description:"4 pieces", price:"£5.00"},
    {name:"Prawn Toast", description:"", price:"£8.50"},
    {name:"Sichuan Pork Dumplings", description:"", price:"£6.90"},
    {name:"Fried Chicken Wings", description:"", price:"£6.50"},
    {name:"Chicken Satay Skewers", description:"", price:"£6.50"},
    {name:"Steamed Rice", description:"", price:"£3.50"},
    {name:"Fried Rice", description:"", price:"£3.50"},
    {name:"Chips", description:"", price:"£3.50"},
    {name:"Egg Noodles", description:"", price:"£5.50"},
    {name:"Rice Noodles", description:"", price:"£5.50"},
    {name:"Curry Sauce", description:"Side sauce", price:"£1.80"},
    {name:"Sweet & Sour Sauce", description:"Side sauce", price:"£1.80"}
  ]},
  {name:"Rice Dishes", note:"All rice dishes £9.90 each", items:[
    {name:"Chicken Katsudon", description:"Panko-coated chicken cutlet with soy, sake and egg over steamed rice", price:"£9.90"},
    {name:"Pork Katsudon", description:"Panko-coated pork cutlet with soy, sake and egg over steamed rice", price:"£9.90"},
    {name:"Singapore Fried Rice", description:"Stir-fried mixed meat and vegetables, topped with fried egg", price:"£9.90"},
    {name:"Roast Duck", description:"Sweet soy, Chinese leaf, steamed or fried rice", price:"£9.90"},
    {name:"King Prawns in Ginger & Spring Onion", description:"King prawns with ginger and spring onion over steamed rice", price:"£9.90"},
    {name:"Roast Pork", description:"Sweet soy, Chinese leaf, steamed or fried rice", price:"£9.90"},
    {name:"Chicken and Pancetta", description:"Crispy bacon and chicken fried rice with fried egg", price:"£9.90"},
    {name:"Garlic Chicken", description:"Crispy chicken fillet, garlic butter sauce, steamed rice", price:"£9.90"},
    {name:"Thai Chilli Chicken", description:"Crispy chicken fillet, Thai chilli sauce, steamed rice", price:"£9.90"},
    {name:"Thai Honey Pork", description:"Crispy pork chop, honey sauce, steamed rice", price:"£9.90"},
    {name:"Lemon Chicken", description:"Crispy lemon-glazed chicken, steamed rice", price:"£9.90"},
    {name:"Kimchi and Egg", description:"Stir-fried kimchi rice, fried egg, nori, toasted sesame", price:"£9.90"}
  ]},
  {name:"Steamed Buns", note:"£4.90 each", items:[
    {name:"Pork Belly", description:"Pickled cucumber, hoisin sauce, crushed peanuts", price:""},
    {name:"Char Siu", description:"Crispy shallot, spring onion", price:""},
    {name:"Crispy Chicken", description:"Pickled carrot, fresh coriander, wasabi mayo", price:""},
    {name:"Deep Fried Tofu", description:"Kimchi, mushrooms, Sriracha sauce", price:""},
    {name:"Tempura King Prawn", description:"Pickled fennel, sweet chilli sauce, mint sauce", price:""},
    {name:"Condensed Milk", description:"Two steamed buns, crushed caramelised peanuts", price:""}
  ]},
  {name:"Bottomless Teapots", note:"Two price groups shown as pot / bottomless.", items:[
    {name:"Dog Head", description:"Chinese green tea", price:"£3 / £6"},
    {name:"Iron Goddess of Mercy", description:"Oolong", price:"£3 / £6"},
    {name:"Jasmine Pearl Green", description:"Green tea", price:"£3 / £6"},
    {name:"Royal Pu'er", description:"Pu'er", price:"£2.80 / £5.50"},
    {name:"Snow White Gold", description:"White tea", price:"£2.80 / £5.50"},
    {name:"Iron Warrior Monk", description:"Oolong", price:"£2.80 / £5.50"},
    {name:"Fountain of Youth Green", description:"Infused green tea", price:"£2.80 / £5.50"},
    {name:"Ginkgo Popcorn", description:"Genmaicha with nettle and ginkgo", price:"£2.80 / £5.50"},
    {name:"Goji Berry & Cranberry", description:"Fruit infusion", price:"£2.80 / £5.50"},
    {name:"Chrysanthemum Flowers", description:"Flower infusion", price:"£2.80 / £5.50"}
  ]},
  {name:"Soft Drinks", items:[
    {name:"Coke", description:"Regular", price:"£2.50"},
    {name:"Diet Coke", description:"", price:"£2.50"},
    {name:"Sprite", description:"", price:"£2.50"},
    {name:"Fanta", description:"", price:"£2.50"},
    {name:"Cordial", description:"Lime, Blackcurrant", price:"£2.00"},
    {name:"Fruit Juice", description:"Orange, Apple, Pineapple", price:"£2.50"},
    {name:"Still Water", description:"250ml / 750ml", price:"£2.00 / £4.50"},
    {name:"Sparkling Water", description:"250ml / 750ml", price:"£2.00 / £4.50"},
    {name:"Appletiser", description:"", price:"£2.70"},
    {name:"J2O", description:"Apple & Raspberry, Orange & Passionfruit", price:"£2.70"},
    {name:"Iced Lemon Tea", description:"", price:"£2.80"},
    {name:"Posh Pop", description:"Ginger & Chilli, Pear & Elderflower, Strawberry & Rhubarb", price:"£2.90"}
  ]},
  {name:"Coffees & Milk Teas", items:[
    {name:"Espresso", description:"", price:"£3.50"},
    {name:"Latte", description:"", price:"£3.50"},
    {name:"Cappuccino", description:"", price:"£3.50"},
    {name:"Americano", description:"", price:"£3.50"},
    {name:"English Tea", description:"", price:"£2.00"},
    {name:"Vietnamese Coffee", description:"Iced or Hot", price:"£4.00"}
  ]},
  {name:"Wines", note:"Still wines served 175ml / 250ml. Sparkling wines served 20cl.", items:[
    {name:"Chardonnay", description:"White · Australia · 13.0% ABV", price:"£5.90 / £7.50"},
    {name:"Montepulciano", description:"Red · Italy · 12.5% ABV", price:"£5.90 / £7.50"},
    {name:"Sauvignon Blanc", description:"White · Chile · 12.0% ABV", price:"£5.90 / £7.50"},
    {name:"Merlot", description:"Red · Chile · 12.5% ABV", price:"£5.90 / £7.50"},
    {name:"White Zinfandel", description:"Rosé · USA · 10.5% ABV", price:"£5.90 / £7.50"},
    {name:"Prosecco", description:"Sparkling · Italy · 11.0% ABV", price:"£7.20"},
    {name:"Pinot Rosé Brut", description:"Sparkling · Italy · 11.0% ABV", price:"£7.20"}
  ]},
  {name:"Beers & Ciders", items:[
    {name:"Tsing Tao", description:"Beer · China · 4.70% ABV", price:"£3.90"},
    {name:"Asahi", description:"Beer · Japan · 5.00% ABV", price:"£3.90"},
    {name:"Tiger", description:"Lager · Singapore · 4.80% ABV", price:"£3.90"},
    {name:"Hitachino Nest", description:"White Ale · Japan · 5.00% ABV", price:"£6.00"},
    {name:"Peroni", description:"Gluten-free beer · Italy · 5.10% ABV", price:"£3.90"},
    {name:"Krombacher", description:"Low-alcohol beer · Germany · 0.0% ABV", price:"£3.90"},
    {name:"Samuel Smith", description:"Cider · UK · 4.00% ABV · 550ml", price:"£5.50"},
    {name:"Rekorderlig Wild Berries", description:"Cider · Sweden · 4.50% ABV · 500ml", price:"£4.50"}
  ]}
]};

export const takeawayMenu = {title:"Takeaway", sections:[
  {name:"Soups", items:[
    {name:"Chicken & Sweetcorn", description:"", price:"£4.20", options:[]},
    {name:"Wonton", description:"", price:"£4.80", options:[]},
    {name:"Hot & Sour", description:"Vegetarian | Meat", price:"£3.80 / £4.20", options:[]},
    {name:"Kimchi Rice & Salted Pork", description:"", price:"£4.20", options:[]}
  ]},
  {name:"Small Bites", items:[
    {name:"Mixed Starter", description:"", price:"£13.80", options:[]},
    {name:"Edamame", description:"", price:"£4.80", options:[]},
    {name:"Spring Rolls", description:"", price:"£4.50", options:[]},
    {name:"Mini Spring Rolls", description:"", price:"£4.20", options:[]},
    {name:"Prawn Toast", description:"", price:"£7.90", options:[]},
    {name:"Salt & Chilli King Prawn", description:"", price:"£7.20", options:[]},
    {name:"Salt & Chilli Chicken", description:"", price:"£6.90", options:[]},
    {name:"Salt & Chilli Fried Chicken Wings", description:"", price:"£6.50", options:[]},
    {name:"Salt & Chilli Pork Ribs", description:"", price:"£6.50", options:[]},
    {name:"BBQ Pork Ribs", description:"", price:"£6.50", options:[]},
    {name:"Fried Chicken Wings", description:"", price:"£6.50", options:[]},
    {name:"Chicken Skewers", description:"", price:"£6.50", options:[]}
  ]},
  {name:"Aromatic Shredded Duck", note:"1/4 or 1/2 portion, served with cucumber, spring onion, plum & chilli sauce, and hoisin sauce.", items:[
    {name:"Steamed Buns", description:"¼ portion / ½ portion", price:"£14.50 / £25", options:[]},
    {name:"Pancakes", description:"¼ portion / ½ portion", price:"£10.90 / £19.90", options:[]}
  ]},
  {name:"Steamed Bao", note:"£5.50 each", items:[
    {name:"Crispy Chicken", description:"Pickled carrot, fresh coriander, and wasabi mayo", price:"£5.50", options:[]},
    {name:"Pork Belly", description:"Pickled cucumber, hoisin sauce, and caramelised peanut", price:"£5.50", options:[]},
    {name:"Char Siu", description:"Crispy shallot & spring onion", price:"£5.50", options:[]},
    {name:"Tempura King Prawn", description:"Pickled fennel, sweet chilli & mint sauce", price:"£5.50", options:[]},
    {name:"Deep Fried Tofu", description:"Kimchi, mushrooms, and sriracha sauce", price:"£5.50", options:[]}
  ]},
  {name:"Chef Specials", items:[
    {name:"Roast Pork Two Ways", description:"Pork belly & char siu on blanched Chinese leaf, and sweet soy", price:"£10.50", options:[]},
    {name:"Roast Duck with Plum & Chilli Sauce", description:"Roast duck topped with sweet soy on blanched Chinese leaf", price:"£11", options:[]},
    {name:"Deep Fried Tofu in Satay/Sichuan", description:"With vegetables and steamed rice", price:"£11", options:[]},
    {name:"Red Coconut Curry", description:"Spicy red coconut curry and vegetables with lime wedge and mango sauce — Vegetarian or with Chicken", price:"£9.90 / £11", options:[]},
    {name:"Grilled Chilli Beef Rice", description:"Sliced flank steak (served pink), on kimchi rice with Chinese greens and a chilli & sake sauce", price:"£16.50", options:[]},
    {name:"Chicken Pancetta Fried Rice", description:"Smoked pancetta & chicken topped with a fried egg and nori", price:"£9.50", options:[]},
    {name:"Golden Duck Fried Rice", description:"Roast duck on fried rice with Chinese sausage, and shitake mushroom", price:"£15.50", options:[]},
    {name:"Kimchi Fried Rice", description:"Kimchi, shitake mushrooms, fried rice, topped with a fried egg, nori, and toasted sesame", price:"£9.50", options:[]}
  ]},
  {name:"Noodle Chef Specials", items:[
    {name:"Pork Ramen", description:"Roasted pork belly, kimchi, boiled egg, spring onions, and nori, on ramen noodles with a pork & chicken broth", price:"£13.90", options:[]},
    {name:"Spicy Beef Ramen", description:"With a chilli broth, broccoli and spring onions", price:"£13.90", options:[]},
    {name:"Teriyaki Salmon", description:"Salmon fillet, king prawns, and stir fried vegetables on top of soba noodles in a teriyaki sauce", price:"£16", options:[]},
    {name:"Chilli Beef Noodles", description:"Sliced flank steak (served pink), on stir fried egg noodles with Chinese greens and a chilli & sake sauce", price:"£16.50", options:[]},
    {name:"Singapore Noodles", description:"Stir fried rice noodles with either vegetables, mango sauce, and lime wedge or mixed meat", price:"£8.90 / £9.50", options:[]},
    {name:"Honey Sriracha Chicken Noodles", description:"Honey stir fried chicken and vegetable chow mein with sriracha sauce", price:"£9.50", options:[]},
    {name:"Chow Mein", description:"Chicken | Beef | Char Siu, stir fried egg noodles with vegetables", price:"£8.90", options:[]},
    {name:"King Prawn Chow Mein", description:"Stir fried egg noodles with vegetables and king prawns", price:"£9.50", options:[]}
  ]},
  {name:"Rice Dishes", items:[
    {name:"Special Fried Rice", description:"", price:"£7.80", options:[]},
    {name:"Chicken Fried Rice", description:"", price:"£7.50", options:[]},
    {name:"Char Siu Fried Rice", description:"", price:"£7.50", options:[]},
    {name:"Beef Fried Rice", description:"", price:"£7.50", options:[]},
    {name:"Singapore Fried Rice", description:"", price:"£8.20", options:[]},
    {name:"Mixed Veg Fried Rice", description:"", price:"£7.50", options:[]},
    {name:"King Prawn Rice", description:"", price:"£8.50", options:[]}
  ]},
  {name:"Classics", note:"Please let your server know of any allergies or intolerances.", items:[
    {name:"Crispy Chicken or Crispy Pork", description:"", price:"£8.20", options:["Curry","Kung Po","Sweet & Sour","Black Bean","Black Pepper","Spring Onion & Oyster","Sichuan","Satay","Garlic Butter","Lemon","Orange"]},
    {name:"Crispy Beef", description:"", price:"£8.30", options:["Curry","Kung Po","Sweet & Sour","Black Bean","Black Pepper","Spring Onion & Oyster","Sichuan"]},
    {name:"Chicken or Pork", description:"Also available with English mushrooms", price:"£7.90", options:["Curry","Black Bean","Spring Onion & Oyster","Sichuan","Satay"]},
    {name:"Beef", description:"", price:"£8.30", options:["Curry","Black Bean","Spring Onion & Oyster","Sichuan","Satay"]}
  ]},
  {name:"Seafood", items:[
    {name:"Salt & Chilli Fried Scallops", description:"", price:"£11.90", options:[]},
    {name:"Scallops with Vegetables in Oyster Sauce", description:"", price:"£11.90", options:[]},
    {name:"Scallops in Garlic Sauce", description:"", price:"£11.90", options:[]},
    {name:"Salt & Chilli Fried Squid", description:"", price:"£9.50", options:[]},
    {name:"Fried Squid in Sweet & Sour Sauce", description:"", price:"£9.50", options:[]},
    {name:"Squid in Ginger, Spring Onion & Oyster Sauce", description:"", price:"£9.50", options:[]},
    {name:"Squid in Sichuan Sauce", description:"", price:"£9.50", options:[]}
  ]},
  {name:"Sides", items:[
    {name:"Steamed Rice", description:"", price:"£3.00", options:[]},
    {name:"Fried Rice", description:"", price:"£3.20", options:[]},
    {name:"Egg Noodles", description:"", price:"£5.00", options:[]},
    {name:"Rice Noodles", description:"", price:"£5.00", options:[]},
    {name:"Chips", description:"", price:"£3.00", options:[]},
    {name:"Salt & Chilli Chips", description:"", price:"£3.80", options:[]},
    {name:"Kimchi", description:"", price:"£3.50", options:[]},
    {name:"English Mushrooms", description:"", price:"£4.50", options:[]},
    {name:"Broccoli & Garlic", description:"", price:"£5.50", options:[]},
    {name:"Chinese Greens", description:"", price:"£6.00", options:[]},
    {name:"Sauce", description:"Curry, sweet & sour, satay, etc.", price:"£2.00", options:[]},
    {name:"Prawn Crackers", description:"", price:"£2.00", options:[]}
  ]},
  {name:"Desserts", items:[
    {name:"Banana Fritters", description:"", price:"£4.50", options:[]}
  ]}
]};

export const reviews = [{name:"Daniel R.", location:"Douglas, Isle of Man", source:"TripAdvisor", title:"An outstanding local favourite", text:"Beautiful food, generous portions and genuinely warm service. The crispy duck was excellent and the team made the evening feel special."},{name:"Isla M.", location:"London, United Kingdom", source:"TripAdvisor", title:"Worth returning for", text:"The best Chinese meal we have had on the island. Everything arrived perfectly cooked, and the staff were charming throughout."},{name:"Mark T.", location:"Peel, Isle of Man", source:"TripAdvisor", title:"Consistently brilliant", text:"A lovely room, a great menu and flavours that keep us coming back. Booking ahead is always a good idea."},{name:"Sarah L.", location:"Douglas, Isle of Man", source:"TripAdvisor", title:"Dinner done beautifully", text:"Relaxed but refined. We loved the dim sum to start and the salt and pepper prawns were a highlight."},{name:"Matt Mylchreest", location:"Isle of Man", source:"Facebook", title:"What a place!", text:"What a place! Fresh food and cooked so well."},{name:"Jane Killey", location:"Isle of Man", source:"Facebook", title:"Highly recommended", text:"Delicious food and friendly service. Highly recommended. We will definitely be back!"},{name:"Jacki Moon", location:"Isle of Man", source:"Facebook", title:"Out of this world", text:"Visited for a late lunch today. The food and customer service was both excellent. Our waitress recommended the Szechwan dumplings, which I agree were out of this world. My husband said the Kung Po chicken was the best he had ever eaten and our girls enjoyed sharing their noodles and won ton soup. Looking forward to returning!"},{name:"Paul Whipp", location:"Isle of Man", source:"Facebook", title:"Couldn't fault it", text:"Lovely meal last night .... couldn't fault the service and the food was excellent. Definitely be going back soon."},{name:"Angela Aston", location:"Isle of Man", source:"Facebook", title:"Best on the island", text:"Best Chinese Restaurant/Takeaway on the Isle of Man. Fabulous food and service."},{name:"Alan Fleming", location:"Isle of Man", source:"Facebook", title:"A lovely family meal", text:"Food was so fresh and tasty, absolutely amazing. Staff were really helpful, I would recommend New Hong Kong to anyone that wants to go for a lovely family meal."},{name:"Frazer Pickering", location:"Isle of Man", source:"Facebook", title:"All excellent", text:"Had a takeaway lunch today - all excellent - highly recommended."},{name:"Ciara Kilgallon", location:"Isle of Man", source:"Facebook", title:"A birthday to remember", text:"Had my birthday meal here and staff went above and beyond. Was totally fantastic. I prefer and recommend their more Hong Kong based dishes. Superb and not your average meal. Wonderful place x"},{name:"Nidal AD", location:"Isle of Man", source:"Facebook", title:"Real food, real experience", text:"Best Asian on the island by far since its opening. Real food and dining experience."},{name:"Jo W", location:"Chester, United Kingdom", source:"TripAdvisor", title:"Fresh and tasty", text:"Really fresh food, delicious and great staff."},{name:"mlinaker", location:"Bury, United Kingdom", source:"TripAdvisor", title:"Excellent", text:"Excellent food and friendly staff, highly recommended."},{name:"Malcolm Davis", location:"Isle of Man", source:"TripAdvisor", title:"Very enjoyable prawn chow mein", text:"This looks very unprepossessing from the outside, but from the inside it is very modern. There are no soups on the menu so I only had the prawn chow mein. With a sparkling mineral water the bill came to a very reasonable £16."},{name:"The Australian Chef", location:"Salcombe, United Kingdom", source:"TripAdvisor", title:"Best Japanese/Asian on the Island", text:"Fantastic place, the host is amazing. Got me a table as I didn't book. I was alone. So happy to be able to eat. Thanks for everything. Staff are great too. Chefs are awesome. Great food."},{name:"GallopingGourmet", location:"Peel, United Kingdom", source:"TripAdvisor", title:"Real Asian Food", text:"I've been a few times now, and the food is always excellent. It is Asian food to the standard you would expect in Tokyo, Taipei or Singapore."},{name:"Cath", location:"Newport, United Kingdom", source:"TripAdvisor", title:"Great food and friendly service", text:"Great food and friendly service all at a reasonable price. We had ribs, beef chow mein, squid in a black bean sauce and egg fried rice. Everything was delicious. Busy on a Friday night but the staff found us a table as a walk in."},{name:"John T", location:"Retford, United Kingdom", source:"TripAdvisor", title:"Great Chinese", text:"Great place to eat great Chinese food, a nice restaurant upstairs, good choice of starters and main courses, nice friendly staff, a very busy place so make sure you book in advance. Look forward to visiting again."},{name:"bluebandit600s", location:"Crossgar, United Kingdom", source:"TripAdvisor", title:"Excellent meal", text:"Lovely restaurant with very friendly staff. Crispy chicken with sweet and sour sauce and fried rice was delicious. My friends enjoyed their meals too."},{name:"Kim", location:"Isle of Man", source:"TripAdvisor", title:"Delicious Gluten Free Chinese", text:"Contacted the team before we went there regarding their gluten free menu and it sounded delicious. When we got there we ordered for takeaway (we will be back in the future to eat in as the atmosphere was great) and it was not too long to wait. Fantastic size portions and the food was delicious. I also felt reassured to know they understood about gluten free."},{name:"Alan E", location:"Brand Green, United Kingdom", source:"TripAdvisor", title:"Great vibe, top staff and lovely food", text:"Ate here on a busy Friday night. Place was full but the staff were great, attentive and helpful. Lovely menu and the food was top notch. Would definitely eat here again."},{name:"VICKY D", location:"Isle of Man", source:"TripAdvisor", title:"Excellent menu", text:"Excellent choice of food and drinks on the menu. Food was some of the best we have eaten in an Asian restaurant. Waitresses very attentive and gave good advice. Lovely dining area upstairs. Handy location in Douglas and easy to find."},{name:"Jo T", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Gorgeous food, friendly staff", text:"Went here with my friend for dinner. The food was gorgeous, the staff were friendly and the prices were affordable. I have been to this restaurant quite a few times and have never been disappointed."},{name:"TAIOM", location:"Isle of Man", source:"TripAdvisor", title:"Very good", text:"Great food, drinks and service! Would recommend to anyone wanting food in a nice clean setting and good environment despite it looking small on the outside!"},{name:"Courtney P", location:"Isle of Man", source:"TripAdvisor", title:"The Best Asian Cuisine on the Isle of Man", text:"My partner and I are regular visitors to NHK, and it is without a doubt our absolute favourite restaurant. The food is hands down the best Asian cuisine on the island, it is consistently fresh, flavourful, and beautifully presented. The atmosphere is warm and inviting, and from our very first visit, we have always felt incredibly welcomed. We visit almost weekly and have never had a disappointing experience. Highly recommended!"},{name:"loveisleofman", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Asian delicious", text:"I have been to this restaurant several times, and it always delivers. The service is attentive, and the food is absolutely delicious. The pulled pork ramen is the best ramen I have tried in any Asian restaurant, and the dumplings are not far behind! They also have a nice selection of bottled beers, as well as sake wine. Highly recommended place with very reasonable prices."},{name:"tortured foodie society", location:"Cheshire, United Kingdom", source:"TripAdvisor", title:"Excellent corner place to eat", text:"Greeted with a very friendly face and welcomed in. The food was amazing and there is a large selection of beer. Very clean and nice ambiance. Management and staff were amazing."},{name:"Lawrence B", location:"Carnforth, United Kingdom", source:"TripAdvisor", title:"Excellent meal", text:"Walked to the town centre to eat at this restaurant on reading positive Trip Advisor reviews. We weren't disappointed as the service and selection of food was excellent. Very helpful serving staff giving good recommendations as to what to select. This restaurant offered a more varied menu from the norm and although the decor was basic, the food couldn't be faulted. There is a licensed bar and the prices were reasonable. Definitely recommend a visit."},{name:"Myke C", location:"Bebington, United Kingdom", source:"TripAdvisor", title:"Go to, every visit", text:"Our first night on our weeks visit to the island. We visit every year, and will definitely visit next year. Our food was, as always, splendid. Service faultless. Drinks a tad on the steep side, but a good choice."},{name:"Taylor5Manchester", location:"Lancaster District, United Kingdom", source:"TripAdvisor", title:"So much better than it looks from the outside", text:"They managed to fit us in on a busy Thursday night. Probably best to book. Really tasty food and service with a smile. Would recommend."},{name:"Eddie P", location:"Barrow-in-Furness, United Kingdom", source:"TripAdvisor", title:"Easily the best Chinese food I've had", text:"It's easily the best Chinese food, restaurant or takeaway, I've ever had. I first visited with friends two years ago, and we agreed then it was fabulous. I went back last week whilst visiting the island with my brother and the food was fabulous again. So good we went twice! The service was spot on too and the prices were good."},{name:"an_spalpeen", location:"Drogheda, Ireland", source:"TripAdvisor", title:"Very tasty Chinese food", text:"Delicious food. Friendly staff. We all thoroughly enjoyed our food which was freshly prepared. Service was quick and efficient. Highly recommended."},{name:"Ken W", location:"Burgess Hill, United Kingdom", source:"TripAdvisor", title:"Excellent Chinese", text:"We popped in here for dinner during TT with some local friends. Looking at the outside I was a bit dubious, especially as I'm generally not a great fan of Chinese food. All I can say is I was wrong, and was totally delighted with my meal of pork belly bao bun followed by red Thai chicken curry and rice. The food was tasty and superb, and everyone else's also looked great. I'll definitely return for more."},{name:"magmo3", location:"Whitehaven, United Kingdom", source:"TripAdvisor", title:"Better than the real thing!", text:"Excellent staff, very friendly. The Red Curry chicken is the best I've had. Have eaten in Hong Kong and China and it was not as good."},{name:"tanya101096", location:"Onchan, United Kingdom", source:"TripAdvisor", title:"Everything always tastes amazing!!", text:"No matter what you order here you know it will be perfect! My favourite place for any event and staff are so friendly. Recommended to everyone."},{name:"IOMtravelgirl", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Tasty food in Douglas", text:"Excellent restaurant with friendly service and great food. My husband enjoyed a laksa and I had king prawns with cashew nuts. We had the dumplings as a starter. It was all very tasty and the ambience upstairs was quiet and cosy. It is nicely decorated. Prices were not bad either! Thank you."},{name:"V7183EKjefft", location:"Burnley, United Kingdom", source:"TripAdvisor", title:"Wow! What a find", text:"Wow! What a find. Fantastic food, staff, decor. Spotless cleanliness. Couldn't fault anything. Excellent value too!"},{name:"Colin D", location:"West Drayton, United Kingdom", source:"TripAdvisor", title:"A really nice place to eat", text:"Very, very good food. A top Chinese restaurant. We loved what we ordered and the prices were very reasonable. The staff are however what make this place. Best book in advance if you do not wish to be disappointed. My tip would be the Sweet and Sour pork. Absolutely delicious. I would definitely eat there again if in Douglas."},{name:"Aaron Joseph D", location:"Isle of Man", source:"TripAdvisor", title:"Very nice food", text:"First timer here and had a great time with great food with a bit of slow service, but its ok because it was her first day. Very well done job."},{name:"GrahameandHelen", location:"Northumberland National Park, United Kingdom", source:"TripAdvisor", title:"A pleasant surprise!", text:"At first sight, and taking the historical Castle St premises into account, you think you are heading for your typical Chinese takeaway. The establishment has an upstairs dining room that is a nice blend of traditional and contemporary, really quite stylish. The staff are friendly, portions are good, the menu varied and the food very tasty. A selection of nice cocktails rounds everything off. We dined here twice in the week which says a lot."},{name:"John R", location:"Abergele, United Kingdom", source:"TripAdvisor", title:"Exquisite dining experience", text:"What a great restaurant this is with modern tasteful decor, friendly and attentive staff and a menu with some typical Chinese dishes plus some very different and unique meals. Their Signature Steamed Buns were superb for starters and our mains choices were beyond expectation served in generous portions. All together a five star experience."},{name:"cgt180", location:"North Yorkshire, United Kingdom", source:"TripAdvisor", title:"Hits the spot!", text:"Called in late afternoon, early evening yesterday to give New Hong Kong a try and was not disappointed. Great service, hot, tasty food and plenty of it. Now my favourite Asian place to eat in Douglas!"},{name:"Barry J", location:"Vancouver, Canada", source:"TripAdvisor", title:"Fresh, hot, very tasty food", text:"Great food, speedy service, spicy authentic Asian food, Szechwan, Cantonese, Korean and Indonesian. Try steamed rice with kimchi, curry with vegetables."},{name:"Lisa B", location:"Derby, United Kingdom", source:"TripAdvisor", title:"Stunning food, possibly the best Chinese food", text:"My husband and I had a meal there last night and it was awesome. From the hot and sour soup to the main courses everything was hot, tasty and absolutely delicious. The staff were all courteous and polite. An absolute must if you love Chinese food."},{name:"Cassie Q", location:"Isle of Man", source:"TripAdvisor", title:"Amazing food and worth a visit!", text:"Came with the girls after hearing very good reviews, and it did not disappoint! The service was excellent and the food was amazing! They cook without dairy, so this was an absolute bonus as I'm lactose intolerant. Shared the quarter duck with the bao buns and then had the Lamb Shank in Yellow Coconut Curry off the specials board. The lamb literally fell off the bone, and the portion was massive! My new favourite Chinese on the IOM, and I will be back!"},{name:"Rob M", location:"Nottinghamshire, United Kingdom", source:"TripAdvisor", title:"Excellent food and service", text:"Visited this whilst on a short visit to IOM. Looks unimposing from outside but once inside, clean, modern and very attentive staff. Importantly the food was fantastic and reasonably priced. Would definitely return."},{name:"Angela A", location:"Isle of Man, United Kingdom", source:"TripAdvisor", title:"Best Chinese food I have ever had", text:"I come here every week, I love it. Always the best food and service. Great choice, and good staple Chinese food."},{name:"Stewart100", location:"Doncaster, United Kingdom", source:"TripAdvisor", title:"Excellent Food and Service", text:"We ate at New Hong Kong twice on our recent visit to Isle of Man and both times the food and the service were excellent."},{name:"Karen S", location:"Manchester, United Kingdom", source:"TripAdvisor", title:"Great place to eat", text:"We went here for a meal following a Trip Advisor search and totally agree with the positive reviews! It looks like the kind of place you'd walk past from the exterior decor but don't let the outside stop you entering! The place was very busy for a Monday night, but we were seated and served quickly. The waitress was friendly and attentive and the food, from the open kitchen, was delicious!"},{name:"Catherine J", location:"Isle of Man", source:"TripAdvisor", title:"A hidden gem", text:"We stumbled across this little gem of a restaurant whilst wandering around and unsuccessfully searching for somewhere to eat. The food was excellent, the menu has lots of choice, we had bao buns for the first time and they were delicious. Our main courses were both equally good and the portions were big. Great service too. Would definitely eat here again if in Douglas."},{name:"Nicholas D", location:"Larne, United Kingdom", source:"TripAdvisor", title:"Ramen Lovers Enjoy", text:"If you love eating ramen then this is the place you need to visit when on the Isle of Man. I haven't had ramen this good for almost 4 years, since I visited Seoul. There is plenty of Asian cuisine available with a full menu of popular rice and noodle dishes, plus Asian beers and a plentiful range of Japanese sakes."},{name:"Peter Irvine", location:"Isle of Man", source:"TripAdvisor", title:"11/10, a must visit for anyone who loves good food", text:"11/10, this was simply the best meal I have had out of South East Asia. I had Malaysian prawn and tofu noodles and they were amazing. Will be back before I go home."},{name:"Ken", location:"Isle of Man", source:"TripAdvisor", title:"Don't judge a book by its cover", text:"Visiting Isle of Man, staying in the Claremont Hotel. Found New Hong Kong by accident, second day in a row we have eaten here and found it fantastic both days. Don't judge by the outside, inside is clean and contemporary, food outstanding."},{name:"Jorgen O", location:"Kingston-upon-Hull, United Kingdom", source:"TripAdvisor", title:"Best Asian", text:"One of the best Chinese restaurants I have ever tried. Fresh, prepared, and very tasty. Modern look, very nice. Very friendly staff."},{name:"Goreus1010", location:"Isle of Man, United Kingdom", source:"TripAdvisor", title:"Fantastic, authentic food and amazing cocktails!", text:"My wife and I have travelled and worked throughout Asia and can safely say that New Hong Kong is great quality and authentic food. To our surprise they also make superb cocktails, better than any of the cocktail bars! Setting is casual but very nicely decorated and clean. Highly recommended."},{name:"THE FOOD RANGER", location:"Isle of Man", source:"TripAdvisor", title:"Lovely food", text:"Food and service was excellent. The front waitresses were fantastic. Will come back for the service and food. Thanks guys."},{name:"John M", location:"Isle of Man", source:"TripAdvisor", title:"Spur of the moment food", text:"We came out of the theatre and were thinking of a bag of chips when we came to this place so decided to give it a try. Wow, the food was amazing and super fresh. Nice and small place and great staff with the chefs visible so you can see everything going on. To top it off, the bill was very cheap. Looking forward to going back soon."},{name:"JG", location:"Isle of Man, United Kingdom", source:"TripAdvisor", title:"Excellent Meal", text:"A very clean restaurant in the main town. The staff are very friendly and the food is spot on. I recommend you get the iced Vietnamese coffee and the salt and chilli chicken. Can't wait to return!"},{name:"Chris H", location:"East Ayrshire, United Kingdom", source:"TripAdvisor", title:"Great Asian food in Douglas", text:"Over to the island on business and happened upon this restaurant whilst out for a walk. Glad I decided to eat here. Service was excellent, food was freshly cooked. Can highly recommend the salt and chilli crispy chicken which was stunning, and the sweet and sour crispy pork was just as good. Can't wait to come back."},{name:"Alba316", location:"Glasgow, United Kingdom", source:"TripAdvisor", title:"Great Chinese food", text:"We had a lovely Chinese meal here and had a selection of dishes to share. Everything was freshly cooked and the service was great. It was busy, even though we went later in the evening. Great value and generous portions."},{name:"john ward", location:"Isle of Man, United Kingdom", source:"TripAdvisor", title:"Packed out on a Tuesday!", text:"The place doesn't look much from the outside and I thought it was really just a takeaway. Number 1 on Tripadvisor, so thought we would try it. Just as well we booked as it was full, even on a Tuesday. The food has a feel of freshness and very high quality. Service was impeccable. Overall, I felt it deserved a 5 star rating."},{name:"psmith20", location:"Keighley, United Kingdom", source:"TripAdvisor", title:"Great little place, well worth checking out", text:"An ex takeaway which now has a limited number of tables. Small menu of interesting dishes rather than the usual generic Chinese menu. Lovely staff and very good prices. Food was excellent."},{name:"LikkelRixxy", location:"Riyadh, Saudi Arabia", source:"TripAdvisor", title:"Great food and service", text:"Wonderful. We were a walk-in and were treated like VIPs, during TT which is a manic time. The food was awesome Asian and the service excellent. Great value and well worth a visit or three."},{name:"Cheryl C", location:"United Kingdom", source:"TripAdvisor", title:"Excellent meal", text:"Excellent meal tonight. We shared a starter of pork gyoza and a tempura prawn steamed bun. Good mains of kimchi fried rice and garlic chicken. Would thoroughly recommend."},{name:"Carol C", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Love this place", text:"The atmosphere and service is excellent, but we come here for the food, it's second to none. Truly the best place to eat on the entire isle, we absolutely love it!"},{name:"r_white1198", location:"Manchester, United Kingdom", source:"TripAdvisor", title:"Amazing food", text:"Visited for dinner, seriously good food, really light and fresh. Service was friendly and quick. Some of the best Chinese food I have had outside of the Far East."},{name:"Manx traveller", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Best for miles", text:"Fresh cooked food that is delicious and reasonably priced. It's not posh but it is smart and clean. Interesting dishes that seem to combine Chinese and Japanese."},{name:"InspirationSeeker", location:"Athens, Greece", source:"TripAdvisor", title:"Great food experience", text:"Visited for dinner last week! I ordered chicken with orange sauce and egg noodles! Excellent food and friendly staff, centrally located, I totally recommend!"},{name:"Patricia L", location:"Belfast, United Kingdom", source:"TripAdvisor", title:"Excellent food and service", text:"Visited here because I could not get into Jakes Steakhouse. They did me a favour in turning me away because I stumbled across this great Chinese restaurant. From the outside it does not look great but really nice inside. The food was excellent, having just returned from Beijing I must say this was one of the best Chinese meals I have had, very fresh. Make sure you visit."},{name:"memberRossonWye", location:"Ross On Wye, United Kingdom", source:"TripAdvisor", title:"Worth going in!", text:"We'd walked past this place a few times on our 3 day trip to Douglas, but on our final night decided to visit, as the reviews here were good and we are glad we did. Really tasty, zingy food that was a delight. Had a mix of a chicken noodle special, Asian greens and a crispy beef satay and it was perfect. Would recommend eating here, the outside looks deceptive but it is much more than that!"},{name:"amorjon", location:"Thornton Cleveleys, United Kingdom", source:"TripAdvisor", title:"Lucky find", text:"Group of 5 found this place by chance and loved it. I liked the fresh new look which is different from the standard Asian restaurants, and the layout allows you to view the kitchen space from downstairs tables. The menu was great with plenty of choice and the bill was reasonable. All staff friendly, definitely recommend a visit."},{name:"John W", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Great Asian Cuisine", text:"Mini spring rolls, gyoza and pork dumplings to start. Pork ramen and duck ramen for mains. Dessert of plum and damson ice cream. Served with Jack the Ram stout and Irish coffee to finish off."},{name:"Wynn07", location:"Fuerteventura, Spain", source:"TripAdvisor", title:"Steamed Buns!!", text:"Wow! I love this place. Excellent lunch and evening menus with a mixed range of Chinese/Japanese/Korean food. The steamed buns are freshly made and very tasty. They do noodle bowls and rice bowls with different meat or fish which are very filling. I can recommend the sticky chicken noodle meal. Will definitely be back, probably many times!"},{name:"ILoveToTravelMoreMrP", location:"Wales, United Kingdom", source:"TripAdvisor", title:"Great New Year's Eve meal", text:"Small restaurant with really nice interior decor, despite outside appearance. Food was amazingly tasty, mixed starter split as one vegan and main courses were sublime. Really tasty food and good value for money. Highly recommend."},{name:"lisawales2017", location:"South Wales, United Kingdom", source:"TripAdvisor", title:"Amazing food", text:"As other reviews have said, this place looks a little dubious from the outside but upstairs is lovely and the food is fantastic! The best Kung Po chicken ever! And the service was excellent."},{name:"Simon S", location:"St. Albans, United Kingdom", source:"TripAdvisor", title:"Gem", text:"This place is an absolute gem. Fantastic food and feel. Great menu that mixes old with new at a reasonable price."},{name:"Carolyn H", location:"Darwen, United Kingdom", source:"TripAdvisor", title:"Delicious!", text:"I've eaten Chinese food all over the world, including China and Malaysia, and this restaurant is as good as any. Friendly staff, no pretensions with decor, just wooden tables and chairs. Food is served fast and piping hot, full of flavour and super fresh ingredients. The salt and chilli chicken starter is awesome. Loved it, see you soon!"},{name:"mjpugh2015", location:"Isle of Man, United Kingdom", source:"TripAdvisor", title:"Love it!", text:"What a fantastic place this is! The food is fresh, interesting and delicious. Having been about 5 times now I honestly haven't ever had a bad dish. The ramen, which seems hard to find on the Isle of Man, is so good! It's filling, beautifully presented and hearty. Friendly, funny staff who actually listen to what you ask for. Don't hesitate, just go, relax and enjoy!"},{name:"Sethuraman0025", location:"Chennai, India", source:"TripAdvisor", title:"Wonderful and excellent one!", text:"I was staying in Isle of Man for a couple of days. This restaurant was very close by and I used to dine here nightly. The cooking was excellent and they had good Asian varieties. The staff present were very courteous and friendly. Even the cost was reasonable compared to other restaurants. Simple but wonderful ambiance inside."},{name:"Ian C", location:"Isle of Man", source:"TripAdvisor", title:"Open late", text:"The main attribute of this place is that it is still open when everywhere else is closed. Half decent little restaurant, go upstairs if you want posh, otherwise downstairs it is a bit cafe buffet style. Food was nice but not particularly cheap."},{name:"Alison K", location:"Isle of Man", source:"TripAdvisor", title:"Beautiful food, atmosphere and great staff", text:"Absolutely gorgeous Chinese food, nice and relaxed atmosphere and staff were really helpful with any questions about what was in the dishes. Would highly recommend."},{name:"David D", location:"Kilmarnock, United Kingdom", source:"TripAdvisor", title:"Authentic cuisine", text:"Excellent restaurant where you could see your meal being freshly prepared in the open kitchen. Best Chinese meal we have had in ages."},{name:"Valleygirl3", location:"Blaenau Gwent, United Kingdom", source:"TripAdvisor", title:"Soup noodle heaven", text:"Stumbled across this Asian restaurant and the smells drew us in, easily seated and a fabulous menu range. Opted for a warming bowl of soup noodle after a chilly walk, it arrived steaming hot and smelling delicious, ingredients were lovely and fresh and noodles cooked to perfection. Thoroughly enjoyed and wonderful service."},{name:"MrsMum21", location:"Corfe Mullen, United Kingdom", source:"TripAdvisor", title:"Wow, simply gorgeous!", text:"My husband and I were so hungry after a day watching the TT Races and found this little gem by accident. All I can say, after eating in other places on this island, is wow, and well done. I can truly say it was the most amazing Chinese we've eaten for years. Superb staff and excellent food."},{name:"Michelle L", location:"Orlando, Florida", source:"TripAdvisor", title:"Fantastic", text:"Couldn't fault anything, service and food amazing! We had the duck buns which I was a bit sceptical about but they were lovely!"},{name:"Dawn F", location:"Isle of Man", source:"TripAdvisor", title:"Dinner", text:"We didn't have to wait long, the food was delicious, best on the island. Service with a smile, very relaxed atmosphere, will definitely use again."},{name:"SJH21", location:"Sowerby, United Kingdom", source:"TripAdvisor", title:"Fantastic, what a find", text:"An absolute delight to find this gem of a restaurant. The food was superb and the choices different and surprising. When you add this to excellent service and a spotless presentation you have a real gem."},{name:"sarah c", location:"Ramsey, Isle of Man", source:"TripAdvisor", title:"Delicious meal", text:"Popped in for early dinner one evening. Staff extremely friendly and welcoming, and you can see the chefs working away in the kitchen. It's lovely upstairs, tables well spaced, decor lovely with a superb feature wall, spotlessly clean too. For starters we had pork belly steamed buns which were so tasty! Mains were absolutely fabulous. Portion sizes were very generous and presentation was beautiful. So many dishes to try, we will be visiting again very soon."},{name:"emmanuel k", location:"London, United Kingdom", source:"TripAdvisor", title:"Best pan Asian restaurant in IOM", text:"Amazing food and big portions! One of the best Chinese restaurants I've been to! The pork ramen was amazing and the salmon and prawn noodles amazing!"},{name:"Macca1916", location:"Isle of Man", source:"TripAdvisor", title:"Very nice place", text:"Very nice food and great service. Will be back next week to try different dishes on the menu. The dumplings were to die for."},{name:"Chris F", location:"Isle of Man", source:"TripAdvisor", title:"Nice Chinese food", text:"I had scallops with veg in oyster sauce and Chinese veg eat in. Very nice, fresh veg and scallops were fresh too. Gave me some free prawn crackers while I waited. I will be visiting again next year."},{name:"Shazmin M", location:"Isle of Man", source:"TripAdvisor", title:"Tasty food!", text:"Really enjoyed my visit here with a few friends last week. Food was superb with a great atmosphere. Will definitely return soon."},{name:"Pete-H-1966", location:"Isle of Man, United Kingdom", source:"TripAdvisor", title:"Wow!", text:"Without doubt the best Chinese food on the IOM. Tasty and fresh and cooked to perfection. I will be shocked if this restaurant doesn't move into the top 10. Can't wait to go back."},{name:"Claire Y", location:"Isle of Man", source:"TripAdvisor", title:"Authentic Asian Cuisine! Delicious food!", text:"Came here to visit family, and was recommended New Hong Kong for authentic Asian cuisine. We were greeted by friendly staff who explained the dishes and recommended food to our taste. The Szechuan pork dumplings in black vinegar and red oil are absolutely phenomenal! The pork belly ramen is a must try! I'd definitely recommend New Hong Kong to anyone on the island."},{name:"foodcritic25_12", location:"Bristol, United Kingdom", source:"TripAdvisor", title:"Cracking lunch", text:"Came here on the off chance while visiting family and got to say that I was so glad we did. The staff were welcoming and told us about the dishes available. Love the ambience in there. No waiting around for food and service was attentive. Food was top notch and loved the open kitchen. Will be back."},{name:"Paul D", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Why haven't I been here before!!", text:"Had a Friday night takeaway and wow, what a meal! Had crispy chicken curry and satay chicken starter, I can't wait to go back and try more on the menu. Very friendly and helpful staff, nice atmosphere whilst waiting and reasonably priced. I will be back very soon!"},{name:"Shona A", location:"Stockport, United Kingdom", source:"TripAdvisor", title:"Lovely lunch with little ones", text:"What a great find for a quick lunch with 2 rice loving children. The staff were more than happy to split a chicken katsu and rice between them and they happily wolfed it down. The adults shared some excellent gyoza, dan dan noodles and crispy chilli beef. Friendly, welcoming and just what we needed after overdoing fish and chips on our Manx holiday!"},{name:"kkc", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Worth a visit", text:"Nice written menu has all the usual Chinese dishes on there but with extra other Asian styles, especially do like the ramen dishes, not many places on the island do them and especially this good. The service is very good and friendly and the interior is clean with great decorations. Couldn't fault anything really. Definitely will be a regular spot."},{name:"Andrew C", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Pleasantly Surprised", text:"I was a bit reluctant to give New Hong Kong a try as a restaurant, as I've always known it as a takeaway. Do not let this put you off. We had no trouble getting a table and the service was spot on. The food is absolutely amazing, extremely well prepared and as good an Asian dining experience as I've had. I would recommend it to anyone liking Asian food."},{name:"Mary1962perth", location:"Perth, United Kingdom", source:"TripAdvisor", title:"Fantastic Asian", text:"Had lunch one day during TT, was excellent Asian food. So good we went back for dinner another night. Restaurant was clean and modern with a nice vibe and good service."},{name:"Dylan E", location:"Isle of Man", source:"TripAdvisor", title:"Not your average Chinese", text:"It was amazing. Best Asian food on the island. It's Asian street food meets Japanese perfection. The only Chinese takeaway I have seen with an open kitchen."},{name:"John M (Foxdale)", location:"Foxdale, Isle of Man", source:"TripAdvisor", title:"First Visit", text:"First visit but definitely not the last! Excellent modern cuisine beautifully presented and with superb flavours. Great service too."},{name:"Twlindsay", location:"Douglas, United Kingdom", source:"TripAdvisor", title:"Absolutely fantastic", text:"My wife and I visited here last night and I must say it was the best meal I've had out on the island in the 4 years living here. We had the steamed buns to start, I had the pork belly and my wife had the prawn, we're still talking about them today. My wife had the teriyaki salmon noodles main and I had the chilli beef rice which again were faultless. This is exactly what the IOM needs. Counting down the days until we go back."},{name:"Lloyd M", location:"Chapel Hill, North Carolina", source:"TripAdvisor", title:"Good Chinese/Asian option", text:"A great addition to the Douglas dining scene. The highlights are the starters. For my visit I selected a pork belly bun and found it very tasty. For my main I chose roast duck with an orange sauce and rice noodles, the duck was a good sized portion with crispy skin, perfectly deboned. Very impressed with the coconut lime ice cream. Overall, a very tasty meal."},{name:"MoustacheMei", location:"Birmingham, United Kingdom", source:"TripAdvisor", title:"Delicious modern Asian cuisine", text:"Visited this restaurant for dinner with family. The restaurant is beautifully designed, minimal, clean and spacious, with an open kitchen so you can see the chefs freshly preparing your meals. An interesting and varied Asian menu, something for everyone, nothing else quite like it on the island. The steamed buns are a must try."}];

export const news = [{title:"Holiday opening hours", date:"20 December 2025", excerpt:"Our festive service schedule for Christmas and New Year.", image:"https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85"},{title:"A new chapter for the menu", date:"08 May 2025", excerpt:"A few considered additions, built around seasonal ingredients.", image:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85"},{title:"An evening at New Hong Kong", date:"19 March 2025", excerpt:"Why the best nights begin with a table of shared dishes.", image:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85"}];
