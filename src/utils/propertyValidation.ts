import { z } from 'zod';
import type { PropertyFormData } from '@/types/property';

export type PropertyValidationErrors = Partial<
  Record<keyof PropertyFormData | 'address_minimum', string>
>;

const cepDigits = (value: string) => (value ?? '').replace(/\D/g, '');

const isValidUF = (value: string) => {
  const v = (value ?? '').trim();
  return /^[A-Za-z]{2}$/.test(v);
};

export function getPropertyValidationErrors(data: PropertyFormData): PropertyValidationErrors {
  const errors: PropertyValidationErrors = {};

  const zipOk = cepDigits(data.address_zip).length === 8;
  const streetOk = (data.address_street ?? '').trim().length > 0;
  const numberOk = (data.address_number ?? '').trim().length > 0;
  const cityOk = (data.address_city ?? '').trim().length > 0;
  const stateOk = isValidUF(data.address_state);

  const addressOk = zipOk || (streetOk && numberOk && cityOk && stateOk);
  if (!addressOk) {
    errors.address_minimum = 'Informe um CEP válido (8 dígitos) ou Rua + Número + Cidade + UF.';
  }

  if (!(Number(data.property_value) > 0)) {
    errors.property_value = 'Valor do imóvel é obrigatório.';
  }

  if (data.status === 'alugado' && !(Number(data.monthly_revenue) > 0)) {
    errors.monthly_revenue = 'Receita mensal é obrigatória quando o imóvel está alugado.';
  }

  return errors;
}

const propertyFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Nome do imóvel é obrigatório.'),
    property_type: z.any(),
    status: z.any(),
    address_street: z.string().optional().default(''),
    address_number: z.string().optional().default(''),
    address_complement: z.string().optional().default(''),
    address_neighborhood: z.string().optional().default(''),
    address_city: z.string().optional().default(''),
    address_state: z.string().optional().default(''),
    address_zip: z.string().optional().default(''),
    property_value: z.number(),
    monthly_revenue: z.number(),
    occupancy_rate: z.number(),
    acquisition_date: z.string().optional().default(''),
    condominium_fee: z.number(),
    iptu_fee: z.number(),
    maintenance_fee: z.number(),
    other_costs: z.number(),
    area_sqm: z.number(),
    bedrooms: z.number(),
    bathrooms: z.number(),
    parking_spots: z.number(),
    suites: z.number(),
    has_pool: z.boolean(),
    has_gym: z.boolean(),
    has_elevator: z.boolean(),
    has_balcony: z.boolean(),
    has_barbecue: z.boolean(),
    is_furnished: z.boolean(),
    floor_number: z.number().nullable(),
    year_built: z.number().nullable(),
    description: z.string().optional().default(''),
    other_amenities: z.string().optional().default(''),
    photo_url: z.string().nullable().optional(),
  })
  .passthrough();

export function validateAndNormalizePropertyFormData(input: PropertyFormData): PropertyFormData {
  // Basic shape/type safety
  const parsed = propertyFormSchema.parse(input) as PropertyFormData;

  const normalized: PropertyFormData = {
    ...parsed,
    name: parsed.name.trim(),
    address_street: (parsed.address_street ?? '').trim(),
    address_number: (parsed.address_number ?? '').trim(),
    address_complement: (parsed.address_complement ?? '').trim(),
    address_neighborhood: (parsed.address_neighborhood ?? '').trim(),
    address_city: (parsed.address_city ?? '').trim(),
    address_state: (parsed.address_state ?? '').trim().toUpperCase(),
    address_zip: (parsed.address_zip ?? '').trim(),
    property_value: Math.max(0, Number(parsed.property_value) || 0),
    monthly_revenue: Math.max(0, Number(parsed.monthly_revenue) || 0),
    occupancy_rate: Math.min(100, Math.max(0, Number(parsed.occupancy_rate) || 0)),
  };

  const errors = getPropertyValidationErrors(normalized);
  if (Object.keys(errors).length) {
    // Single message for toast/errors
    const message =
      errors.address_minimum ||
      errors.property_value ||
      errors.monthly_revenue ||
      'Dados do imóvel inválidos.';
    throw new Error(message);
  }

  return normalized;
}
