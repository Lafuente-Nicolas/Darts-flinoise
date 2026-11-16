import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ConfirmButton } from '@/components/ConfirmButton';
import { QueryState } from '@/components/QueryState';
import { getErrorMessage } from '@/lib/errors';
import { PostCard } from '@/features/posts/PostCard';
import { postsQuery, useDeletePost, useUpdatePost } from '@/features/posts/queries';
import type { Post } from '@/features/posts/types';
import { PostEditor } from './PostEditor';

export function PostsManager() {
  const { data, error, isPending } = useQuery(postsQuery);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <QueryState
      data={data}
      error={error}
      isPending={isPending}
      isEmpty={(posts) => posts.length === 0}
      loadingLabel="Chargement des actus…"
      emptyLabel="Aucune actu publiée. Utilisez l’onglet « Publier »."
    >
      {(posts) => (
        <div className="stack">
          {posts.map((post) =>
            post.id === editingId ? (
              <PostEditor key={post.id} post={post} onDone={() => setEditingId(null)} />
            ) : (
              <ManagedPost key={post.id} post={post} onEdit={() => setEditingId(post.id)} />
            ),
          )}
        </div>
      )}
    </QueryState>
  );
}

function ManagedPost({ post, onEdit }: { post: Post; onEdit: () => void }) {
  const update = useUpdatePost();
  const remove = useDeletePost();
  const busy = update.isPending || remove.isPending;
  const failure = update.error ?? remove.error;

  return (
    <div className="stack">
      <PostCard
        post={post}
        actions={
          <>
            <button type="button" className="btn-small" onClick={onEdit} disabled={busy}>
              Modifier
            </button>
            <button
              type="button"
              className="btn-small"
              disabled={busy}
              onClick={() => update.mutate({ id: post.id, input: { pinned: !post.pinned } })}
            >
              {post.pinned ? 'Désépingler' : 'Épingler'}
            </button>
            <ConfirmButton
              label="Supprimer"
              confirmLabel="Confirmer la suppression"
              disabled={busy}
              onConfirm={() => remove.mutate(post.id)}
            />
          </>
        }
      />
      {failure && (
        <p className="status-text is-error" role="alert">
          {getErrorMessage(failure)}
        </p>
      )}
    </div>
  );
}
