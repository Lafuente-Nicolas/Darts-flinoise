import type { ComponentType, SVGProps } from 'react';
import { ClubIcon, HomeIcon, NewsIcon, TrophyIcon } from '@/components/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Accueil', icon: HomeIcon, end: true },
  { to: '/actus', label: 'Actus', icon: NewsIcon },
  { to: '/classement', label: 'Classement', icon: TrophyIcon },
  { to: '/club', label: 'Le club', icon: ClubIcon },
];
