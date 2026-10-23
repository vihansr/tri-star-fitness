/** Brand constants & link configuration (client-side single source). */

export const BRAND_NAME = 'TRI-STAR ★ FITNESS';
export const BRAND_SHORT = 'TRI-STAR★';
export const PHONE_NUMBER_DISPLAY = '076930 06065';
export const PHONE_NUMBER_TEL = '+917693006065';
export const WHATSAPP_NUMBER = '917693006065';
export const ADDRESS_DISPLAY = 'Sapna Sangeeta Road, next to Lotus Electronic, Indore';
export const GOOGLE_RATING = '5.0';
export const GOOGLE_REVIEW_COUNT = 51;
export const INSTAGRAM_HANDLE = '@TRISTARFITNESS';
export const INSTAGRAM_URL = 'https://www.instagram.com/TRISTARFITNESS';
export const STORE_URL = 'https://tristarfitness.emitra.dev/store';

/** Both gym branches — used by useNearestGym hook. */
export const GYMS = [
  {
    id: 'sapna-sangeeta',
    name: 'Sapna Sangeeta',
    address: 'Sapna Sangeeta Road, next to Lotus Electronic, Indore',
    lat: 22.7065,
    lng: 75.8762,
    mapsUrl: 'https://maps.google.com/?q=Tri-Star+Fitness+Sapna+Sangeeta+Indore',
  },
  {
    id: 'manik-bagh',
    name: 'Manik Bagh',
    address: 'Manik Bagh Road, near Nai Duniya, Indore',
    lat: 22.7045,
    lng: 75.8575,
    mapsUrl: 'https://maps.google.com/?q=Tri-Star+Fitness+Manik+Bagh+Indore',
  },
];

/** XP economy (mirrors vanilla main.js XP_RULES, plus new interactive bonuses). */
export const XP_RULES = {
  FIRST_REP: 50,
  QUIZ_CORRECT: 25,
  OVERLOAD_100KG: 25,
  FREE_TRIAL: 100,
  CARDIAC_ZONE: 20,
  EQUIPMENT_VIEW: 25,
};
