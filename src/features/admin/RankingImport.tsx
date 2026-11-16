import { useId, useState, type ChangeEvent, type DragEvent } from 'react';
import { UploadIcon } from '@/components/icons';
import { getErrorMessage } from '@/lib/errors';
import {
  parseRankingSheet,
  RankingParseError,
  type RankingParseResult,
  type SheetRow,
} from '@/features/ranking/parseRankingSheet';
import { useReplaceRanking } from '@/features/ranking/queries';
import { RankingTable } from '@/features/ranking/RankingTable';
import styles from './Admin.module.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface Preview {
  fileName: string;
  result: RankingParseResult;
}

type Feedback = { text: string; error: boolean } | null;

export function RankingImport() {
  const id = useId();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [reading, setReading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const publish = useReplaceRanking();

  async function readFile(file: File | undefined) {
    setPreview(null);
    setFeedback(null);
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name)) {
      setFeedback({ text: 'Choisissez un fichier Excel au format .xlsx.', error: true });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFeedback({ text: 'Fichier trop lourd (5 Mo maximum).', error: true });
      return;
    }

    setReading(true);
    try {
      // Le lecteur Excel n'est téléchargé qu'au moment de l'import.
      const { default: readXlsxFile } = await import('read-excel-file');
      const rows = (await readXlsxFile(file)) as unknown as SheetRow[];
      setPreview({ fileName: file.name, result: parseRankingSheet(rows) });
    } catch (error) {
      setFeedback({
        text:
          error instanceof RankingParseError
            ? error.message
            : 'Ce fichier n’a pas pu être lu. Ouvrez-le dans Excel, enregistrez-le en .xlsx et réessayez.',
        error: true,
      });
    } finally {
      setReading(false);
    }
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    void readFile(event.target.files?.[0]);
    event.target.value = ''; // permet de re-sélectionner le même fichier
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    void readFile(event.dataTransfer.files[0]);
  };

  const onPublish = () => {
    if (!preview) return;
    publish.mutate(
      { fileName: preview.fileName, lines: preview.result.lines },
      {
        onSuccess: (count) => {
          setPreview(null);
          setFeedback({
            text: `Classement publié : ${count} joueur${count > 1 ? 's' : ''}. Il est visible sur le site.`,
            error: false,
          });
        },
        onError: (error) => setFeedback({ text: getErrorMessage(error), error: true }),
      },
    );
  };

  return (
    <div className="card stack">
      <h2 className="display display-md">Importer le classement</h2>
      <p className="lead">
        Le fichier remplace tout le classement affiché. Première ligne : les titres de colonnes.
      </p>
      <ul className={styles.columns}>
        <li>
          <code>Nom</code> et <code>Points</code> : obligatoires
        </li>
        <li>
          <code>Matchs</code> et <code>Victoires</code> : facultatives
        </li>
      </ul>

      <div
        className={`${styles.dropzone}${dragOver ? ` ${styles.dropzoneActive}` : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <UploadIcon className={styles.dropIcon} />
        <label className="btn btn-primary" htmlFor={`${id}-file`}>
          {reading ? 'Lecture…' : 'Choisir le fichier Excel'}
        </label>
        <input
          id={`${id}-file`}
          className="visually-hidden"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onChange}
          disabled={reading || publish.isPending}
        />
        <p className={styles.dropHint}>ou glissez-le ici (.xlsx, 5 Mo max)</p>
      </div>

      <a className={styles.template} href="/modele-classement.xlsx" download>
        Télécharger le modèle Excel
      </a>

      <p className={`status-text${feedback?.error ? ' is-error' : ''}`} role="status">
        {feedback?.text}
      </p>

      {preview && (
        <section className="stack" aria-labelledby={`${id}-preview`}>
          <h3 id={`${id}-preview`} className={styles.previewTitle}>
            Aperçu · {preview.result.lines.length} joueur
            {preview.result.lines.length > 1 ? 's' : ''} lus dans « {preview.fileName} »
          </h3>
          {preview.result.warnings.length > 0 && (
            <ul className={styles.warnings}>
              {preview.result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
          <RankingTable lines={preview.result.lines} caption="Aperçu du classement importé" />
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onPublish}
              disabled={publish.isPending}
            >
              {publish.isPending ? 'Publication…' : 'Publier ce classement'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPreview(null)}
              disabled={publish.isPending}
            >
              Annuler
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
