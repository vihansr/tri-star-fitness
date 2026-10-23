/**
 * Source-of-truth content seed data.
 *
 * Single copy of the marketing/content data. It is used by:
 *  - server/models.js   → seeds MongoDB collections
 *  - server/seed.js     → CLI seeder (npm run seed)
 *  - server/routes/content.js → /api/content fallback when DB is unreachable/empty
 *  - src/hooks/useContent.js  → client-side fallback while /api/content is loading
 */
import { EQUIPMENT_LIST } from '../src/lib/logic.js';

export const OFFERS = [
  {
    id: 'strength',
    title: 'Strength training',
    desc: 'Build raw power with free weights, machines and progressive overload programs for every level.',
    accent: 'var(--plate-red)',
    badge: 'Heavy iron',
    svgIcon: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6.5 6.5 11 11M3 21l3-3M21 3l-3 3M7 4l3 3M17 14l3 3M14 17l3 3M4 7l3 3"></path>
      </svg>`,
  },
  {
    id: 'hyrox',
    title: 'HYROX training',
    desc: 'Competition-ready HYROX preparation with functional stations and endurance protocols.',
    accent: 'var(--plate-blue)',
    badge: 'Endurance',
    svgIcon: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>`,
  },
  {
    id: 'functional',
    title: 'Functional fitness',
    desc: 'Real-world movement patterns for everyday strength, mobility and peak athleticism.',
    accent: 'var(--plate-yellow)',
    badge: 'Mobility',
    svgIcon: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>`,
  },
  {
    id: 'transformation',
    title: 'Transformation programs',
    desc: '8 to 12 week guided body transformation with personalised diet plans and training protocols.',
    accent: 'var(--plate-green)',
    badge: 'Results',
    svgIcon: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>`,
  },
  {
    id: 'community',
    title: 'Community and events',
    desc: 'Group challenges, fitness meetups and a tribe that pushes you further every day.',
    accent: 'var(--ink)',
    badge: 'Tribe',
    svgIcon: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>`,
  },
];

export const STATS = [
  { value: 5.0, label: 'Google rating', isDecimal: true, suffix: '' },
  { value: 51, label: 'Google reviews', isDecimal: false, suffix: '+' },
  { value: 5, label: 'Training styles', isDecimal: false, suffix: '' },
  { value: 2, label: 'Years strong', isDecimal: false, suffix: '+' },
];

export const PLANS = [
  {
    name: 'Monthly Starter',
    accent: 'var(--plate-blue)',
    features: [
      'Full gym access',
      'Locker facility',
      'Group training sessions',
      'Basic fitness assessment',
    ],
    buttonText: 'Contact sales',
    popular: false,
  },
  {
    name: 'Quarterly Pro',
    accent: 'var(--plate-red)',
    features: [
      'Everything in Monthly',
      'Personal training sessions',
      'Diet consultation',
      'HYROX zone access',
      'Progress tracking',
      'Priority support',
    ],
    buttonText: 'Get started',
    popular: true,
  },
  {
    name: 'Annual Elite',
    accent: 'var(--plate-yellow)',
    features: [
      'Everything in Quarterly',
      'Unlimited personal training',
      'Priority booking',
      'Exclusive member events',
      'Nutrition store discounts',
      'Guest passes (2 per month)',
      'Body composition analysis',
    ],
    buttonText: 'Contact sales',
    popular: false,
  },
  {
    name: 'Custom Plan',
    accent: 'var(--plate-green)',
    features: [
      'Tailored to your goals',
      'Flexible duration',
      'Choose your training style',
      'Custom diet and workout plan',
      'One-on-one consultation',
    ],
    buttonText: 'Talk to us',
    popular: false,
  },
];

export const GAME_IDEAS = [
  {
    title: 'Daily streak',
    desc: 'Check in on consecutive days to build momentum, earn bonus multipliers, and keep your discipline fire burning.',
    accent: 'var(--plate-red)',
  },
  {
    title: 'XP and ranks',
    desc: 'Earn experience points with every rep, completed session, and fitness milestone to advance your gym tier.',
    accent: 'var(--plate-blue)',
  },
  {
    title: 'Weekly quests',
    desc: 'Tackle targeted workout objectives—from 10k rowing meters to strict form challenges—for exclusive rewards.',
    accent: 'var(--plate-yellow)',
  },
  {
    title: 'Squad leaderboards',
    desc: 'Compare weekly volume, attendance, and bench milestones with gym friends and teammates.',
    accent: 'var(--plate-green)',
  },
  {
    title: 'Spin the plate',
    desc: 'Unlock a lucky training finisher or complimentary nutrition perk when you hit your weekly attendance goal.',
    accent: 'var(--plate-red)',
  },
  {
    title: 'Boss lift of the month',
    desc: 'Test your maximum effort on our featured benchmark lift under coach supervision and claim bragging rights.',
    accent: 'var(--plate-blue)',
  },
];

export const TESTIMONIALS = [
  {
    author: 'Arjun Patel',
    initial: 'A',
    quote: '“Lost 15kg in just 3 months. The trainers here don’t just count reps, they change your lifestyle. Best gym in Indore, hands down.”',
  },
  {
    author: 'Sneha Joshi',
    initial: 'S',
    quote: '“The energy at Tri-Star is unmatched. Mohit sir’s training approach is scientific and result-oriented. I’ve never been fitter.”',
  },
  {
    author: 'Vikram Singh',
    initial: 'V',
    quote: '“HYROX training here is next level. They have proper stations, proper coaching, and a proper competitive environment. Love it.”',
  },
  {
    author: 'Ananya Dubey',
    initial: 'A',
    quote: '“The community and environment is unmatched. It’s not just a gym, it’s a family that holds you accountable every single day.”',
  },
];

export const QUESTIONS = [
  {
    id: 'morning',
    question: 'You arrive at the gym in the morning. First thing you do:',
    correct: 'Stretch and warm up',
    wrong: [
      'Drink black coffee',
      'Roam around for half an hour before deciding what to do',
      'Eat a lot of chips',
    ],
    explanation: 'A focused warm-up raises core body temperature, lubricates joints, and primes neuromuscular recruitment.',
  },
  {
    id: 'rest_day',
    question: 'It’s rest day. What’s your move?',
    correct: 'Take a walk, sleep well, eat well',
    wrong: [
      'Skip it and feel guilty',
      'Do a full-body max-out anyway',
      'Stay up gaming until 3 am',
    ],
    explanation: 'Active recovery and quality deep sleep are when muscle repair and strength adaptations actually take place.',
  },
  {
    id: 'form_slip',
    question: 'Your form slips on the last rep. You:',
    correct: 'Rack it and rest a little longer',
    wrong: [
      'Swing the weight up with momentum',
      'Add more weight right away',
      'Ask a friend to lift it for you',
    ],
    explanation: 'Racking the weight protects your joints and spine from strain. Technique and longevity always come first.',
  },
  {
    id: 'bottle',
    question: 'During a long session, what’s in your bottle?',
    correct: 'Water, sipped between sets',
    wrong: [
      'Sugary soda',
      'Nothing, you’ll drink later',
      'Energy drink, double strength',
    ],
    explanation: 'Consistent hydration preserves muscle contractility, mental focus, and cardiovascular endurance during heavy work.',
  },
];

export const BADGES = [
  {
    id: 'first_rep',
    title: 'First rep',
    description: 'Lifted the barbell in the hero arena.',
    icon: '🏋️‍♂️',
  },
  {
    id: 'quiz_finisher',
    title: 'Quiz finisher',
    description: 'Completed the gym knowledge quiz.',
    icon: '🧠',
  },
  {
    id: 'perfect_form',
    title: 'Perfect form',
    description: 'Scored a perfect 40/40 on the quiz.',
    icon: '🏆',
  },
];

const defaultSeedData = {
  offers: OFFERS,
  stats: STATS,
  plans: PLANS,
  gameIdeas: GAME_IDEAS,
  testimonials: TESTIMONIALS,
  questions: QUESTIONS,
  badges: BADGES,
  equipment: EQUIPMENT_LIST,
};

export default defaultSeedData;
