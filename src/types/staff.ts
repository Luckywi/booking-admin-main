export interface Staff {
    id: string;
    businessId: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    color?: string;
    vacationPeriods: VacationPeriod[];
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