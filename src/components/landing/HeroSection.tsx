import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Calendar, BarChart3, Building2, Users, FileText } from "lucide-react";

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Plataforma #1 de gestão imobiliária
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
              Gerencie seus imóveis com{" "}
              <span className="gradient-text">inteligência</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Gestão de imóveis, inquilinos, contratos, documentos e WhatsApp automatizado. Tudo em uma única plataforma para investidores, proprietários e administradores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/auth">
                <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Rocket className="h-5 w-5" />
                  Comece Grátis
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8 py-6 hover:bg-muted/50"
                onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma demonstração do ImobiSmart.', '_blank')}
              >
                <Calendar className="h-5 w-5" />
                Agendar Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              ✓ Grátis para começar &nbsp; ✓ Sem cartão de crédito &nbsp; ✓ Setup em 2 minutos
            </p>
          </motion.div>

          {/* Right - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground border border-border/50">
                    app.imobismart.com/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Imóveis", value: "24", icon: Building2, color: "text-primary" },
                    { label: "Inquilinos", value: "12", icon: Users, color: "text-info" },
                    { label: "Contratos", value: "18", icon: FileText, color: "text-success" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted/30 rounded-xl p-4 border border-border/30">
                      <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
                {/* Mini chart placeholder */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Receita Mensal</span>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 85, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t-sm transition-all"
                        style={{ height: `${h}%` }}
                      >
                        <div
                          className="w-full bg-primary rounded-t-sm"
                          style={{ height: `${Math.min(100, h + 10)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg border border-border/50 p-3 flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-success/10">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">+23%</p>
                <p className="text-xs text-muted-foreground">Receita este mês</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
