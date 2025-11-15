export type Mode = 'entrainement' | 'examen';

export type Answer = { text: string; correct: boolean };
export type DragPair = { item: string; match: string };
export type Question =
  | { type: 'VF'; question: string; vf: 'V' | 'F'; explication?: string; topics?: string[] }
  | { type: 'QR'; question: string; answers: Answer[]; explication?: string; topics?: string[] }
  | { type: 'QCM'; question: string; answers: Answer[]; explication?: string; topics?: string[] }
  | { type: 'DragMatch'; question: string; pairs: DragPair[]; explication?: string; topics?: string[] };

export type UserAnswer =
  | { kind: 'VF'; value: 'V' | 'F' }
  | { kind: 'QR'; value: string | null }
  | { kind: 'QCM'; values: string[] }
  | { kind: 'DragMatch'; matches: Record<string, string> };
