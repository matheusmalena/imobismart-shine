import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  BarChart3, 
  FileText, 
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

const TUTORIAL_KEY = 'imobismart-tutorial-completed';

interface TutorialSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips: string[];
}

const slides: TutorialSlide[] = [
  {
    icon: <BarChart3 className="h-12 w-12" />,
    title: 'Bem-vindo ao ImobiSmart!',
    description: 'Sua plataforma inteligente de gestão imobiliária. Vamos fazer um tour rápido para você aproveitar ao máximo.',
    tips: [
      'Dashboard com métricas em tempo real',
      'Visualize receitas, custos e ROI',
      'Acompanhe a performance de cada imóvel',
    ],
  },
  {
    icon: <Building2 className="h-12 w-12" />,
    title: 'Cadastre seus Imóveis',
    description: 'Adicione seus imóveis com todas as informações importantes: endereço, tipo, valor, custos e receitas.',
    tips: [
      'Clique em "Novo Imóvel" para adicionar',
      'Preencha os dados de localização e valores',
      'Adicione fotos para identificar facilmente',
    ],
  },
  {
    icon: <FileText className="h-12 w-12" />,
    title: 'Organize Documentos',
    description: 'Armazene contratos, matrículas, IPTUs e laudos de forma organizada por imóvel e categoria.',
    tips: [
      'Acesse a seção "Documentos" no menu',
      'Faça upload de PDFs e imagens',
      'Categorize por tipo de documento',
    ],
  },
  {
    icon: <Settings className="h-12 w-12" />,
    title: 'Pronto para começar!',
    description: 'Você está preparado para gerenciar seus imóveis de forma inteligente. Explore a plataforma!',
    tips: [
      'Acesse as Configurações para seu perfil',
      'Use o modo escuro se preferir',
      'Faça upgrade para desbloquear mais recursos',
    ],
  },
];

export function TutorialModal() {
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_KEY);
    if (!completed) {
      // Small delay to ensure smooth page load
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setOpen(false);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const slide = slides[currentSlide];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="gradient-hero p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white mb-4">
            {slide.icon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{slide.title}</h2>
          <p className="text-white/80 text-sm">{slide.description}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <ul className="space-y-3">
            {slide.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 py-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Pular tutorial
            </Button>
            <div className="flex gap-2">
              {currentSlide > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentSlide < slides.length - 1 ? (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Começar
                    <Check className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
