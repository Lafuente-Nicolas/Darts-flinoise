import type { ReactNode } from 'react';
import { formatDate } from '@/lib/format';
import { categoryLabel, type Post } from './types';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
  /** Actions d'administration affichées sous le texte. */
  actions?: ReactNode;
}

export function PostCard({ post, actions }: PostCardProps) {
  return (
    <article className={`${styles.card}${post.pinned ? ` ${styles.pinned}` : ''}`}>
      <div className={styles.meta}>
        <span className={styles.chip}>{categoryLabel(post.category)}</span>
        {post.pinned && <span className={`${styles.chip} ${styles.chipPinned}`}>Épinglé</span>}
        <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
      </div>
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.body}>{post.body}</p>
      {actions && <div className={styles.actions}>{actions}</div>}
    </article>
  );
}
