import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MFAVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MFAVerification({ onSuccess, onCancel }: MFAVerificationProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Digite o código de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factors.totp.find(f => f.status === 'verified');
      if (!totpFactor) {
        throw new Error('Nenhum fator TOTP encontrado');
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Código inválido');
      toast.error('Código de verificação inválido');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle>Verificação em Duas Etapas</CardTitle>
        <CardDescription>
          Digite o código do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Código de Verificação</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="text-center text-2xl tracking-[0.5em] font-mono"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Voltar
          </Button>
          <Button onClick={handleVerify} disabled={isVerifying || code.length !== 6} className="flex-1">
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verificar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}