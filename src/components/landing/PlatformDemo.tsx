import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, BarChart3, Users, Building2 } from "lucide-react";

const screens = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    image: "/images/tutorial-dashboard.png",
  },
  {
    id: "properties",
    label: "Imóveis",
    icon: Building2,
    image: "/images/tutorial-properties.png",
  },
  {
    id: "documents",
    label: "Documentos",
    icon: Users,
    image: "/images/tutorial-documents.png",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: Monitor,
    image: "/images/tutorial-settings.png",
  },
];

export function PlatformDemo() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const current = screens.find((s) => s.id === activeScreen)!;

  return (
    <section className="py-24 px-4 bg-muted/30" id="demo">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Monitor className="h-4 w-4" />
            Veja na Prática
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Conheça a plataforma por dentro
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Interface moderna e intuitiva. Veja como cada área funciona.
          </p>
        </motion.div>

        {/* Screen tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {screens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeScreen === screen.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30"
              }`}
            >
              <screen.icon className="h-4 w-4" />
              {screen.label}
            </button>
          ))}
        </div>

        {/* Screenshot */}
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground border border-border/50">
                  app.imobismart.com/{current.id}
                </div>
              </div>
            </div>
            <div className="aspect-video bg-muted/20 flex items-center justify-center">
              <img
                src={current.image}
                alt={`ImobiSmart ${current.label}`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
