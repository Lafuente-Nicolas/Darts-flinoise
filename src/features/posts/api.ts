import { requireSupabase } from '@/lib/supabase';
import type { Post, PostInput } from './types';

const FEED_LIMIT = 50;

/** Actus épinglées d'abord, puis les plus récentes. */
export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await requireSupabase()
    .from('posts')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(FEED_LIMIT);

  if (error) throw error;
  return data;
}

export async function createPost(input: PostInput): Promise<void> {
  const { error } = await requireSupabase().from('posts').insert(normalize(input));
  if (error) throw error;
}

export async function updatePost(id: string, input: Partial<PostInput>): Promise<void> {
  const patch = { ...input };
  if (patch.title !== undefined) patch.title = patch.title.trim();
  if (patch.body !== undefined) patch.body = patch.body.trim();

  const { error } = await requireSupabase().from('posts').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await requireSupabase().from('posts').delete().eq('id', id);
  if (error) throw error;
}

function normalize(input: PostInput): PostInput {
  return { ...input, title: input.title.trim(), body: input.body.trim() };
}
