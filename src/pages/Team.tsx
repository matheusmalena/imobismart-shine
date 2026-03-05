import { TeamManagement } from '@/components/team/TeamManagement';

export default function Team() {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os membros da sua equipe e suas permissões
        </p>
      </div>

      {/* Team Management */}
      <TeamManagement />
    </div>
  );
}
