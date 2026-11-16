import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRanking, replaceRanking } from './api';
import type { RankingLine } from './parseRankingSheet';

export const rankingQuery = queryOptions({
  queryKey: ['ranking'],
  queryFn: fetchRanking,
});

export function useReplaceRanking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileName, lines }: { fileName: string; lines: RankingLine[] }) =>
      replaceRanking(fileName, lines),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rankingQuery.queryKey }),
  });
}
