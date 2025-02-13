// src/types/business.ts
export interface OpeningHours {
    day: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    breakPeriods?: BreakPeriod[];
  }
  
  export interface BreakPeriod {
    start: string;    // Format "HH:mm"
    end: string;      // Format "HH:mm"
    label?: string;   // Ex: "Pause déjeuner"
}

export interface VacationPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  title: string;
  description?: string;
  type: 'business' | 'staff';
  entityId: string; // businessId ou staffId selon le type
  createdAt: Date;
}


  export interface BusinessHours {
    id: string;
    businessId: string;
    hours: {
      monday: OpeningHours;
      tuesday: OpeningHours;
      wednesday: OpeningHours;
      thursday: OpeningHours;
      friday: OpeningHours;
      saturday: OpeningHours;
      sunday: OpeningHours;
    };
    vacationPeriods: VacationPeriod[];

  }

  // Ajouter cette interface pour les horaires des collaborateurs
export interface StaffHours {
  id: string;
  staffId: string;
  businessId: string;
  hours: {
    monday: OpeningHours;
    tuesday: OpeningHours;
    wednesday: OpeningHours;
    thursday: OpeningHours;
    friday: OpeningHours;
    saturday: OpeningHours;
    sunday: OpeningHours;
  };
}