/**
 * Contenu éditorial du club, centralisé ici pour être modifié sans toucher aux composants.
 */

export interface Session {
  day: string;
  start: string;
  end: string;
}

const VENUE_ADDRESS = '24 rue Aristide Barbieux, 59158 Flines-lès-Mortagne';

export const club = {
  name: 'Darts Flinoise',
  tagline: 'Association de fléchettes',
  sessions: [
    { day: 'Mardi', start: '18:00', end: '21:00' },
    { day: 'Jeudi', start: '18:00', end: '21:00' },
  ] satisfies Session[],
  venue: {
    name: 'Friterie Diligense',
    street: '24 rue Aristide Barbieux',
    city: '59158 Flines-lès-Mortagne',
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `Friterie la Diligense, ${VENUE_ADDRESS}`,
    )}`,
  },
  presentation: [
    'Darts Flinoise, c’est avant tout une bande d’amis passionnés par les fléchettes.',
    'On se retrouve deux soirs par semaine pour jouer, se lancer des défis et partager cette passion avec tous ceux qui ont envie de s’y mettre, que vous lanciez votre toute première fléchette ou que vous visiez déjà le 180.',
  ],
  pillars: [
    { title: 'Jouer', text: 'On joue au cricket, au 501, au 701, au 301…' },
    {
      title: 'Se retrouver',
      text: 'Une soirée fléchettes, c’est aussi un bon moment entre amis : on rigole, on se chambre après un double raté et on fête chaque belle volée. L’ambiance est détendue et tout le monde est le bienvenu.',
    },
  ],
} as const;
