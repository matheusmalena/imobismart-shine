import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmailOTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
  inline?: boolean;
}

export function EmailOTPVerification({ email, onSuccess, onCancel, inline }: EmailOTPVerificationProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length !== 4) { setError('Digite o código de 4 dígitos'); return; }
    setIsVerifying(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-login-otp', { body: { email, code } });
      if (fnError || !data?.success) {
        setError(data?.error || 'Código inválido ou expirado');
        toast.error('Código inválido ou expirado');
        setIsVerifying(false);
        return;
      }
      onSuccess();
    } catch {
      setError('Erro ao verificar código');
      toast.error('Erro ao verificar código');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-login-otp', { body: { email } });
      if (fnError || !data?.success) { toast.error('Erro ao reenviar código'); }
      else { toast.success('Novo código enviado para seu email'); }
    } catch { toast.error('Erro ao reenviar código'); }
    finally { setIsResending(false); }
  };

  const content = (
    <div className="space-y-4">
      {inline && (
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="otp-code">Código de Verificação</Label>
        <Input
          id="otp-code" type="text" inputMode="numeric" pattern="[0-9]*"
          maxLength={4} placeholder="0000" value={code}
          onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          className="text-center text-3xl tracking-[0.5em] font-mono" autoFocus
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">Voltar</Button>
        <Button onClick={handleVerify} disabled={isVerifying || code.length !== 4} className="flex-1">
          {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verificar
        </Button>
      </div>
      <div className="text-center">
        <button type="button" onClick={handleResend} disabled={isResending}
          className="text-sm text-primary hover:underline disabled:opacity-50">
          {isResending ? 'Reenviando...' : 'Reenviar código'}
        </button>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle>Verificação por Email</CardTitle>
        <CardDescription>
          Enviamos um código de 4 dígitos para <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
