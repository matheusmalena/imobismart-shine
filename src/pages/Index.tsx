import { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
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
  TrendingUp,
  Play,
  Sparkles,
  Rocket,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const tutorialRef = useRef<TutorialModalRef>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Gestão Centralizada",
      description:
        "Todos os seus imóveis em um único painel. Visualize, edite e monitore em tempo real com facilidade.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Métricas Automáticas",
      description: "ROI, receitas, custos e lucro líquido calculados instantaneamente. Sem planilhas complicadas.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Documentos Seguros",
      description: "Contratos, matrículas e laudos organizados por imóvel. Acesse de qualquer lugar.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia. Backups automáticos e acesso controlado.",
    },
  ];

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
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <LogoText size="md" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20"
          >
            <Sparkles className="h-4 w-4" />
            A plataforma #1 de gestão imobiliária inteligente
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8"
          >
            Gerencie seus imóveis com{" "}
            <span className="gradient-text">inteligência</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Plataforma completa para imobiliárias, investidores e proprietários.
            Controle financeiro, documentos organizados e métricas em tempo real.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
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
          </motion.div>

          {/* Tutorial Modal */}
          <TutorialModal ref={tutorialRef} autoShow={false} />
          
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-border/50">
              <Building2 className="h-4 w-4 text-primary" />
              <span>200+ proprietários</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-border/50">
              <Shield className="h-4 w-4 text-primary" />
              <span>100% seguro</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-border/50">
              <Zap className="h-4 w-4 text-primary" />
              <span>Pronto para usar</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 px-4 bg-muted/30">
        <TargetAudienceSection />
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Recursos Poderosos
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas poderosas para você parar de perder dinheiro com falta de controle.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group bg-card rounded-2xl p-8 shadow-card border border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/30"
              >
                <div className="p-4 rounded-2xl bg-primary/10 w-fit mb-6 group-hover:bg-primary/15 transition-colors">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
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
                viewport={{ once: true, margin: "-100px" }}
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
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 flex items-center justify-center"
            >
              <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-card-foreground">Performance</h3>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-4">
                  {[
                    { label: "ROI Médio", value: "12.5%", color: "text-primary" },
                    { label: "Lucro Mensal", value: "R$ 15.420", color: "text-foreground" },
                    { label: "Ocupação", value: "94%", color: "text-primary" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className={`font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Pronto para multiplicar seus resultados?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Junte-se a milhares de investidores que já usam o ImobiSmart para ter controle total sobre seu patrimônio
            imobiliário.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
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
