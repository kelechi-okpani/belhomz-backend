export enum LeadStage {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  INSPECTION_BOOKED = "INSPECTION_BOOKED",
  NEGOTIATION = "NEGOTIATION",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST",
}

export interface LeadActivity {
  note: string;
  createdBy: string;
  createdAt: Date;
}

export interface IInspection {
  scheduledAt: Date;
  location: string;
  notes?: string;
  completed: boolean;
}

export interface ILead {
  _id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  property?: string; // property id
  assignedAgent: string; // user id
  stage: LeadStage;
  activities: LeadActivity[];
  inspection?: IInspection;
  createdAt: Date;
  updatedAt: Date;
}
