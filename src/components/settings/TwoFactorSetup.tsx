import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Smartphone, Shield, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function TwoFactorSetup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const verifiedFactor = data.totp.find(f => f.status === 'verified');
      setIsEnabled(!!verifiedFactor);
    } catch (error) {
      console.error('Erro ao verificar status MFA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (isEnabled) {
      setShowDisableDialog(true);
    } else {
      await startEnrollment();
    }
  };

  const startEnrollment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setShowEnrollDialog(true);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar configuração 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Digite o código de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      setIsEnabled(true);
      setShowEnrollDialog(false);
      setVerifyCode('');
      toast.success('Autenticação de dois fatores ativada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Código inválido. Tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const disableMFA = async () => {
    setIsLoading(true);
    try {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const verifiedFactor = data.totp.find(f => f.status === 'verified');
      if (!verifiedFactor) {
        setIsEnabled(false);
        setShowDisableDialog(false);
        return;
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      });

      if (error) throw error;

      setIsEnabled(false);
      setShowDisableDialog(false);
      toast.success('Autenticação de dois fatores desativada');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao desativar 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const cancelEnrollment = async () => {
    if (factorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId });
      } catch (error) {
        // Ignore error on cancel
      }
    }
    setShowEnrollDialog(false);
    setVerifyCode('');
    setQrCode('');
    setSecret('');
    setFactorId('');
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Autenticação de Dois Fatores (2FA)</p>
            <p className="text-sm text-muted-foreground">
              Adicione uma camada extra de segurança usando um aplicativo autenticador.
            </p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>

      {isEnabled && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-600">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Autenticação de dois fatores está ativa</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sua conta está protegida com verificação em duas etapas.
          </p>
        </div>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={(open) => !open && cancelEnrollment()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Autenticação de Dois Fatores</DialogTitle>
            <DialogDescription>
              Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {qrCode && (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">
                Ou digite o código manualmente:
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-xs font-mono break-all">
                  {secret}
                </code>
                <Button variant="outline" size="icon" onClick={copySecret}>
                  {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Código de Verificação</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Digite o código de 6 dígitos do seu aplicativo autenticador
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={cancelEnrollment} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={verifyAndEnable} disabled={isVerifying || verifyCode.length !== 6} className="flex-1">
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ativar 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar 2FA</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desativar a autenticação de dois fatores? Sua conta ficará menos protegida.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDisableDialog(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={disableMFA} disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desativar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}