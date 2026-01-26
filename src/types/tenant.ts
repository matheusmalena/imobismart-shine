export interface Tenant {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  rg: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantFormData {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  notes?: string;
}

export interface LeaseContract {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number | null;
  payment_due_day: number | null;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  notes: string | null;
  contract_file_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  tenant?: Tenant;
  property?: {
    id: string;
    name: string;
    photo_url: string | null;
  };
}

export interface LeaseContractFormData {
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount?: number;
  payment_due_day?: number;
  status?: 'active' | 'expired' | 'terminated' | 'pending';
  notes?: string;
  contract_file?: File | null;
  contract_file_url?: string | null;
}

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  expired: 'Expirado',
  terminated: 'Rescindido',
  pending: 'Pendente',
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  terminated: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};
