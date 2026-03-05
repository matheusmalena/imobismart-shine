import { Link } from "react-router-dom";
import { LogoText } from "@/components/common/LogoText";

const footerLinks = {
  Produto: [
    { label: "Recursos", href: "#features" },
    { label: "Preços", href: "#pricing" },
    { label: "Demonstração", href: "#demo" },
    { label: "FAQ", href: "#faq" },
  ],
  Recursos: [
    { label: "CRM Imobiliário", href: "#features" },
    { label: "Gestão de Imóveis", href: "#features" },
    { label: "Site Imobiliário", href: "#features" },
    { label: "Integrações", href: "#features" },
  ],
  Empresa: [
    { label: "Sobre nós", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Carreiras", href: "#" },
  ],
  Legal: [
    { label: "Termos de Uso", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "LGPD", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="py-16 px-4 border-t border-border bg-muted/20">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <LogoText size="md" />
            </Link>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Plataforma completa de gestão imobiliária para imobiliárias, corretores e investidores.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4 text-sm">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ImobiSmart. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Termos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
