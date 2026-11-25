export type UserRole = 'Client' | 'Technician';

export interface TechnicianProfileDto {
  specialties: string;
  experienceYears: number;
  serviceZone: string;
  businessName: string | null;
}

export interface UserSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  technicianProfile: TechnicianProfileDto | null;
}

export interface AuthSessionResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: UserSummaryDto;
}

export interface RegistrationResponse {
  message: string;
  email: string;
  requiresEmailVerification: boolean;
}

export interface GenericMessageResponse {
  message: string;
}

export interface RegisterClientPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
}

export interface RegisterTechnicianPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  specialties: string;
  experienceYears: number;
  serviceZone: string;
  businessName: string | null;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ConfirmPasswordResetPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface ApiProblemResponse {
  title?: string;
  detail?: string;
  code?: string;
  errors?: string[];
}
