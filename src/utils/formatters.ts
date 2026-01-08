// Format phone number: (00) 00000-0000
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// Format currency: R$ 1.234,56
export const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits === '') return '';
  
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Parse formatted currency to number
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

// Format CEP: 00000-000
export const formatCEP = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

// Interface for ViaCEP response
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// Fetch address from CEP using ViaCEP API
export const fetchAddressByCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return data as ViaCEPResponse;
  } catch (error) {
    console.error('Error fetching CEP:', error);
    return null;
  }
};
