import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoText } from "@/components/common/LogoText";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { TutorialModal, TutorialModalRef } from "@/components/onboarding/TutorialModal";
import { DashboardMockup, PropertiesMockup, SCREEN_MOCKUPS } from "@/components/landing/ScreenMockups";

import {
  Building2,
  BarChart3,
  FileText,
  Shield,
  ArrowRight,
  Check,
  Zap,
  Play,
  Sparkles,
  Rocket,
  Users,
  ClipboardList,
  Loader2,
} from "lucide-react";

const featureTabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Visão completa do seu portfólio",
    description:
      "Métricas de receita, custos, ROI e lucro líquido calculados automaticamente. Gráficos de evolução e ranking de performance dos seus imóveis.",
    mockup: "dashboard",
  },
  {
    id: "properties",
    label: "Imóveis",
    icon: <Building2 className="h-5 w-5" />,
    title: "Gestão centralizada de imóveis",
    description:
      "Cadastre todos os seus imóveis com fotos, endereço, valores e status. Filtre por tipo, status e performance com facilidade.",
    mockup: "properties",
  },
  {
    id: "documents",
    label: "Documentos",
    icon: <FileText className="h-5 w-5" />,
    title: "Documentos organizados por imóvel",
    description:
      "Contratos, matrículas, laudos e IPTUs salvos na nuvem. Busque e acesse qualquer documento de qualquer lugar.",
    mockup: "documents",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: <Shield className="h-5 w-5" />,
    title: "Segurança e personalização",
    description:
      "Autenticação em duas etapas, gestão de equipe, planos e preferências. Tudo para você ter controle total da sua conta.",
    mockup: "settings",
  },
];

const steps = [
  {
    icon: <ClipboardList className="h-7 w-7" />,
    step: "01",
    title: "Cadastre seus imóveis",
    description: "Adicione fotos, valores, endereço e status de cada imóvel em poucos cliques.",
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    step: "02",
    title: "Acompanhe métricas",
    description: "Visualize ROI, receitas, custos e lucro de cada imóvel no dashboard automático.",
  },
  {
    icon: <Rocket className="h-7 w-7" />,
    step: "03",
    title: "Tome decisões inteligentes",
    description: "Use relatórios e rankings para identificar oportunidades e otimizar seu portfólio.",
  },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
      );
    }
    observerRef.current.observe(node);
  }, []);

  return setRef;
}

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const tutorialRef = useRef<TutorialModalRef>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const reveal = useScrollReveal();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const benefits = [
    "Dashboard com métricas em tempo real",
    "Ranking de performance por imóvel",
    "Cálculo automático de ROI e lucro",
    "Upload de documentos organizados",
    "Relatórios detalhados",
    "Acesso de qualquer dispositivo",
  ];

  const FEATURE_MOBILE_IMAGES: Record<string, string> = {
    dashboard: "/images/tutorial-dashboard.png",
    properties: "/images/tutorial-properties.png",
    documents: "/images/tutorial-documents.png",
    settings: "/images/tutorial-settings.png",
  };

  const activeFeature = featureTabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border animate-fade-in">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <LogoText size="md" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero - Split Layout */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-28 px-3 sm:px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Text */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-6 border border-primary/20">
                <Sparkles className="h-4 w-4" />
                Plataforma #1 de gestão imobiliária
              </div>
              <h1 className="text-[2.1rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.1] mb-5">
                Gerencie seus imóveis de forma{" "}
                <span className="gradient-text">inteligente</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                Controle financeiro, documentos organizados e métricas em tempo real para investidores, imobiliárias e proprietários.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/auth">
                  <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    <Rocket className="h-5 w-5" />
                    Começar Gratuitamente
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-base px-8 py-6 hover:bg-muted/50"
                  onClick={() => tutorialRef.current?.open()}
                >
                  <Play className="h-5 w-5" />
                  Ver Demonstração
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Setup em 2 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>100% seguro</span>
                </div>
              </div>
            </div>

            {/* Right - Dashboard Screenshot with 3D */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <div className="hero-screenshot-3d hero-glow rounded-2xl overflow-hidden border border-border/50">
                <img src="/images/tutorial-dashboard.png" alt="Dashboard ImobiSmart" className="block md:hidden w-full h-auto" loading="eager" />
                <div className="hidden md:block">
                  <DashboardMockup />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TutorialModal ref={tutorialRef} autoShow={false} />

      {/* Social Proof Bar */}
      <section className="py-16 px-3 sm:px-4 border-y border-border/30 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
            {[
              { value: 100, suffix: "+", label: "Proprietários ativos", icon: <Users className="h-6 w-6" /> },
              { value: 1000, suffix: "+", label: "Imóveis gerenciados", icon: <Building2 className="h-6 w-6" /> },
              { value: 50, suffix: "mil+", label: "Documentos organizados", icon: <FileText className="h-6 w-6" /> },
              { value: 5, suffix: "★", label: "Avaliação média", icon: <Sparkles className="h-6 w-6" /> },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center py-7 px-5 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  {stat.icon}
                </div>
                <p className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-none">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-3 sm:px-4 scroll-reveal" ref={reveal}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Simples e rápido
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Em três passos simples você tem controle total do seu portfólio.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center p-5 rounded-2xl bg-primary/10 text-primary mb-5">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-2">
                  Passo {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                    <ArrowRight className="h-5 w-5 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Tabs */}
      <section className="py-20 px-3 sm:px-4 bg-muted/30 scroll-reveal" ref={reveal}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Veja na prática
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Conheça cada funcionalidade
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore as principais telas do ImobiSmart e descubra como ele funciona.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-2xl border border-border/50 hero-glow" key={`mockup-${activeFeature.id}`}>
              <img
                src={FEATURE_MOBILE_IMAGES[activeFeature.mockup]}
                alt={activeFeature.title}
                className="block md:hidden w-full h-auto"
                loading="eager"
              />

              <div className="hidden md:block">
                <div className="bg-card border-b border-border/30 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/70" />
                    <div className="w-3 h-3 rounded-full bg-primary/50" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">ImobiSmart</span>
                </div>
                {(() => {
                  const MockupComponent = SCREEN_MOCKUPS[activeFeature.mockup];
                  return MockupComponent ? <MockupComponent /> : null;
                })()}
              </div>
            </div>

            {/* Description */}
            <div className="lg:col-span-2 space-y-4 animate-fade-in" key={`desc-${activeFeature.id}`}>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {activeFeature.title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {activeFeature.description}
              </p>
              <Link to="/auth">
                <Button className="gap-2 mt-2">
                  Experimentar agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-20 px-3 sm:px-4 scroll-reveal" ref={reveal}>
        <TargetAudienceSection />
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FAQSection />

      {/* Benefits with real screenshot */}
      <section className="py-20 px-3 sm:px-4 scroll-reveal" ref={reveal}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Pare de perder dinheiro com falta de controle
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Muitos proprietários não sabem quanto realmente lucram. Com o ImobiSmart, você tem visibilidade total
                sobre cada centavo — receitas, custos, ROI e lucro líquido de cada imóvel.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-primary/10 shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    Testar Gratuitamente
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Properties Preview */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50 hero-glow">
              <img src="/images/tutorial-properties.png" alt="Gestão de Imóveis ImobiSmart" className="block md:hidden w-full h-auto" loading="lazy" />
              <div className="hidden md:block">
                <PropertiesMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-3 sm:px-4 relative overflow-hidden bg-[hsl(175,50%,25%)] dark:bg-[hsl(200,30%,10%)]">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Comece agora e veja resultados em minutos
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Junte-se a centenas de investidores que já usam o ImobiSmart para ter controle total sobre seu patrimônio imobiliário.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2 text-base px-8 py-6 shadow-xl hover:scale-105 transition-transform">
              Criar Minha Conta Grátis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-3 sm:px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/">
              <LogoText size="sm" />
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ImobiSmart. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
