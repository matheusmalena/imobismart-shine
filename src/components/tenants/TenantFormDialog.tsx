import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tenant, TenantFormData } from '@/types/tenant';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Helper function to validate CPF with check digits (Brazilian algorithm)
function isValidCPF(cpf: string): boolean {
  // Remove non-digits
  const cleaned = cpf.replace(/\D/g, '');
  
  // Must have 11 digits
  if (cleaned.length !== 11) return false;
  
  // Check for known invalid patterns (all same digits)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;
  
  return true;
}

// Helper function to validate Brazilian phone format
function isValidPhone(phone: string): boolean {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Brazilian phones: 10-11 digits (with DDD)
  return cleaned.length >= 10 && cleaned.length <= 11;
}

// Helper function to sanitize input - removes potential script/injection characters
function sanitizeInput(value: string): string {
  return value
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"`;]/g, '') // Remove potentially dangerous characters
    .trim();
}

const formSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .transform(sanitizeInput)
    .refine(val => val.length >= 2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string()
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .transform(val => val.trim().toLowerCase())
    .refine(val => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Email inválido')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .refine(val => val === '' || isValidPhone(val), 'Telefone inválido. Use formato: (00) 00000-0000')
    .optional()
    .or(z.literal('')),
  cpf: z.string()
    .max(14, 'CPF deve ter no máximo 14 caracteres')
    .refine(val => val === '' || isValidCPF(val), 'CPF inválido. Verifique os dígitos')
    .optional()
    .or(z.literal('')),
  rg: z.string()
    .max(20, 'RG deve ter no máximo 20 caracteres')
    .transform(val => val.replace(/[^0-9A-Za-z.-]/g, '')) // Allow only alphanumeric and common separators
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(200, 'Endereço deve ter no máximo 200 caracteres')
    .transform(sanitizeInput)
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(500, 'Observações deve ter no máximo 500 caracteres')
    .transform(sanitizeInput)
    .optional()
    .or(z.literal('')),
});

interface TenantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onSubmit: (data: TenantFormData) => void;
  isLoading: boolean;
}

export function TenantFormDialog({
  open,
  onOpenChange,
  tenant,
  onSubmit,
  isLoading,
}: TenantFormDialogProps) {
  const form = useForm<TenantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      rg: '',
      address: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name,
        email: tenant.email || '',
        phone: tenant.phone || '',
        cpf: tenant.cpf || '',
        rg: tenant.rg || '',
        address: tenant.address || '',
        notes: tenant.notes || '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        rg: '',
        address: '',
        notes: '',
      });
    }
  }, [tenant, form]);

  const handleSubmit = (data: TenantFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tenant ? 'Editar Inquilino' : 'Novo Inquilino'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do inquilino" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço do inquilino" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o inquilino..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {tenant ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
