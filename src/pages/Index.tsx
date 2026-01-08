import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoText } from "@/components/common/LogoText";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
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
  DollarSign,
  Percent,
  Activity,
  Sparkles,
  Brain,
  Crown,
  Rocket,
  Target,
  Clock,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

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
      icon: <Brain className="h-6 w-6" />,
      title: "Inteligência Artificial",
      description: "Insights automáticos e análises preditivas para decisões mais inteligentes.",
    },
  ];

  const benefits = [
    "Dashboard com métricas em tempo real",
    "Ranking de performance por imóvel",
    "Cálculo automático de ROI e lucro",
    "Upload de documentos organizados",
    "Relatórios inteligentes com IA",
    "Acesso de qualquer dispositivo",
  ];

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Ideal para começar",
      features: ["Até 2 imóveis cadastrados", "Dashboard básico", "Upload de documentos (100MB)", "Suporte por email"],
      cta: "Começar Grátis",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "R$ 49",
      period: "/mês",
      description: "Para investidores sérios",
      features: [
        "Até 25 imóveis cadastrados",
        "Dashboard avançado com IA",
        "Upload ilimitado de documentos",
        "Relatórios automáticos",
        "Análise preditiva de mercado",
        "Suporte prioritário",
      ],
      cta: "Assinar Pro",
      popular: true,
    },
    {
      id: "plus",
      name: "Plus",
      price: "R$ 99",
      period: "/mês",
      description: "Para grandes portfólios",
      features: [
        "Imóveis ilimitados",
        "Todos os recursos Pro",
        "Relatórios personalizados",
        "Exportação de dados",
        "Suporte prioritário 24/7",
      ],
      cta: "Assinar Plus",
      popular: false,
    },
  ];

  const demoSlides = [
    {
      title: "Dashboard Inteligente",
      description:
        "Visualize todas as métricas importantes em um único lugar. ROI, receitas, custos e lucro líquido calculados automaticamente.",
      metrics: [
        { label: "Imóveis", value: "12", icon: Building2 },
        { label: "Receita", value: "R$ 45.200", icon: DollarSign },
        { label: "ROI", value: "14.2%", icon: Percent },
        { label: "Ocupação", value: "92%", icon: Activity },
      ],
    },
    {
      title: "Gestão de Imóveis",
      description:
        "Cadastre e organize todos os seus imóveis com informações detalhadas: endereço, tipo, valor, custos e muito mais.",
      properties: [
        { name: "Apartamento Centro", type: "apartamento", revenue: "R$ 3.500", status: "Alugado" },
        { name: "Casa Jardins", type: "casa", revenue: "R$ 5.200", status: "Alugado" },
        { name: "Sala Comercial", type: "comercial", revenue: "R$ 2.800", status: "Vago" },
      ],
    },
    {
      title: "Documentos Organizados",
      description:
        "Armazene e acesse rapidamente contratos, matrículas, IPTUs e laudos. Tudo organizado por imóvel e categoria.",
      documents: [
        { name: "Contrato de Locação", category: "Contrato", date: "15/01/2024" },
        { name: "Matrícula Atualizada", category: "Matrícula", date: "10/01/2024" },
        { name: "Laudo de Vistoria", category: "Laudo", date: "05/01/2024" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
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
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />A plataforma #1 de gestão imobiliária inteligente
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Gerencie seus imóveis com <span className="gradient-text">inteligência</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Plataforma completa para imobiliárias, investidores e proprietários.
            Controle financeiro, documentos organizados e métricas em tempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Rocket className="h-5 w-5" />
                Começar Gratuitamente
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => {
                setShowDemo(true);
                setDemoStep(0);
              }}
            >
              <Play className="h-5 w-5" />
              Ver Demonstração
            </Button>
          </div>

          {/* Demo Modal */}
          <Dialog open={showDemo} onOpenChange={setShowDemo}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  {demoSlides[demoStep].title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <p className="text-muted-foreground">{demoSlides[demoStep].description}</p>

                {/* Demo Content based on step */}
                {demoStep === 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {demoSlides[0].metrics?.map((metric, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-xl p-4 text-center">
                        <metric.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="text-lg font-bold text-foreground">{metric.value}</p>
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {demoStep === 1 && (
                  <div className="space-y-3">
                    {demoSlides[1].properties?.map((prop, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{prop.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{prop.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-foreground">{prop.revenue}/mês</p>
                          <p
                            className={`text-xs ${prop.status === "Alugado" ? "text-primary" : "text-muted-foreground"}`}
                          >
                            {prop.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {demoStep === 2 && (
                  <div className="space-y-3">
                    {demoSlides[2].documents?.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.category}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{doc.date}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-1.5">
                    {demoSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDemoStep(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === demoStep ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {demoStep > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setDemoStep((s) => s - 1)}>
                        Anterior
                      </Button>
                    )}
                    {demoStep < demoSlides.length - 1 ? (
                      <Button size="sm" onClick={() => setDemoStep((s) => s + 1)}>
                        Próximo
                      </Button>
                    ) : (
                      <Link to="/auth">
                        <Button size="sm" className="gap-1">
                          Começar Agora
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Mais de 200+ proprietários
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Dados 100% seguros
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Pronto para usar
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 px-4 bg-muted/30">
        <TargetAudienceSection />
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas para você parar de perder dinheiro com falta de controle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4" id="pricing">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Planos que cabem no seu bolso</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e evolua conforme seu portfólio cresce. Sem surpresas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                  plan.popular ? "border-primary shadow-lg shadow-primary/10 scale-105" : "border-border/50 shadow-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      <Crown className="h-3 w-3" />
                      Mais Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-card-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Pare de perder dinheiro com falta de controle
              </h2>
              <p className="text-muted-foreground mb-8">
                Muitos proprietários não sabem quanto realmente lucram. Com o ImobiSmart, você tem visibilidade total
                sobre cada centavo — receitas, custos, ROI e lucro líquido de cada imóvel.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-primary/10">
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
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 flex items-center justify-center">
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
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 gradient-hero">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para multiplicar seus resultados?</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            Junte-se a milhares de investidores que já usam o ImobiSmart para ter controle total sobre seu patrimônio
            imobiliário.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2">
              Criar Minha Conta Grátis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

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
