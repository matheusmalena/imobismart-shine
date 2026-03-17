import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
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

  const handleVerify = async (otpCode: string) => {
    if (otpCode.length !== 6) { setError('Digite o código de 6 dígitos'); return; }
    setIsVerifying(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-login-otp', { body: { email, code: otpCode } });
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

  // Auto-bypass OTP for @teste.com accounts
  useEffect(() => {
    if (email.endsWith('@teste.com')) {
      handleVerify('000000');
    }
  }, [email]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (code.length === 6) {
      handleVerify(code);
    }
  }, [code]);

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
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-center block text-sm font-medium text-muted-foreground">
          Código de Verificação
        </Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => { setCode(value); setError(''); }}
            disabled={isVerifying}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-12 w-12 text-lg font-semibold" />
              <InputOTPSlot index={1} className="h-12 w-12 text-lg font-semibold" />
              <InputOTPSlot index={2} className="h-12 w-12 text-lg font-semibold" />
              <InputOTPSlot index={3} className="h-12 w-12 text-lg font-semibold" />
              <InputOTPSlot index={4} className="h-12 w-12 text-lg font-semibold" />
              <InputOTPSlot index={5} className="h-12 w-12 text-lg font-semibold" />
            </InputOTPGroup>
          </InputOTP>
        </div>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">Voltar</Button>
        <Button onClick={() => handleVerify(code)} disabled={isVerifying || code.length !== 6} className="flex-1">
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
          Enviamos um código de 6 dígitos para <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
