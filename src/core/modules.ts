// The sections of the app. The home page tiles and the menus are built from this list,
// so adding a section = a folder under src/app/(site)/<slug> (+ src/modules/<slug>) and one entry here.
//
// While a section still lives in its old separate site, `href` points there (external);
// when it moves into this app, `href` becomes "/<slug>" and the old address redirects here.

export type IconName = "home" | "rain" | "media" | "sport";

export type Module = {
  slug: string; // also the URL path and the table prefix family (rain_, kmedia_, sport_ …)
  name: string; // tile + menu label
  shortName: string; // phone tab bar (keep it to one short word)
  description: string; // one line under the tile name
  href: string; // "/rain" inside the app, or a full URL while the section is still a separate site
  icon: IconName;
  accent: string; // the section's own colour (icons, highlights); must reach 4.5:1 against white
  tint: string; // light background for its tile
  enabled: boolean;
};

export const MODULES: Module[] = [
  {
    slug: "rain",
    name: "משקעים",
    shortName: "גשם",
    description: "כמה גשם ירד, העונה ולאורך השנים",
    href: "/rain",
    icon: "rain",
    accent: "#1d4fc4",
    tint: "#e6eefc",
    enabled: true,
  },
  {
    slug: "media",
    name: "מדיה",
    shortName: "מדיה",
    description: "תמונות וסרטים מההיסטוריה של הקיבוץ",
    href: "https://media.kneapps.fyi",
    icon: "media",
    accent: "#a4532a",
    tint: "#f8ebe2",
    enabled: true,
  },
  {
    slug: "sport",
    name: "מגרשי ספורט",
    shortName: "ספורט",
    description: "הזמנת מגרשים והצטרפות למשחקים",
    href: "/sport",
    icon: "sport",
    accent: "#a34a0a",
    tint: "#fbefdc",
    enabled: true,
  },
];

export const enabledModules = () => MODULES.filter((m) => m.enabled);
export const isExternal = (m: Module) => /^https?:\/\//.test(m.href);
