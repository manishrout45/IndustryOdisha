export const categories = [
  'Top Stories',
  'Politics',
  'Business',
  'Technology',
  'Culture',
  'Sports',
  'Opinion',
];

export const articles = [
  {
    id: 1,
    title: 'Election panel announces new transparency rules for campaign spending',
    category: 'Politics',
    author: 'Maya Sen',
    minutes: 5,
    image:
      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1100&q=80',
    excerpt:
      'The commission said parties will file weekly digital disclosures through the final phase of voting.',
    body:
      'Election officials framed the new rules as a public trust measure after months of pressure from civil society groups. Campaigns will need to report high-value donations, advertising purchases, and vendor contracts on a rolling basis. Analysts expect the policy to shape how national parties organize their media operations during the final stretch.',
    featured: true,
    trending: true,
  },
  {
    id: 2,
    title: 'Markets close higher as energy and banking shares recover',
    category: 'Business',
    author: 'Arjun Mehta',
    minutes: 4,
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1100&q=80',
    excerpt:
      'Investors returned to large-cap stocks after a calmer inflation outlook and stronger earnings guidance.',
    body:
      'The benchmark index rose through afternoon trading as banking, energy, and infrastructure counters found fresh demand. Traders said the rally was helped by stable bond yields and an upbeat outlook from exporters. Small-cap stocks remained mixed as investors waited for clearer signals from quarterly results.',
    featured: true,
    trending: false,
  },
  {
    id: 3,
    title: 'Researchers unveil low-cost battery chemistry for city buses',
    category: 'Technology',
    author: 'Nisha Rao',
    minutes: 6,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1100&q=80',
    excerpt:
      'A university-backed pilot could reduce replacement costs for electric public transport fleets.',
    body:
      'The project uses abundant materials and a modular pack design aimed at hot-weather operations. Engineers said the chemistry is not meant for luxury cars, but could be ideal for high-mileage buses that charge predictably. City transport agencies are watching the trial closely before ordering larger deployments.',
    featured: true,
    trending: true,
  },
  {
    id: 4,
    title: 'Film festival opens with restored classics and new regional premieres',
    category: 'Culture',
    author: 'Leena Kapoor',
    minutes: 3,
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1100&q=80',
    excerpt:
      'Curators are pairing archival cinema with debut features from smaller production houses.',
    body:
      'Festival organizers said the program was designed to connect film history with the current wave of independent storytelling. Restored prints will screen alongside first features from younger directors. Audience talks and workshops are scheduled through the weekend.',
    featured: false,
    trending: false,
  },
  {
    id: 5,
    title: 'National team names young squad for upcoming continental tournament',
    category: 'Sports',
    author: 'Kabir Thomas',
    minutes: 4,
    image:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1100&q=80',
    excerpt:
      'Selectors backed pace and flexibility, adding four uncapped players to the final roster.',
    body:
      'The coaching staff said the squad was chosen with an eye on future cycles as well as immediate tournament needs. Senior players will anchor the dressing room, while newer names are expected to bring intensity in transition. Warm-up matches begin next month.',
    featured: false,
    trending: true,
  },
  {
    id: 6,
    title: 'Editorial: Public data works best when people can actually use it',
    category: 'Opinion',
    author: 'Editorial Board',
    minutes: 4,
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1100&q=80',
    excerpt:
      'Open data portals need clearer formats, plain language summaries, and reliable update schedules.',
    body:
      'Governments often publish data in the name of transparency, but inaccessible files and inconsistent updates can make that transparency ornamental. Useful disclosure should help citizens, journalists, researchers, and businesses answer real questions without specialist tooling. That means stable formats, documentation, and accountability for delays.',
    featured: false,
    trending: false,
  },
];

export const comments = [
  {
    id: 1,
    name: 'Priya',
    text: 'Clear explainer. The disclosure timeline is the key detail here.',
  },
  {
    id: 2,
    name: 'Rohan',
    text: 'Would love to see a follow-up on how regional parties handle compliance.',
  },
];

export const dashboardStats = [
  { label: 'Published', value: '128', note: '+12 this week' },
  { label: 'Drafts', value: '34', note: '7 awaiting edit' },
  { label: 'Readers', value: '84K', note: '+18% month over month' },
  { label: 'Comments', value: '912', note: '64 pending review' },
];
