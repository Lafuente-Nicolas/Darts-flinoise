/**
 * Lecture d'une feuille Excel de classement, sans dépendance au navigateur (testable).
 *
 * Attendu : une ligne d'en-tête (dans les 10 premières lignes) avec au minimum
 * une colonne « Nom » et une colonne « Points ». « Matchs » et « Victoires » sont facultatives.
 * Les joueurs sont triés par points, et les ex æquo partagent le même rang (1, 1, 3…).
 */

export type SheetCell = string | number | boolean | Date | null | undefined;
export type SheetRow = readonly SheetCell[];

export interface RankingLine {
  position: number;
  name: string;
  points: number;
  played: number | null;
  wins: number | null;
}

export interface RankingParseResult {
  lines: RankingLine[];
  warnings: string[];
  columns: { played: boolean; wins: boolean };
}

export class RankingParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RankingParseError';
  }
}

export const MAX_PLAYERS = 500;
export const MAX_NAME_LENGTH = 80;
const HEADER_SCAN_ROWS = 10;

type Field = 'name' | 'points' | 'played' | 'wins';

const HEADER_ALIASES: Record<Field, readonly string[]> = {
  name: [
    'nom',
    'joueur',
    'joueuse',
    'joueurs',
    'pseudo',
    'membre',
    'nomprenom',
    'prenomnom',
    'nometprenom',
  ],
  points: ['points', 'point', 'pts', 'pt', 'total', 'score'],
  played: ['matchs', 'match', 'mj', 'joues', 'parties', 'partiesjouees', 'matchsjoues', 'nbmatchs'],
  wins: ['victoires', 'victoire', 'vict', 'v', 'gagnes', 'wins'],
};

/** « Matchs joués » → « matchsjoues » : minuscules, sans accents, sans espaces ni ponctuation. */
export function normalizeHeader(value: SheetCell): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Accepte les nombres Excel et le texte « 12,5 », « 1 250 », « 12.5 ». */
export function toNumber(value: SheetCell): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  if (cleaned === '' || !/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

function cellText(value: SheetCell): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function findHeader(rows: readonly SheetRow[]): {
  index: number;
  columns: Partial<Record<Field, number>>;
} {
  for (let r = 0; r < Math.min(rows.length, HEADER_SCAN_ROWS); r++) {
    const columns: Partial<Record<Field, number>> = {};
    (rows[r] ?? []).forEach((cell, c) => {
      const key = normalizeHeader(cell);
      for (const field of Object.keys(HEADER_ALIASES) as Field[]) {
        if (columns[field] === undefined && HEADER_ALIASES[field].includes(key)) {
          columns[field] = c;
        }
      }
    });
    if (columns.name !== undefined && columns.points !== undefined) {
      return { index: r, columns };
    }
  }
  throw new RankingParseError(
    'Colonnes « Nom » et « Points » introuvables. Vérifiez la ligne d’en-tête du fichier.',
  );
}

function optionalCount(
  value: SheetCell,
  label: string,
  rowNumber: number,
  warnings: string[],
): number | null {
  if (cellText(value) === '') return null;
  const n = toNumber(value);
  if (n === null || n < 0 || !Number.isInteger(n)) {
    warnings.push(`Ligne ${rowNumber} : « ${label} » invalide, laissé vide.`);
    return null;
  }
  return n;
}

export function parseRankingSheet(rows: readonly SheetRow[]): RankingParseResult {
  const { index, columns } = findHeader(rows);
  const warnings: string[] = [];
  const parsed: Omit<RankingLine, 'position'>[] = [];
  const seen = new Set<string>();

  rows.slice(index + 1).forEach((row, offset) => {
    const rowNumber = index + offset + 2; // numérotation Excel (1-indexée, après l'en-tête)
    const name = cellText(row[columns.name ?? -1]);
    const rawPoints = row[columns.points ?? -1];
    const points = toNumber(rawPoints);

    if (name === '' && cellText(rawPoints) === '') return; // ligne vide

    if (name === '') {
      warnings.push(`Ligne ${rowNumber} ignorée : nom manquant.`);
      return;
    }
    if (points === null) {
      warnings.push(`Ligne ${rowNumber} ignorée : points manquants ou invalides pour « ${name} ».`);
      return;
    }

    const key = normalizeHeader(name);
    if (seen.has(key)) {
      warnings.push(`Ligne ${rowNumber} : « ${name} » apparaît plusieurs fois.`);
    }
    seen.add(key);

    const played =
      columns.played === undefined
        ? null
        : optionalCount(row[columns.played], 'Matchs', rowNumber, warnings);
    const wins =
      columns.wins === undefined
        ? null
        : optionalCount(row[columns.wins], 'Victoires', rowNumber, warnings);

    if (played !== null && wins !== null && wins > played) {
      warnings.push(`Ligne ${rowNumber} : « ${name} » a plus de victoires que de matchs.`);
    }

    parsed.push({ name: name.slice(0, MAX_NAME_LENGTH), points, played, wins });
  });

  if (parsed.length === 0) {
    throw new RankingParseError('Aucun joueur trouvé sous la ligne d’en-tête.');
  }
  if (parsed.length > MAX_PLAYERS) {
    throw new RankingParseError(`Le fichier contient plus de ${MAX_PLAYERS} joueurs.`);
  }

  parsed.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, 'fr'));

  const lines: RankingLine[] = [];
  parsed.forEach((line, i) => {
    const previous = lines[i - 1];
    const position = previous && previous.points === line.points ? previous.position : i + 1;
    lines.push({ position, ...line });
  });

  return {
    lines,
    warnings,
    columns: { played: columns.played !== undefined, wins: columns.wins !== undefined },
  };
}
