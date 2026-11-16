import { useEffect, useState, type RefObject } from 'react';

/** Vrai tant que l'élément est (au moins en partie) visible à l'écran. */
export function useInView(ref: RefObject<Element | null>, rootMargin = '100px'): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
