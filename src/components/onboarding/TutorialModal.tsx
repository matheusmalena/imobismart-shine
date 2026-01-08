import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  BarChart3, 
  FileText, 
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
  MousePointer,
} from 'lucide-react';

const TUTORIAL_KEY = 'imobismart-tutorial-completed';

interface TutorialSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips: string[];
  screenshot: string;
  highlightArea?: string;
}

const slides: TutorialSlide[] = [
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Bem-vindo ao ImobiSmart!',
    description: 'Sua plataforma inteligente de gestão imobiliária. Veja como usar cada recurso.',
    tips: [
      'O Dashboard mostra todas suas métricas',
      'Visualize receitas, custos e ROI em tempo real',
      'Acompanhe a performance de cada imóvel',
    ],
    screenshot: '/images/tutorial-dashboard.png?v=2',
    highlightArea: 'dashboard',
  },
  {
    icon: <Building2 className="h-8 w-8" />,
    title: 'Cadastre seus Imóveis',
    description: 'Clique em "Imóveis" no menu lateral e depois em "Novo Imóvel" para adicionar.',
    tips: [
      'Acesse o menu "Imóveis" na barra lateral',
      'Clique no botão verde "Novo Imóvel"',
      'Preencha os dados: nome, endereço, valores',
    ],
    screenshot: '/images/tutorial-properties.png?v=2',
    highlightArea: 'properties',
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Organize seus Documentos',
    description: 'Armazene contratos, matrículas e laudos organizados por imóvel.',
    tips: [
      'Vá em "Documentos" no menu lateral',
      'Clique em "Novo Documento" para fazer upload',
      'Escolha o imóvel e a categoria do documento',
    ],
    screenshot: '/images/tutorial-documents.png?v=2',
    highlightArea: 'documents',
  },
  {
    icon: <Settings className="h-8 w-8" />,
    title: 'Configure sua Conta',
    description: 'Personalize seu perfil e gerencie sua assinatura nas configurações.',
    tips: [
      'Acesse "Configurações" para editar seu perfil',
      'Altere entre tema claro e escuro',
      'Veja seu plano atual e faça upgrade',
    ],
    screenshot: '/images/tutorial-settings.png?v=2',
    highlightArea: 'settings',
  },
];

export interface TutorialModalRef {
  open: () => void;
}

interface TutorialModalProps {
  forceShow?: boolean;
  autoShow?: boolean; // Se deve abrir automaticamente baseado no localStorage
  onOpenChange?: (open: boolean) => void;
}

export const TutorialModal = forwardRef<TutorialModalRef, TutorialModalProps>(
  ({ forceShow = false, autoShow = true, onOpenChange }, ref) => {
    const [open, setOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useImperativeHandle(ref, () => ({
      open: () => {
        setCurrentSlide(0);
        setOpen(true);
      },
    }));

    useEffect(() => {
      if (forceShow) {
        setCurrentSlide(0);
        setOpen(true);
        return;
      }

      if (!autoShow) return;

      const completed = localStorage.getItem(TUTORIAL_KEY);
      if (!completed) {
        const timer = setTimeout(() => setOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }, [forceShow, autoShow]);

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    const handleComplete = () => {
      if (!forceShow) {
        localStorage.setItem(TUTORIAL_KEY, 'true');
      }
      handleOpenChange(false);
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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{slide.title}</DialogTitle>
            <DialogDescription>{slide.description}</DialogDescription>
          </DialogHeader>
          
          {/* Screenshot Area */}
          <div className="relative">
            <img 
              key={`${currentSlide}-${slide.screenshot}`}
              src={`${slide.screenshot}${slide.screenshot.includes('?') ? '&' : '?'}t=${currentSlide}`}
              alt={slide.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            
            {/* Step indicator */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {currentSlide + 1} de {slides.length}
            </div>
            
            {/* Icon */}
            <div className="absolute bottom-4 left-6 p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
              {slide.icon}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">{slide.title}</h2>
              <p className="text-muted-foreground">{slide.description}</p>
            </div>

            {/* Tips with pointer icon */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MousePointer className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Como fazer:</span>
              </div>
              <ul className="space-y-2">
                {slide.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 py-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
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
                      Começar a usar
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
);

TutorialModal.displayName = 'TutorialModal';
