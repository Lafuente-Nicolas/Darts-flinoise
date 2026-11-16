import { PageHeader } from '@/components/PageHeader';
import { RankingBoard } from '@/features/ranking/RankingBoard';

export function RankingPage() {
  return (
    <div className="container">
      <title>Classement · Darts Flinoise</title>
      <PageHeader eyebrow="Saison en cours" title="Classement" />
      <section className="section">
        <RankingBoard />
      </section>
    </div>
  );
}
