export type PropertyType = 'apartamento' | 'casa' | 'comercial' | 'terreno' | 'galpao' | 'sala' | 'loja' | 'outro';
export type PropertyStatus = 'alugado' | 'vago' | 'em_reforma' | 'a_venda' | 'vendido';
export type DocumentCategory = 'matricula' | 'iptu' | 'contrato' | 'laudo' | 'outro';

export interface Property {
  id: string;
  user_id: string;
  name: string;
  property_type: PropertyType;
  status: PropertyStatus;
  
  // Address
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  
  // Financial
  property_value: number;
  monthly_revenue: number;
  occupancy_rate: number;
  acquisition_date: string | null;
  
  // Costs
  condominium_fee: number;
  iptu_fee: number;
  maintenance_fee: number;
  other_costs: number;
  
  // Physical characteristics
  area_sqm: number | null;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  suites: number;
  has_pool: boolean;
  has_gym: boolean;
  has_elevator: boolean;
  has_balcony: boolean;
  has_barbecue: boolean;
  is_furnished: boolean;
  floor_number: number | null;
  year_built: number | null;
  description: string | null;
  other_amenities: string | null;
  
  // Photo
  photo_url: string | null;
  
  // Metadata
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  user_id: string;
  name: string;
  category: DocumentCategory;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyFormData {
  name: string;
  property_type: PropertyType;
  status: PropertyStatus;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  property_value: number;
  monthly_revenue: number;
  occupancy_rate: number;
  acquisition_date: string;
  condominium_fee: number;
  iptu_fee: number;
  maintenance_fee: number;
  other_costs: number;
  area_sqm: number;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  suites: number;
  has_pool: boolean;
  has_gym: boolean;
  has_elevator: boolean;
  has_balcony: boolean;
  has_barbecue: boolean;
  is_furnished: boolean;
  floor_number: number | null;
  year_built: number | null;
  description: string;
  other_amenities: string;
  photo_url?: string | null;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  comercial: 'Comercial',
  terreno: 'Terreno',
  galpao: 'Galpão',
  sala: 'Sala',
  loja: 'Loja',
  outro: 'Outro',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  alugado: 'Alugado',
  vago: 'Vago',
  em_reforma: 'Em Reforma',
  a_venda: 'À Venda',
  vendido: 'Vendido',
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  matricula: 'Matrícula',
  iptu: 'IPTU',
  contrato: 'Contrato',
  laudo: 'Laudo',
  outro: 'Outro',
};
