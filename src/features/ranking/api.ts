import { requireSupabase } from '@/lib/supabase';
import type { RankingLine } from './parseRankingSheet';

export interface Ranking {
  lines: RankingLine[];
  updatedAt: string | null;
}

export async function fetchRanking(): Promise<Ranking> {
  const supabase = requireSupabase();
  const [entries, lastImport] = await Promise.all([
    supabase
      .from('ranking_entries')
      .select('*')
      .order('position', { ascending: true })
      .order('player_name', { ascending: true }),
    supabase
      .from('ranking_imports')
      .select('imported_at')
      .order('imported_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (entries.error) throw entries.error;
  if (lastImport.error) throw lastImport.error;

  return {
    lines: entries.data.map((row) => ({
      position: row.position,
      name: row.player_name,
      points: Number(row.points),
      played: row.matches_played,
      wins: row.wins,
    })),
    updatedAt: lastImport.data?.imported_at ?? null,
  };
}

/** Remplace tout le classement côté serveur, en une transaction (réservé aux admins). */
export async function replaceRanking(fileName: string, lines: RankingLine[]): Promise<number> {
  const { data, error } = await requireSupabase().rpc('replace_ranking', {
    p_file_name: fileName,
    p_rows: lines.map((line) => ({
      position: line.position,
      player_name: line.name,
      points: line.points,
      matches_played: line.played,
      wins: line.wins,
    })),
  });

  if (error) throw error;
  return data;
}
