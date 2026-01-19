import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

interface EvolutionApiGuideProps {
  onComplete?: () => void;
}

export function EvolutionApiGuide({ onComplete }: EvolutionApiGuideProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const steps = [
    {
      number: 1,
      title: "Criar conta no Railway",
      description: "Acesse railway.app e crie uma conta gratuita (pode usar GitHub).",
      action: (
        <Button variant="outline" size="sm" asChild>
          <a href="https://railway.app" target="_blank" rel="noopener noreferrer">
            Abrir Railway <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      ),
    },
    {
      number: 2,
      title: "Deploy com 1 clique",
      description: "Clique no botão abaixo para fazer deploy automático da Evolution API.",
      action: (
        <Button variant="outline" size="sm" asChild>
          <a 
            href="https://railway.app/template/LK1WOi" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Deploy Evolution API <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      ),
    },
    {
      number: 3,
      title: "Aguarde o deploy",
      description: "O Railway vai criar o servidor automaticamente. Aguarde alguns minutos até aparecer 'Success'.",
    },
    {
      number: 4,
      title: "Copie a URL pública",
      description: "No painel do Railway, clique no serviço e copie a URL pública (ex: seu-app.up.railway.app).",
    },
    {
      number: 5,
      title: "Configure a API Key",
      description: "Nas variáveis de ambiente do Railway, encontre ou defina a AUTHENTICATION_API_KEY. Use ela aqui.",
      extra: (
        <div className="mt-2 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground mb-2">
            Se não tiver definido, adicione uma variável:
          </p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-background px-2 py-1 rounded">
              AUTHENTICATION_API_KEY=sua-chave-secreta
            </code>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => copyToClipboard("AUTHENTICATION_API_KEY=", "Variável")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      number: 6,
      title: "Configure aqui no ImobiSmart",
      description: "Cole a URL e API Key nos campos acima e teste a conexão.",
    },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          🚀 Guia: Deploy Evolution API (Gratuito)
        </CardTitle>
        <CardDescription>
          Siga os passos abaixo para ter sua própria instância da Evolution API em ~5 minutos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div 
            key={step.number} 
            className="flex gap-4 p-3 rounded-lg border bg-background"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{step.number}</span>
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-medium">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {step.action}
              {step.extra}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Plano gratuito do Railway</p>
              <p className="text-xs text-muted-foreground">
                Inclui $5 de crédito/mês, suficiente para uso moderado. 
                Para produção, considere o plano Hobby ($5/mês).
              </p>
            </div>
          </div>
        </div>

        {onComplete && (
          <Button onClick={onComplete} className="w-full">
            Já configurei, continuar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
