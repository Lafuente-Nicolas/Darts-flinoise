import { describe, expect, it } from 'vitest';
import {
  MAX_PLAYERS,
  RankingParseError,
  normalizeHeader,
  parseRankingSheet,
  toNumber,
  type SheetRow,
} from './parseRankingSheet';

describe('normalizeHeader', () => {
  it('ignore la casse, les accents et la ponctuation', () => {
    expect(normalizeHeader('  Matchs joués ')).toBe('matchsjoues');
    expect(normalizeHeader('PTS.')).toBe('pts');
    expect(normalizeHeader(null)).toBe('');
  });
});

describe('toNumber', () => {
  it('lit les nombres Excel et le texte au format français', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber('12,5')).toBe(12.5);
    expect(toNumber('1 250')).toBe(1250);
    expect(toNumber('1\u202f250')).toBe(1250);
  });

  it('refuse ce qui n’est pas un nombre', () => {
    expect(toNumber('douze')).toBeNull();
    expect(toNumber('')).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber(Number.NaN)).toBeNull();
  });
});

describe('parseRankingSheet', () => {
  it('trie par points et donne le même rang aux ex æquo', () => {
    const rows: SheetRow[] = [
      ['Nom', 'Points'],
      ['Paul', 30],
      ['Nico', 42],
      ['Amélie', 30],
      ['Julie', 12],
    ];
    const { lines } = parseRankingSheet(rows);
    expect(lines.map((l) => [l.position, l.name, l.points])).toEqual([
      [1, 'Nico', 42],
      [2, 'Amélie', 30],
      [2, 'Paul', 30],
      [4, 'Julie', 12],
    ]);
  });

  it('reconnaît les en-têtes alternatifs et une en-tête décalée', () => {
    const rows: SheetRow[] = [
      ['Classement saison 2026'],
      [],
      ['Joueur', 'Pts', 'MJ', 'Victoires'],
      ['Nico', '42,5', 10, 7],
    ];
    const result = parseRankingSheet(rows);
    expect(result.columns).toEqual({ played: true, wins: true });
    expect(result.lines[0]).toEqual({
      position: 1,
      name: 'Nico',
      points: 42.5,
      played: 10,
      wins: 7,
    });
  });

  it('ignore les lignes vides et signale les lignes incomplètes', () => {
    const rows: SheetRow[] = [
      ['Nom', 'Points'],
      ['Nico', 10],
      [null, null],
      ['', 5],
      ['Paul', 'abc'],
    ];
    const result = parseRankingSheet(rows);
    expect(result.lines).toHaveLength(1);
    expect(result.warnings).toEqual([
      'Ligne 4 ignorée : nom manquant.',
      'Ligne 5 ignorée : points manquants ou invalides pour « Paul ».',
    ]);
  });

  it('laisse vide une colonne facultative invalide et prévient', () => {
    const rows: SheetRow[] = [
      ['Nom', 'Points', 'Matchs', 'Victoires'],
      ['Nico', 10, 'beaucoup', 12],
    ];
    const result = parseRankingSheet(rows);
    expect(result.lines[0]?.played).toBeNull();
    expect(result.lines[0]?.wins).toBe(12);
    expect(result.warnings).toEqual(['Ligne 2 : « Matchs » invalide, laissé vide.']);
  });

  it('signale les doublons et les victoires supérieures aux matchs', () => {
    const rows: SheetRow[] = [
      ['Nom', 'Points', 'Matchs', 'Victoires'],
      ['Nico', 10, 3, 5],
      ['nico', 8, 2, 1],
    ];
    const { warnings } = parseRankingSheet(rows);
    expect(warnings).toContain('Ligne 2 : « Nico » a plus de victoires que de matchs.');
    expect(warnings).toContain('Ligne 3 : « nico » apparaît plusieurs fois.');
  });

  it('nettoie les espaces superflus dans les noms', () => {
    const { lines } = parseRankingSheet([
      ['Nom', 'Points'],
      ['  Jean   Dupont ', 3],
    ]);
    expect(lines[0]?.name).toBe('Jean Dupont');
  });

  it('refuse un fichier sans colonnes Nom et Points', () => {
    expect(() => parseRankingSheet([['Prénom', 'Score total']])).toThrow(RankingParseError);
  });

  it('refuse un fichier sans aucun joueur', () => {
    expect(() => parseRankingSheet([['Nom', 'Points'], []])).toThrow(
      'Aucun joueur trouvé sous la ligne d’en-tête.',
    );
  });

  it('refuse un fichier trop long', () => {
    const rows: SheetRow[] = [['Nom', 'Points']];
    for (let i = 0; i <= MAX_PLAYERS; i++) rows.push([`Joueur ${i}`, i]);
    expect(() => parseRankingSheet(rows)).toThrow(RankingParseError);
  });
});
