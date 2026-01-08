import { Building2, Briefcase, Users, Home } from 'lucide-react';

const audiences = [
  {
    icon: <Building2 className="h-8 w-8" />,
    title: 'Investidores Imobiliários',
    description: 'Controle total sobre seu portfólio de investimentos. Acompanhe ROI, receitas e custos de cada imóvel em tempo real.',
  },
  {
    icon: <Briefcase className="h-8 w-8" />,
    title: 'Imobiliárias',
    description: 'Gerencie múltiplos imóveis de clientes com eficiência. Documentos organizados e relatórios automáticos.',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Administradoras',
    description: 'Centralização de informações de condomínios e imóveis. Controle financeiro completo e transparente.',
  },
  {
    icon: <Home className="h-8 w-8" />,
    title: 'Proprietários',
    description: 'Mesmo com poucos imóveis, tenha controle profissional. Perfeito para quem aluga apartamentos ou casas.',
  },
];

export function TargetAudienceSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Para quem é o <span className="text-primary">ImobiSmart</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desenvolvido para atender desde proprietários individuais até grandes administradoras.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 border border-border/50 shadow-card transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
            >
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {audience.icon}
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {audience.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
