import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // No session — show success anyway after a few tries
        if (attempts >= 3) setConfirmed(true);
        return;
      }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', session.user.id)
        .single();

      if (sub && sub.plan !== 'free' && sub.status === 'active') {
        queryClient.invalidateQueries({ queryKey: ['user-data'] });
        setConfirmed(true);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        queryClient.invalidateQueries({ queryKey: ['user-data'] });
        setConfirmed(true);
        return;
      }

      setTimeout(poll, 3000);
    };

    poll();
  }, [queryClient]);

  if (!confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground font-medium">Processando seu pagamento...</p>
        <p className="text-sm text-muted-foreground">Aguarde enquanto confirmamos sua assinatura.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      <div className="absolute top-[-120px] left-[-80px] w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-60px] w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mb-6 ring-4 ring-emerald-500/10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 250, damping: 12 }}
            className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <Check className="h-7 w-7 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            style={{
              top: `${20 + Math.sin(i * 1.2) * 30}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-3xl font-bold tracking-tight text-foreground mb-3"
        >
          Obrigado pela sua compra!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-muted-foreground text-base mb-8 leading-relaxed"
        >
          Seu plano foi ativado com sucesso. Aproveite todos os recursos disponíveis para gerenciar seu portfólio imobiliário.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="flex flex-col gap-3 w-full"
        >
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="gap-2 w-full font-semibold"
          >
            Acessar Plataforma
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            Voltar ao início
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
