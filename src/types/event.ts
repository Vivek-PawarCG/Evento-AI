export type EventType = 'wedding' | 'birthday' | 'community' | 'gala';

export interface BudgetItem {
  id: string;
  category: 'Venue & Rentals' | 'Catering & Bar' | 'Photography & AV' | 'Decor & Florals' | 'Entertainment' | 'Contingency';
  allocated: number;
  spent: number;
  min: number;
  max: number;
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  matchScore: number; // e.g. 98 for 98%
  description: string;
  status: 'contacted' | 'shortlisted' | 'contract_pending' | 'contract_signed' | 'paid';
  contactEmail: string;
  features: string[];
}

export interface Milestone {
  id: string;
  title: string;
  deadlineDescription: string;
  dueDate: string;
  completed: boolean;
  category: 'Legal & Venue' | 'Vendors' | 'Guests & Invites' | 'Decor & Aesthetics' | 'Day-Of Logistics';
}

export interface DietaryBreakdown {
  standard: number;
  vegetarianVegan: number;
  glutenFree: number;
  halalKosher: number;
  allergies: number;
}

export interface VenueInfo {
  name: string;
  location: string;
  capacity: number;
  rating: number;
  imageUrl: string;
  setupTime: string;
  cateringPartner: string;
  securityTier: string;
  curfew: string;
}

export interface AIConceptCard {
  id: string;
  title: string;
  category: 'Theme & Decor' | 'Culinary & Cocktails' | 'Music & Vibe' | 'Guest Experience';
  description: string;
  badge: string;
  paletteColors: string[];
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini' | 'system';
  content: string;
  timestamp: string;
  actionsTaken?: string[];
}

export interface EventPlan {
  id: string;
  title: string;
  type: EventType;
  date: string;
  targetBudget: number;
  guestCount: number;
  rsvpConfirmed: number;
  rsvpDeclined: number;
  theme: string;
  colorPalette: {
    name: string;
    hexCodes: string[];
  };
  venue: VenueInfo;
  suggestedVenues?: VenueInfo[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  milestones: Milestone[];
  dietary: DietaryBreakdown;
  concepts: AIConceptCard[];
  copilotHistory: ChatMessage[];
}
