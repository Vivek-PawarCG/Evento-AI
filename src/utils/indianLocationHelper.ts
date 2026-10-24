import { EventType, VenueInfo, Vendor, Milestone } from '../types/event';

export interface LocationDetectionResult {
  city: string;
  state?: string;
  fullLocation: string;
  style: 'rooftop' | 'heritage' | 'beach' | 'lawn' | 'banquet';
}

const INDIAN_CITIES: { name: string; state: string; aliases: string[] }[] = [
  { name: 'Aurangabad', state: 'Maharashtra', aliases: ['aurangabad', 'chhatrapati sambhajinagar', 'sambhajinagar'] },
  { name: 'Mumbai', state: 'Maharashtra', aliases: ['mumbai', 'bombay', 'worli', 'bandra', 'juhu', 'thane', 'navi mumbai'] },
  { name: 'Pune', state: 'Maharashtra', aliases: ['pune', 'poona', 'viman nagar', 'koregaon park', 'baner'] },
  { name: 'Nashik', state: 'Maharashtra', aliases: ['nashik', 'nasik'] },
  { name: 'Nagpur', state: 'Maharashtra', aliases: ['nagpur'] },
  { name: 'Goa', state: 'Goa', aliases: ['goa', 'panaji', 'calangute', 'candolim', 'morjim', 'anjuna', 'baga'] },
  { name: 'Udaipur', state: 'Rajasthan', aliases: ['udaipur', 'lake pichola'] },
  { name: 'Jaipur', state: 'Rajasthan', aliases: ['jaipur', 'pink city', 'amer'] },
  { name: 'Jodhpur', state: 'Rajasthan', aliases: ['jodhpur'] },
  { name: 'Bengaluru', state: 'Karnataka', aliases: ['bengaluru', 'bangalore', 'indiranagar', 'koramangala', 'whitefield'] },
  { name: 'Delhi NCR', state: 'Delhi', aliases: ['delhi', 'new delhi', 'noida', 'gurugram', 'gurgaon'] },
  { name: 'Hyderabad', state: 'Telangana', aliases: ['hyderabad', 'secunderabad', 'hitec city', 'banjara hills', 'jubilee hills'] },
  { name: 'Chennai', state: 'Tamil Nadu', aliases: ['chennai', 'madras', 'ecr'] },
  { name: 'Kolkata', state: 'West Bengal', aliases: ['kolkata', 'calcutta', 'salt lake', 'new town'] },
  { name: 'Ahmedabad', state: 'Gujarat', aliases: ['ahmedabad', 'gandhinagar'] },
  { name: 'Surat', state: 'Gujarat', aliases: ['surat'] },
  { name: 'Lucknow', state: 'Uttar Pradesh', aliases: ['lucknow', 'gomti nagar'] },
  { name: 'Varanasi', state: 'Uttar Pradesh', aliases: ['varanasi', 'banaras', 'kashi'] },
  { name: 'Chandigarh', state: 'Punjab/Haryana', aliases: ['chandigarh', 'mohali', 'panchkula'] },
  { name: 'Indore', state: 'Madhya Pradesh', aliases: ['indore'] },
  { name: 'Bhopal', state: 'Madhya Pradesh', aliases: ['bhopal'] },
  { name: 'Kochi', state: 'Kerala', aliases: ['kochi', 'cochin'] },
  { name: 'Dehradun', state: 'Uttarakhand', aliases: ['dehradun', 'mussoorie', 'rishikesh'] },
];

/**
 * Parses user input (title, search string, or location input)
 * and extracts the authentic Indian city and venue style.
 */
export function detectIndianLocationAndStyle(
  title: string,
  userLocationInput?: string,
  theme?: string
): LocationDetectionResult {
  const combined = `${userLocationInput || ''} ${title} ${theme || ''}`.toLowerCase();

  // 1. Detect Style
  let style: 'rooftop' | 'heritage' | 'beach' | 'lawn' | 'banquet' = 'banquet';
  if (combined.includes('rooftop') || combined.includes('sky lounge') || combined.includes('terrace') || combined.includes('deck') || combined.includes('bierthy') || combined.includes('birthday')) {
    style = 'rooftop';
  } else if (combined.includes('heritage') || combined.includes('palace') || combined.includes('royal') || combined.includes('haveli') || combined.includes('fort') || combined.includes('wedding')) {
    style = 'heritage';
  } else if (combined.includes('beach') || combined.includes('coastal') || combined.includes('sea') || combined.includes('ocean')) {
    style = 'beach';
  } else if (combined.includes('lawn') || combined.includes('garden') || combined.includes('resort') || combined.includes('farm')) {
    style = 'lawn';
  }

  // 2. Detect City
  for (const c of INDIAN_CITIES) {
    for (const alias of c.aliases) {
      if (combined.includes(alias)) {
        return {
          city: c.name,
          state: c.state,
          fullLocation: `${c.name}, ${c.state}`,
          style,
        };
      }
    }
  }

  // 3. Fallback: Check regex for "in <City>" or "<City>, <State>"
  const matchIn = combined.match(/\bin\s+([a-z\s]+)/i);
  if (matchIn && matchIn[1]) {
    const rawCity = matchIn[1].split(/[,|\-]/)[0].trim();
    if (rawCity.length > 2) {
      const capitalized = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
      return {
        city: capitalized,
        fullLocation: `${capitalized}, India`,
        style,
      };
    }
  }

  if (userLocationInput && userLocationInput.trim()) {
    return {
      city: userLocationInput.trim(),
      fullLocation: userLocationInput.trim(),
      style,
    };
  }

  // Default fallback if no location specified
  return {
    city: 'Udaipur',
    state: 'Rajasthan',
    fullLocation: 'Udaipur, Rajasthan',
    style,
  };
}

/**
 * Generates bespoke AI-suggested venues specifically for the target Indian city and style.
 */
export function generateVenuesForLocation(
  city: string,
  state: string = 'India',
  style: 'rooftop' | 'heritage' | 'beach' | 'lawn' | 'banquet',
  guestCount: number,
  eventType: EventType
): VenueInfo[] {
  const normCity = city.toLowerCase();
  const capacity = Math.max(guestCount + 40, 120);

  // Dedicated presets for Aurangabad / Chhatrapati Sambhajinagar
  if (normCity.includes('aurangabad') || normCity.includes('sambhajinagar')) {
    return [
      {
        name: 'The Sky Deck Lounge & Rooftop Terraces',
        location: 'Jalna Road / CIDCO, Aurangabad, Maharashtra',
        capacity: Math.max(capacity, 150),
        rating: 4.94,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        setupTime: '04:00 PM IST',
        cateringPartner: 'Marathwada Shahi Culinary Co.',
        securityTier: 'VIP Guest QR Gate Protocol',
        curfew: '01:30 AM IST',
      },
      {
        name: 'Ambience Sky Terrace & Banquet Lawns',
        location: 'Prozone Area, Chhatrapati Sambhajinagar',
        capacity: Math.max(capacity + 50, 200),
        rating: 4.88,
        imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80',
        setupTime: '05:00 PM IST',
        cateringPartner: 'Deccan Flavors Gourmet Kitchen',
        securityTier: 'Standard Guest Pass Access',
        curfew: '01:00 AM IST',
      },
      {
        name: 'Vivanta Aurangabad Heritage Lawns & Deck',
        location: 'Rauza Baugh, Aurangabad, Maharashtra',
        capacity: Math.max(capacity + 100, 300),
        rating: 4.97,
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        setupTime: '02:00 PM IST',
        cateringPartner: 'Vivanta Master Kitchens',
        securityTier: '5-Star Z+ Tier Security Protocol',
        curfew: '02:00 AM IST',
      },
      {
        name: 'The Meadows Resort & Open Sky Pavilion',
        location: 'Mitcon Lane, Aurangabad, Maharashtra',
        capacity: Math.max(capacity + 80, 250),
        rating: 4.91,
        imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        setupTime: '03:00 PM IST',
        cateringPartner: 'Ajanta Royal Feast Caterers',
        securityTier: 'Private Gate Entry Protocol',
        curfew: '01:00 AM IST',
      },
    ];
  }

  // Mumbai
  if (normCity.includes('mumbai') || normCity.includes('bombay') || normCity.includes('worli')) {
    return [
      {
        name: 'Aer Sky Lounge & Rooftop Terraces',
        location: 'Worli, Mumbai, Maharashtra',
        capacity: Math.max(capacity, 160),
        rating: 4.96,
        imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80',
        setupTime: '05:00 PM IST',
        cateringPartner: 'Spice Symphony Gourmet Banquets',
        securityTier: 'VIP Z+ Heritage Protocol',
        curfew: '03:00 AM IST',
      },
      {
        name: 'Asilo Penthouse Sky Terrace',
        location: 'Lower Parel, Mumbai, Maharashtra',
        capacity: Math.max(capacity, 180),
        rating: 4.92,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        setupTime: '04:00 PM IST',
        cateringPartner: 'Bandra Culinary Collective',
        securityTier: 'Biometric Penthouse Access',
        curfew: '02:30 AM IST',
      },
      {
        name: 'Taj Lands End Seaside Lawns & Deck',
        location: 'Bandra West, Mumbai, Maharashtra',
        capacity: Math.max(capacity + 150, 400),
        rating: 4.98,
        imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        setupTime: '01:00 PM IST',
        cateringPartner: 'Taj Lands End Master Chefs',
        securityTier: 'Diplomatic VIP Protocol',
        curfew: '01:30 AM IST',
      },
    ];
  }

  // Pune
  if (normCity.includes('pune')) {
    return [
      {
        name: 'Atmosphere 6 Sky Lounge & Terrace',
        location: 'Viman Nagar, Pune, Maharashtra',
        capacity: Math.max(capacity, 175),
        rating: 4.93,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        setupTime: '04:00 PM IST',
        cateringPartner: 'Poona Royal Banquets',
        securityTier: 'Smart Pass Protocol',
        curfew: '01:30 AM IST',
      },
      {
        name: 'Paasha Rooftop Deck & Banquets',
        location: 'Senapati Bapat Road, Pune, Maharashtra',
        capacity: Math.max(capacity, 200),
        rating: 4.95,
        imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80',
        setupTime: '05:00 PM IST',
        cateringPartner: 'Marriott Gourmet Kitchen',
        securityTier: 'Executive Guard Protocol',
        curfew: '02:00 AM IST',
      },
    ];
  }

  // Goa
  if (normCity.includes('goa')) {
    return [
      {
        name: 'Marbela Beach Oceanfront Deck & Sky Lounge',
        location: 'Morjim Beach, North Goa',
        capacity: Math.max(capacity, 220),
        rating: 4.96,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        setupTime: '03:00 PM IST',
        cateringPartner: 'Goan Coastal & Mediterranean Grill',
        securityTier: 'Beachside Private Access',
        curfew: '03:30 AM IST',
      },
      {
        name: 'Thalassa Waterfront Terraces & Sunset Pavilion',
        location: 'Siolim, North Goa',
        capacity: Math.max(capacity, 180),
        rating: 4.93,
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
        setupTime: '04:00 PM IST',
        cateringPartner: 'Greek & Seafood Artisans',
        securityTier: 'Private Waterfront Guard Protocol',
        curfew: '02:00 AM IST',
      },
    ];
  }

  // Udaipur / Jaipur
  if (normCity.includes('udaipur') || normCity.includes('jaipur')) {
    return [
      {
        name: normCity.includes('udaipur') ? 'The Oberoi Udaivilas & Grand Palace Lawns' : 'Rambagh Palace Heritage Lawns & Terraces',
        location: `${city}, Rajasthan`,
        capacity: Math.max(capacity + 150, 450),
        rating: 4.98,
        imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        setupTime: '06:00 AM IST',
        cateringPartner: 'Royal Rajputana Culinary & Banquets',
        securityTier: 'Z+ Royal Heritage Protocol',
        curfew: '01:00 AM IST',
      },
      {
        name: 'Fateh Prakash Palace Sunset Terrace',
        location: `${city}, Rajasthan`,
        capacity: Math.max(capacity, 250),
        rating: 4.94,
        imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        setupTime: '08:00 AM IST',
        cateringPartner: 'Mewar Heritage Banquets',
        securityTier: 'Palace Guard Protocol',
        curfew: '01:30 AM IST',
      },
    ];
  }

  // Generic Dynamic Synthesis for ANY Indian City
  const styleLabel = style === 'rooftop' ? 'Sky Deck & Rooftop Lounge' : style === 'lawn' ? 'Grand Heritage Lawns' : style === 'beach' ? 'Coastal Deck & Lounge' : 'Grand Ballroom & Terraces';

  return [
    {
      name: `${city} Horizon ${styleLabel}`,
      location: `${city}, ${state}`,
      capacity: Math.max(capacity, 150),
      rating: 4.93,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      setupTime: '04:00 PM IST',
      cateringPartner: `${city} Royal Culinary Co.`,
      securityTier: 'Private Gate Entry Protocol',
      curfew: eventType === 'birthday' ? '02:00 AM IST' : '01:00 AM IST',
    },
    {
      name: `The Landmark ${style === 'rooftop' ? 'Penthouse Terrace' : 'Palace Banquets'}`,
      location: `Central ${city}, ${state}`,
      capacity: Math.max(capacity + 50, 200),
      rating: 4.89,
      imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80',
      setupTime: '05:00 PM IST',
      cateringPartner: `${city} Gourmet Artisans`,
      securityTier: 'Standard Guest Pass Access',
      curfew: '01:30 AM IST',
    },
    {
      name: `Grand Regency Pavilion & Gardens`,
      location: `${city} Outer Ring Road, ${state}`,
      capacity: Math.max(capacity + 100, 300),
      rating: 4.95,
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      setupTime: '02:00 PM IST',
      cateringPartner: `${city} Master Kitchens`,
      securityTier: 'Executive VIP Protocol',
      curfew: '02:00 AM IST',
    },
  ];
}

/**
 * Generates dynamic Indian vendors matching the specific city and target budget.
 */
export function generateVendorsForLocation(city: string, targetBudget: number, type: EventType): Vendor[] {
  const isBirthday = type === 'birthday';

  return [
    {
      id: `v-${Date.now()}-1`,
      name: `${city} Shahi Catering & Live Counters`,
      category: 'Catering & Bar',
      price: Math.round(targetBudget * 0.28),
      rating: 4.95,
      matchScore: 98,
      description: `Signature banquet menu for ${city} with live chaat stalls, tandoor station, craft mocktails, and late-night biryani.`,
      status: 'contract_signed',
      contactEmail: `catering@${city.toLowerCase().replace(/[^a-z]/g, '')}banquets.in`,
      features: ['Live Tandoor & Chaat', 'Signature Dessert Table', 'Jain & Vegan Options', 'Custom Mocktail Bar'],
    },
    {
      id: `v-${Date.now()}-2`,
      name: `${city} Beat Production & Dhol Symphony`,
      category: 'Music & Entertainment',
      price: Math.round(targetBudget * 0.08),
      rating: 4.92,
      matchScore: 94,
      description: isBirthday
        ? `Club-grade rooftop sound setup, Bollywood & House DJ, intelligent moving heads, and strobe lasers.`
        : `Nashik Dhol troupe, live acoustic setup, wireless sound coverage, and Sangeet cue management.`,
      status: 'contract_signed',
      contactEmail: `sound@${city.toLowerCase().replace(/[^a-z]/g, '')}audio.in`,
      features: ['DMX Intelligent Lighting', 'Dual Wireless Mic System', 'Subwoofer Sound Array', 'DJ Console'],
    },
    {
      id: `v-${Date.now()}-3`,
      name: `${city} Lensworks & 4K Drone Cinema`,
      category: 'Photography & AV',
      price: Math.round(targetBudget * 0.12),
      rating: 4.91,
      matchScore: 92,
      description: '4K cinema cameras, candid coverage, 24-hour Instagram reel delivery, and aerial drone perspective.',
      status: 'contract_pending',
      contactEmail: `bookings@${city.toLowerCase().replace(/[^a-z]/g, '')}lens.in`,
      features: ['4K Video Highlights', 'Candid Portrait Specialist', 'Instagram Reels in 24h', 'Drone Aerials'],
    },
    {
      id: `v-${Date.now()}-4`,
      name: `${city} Floral & Ambient Lighting Craftsmen`,
      category: 'Decor & Florals',
      price: Math.round(targetBudget * 0.10),
      rating: 4.93,
      matchScore: 93,
      description: isBirthday
        ? 'Cyberpunk neon light tunnels, acrylic photo backdrops, customized name signage, and metallic balloon arches.'
        : 'Fresh marigold & mogra torans, royal brass diya urli setups, fairylight canopy, and floral stage backdrop.',
      status: 'contract_pending',
      contactEmail: `decor@${city.toLowerCase().replace(/[^a-z]/g, '')}crafts.in`,
      features: ['Custom Glow Signage', 'Fairy Light Canopy', 'Photo Backdrop Booth', 'Floral Welcome Arch'],
    },
    {
      id: `v-${Date.now()}-5`,
      name: `${city} Artisan Patisserie & Custom Cake Studio`,
      category: 'Bakery & Sweets',
      price: Math.round(targetBudget * 0.04),
      rating: 4.97,
      matchScore: 96,
      description: 'Bespoke tiered celebration cakes, Belgian chocolate petit fours, and traditional saffron mithai hampers.',
      status: 'shortlisted',
      contactEmail: `cakes@${city.toLowerCase().replace(/[^a-z]/g, '')}sweets.in`,
      features: ['Custom Tiered Cake', 'Eggless & Gluten-Free Available', 'Dessert Table Styling'],
    },
  ];
}

/**
 * Generates dynamic milestones tailored to the timeframe (days until event)
 * and celebration context in that city.
 */
export function generateMilestonesForTimeframe(
  dateStr: string,
  city: string,
  eventType: EventType
): Milestone[] {
  const eventDate = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 14) {
    // Event is near (e.g. 8 days)
    return [
      {
        id: `m-${Date.now()}-1`,
        title: `Lock ${city} Venue Deposit & Music Sound License`,
        deadlineDescription: 'Completed at booking',
        dueDate: dateStr,
        completed: true,
        category: 'Legal & Venue',
      },
      {
        id: `m-${Date.now()}-2`,
        title: `Finalize RSVP Headcount with ${city} Caterer`,
        deadlineDescription: 'Catering guarantee submitted',
        dueDate: dateStr,
        completed: true,
        category: 'Vendors',
      },
      {
        id: `m-${Date.now()}-3`,
        title: `Sound Check & DJ Playlist Cue Review for Rooftop`,
        deadlineDescription: 'Stage & audio testing',
        dueDate: dateStr,
        completed: true,
        category: 'Vendors',
      },
      {
        id: `m-${Date.now()}-4`,
        title: `Weather Contingency Canopy & Ambient Lighting Inspection`,
        deadlineDescription: '3 days prior to party',
        dueDate: dateStr,
        completed: false,
        category: 'Day-Of Logistics',
      },
      {
        id: `m-${Date.now()}-5`,
        title: `Final Guest Entry Protocol & Birthday Cake Delivery Coordination`,
        deadlineDescription: 'Event day morning setup',
        dueDate: dateStr,
        completed: false,
        category: 'Day-Of Logistics',
      },
    ];
  }

  // Standard medium-range timeline
  return [
    {
      id: `m-${Date.now()}-1`,
      title: `Finalize Contract with ${city} Primary Venue`,
      deadlineDescription: 'Venue lock-in',
      dueDate: dateStr,
      completed: true,
      category: 'Legal & Venue',
    },
    {
      id: `m-${Date.now()}-2`,
      title: `Curate Tasting Menu with ${city} Gourmet Caterers`,
      deadlineDescription: 'Chef review',
      dueDate: dateStr,
      completed: true,
      category: 'Vendors',
    },
    {
      id: `m-${Date.now()}-3`,
      title: `Deploy WhatsApp & Digital Invitation Invites`,
      deadlineDescription: 'Initial invitations dispatched',
      dueDate: dateStr,
      completed: false,
      category: 'Guests & Invites',
    },
    {
      id: `m-${Date.now()}-4`,
      title: `Sign Vendor Contracts for Sound, Lighting & Cinematography`,
      deadlineDescription: 'Vendor confirmation',
      dueDate: dateStr,
      completed: false,
      category: 'Vendors',
    },
    {
      id: `m-${Date.now()}-5`,
      title: `Floral & Aesthetic Mockup Approval`,
      deadlineDescription: 'Decor review',
      dueDate: dateStr,
      completed: false,
      category: 'Decor & Aesthetics',
    },
  ];
}
