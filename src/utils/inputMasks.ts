// Input mask utilities for Brazilian document formats

export function formatCPF(value: string): string {
  // Remove non-digits
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  // Apply mask: ###.###.###-##
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhone(value: string): string {
  // Remove non-digits
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  // Apply mask: (##) #####-#### or (##) ####-####
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    const isNineDigit = digits.length > 10;
    const splitPoint = isNineDigit ? 7 : 6;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, splitPoint)}-${digits.slice(splitPoint)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatRG(value: string): string {
  // Remove special characters but keep alphanumeric (RG can have X at the end)
  const cleaned = value.replace(/[^0-9A-Za-z]/g, '').slice(0, 12).toUpperCase();
  
  // Apply common mask: ##.###.###-#
  const digits = cleaned.replace(/[^0-9]/g, '');
  const suffix = cleaned.replace(/[0-9]/g, ''); // Get any letters (like X)
  
  if (digits.length <= 2) return digits + suffix;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}${suffix}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}${suffix}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}${suffix}`;
}

// Unformat functions to get raw values
export function unformatCPF(value: string): string {
  return value.replace(/\D/g, '');
}

export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function unformatRG(value: string): string {
  return value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}
