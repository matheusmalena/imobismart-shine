import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useParallax } from "@/hooks/useParallax";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoText } from "@/components/common/LogoText";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { TutorialModal, TutorialModalRef } from "@/components/onboarding/TutorialModal";
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
  MessageSquare,
  ClipboardList,
  Monitor,
  Smartphone,
  Cloud,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const featureTabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Visão completa do seu portfólio",
    description:
      "Métricas de receita, custos, ROI e lucro líquido calculados automaticamente. Gráficos de evolução e ranking de performance dos seus imóveis.",
    image: "/images/tutorial-dashboard.jpg",
  },
  {
    id: "properties",
    label: "Imóveis",
    icon: <Building2 className="h-5 w-5" />,
    title: "Gestão centralizada de imóveis",
    description:
      "Cadastre todos os seus imóveis com fotos, endereço, valores e status. Filtre por tipo, status e performance com facilidade.",
    image: "/images/tutorial-properties.jpg",
  },
  {
    id: "documents",
    label: "Documentos",
    icon: <FileText className="h-5 w-5" />,
    title: "Documentos organizados por imóvel",
    description:
      "Contratos, matrículas, laudos e IPTUs salvos na nuvem. Busque e acesse qualquer documento de qualquer lugar.",
    image: "/images/tutorial-documents.jpg",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: <Shield className="h-5 w-5" />,
    title: "Segurança e personalização",
    description:
      "Autenticação em duas etapas, gestão de equipe, planos e preferências. Tudo para você ter controle total da sua conta.",
    image: "/images/tutorial-settings.jpg",
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
          let start = 0;
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

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const tutorialRef = useRef<TutorialModalRef>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Parallax for decorative blobs
  const blob1 = useParallax({ speed: 0.15, direction: 'up' });
  const blob2 = useParallax({ speed: 0.1, direction: 'down' });
  // Parallax for floating badges
  const badge1 = useParallax({ speed: 0.08, direction: 'up' });
  const badge2 = useParallax({ speed: 0.06, direction: 'down' });
  // Parallax for CTA blobs
  const ctaBlob1 = useParallax({ speed: 0.12, direction: 'up' });
  const ctaBlob2 = useParallax({ speed: 0.08, direction: 'down' });
  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  // Preload all feature images for instant tab switching
  useEffect(() => {
    const imagesToPreload = [
      '/images/tutorial-dashboard.jpg',
      '/images/tutorial-properties.jpg',
      '/images/tutorial-documents.jpg',
      '/images/tutorial-settings.jpg',
    ];
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const benefits = [
    "Dashboard com métricas em tempo real",
    "Ranking de performance por imóvel",
    "Cálculo automático de ROI e lucro",
    "Upload de documentos organizados",
    "Relatórios detalhados",
    "Acesso de qualquer dispositivo",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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
      </motion.header>

      {/* Hero - Split Layout */}
      <section className="pt-28 pb-16 lg:pt-32 lg:pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div ref={blob1.ref} style={blob1.style} className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div ref={blob2.ref} style={blob2.style} className="absolute bottom-10 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                <Sparkles className="h-4 w-4" />
                Plataforma #1 de gestão imobiliária
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
                Gerencie seus imóveis de forma{" "}
                <span className="gradient-text">inteligente</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
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
            </motion.div>

            {/* Right - Dashboard Screenshot */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <div className="bg-card border-b border-border px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">ImobiSmart — Dashboard</span>
                </div>
                <img
                  src="/images/tutorial-dashboard.jpg"
                  alt="Dashboard do ImobiSmart mostrando métricas de imóveis"
                  className="w-full"
                  loading="eager"
                />
              </div>
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-xl border border-border/50 p-3 flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROI Médio</p>
                  <p className="text-sm font-bold text-foreground">12.5%</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="absolute -top-4 -right-4 bg-card rounded-xl shadow-xl border border-border/50 p-3 flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-success/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ocupação</p>
                  <p className="text-sm font-bold text-foreground">94%</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <TutorialModal ref={tutorialRef} autoShow={false} />

      {/* Social Proof Bar */}
      <section className="py-16 px-4 border-y border-border bg-gradient-to-b from-muted/50 to-muted/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: 200, suffix: "+", label: "Proprietários ativos", icon: <Users className="h-6 w-6" /> },
              { value: 500, suffix: "+", label: "Imóveis gerenciados", icon: <Building2 className="h-6 w-6" /> },
              { value: 99, suffix: ".9%", label: "Uptime garantido", icon: <Shield className="h-6 w-6" /> },
              { value: 4, suffix: ".9★", label: "Avaliação média", icon: <Sparkles className="h-6 w-6" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border/50 p-5 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-3">
                  {stat.icon}
                </div>
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
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
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div key={i} variants={itemVariants} className="relative text-center">
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Feature Tabs - "Veja na prática" */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Monitor className="h-4 w-4" />
              Veja na prática
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Conheça cada funcionalidade
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore as principais telas do ImobiSmart e descubra como ele funciona.
            </p>
          </motion.div>

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
          <AnimatePresence mode="wait">
            {featureTabs
              .filter((t) => t.id === activeTab)
              .map((tab) => (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center"
                >
                  {/* Screenshot */}
                  <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                    <div className="bg-card border-b border-border px-4 py-2.5 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-destructive/60" />
                        <div className="w-3 h-3 rounded-full bg-warning/60" />
                        <div className="w-3 h-3 rounded-full bg-success/60" />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">ImobiSmart</span>
                    </div>
                    <img
                      src={tab.image}
                      alt={tab.title}
                      className="w-full"
                    />
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      {tab.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {tab.description}
                    </p>
                    <Link to="/auth">
                      <Button className="gap-2 mt-2">
                        Experimentar agora <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-20 px-4">
        <TargetAudienceSection />
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FAQSection />

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Pare de perder dinheiro com falta de controle
              </h2>
              <p className="text-muted-foreground mb-8">
                Muitos proprietários não sabem quanto realmente lucram. Com o ImobiSmart, você tem visibilidade total
                sobre cada centavo — receitas, custos, ROI e lucro líquido de cada imóvel.
              </p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {benefits.map((benefit, index) => (
                  <motion.div key={index} variants={itemVariants} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-8">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    Testar Gratuitamente
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: <Cloud className="h-6 w-6" />, title: "Na nuvem", desc: "Acesse de qualquer lugar" },
                { icon: <Smartphone className="h-6 w-6" />, title: "Responsivo", desc: "Funciona em qualquer tela" },
                { icon: <Shield className="h-6 w-6" />, title: "Seguro", desc: "Dados criptografados" },
                { icon: <Zap className="h-6 w-6" />, title: "Rápido", desc: "Métricas instantâneas" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border/50 shadow-card text-center"
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-3">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-24 px-4 gradient-hero relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto text-center max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Pronto para multiplicar seus resultados?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Junte-se a centenas de investidores que já usam o ImobiSmart para ter controle total sobre seu patrimônio imobiliário.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-8 py-6 shadow-xl hover:scale-105 transition-transform">
                Criar Minha Conta Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
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
