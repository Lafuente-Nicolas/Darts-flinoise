import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, deletePost, fetchPosts, updatePost } from './api';
import type { PostInput } from './types';

export const postsQuery = queryOptions({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});

function useInvalidatePosts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: postsQuery.queryKey });
}

export function useCreatePost() {
  const invalidate = useInvalidatePosts();
  return useMutation({ mutationFn: createPost, onSuccess: invalidate });
}

export function useUpdatePost() {
  const invalidate = useInvalidatePosts();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PostInput> }) => updatePost(id, input),
    onSuccess: invalidate,
  });
}

export function useDeletePost() {
  const invalidate = useInvalidatePosts();
  return useMutation({ mutationFn: deletePost, onSuccess: invalidate });
}
