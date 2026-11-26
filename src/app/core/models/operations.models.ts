export interface UpdateOwnProfilePayload {
  firstName: string;
  lastName: string;
  phone: string | null;
  specialties?: string | null;
  experienceYears?: number | null;
  serviceZone?: string | null;
  businessName?: string | null;
  publicRegion?: string | null;
  avatarUrl?: string | null;
}

export interface PostalCodeLookupDto {
  postalCode: string;
  found: boolean;
  state: string | null;
  municipality: string | null;
  city: string | null;
  neighborhoods: string[];
}

export interface UploadedImageDto {
  imageUrl: string;
}

export interface PublicLocationDto {
  postalCode: string;
  state: string;
  municipality: string;
  city: string | null;
  neighborhood: string;
}

export interface FullAddressDto {
  street: string;
  exteriorNumber: string | null;
  interiorNumber: string | null;
  addressReference: string | null;
}

export interface ImageItemDto {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

export type RepairStatusCode =
  | 'Open'
  | 'Assigned'
  | 'Scheduled'
  | 'OnTheWay'
  | 'Arrived'
  | 'InProgress'
  | 'ClosureRequested'
  | 'Completed'
  | 'Cancelled';

export interface OpenRepairBoardItemDto {
  id: string;
  applianceName: string;
  brandModel: string | null;
  issueSummary: string;
  preferredDate: string;
  preferredTimeSlot: string;
  location: PublicLocationDto;
  status: RepairStatusCode;
  statusLabel: string;
  imageCount: number;
  thumbnailUrl: string | null;
  createdAt: string;
  imageUrls?: string[];
}

export interface ClientRepairSummaryDto {
  id: string;
  applianceName: string;
  brandModel: string | null;
  issueSummary: string;
  preferredDate: string;
  preferredTimeSlot: string;
  location: PublicLocationDto;
  status: RepairStatusCode;
  statusLabel: string;
  assignedTechnicianName: string | null;
  scheduledStartAt: string | null;
  closureRequestedAt: string | null;
  completedAt: string | null;
  imageCount: number;
  thumbnailUrl: string | null;
  createdAt: string;
  imageUrls?: string[];
}

export interface ItineraryItemDto {
  id: string;
  applianceName: string;
  brandModel: string | null;
  clientDisplayName: string;
  location: PublicLocationDto;
  fullAddress: FullAddressDto;
  preferredDate: string;
  preferredTimeSlot: string;
  scheduledStartAt: string | null;
  status: RepairStatusCode;
  statusLabel: string;
  hasScheduleOverlap: boolean;
  assignedAt: string;
  imageCount: number;
  thumbnailUrl: string | null;
  imageUrls?: string[];
}

export interface RepairDetailDto {
  id: string;
  clientUserId: string;
  clientDisplayName: string;
  assignedTechnicianId: string | null;
  assignedTechnicianName: string | null;
  applianceName: string;
  brandModel: string | null;
  issueDescription: string;
  preferredDate: string;
  preferredTimeSlot: string;
  location: PublicLocationDto;
  fullAddress: FullAddressDto | null;
  status: RepairStatusCode;
  statusLabel: string;
  assignedAt: string | null;
  scheduledStartAt: string | null;
  startedAt: string | null;
  closureRequestedAt: string | null;
  closureNotes: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: ImageItemDto[];
  conversationId: string | null;
  enRouteAt?: string | null;
  estimatedArrivalMinutes?: number | null;
  arrivedAt?: string | null;
  clientArrivalPin?: string | null;
  requiresArrivalPin?: boolean;
  closureRejectionReason?: string | null;
  cancellationReason?: string | null;
  assignedTechnicianAvatarUrl?: string | null;
  clientAvatarUrl?: string | null;
}

export interface OverlappingAppointmentDto {
  repairRequestId: string;
  applianceName: string;
  scheduledStartAt: string;
}

export interface ScheduleRepairResponse {
  repair: RepairDetailDto;
  hasScheduleOverlap: boolean;
  overlappingAppointments: OverlappingAppointmentDto[];
}

export interface CreateRepairRequestPayload {
  applianceName: string;
  brandModel: string | null;
  issueDescription: string;
  preferredDate: string;
  preferredTimeSlot: string;
  postalCode: string;
  state: string;
  municipality: string;
  city: string | null;
  neighborhood: string;
  street: string;
  exteriorNumber: string | null;
  interiorNumber: string | null;
  addressReference: string | null;
  imageUrls: string[];
}

export type SparePartConditionCode = 'New' | 'Used' | 'Refurbished';
export type SparePartModalityCode = 'Sale' | 'Exchange' | 'SaleOrExchange';

export interface SparePartSummaryDto {
  id: string;
  technicianUserId: string;
  technicianDisplayName: string;
  technicianZone: string | null;
  title: string;
  descriptionSummary: string;
  applianceCategory: string;
  compatibility: string | null;
  condition: SparePartConditionCode;
  conditionLabel: string;
  modality: SparePartModalityCode;
  modalityLabel: string;
  priceMxn: number;
  isAvailable: boolean;
  availabilityLabel: string;
  imageCount: number;
  thumbnailUrl: string | null;
  createdAt: string;
  imageUrls?: string[];
}

export interface SparePartDetailDto {
  id: string;
  technicianUserId: string;
  technicianDisplayName: string;
  technicianBusinessName: string | null;
  technicianZone: string | null;
  title: string;
  description: string;
  applianceCategory: string;
  compatibility: string | null;
  condition: SparePartConditionCode;
  conditionLabel: string;
  modality: SparePartModalityCode;
  modalityLabel: string;
  priceMxn: number;
  contactPhone: string | null;
  contactEmail: string | null;
  contactNotes: string | null;
  isAvailable: boolean;
  availabilityLabel: string;
  createdAt: string;
  updatedAt: string;
  images: ImageItemDto[];
  isOwner: boolean;
  technicianAvatarUrl?: string | null;
}

export interface UpsertSparePartPayload {
  title: string;
  description: string;
  applianceCategory: string;
  compatibility: string | null;
  condition: SparePartConditionCode;
  modality: SparePartModalityCode;
  priceMxn: number;
  contactPhone: string | null;
  contactEmail: string | null;
  contactNotes: string | null;
  imageUrls: string[];
}

export interface ChatConversationSummaryDto {
  id: string;
  contextType: 'RepairRequest' | 'SparePart';
  contextId: string;
  contextTitle: string;
  contextStatusLabel: string;
  counterpartUserId: string;
  counterpartDisplayName: string;
  counterpartRoleLabel: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isReadOnly: boolean;
  counterpartAvatarUrl?: string | null;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderDisplayName: string;
  isMine: boolean;
  body: string;
  sentAt: string;
  readAt: string | null;
  imageUrl?: string | null;
}

export interface ChatThreadDto {
  conversation: ChatConversationSummaryDto;
  messages: ChatMessageDto[];
}

export interface UnreadCountDto {
  unreadCount: number;
}

export interface PublicReviewItemDto {
  id: string;
  repairRequestId: string;
  rating: number;
  comment: string | null;
  applianceName: string;
  reviewerDisplayName: string;
  createdAt: string;
}

export interface PublicTechnicianProfileDto {
  technicianUserId: string;
  displayName: string;
  businessName: string | null;
  specialties: string;
  experienceYears: number;
  serviceZone: string;
  memberSinceUtc: string;
  completedServicesCount: number;
  reviewCount: number;
  averageRating: number | null;
  reviews: PublicReviewItemDto[];
  avatarUrl?: string | null;
}

export interface PublicClientProfileDto {
  clientUserId: string;
  displayName: string;
  publicRegion: string | null;
  memberSinceUtc: string;
  completedServicesCount: number;
  avatarUrl?: string | null;
}

export interface CreateServiceReviewPayload {
  rating: number;
  comment: string | null;
}

export interface UserNotificationDto {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  unreadCount: number;
  items: UserNotificationDto[];
}

export interface VapidPublicKeyResponse {
  enabled: boolean;
  publicKey: string | null;
}
