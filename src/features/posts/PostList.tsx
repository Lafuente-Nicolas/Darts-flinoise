import { useQuery } from '@tanstack/react-query';
import { QueryState } from '@/components/QueryState';
import { PostCard } from './PostCard';
import { postsQuery } from './queries';

interface PostListProps {
  /** Nombre maximum d'actus affichées (toutes par défaut). */
  limit?: number;
}

export function PostList({ limit }: PostListProps) {
  const { data, error, isPending } = useQuery(postsQuery);

  return (
    <QueryState
      data={data}
      error={error}
      isPending={isPending}
      isEmpty={(posts) => posts.length === 0}
      loadingLabel="Chargement des actus…"
      emptyLabel="Aucune actu pour l’instant."
    >
      {(posts) => (
        <div className="stack">
          {posts.slice(0, limit).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </QueryState>
  );
}
