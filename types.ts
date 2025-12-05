export enum ServiceType {
  EditorialAssessment = 'Editorial Assessment',
  Ghostwriting = 'Ghostwriting',
  CopyEditing = 'Copy Editing',
  CoverDesign = 'Cover Design',
  BookMarketing = 'Book Marketing',
  AudiobookProduction = 'Audiobook Production',
  GeneralInquiry = 'General Inquiry'
}

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  icon: string;
  priceRange: string;
  type: ServiceType;
}

export interface FormState {
  name: string;
  email: string;
  service: ServiceType;
  message: string;
}

export enum AgentStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error'
}