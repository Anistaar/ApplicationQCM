export type RevisionSheetsVersion = 1;

export type SheetSubject = 'OMC' | 'FMI' | 'BM';

export type SheetItem = {
  id: string;
  text: string;
  kind?: 'date' | 'concept' | 'acteur' | 'lieu' | 'chiffre' | 'autre';
};

export type SheetSlot = {
  id: string;
  label: string;
  accepts?: SheetItem['kind'][];
  correctItemId: string;
};

export type RevisionSheet = {
  version: RevisionSheetsVersion;
  id: string;
  title: string;
  subject: SheetSubject;
  description?: string;
  sections: Array<{
    id: string;
    title: string;
    slots: SheetSlot[];
  }>;
  items: SheetItem[];
};

export type RevisionProgress = {
  version: RevisionSheetsVersion;
  sheetId: string;
  placed: Record<string, string>; // slotId -> itemId
  completedAt?: string;
};

export const REVISION_SHEETS_STORAGE_KEY = 't2q-revision-sheets:v1';

export function computeCompletion(sheet: RevisionSheet, progress: RevisionProgress): {
  totalSlots: number;
  correctSlots: number;
} {
  const allSlots = sheet.sections.flatMap(s => s.slots);
  let correctSlots = 0;
  for (const slot of allSlots) {
    const placedItemId = progress.placed[slot.id];
    if (placedItemId && placedItemId === slot.correctItemId) correctSlots += 1;
  }
  return { totalSlots: allSlots.length, correctSlots };
}

export function isSlotFilledCorrectly(sheet: RevisionSheet, progress: RevisionProgress, slotId: string): boolean {
  const slot = sheet.sections.flatMap(s => s.slots).find(s => s.id === slotId);
  if (!slot) return false;
  return progress.placed[slot.id] === slot.correctItemId;
}

export function makeEmptyProgress(sheet: RevisionSheet): RevisionProgress {
  return { version: 1, sheetId: sheet.id, placed: {} };
}

export function loadAllProgress(): Record<string, RevisionProgress> {
  try {
    const raw = localStorage.getItem(REVISION_SHEETS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, RevisionProgress>;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveAllProgress(map: Record<string, RevisionProgress>): void {
  localStorage.setItem(REVISION_SHEETS_STORAGE_KEY, JSON.stringify(map));
}

export function loadProgressForSheet(sheet: RevisionSheet): RevisionProgress {
  const all = loadAllProgress();
  const existing = all[sheet.id];
  if (existing && existing.version === 1 && existing.sheetId === sheet.id && existing.placed) return existing;
  return makeEmptyProgress(sheet);
}

export function saveProgressForSheet(progress: RevisionProgress): void {
  const all = loadAllProgress();
  all[progress.sheetId] = progress;
  saveAllProgress(all);
}

export function resetProgressForSheet(sheet: RevisionSheet): void {
  const all = loadAllProgress();
  delete all[sheet.id];
  saveAllProgress(all);
}

export const demoSheets: RevisionSheet[] = [
  {
    version: 1,
    id: 'sheet-omc-fondations',
    title: 'OMC — Fondations (dates & repères)',
    subject: 'OMC',
    description: "Complète les repères clés autour de la création de l'OMC.",
    items: [
      { id: 'i-1947', text: '1947', kind: 'date' },
      { id: 'i-1995', text: '1995', kind: 'date' },
      { id: 'i-gatt', text: 'GATT', kind: 'concept' },
      { id: 'i-marrakech', text: 'Accords de Marrakech', kind: 'concept' },
    ],
    sections: [
      {
        id: 's-1',
        title: 'Chronologie',
        slots: [
          { id: 'slot-omc-1947', label: 'Année de signature du GATT', accepts: ['date'], correctItemId: 'i-1947' },
          { id: 'slot-omc-1995', label: "Année d'entrée en vigueur de l'OMC", accepts: ['date'], correctItemId: 'i-1995' },
        ],
      },
      {
        id: 's-2',
        title: 'Notions',
        slots: [
          { id: 'slot-omc-gatt', label: 'Accord commercial multilatéral d’après-guerre', accepts: ['concept'], correctItemId: 'i-gatt' },
          { id: 'slot-omc-marrakech', label: "Traité qui acte la création de l'OMC", accepts: ['concept'], correctItemId: 'i-marrakech' },
        ],
      },
    ],
  },
  {
    version: 1,
    id: 'sheet-fmi-roles',
    title: 'FMI — Rôle et outils (repères)',
    subject: 'FMI',
    description: "Replace les notions et missions clés du FMI.",
    items: [
      { id: 'i-stabilite', text: 'Stabilité financière', kind: 'concept' },
      { id: 'i-bop', text: 'Balance des paiements', kind: 'concept' },
      { id: 'i-conditionnalite', text: 'Conditionnalité', kind: 'concept' },
      { id: 'i-quotes', text: 'Quotes-parts', kind: 'concept' },
    ],
    sections: [
      {
        id: 's-1',
        title: 'Missions',
        slots: [
          { id: 'slot-fmi-1', label: 'Surveiller et soutenir la…', accepts: ['concept'], correctItemId: 'i-stabilite' },
          { id: 'slot-fmi-2', label: 'Aide en cas de crise de…', accepts: ['concept'], correctItemId: 'i-bop' },
        ],
      },
      {
        id: 's-2',
        title: 'Gouvernance & prêts',
        slots: [
          { id: 'slot-fmi-3', label: "Les prêts s'accompagnent de…", accepts: ['concept'], correctItemId: 'i-conditionnalite' },
          { id: 'slot-fmi-4', label: 'La clé de répartition du pouvoir: …', accepts: ['concept'], correctItemId: 'i-quotes' },
        ],
      },
    ],
  },
  {
    version: 1,
    id: 'sheet-bm-missions',
    title: 'Banque mondiale — Missions (repères)',
    subject: 'BM',
    description: "Associe les missions et instruments de la Banque mondiale.",
    items: [
      { id: 'i-developpement', text: 'Développement', kind: 'concept' },
      { id: 'i-pauvrete', text: 'Réduction de la pauvreté', kind: 'concept' },
      { id: 'i-bird', text: 'BIRD', kind: 'concept' },
      { id: 'i-aid', text: 'AID', kind: 'concept' },
    ],
    sections: [
      {
        id: 's-1',
        title: 'Objectifs',
        slots: [
          { id: 'slot-bm-1', label: 'Financer le…', accepts: ['concept'], correctItemId: 'i-developpement' },
          { id: 'slot-bm-2', label: "Lutter contre…", accepts: ['concept'], correctItemId: 'i-pauvrete' },
        ],
      },
      {
        id: 's-2',
        title: 'Institutions',
        slots: [
          { id: 'slot-bm-3', label: 'Prêts aux pays à revenu intermédiaire: …', accepts: ['concept'], correctItemId: 'i-bird' },
          { id: 'slot-bm-4', label: 'Aide concessionnelle aux pays pauvres: …', accepts: ['concept'], correctItemId: 'i-aid' },
        ],
      },
    ],
  },
];
