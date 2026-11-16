import type { DbEnum, TableRow } from '@/types/database';

export type Post = TableRow<'posts'>;
export type PostCategory = DbEnum<'post_category'>;

export interface PostInput {
  title: string;
  body: string;
  category: PostCategory;
  pinned: boolean;
}

export const POST_CATEGORIES: readonly { value: PostCategory; label: string }[] = [
  { value: 'info', label: 'Info pratique' },
  { value: 'tournoi', label: 'Tournoi' },
  { value: 'resultats', label: 'Résultats' },
  { value: 'annonce', label: 'Annonce' },
];

export const POST_LIMITS = { title: 120, body: 2000 } as const;

export function categoryLabel(category: PostCategory): string {
  return POST_CATEGORIES.find((c) => c.value === category)?.label ?? 'Info';
}
