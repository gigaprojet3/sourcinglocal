export interface Country {
  code: string;
  name: string;
  flag: string; // emoji drapeau
  dialCode: string;
}

export interface City {
  name: string;
  countryCode: string;
}

export const COUNTRIES: Country[] = [
  { code: "CG", name: "République du Congo",              flag: "🇨🇬", dialCode: "+242" },
  { code: "CD", name: "République Démocratique du Congo", flag: "🇨🇩", dialCode: "+243" },
  { code: "CI", name: "Côte d'Ivoire",                    flag: "🇨🇮", dialCode: "+225" },
  { code: "CM", name: "Cameroun",                         flag: "🇨🇲", dialCode: "+237" },
  { code: "GA", name: "Gabon",                            flag: "🇬🇦", dialCode: "+241" },
  { code: "BJ", name: "Bénin",                            flag: "🇧🇯", dialCode: "+229" },
  { code: "TG", name: "Togo",                             flag: "🇹🇬", dialCode: "+228" },
  { code: "BF", name: "Burkina Faso",                     flag: "🇧🇫", dialCode: "+226" },
];

export const CITIES: City[] = [
  // République du Congo
  { name: "Brazzaville",    countryCode: "CG" },
  { name: "Pointe-Noire",   countryCode: "CG" },
  { name: "Dolisie",        countryCode: "CG" },
  { name: "Nkayi",          countryCode: "CG" },
  { name: "Impfondo",       countryCode: "CG" },
  { name: "Ouesso",         countryCode: "CG" },

  // République Démocratique du Congo
  { name: "Kinshasa",       countryCode: "CD" },
  { name: "Lubumbashi",     countryCode: "CD" },
  { name: "Mbuji-Mayi",     countryCode: "CD" },
  { name: "Kananga",        countryCode: "CD" },
  { name: "Kisangani",      countryCode: "CD" },
  { name: "Bukavu",         countryCode: "CD" },
  { name: "Goma",           countryCode: "CD" },
  { name: "Matadi",         countryCode: "CD" },

  // Côte d'Ivoire
  { name: "Abidjan",        countryCode: "CI" },
  { name: "Bouaké",         countryCode: "CI" },
  { name: "Yamoussoukro",   countryCode: "CI" },
  { name: "San-Pédro",      countryCode: "CI" },
  { name: "Daloa",          countryCode: "CI" },
  { name: "Korhogo",        countryCode: "CI" },
  { name: "Man",            countryCode: "CI" },

  // Cameroun
  { name: "Douala",         countryCode: "CM" },
  { name: "Yaoundé",        countryCode: "CM" },
  { name: "Bafoussam",      countryCode: "CM" },
  { name: "Bamenda",        countryCode: "CM" },
  { name: "Garoua",         countryCode: "CM" },
  { name: "Maroua",         countryCode: "CM" },
  { name: "Ngaoundéré",     countryCode: "CM" },
  { name: "Bertoua",        countryCode: "CM" },

  // Gabon
  { name: "Libreville",     countryCode: "GA" },
  { name: "Port-Gentil",    countryCode: "GA" },
  { name: "Franceville",    countryCode: "GA" },
  { name: "Oyem",           countryCode: "GA" },
  { name: "Moanda",         countryCode: "GA" },
  { name: "Mouila",         countryCode: "GA" },

  // Bénin
  { name: "Cotonou",        countryCode: "BJ" },
  { name: "Porto-Novo",     countryCode: "BJ" },
  { name: "Parakou",        countryCode: "BJ" },
  { name: "Abomey-Calavi",  countryCode: "BJ" },
  { name: "Natitingou",     countryCode: "BJ" },
  { name: "Ouidah",         countryCode: "BJ" },

  // Togo
  { name: "Lomé",           countryCode: "TG" },
  { name: "Sokodé",         countryCode: "TG" },
  { name: "Kpalimé",        countryCode: "TG" },
  { name: "Atakpamé",       countryCode: "TG" },
  { name: "Dapaong",        countryCode: "TG" },
  { name: "Tsévié",         countryCode: "TG" },

  // Burkina Faso
  { name: "Ouagadougou",    countryCode: "BF" },
  { name: "Bobo-Dioulasso", countryCode: "BF" },
  { name: "Koudougou",      countryCode: "BF" },
  { name: "Banfora",        countryCode: "BF" },
  { name: "Ouahigouya",     countryCode: "BF" },
  { name: "Tenkodogo",      countryCode: "BF" },
  { name: "Kaya",           countryCode: "BF" },
];

/** Retourne les villes filtrées par code pays */
export function getCitiesByCountry(countryCode: string): City[] {
  return CITIES.filter((c) => c.countryCode === countryCode);
}
