import type { WasteScanResult } from '../utils/wasteLogic';

export interface QuickSample {
  id: string;
  label: string;
  shortTag: string;
  imageUrl: string;
  filename: string;
  alt: string;
  result: WasteScanResult;
}

const PIZZA_BOX_SVG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#ebe7df"/>
  <rect x="140" y="105" width="520" height="390" rx="10" fill="#cfa97e" stroke="#9e764a" stroke-width="4"/>
  <rect x="165" y="130" width="470" height="340" rx="6" fill="#d9b68c"/>
  <ellipse cx="400" cy="300" rx="145" ry="125" fill="#b78a52" opacity="0.55"/>
  <ellipse cx="365" cy="280" rx="72" ry="54" fill="#9c6c34" opacity="0.45"/>
  <ellipse cx="455" cy="340" rx="46" ry="38" fill="#9c6c34" opacity="0.4"/>
  <path d="M165 130 L635 130 L605 165 L195 165 Z" fill="#c29868" opacity="0.65"/>
</svg>`);

export const QUICK_SAMPLES: QuickSample[] = [
  {
    id: 'banana-peel',
    label: 'Banana Peel & Core',
    shortTag: 'Green Bin',
    imageUrl: '/src/assets/images/sample_organic_peel_1795563893335.jpg',
    filename: 'banana-peel-organic.jpg',
    alt: 'Yellow banana peel and apple core on a clean pale surface',
    result: {
      itemName: 'Banana Peel & Apple Core',
      binColor: 'green',
      materialComposition: '100% biodegradable plant cellulose and fruit fiber',
      confidence: 99,
      co2SavedKg: 0.18,
      disposalSteps: [
        'Remove any plastic produce stickers from the peel before discarding.',
        'Place directly into the Green Dustbin without wrapping in a plastic bag.',
        'Tear larger scraps into smaller pieces if adding to a home compost tumbler.',
      ],
      environmentalFact:
        'Composting kitchen fruit scraps avoids anaerobic methane release in landfills and turns back into nutrient-rich humus in 2 to 6 weeks.',
      modelUsed: 'Verified Sample Dataset',
    },
  },
  {
    id: 'plastic-bottle',
    label: 'PET Bottle & Can',
    shortTag: 'Blue Bin',
    imageUrl: '/src/assets/images/sample_plastic_bottle_1795563890422.jpg',
    filename: 'pet-bottle-aluminum-can.jpg',
    alt: 'Crushed clear PET plastic bottle next to an empty aluminum can',
    result: {
      itemName: 'Clear PET Water Bottle & Aluminum Can',
      binColor: 'blue',
      materialComposition: 'Polyethylene Terephthalate (PET #1) and recyclable aluminum alloy',
      confidence: 98,
      co2SavedKg: 0.34,
      disposalSteps: [
        'Empty remaining liquids and give both containers a quick rinse.',
        'Keep the bottle flattened to save collection volume and re-attach the cap.',
        'Place both clean, dry items loosely inside the Blue Dustbin.',
      ],
      environmentalFact:
        'Recycling aluminum uses 95% less energy than smelting raw bauxite ore, and one recycled PET bottle saves enough energy to power an LED bulb for 18 hours.',
      modelUsed: 'Verified Sample Dataset',
    },
  },
  {
    id: 'surgical-mask',
    label: 'Mask & Blister Pack',
    shortTag: 'Red Bin',
    imageUrl: '/src/assets/images/sample_hazardous_mask_1795563894908.jpg',
    filename: 'surgical-mask-blister-pack.jpg',
    alt: 'Folded disposable blue surgical face mask beside an empty medicine blister pack',
    result: {
      itemName: 'Disposable Surgical Mask & Medicine Blister Pack',
      binColor: 'red',
      materialComposition: 'Melt-blown polypropylene fabric with PVC-aluminum pharmaceutical blister foil',
      confidence: 97,
      co2SavedKg: 0.14,
      disposalSteps: [
        'Fold the mask inward so the contaminated outer layer stays enclosed.',
        'Snip the elastic ear loops so they cannot entangle wildlife during handling.',
        'Wrap in scrap paper or a closed pouch and place inside the Red Dustbin.',
      ],
      environmentalFact:
        'Segregating biomedical waste into red streams protects waste handlers from pathogens and stops single-use mask fibers from entering waterways.',
      modelUsed: 'Verified Sample Dataset',
    },
  },
  {
    id: 'aa-batteries',
    label: 'Batteries & USB Cable',
    shortTag: 'Yellow Bin',
    imageUrl: '/src/assets/images/sample_ewaste_battery_1795563888374.jpg',
    filename: 'aa-batteries-usb-pcb.jpg',
    alt: 'Spent AA batteries beside a frayed black USB cable and small circuit board',
    result: {
      itemName: 'Spent AA Batteries, Frayed USB Cable & PCB',
      binColor: 'yellow',
      materialComposition: 'Alkaline electrolytes, zinc-steel casing, copper wire, and FR-4 fiberglass circuit board',
      confidence: 96,
      co2SavedKg: 0.68,
      disposalSteps: [
        'Place clear tape over the positive (+) and negative (-) battery terminals to prevent sparks.',
        'Keep batteries, cables, and circuit boards dry and separated from wet or paper trash.',
        'Deposit all electronic items into the Yellow / E-Waste Bin or certified drop-off point.',
      ],
      environmentalFact:
        'Formal e-waste recovery reclaims up to 90% of copper, zinc, and trace precious metals while preventing toxic heavy-metal soil contamination.',
      modelUsed: 'Verified Sample Dataset',
    },
  },
  {
    id: 'greasy-pizza-box',
    label: 'Greasy Pizza Box',
    shortTag: 'Tricky · Green',
    imageUrl: PIZZA_BOX_SVG,
    filename: 'greasy-pizza-box.svg',
    alt: 'Cardboard pizza box base stained with cooking oil and grease',
    result: {
      itemName: 'Grease-Soaked Cardboard Pizza Box Base',
      binColor: 'green',
      materialComposition: 'Uncoated corrugated kraft paper saturated with food oils',
      confidence: 95,
      co2SavedKg: 0.24,
      disposalSteps: [
        'Tear off the clean, unstained top lid and place that dry half in the Blue Dustbin.',
        'Tear the grease-stained bottom into smaller sheets and place in the Green Dustbin.',
        'Avoid placing oily cardboard in paper recycling—grease ruins entire pulp batches.',
      ],
      environmentalFact:
        'Food oils prevent paper fibers from re-bonding during hydro-pulping; composting soiled cardboard keeps recycling streams clean and high-grade.',
      modelUsed: 'Verified Sample Dataset',
    },
  },
];
