import { useId, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { useCreatePost, useUpdatePost } from '@/features/posts/queries';
import {
  POST_CATEGORIES,
  POST_LIMITS,
  type Post,
  type PostCategory,
  type PostInput,
} from '@/features/posts/types';
import styles from './Admin.module.css';

interface PostEditorProps {
  /** Actu à modifier ; absent pour une création. */
  post?: Post;
  onDone?: () => void;
}

const EMPTY: PostInput = { title: '', body: '', category: 'info', pinned: false };

export function PostEditor({ post, onDone }: PostEditorProps) {
  const id = useId();
  const [form, setForm] = useState<PostInput>(() =>
    post
      ? { title: post.title, body: post.body, category: post.category, pinned: post.pinned }
      : EMPTY,
  );
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const create = useCreatePost();
  const update = useUpdatePost();
  const pending = create.isPending || update.isPending;

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setFeedback({ text: 'Ajoutez un titre et un texte avant de publier.', error: true });
      return;
    }
    const callbacks = {
      onSuccess: () => {
        setFeedback({ text: post ? 'Actu modifiée.' : 'Actu publiée.', error: false });
        if (!post) setForm(EMPTY);
        onDone?.();
      },
      onError: (error: unknown) => setFeedback({ text: getErrorMessage(error), error: true }),
    };
    if (post) update.mutate({ id: post.id, input: form }, callbacks);
    else create.mutate(form, callbacks);
  };

  return (
    <form className={`card stack ${styles.form}`} onSubmit={onSubmit}>
      <label className="field" htmlFor={`${id}-title`}>
        Titre
        <input
          id={`${id}-title`}
          className="input"
          type="text"
          required
          maxLength={POST_LIMITS.title}
          placeholder="Ex. Tournoi interne jeudi"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </label>

      <label className="field" htmlFor={`${id}-category`}>
        Catégorie
        <select
          id={`${id}-category`}
          className="input"
          value={form.category}
          onChange={(e) => set('category', e.target.value as PostCategory)}
        >
          {POST_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field" htmlFor={`${id}-body`}>
        Texte
        <textarea
          id={`${id}-body`}
          className="input"
          required
          maxLength={POST_LIMITS.body}
          placeholder="Ce que les membres doivent savoir…"
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          aria-describedby={`${id}-count`}
        />
        <span id={`${id}-count`} className={styles.counter}>
          {form.body.length} / {POST_LIMITS.body}
        </span>
      </label>

      <label className="checkbox" htmlFor={`${id}-pinned`}>
        <input
          id={`${id}-pinned`}
          type="checkbox"
          checked={form.pinned}
          onChange={(e) => set('pinned', e.target.checked)}
        />
        Épingler en haut des actus
      </label>

      <div className="btn-row">
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? 'Enregistrement…' : post ? 'Enregistrer' : 'Publier l’actu'}
        </button>
        {post && onDone && (
          <button className="btn btn-ghost" type="button" onClick={onDone} disabled={pending}>
            Annuler
          </button>
        )}
      </div>

      <p className={`status-text${feedback?.error ? ' is-error' : ''}`} role="status">
        {feedback?.text}
      </p>
    </form>
  );
}
