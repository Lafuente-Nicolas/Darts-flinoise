import { PageHeader } from '@/components/PageHeader';
import { PostList } from '@/features/posts/PostList';

export function NewsPage() {
  return (
    <div className="container">
      <title>Actus · Darts Flinoise</title>
      <PageHeader eyebrow="Vie du club" title="Actus" />
      <section className="section">
        <PostList />
      </section>
    </div>
  );
}
