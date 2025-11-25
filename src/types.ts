export type Mode = 'entrainement' | 'examen' | 'flashcards' | 'match';
export type QuestionType = 'QCM' | 'QR' | 'VF' | 'DragMatch' | 'OpenQ';

export type Answer = { text: string; correct: boolean };

export type DragPair = { item: string; match: string };

export type Question = {
  type: QuestionType;
  question: string;
  answers?: Answer[];   // QCM/QR
  vf?: 'V' | 'F';       // VF
  pairs?: DragPair[];   // DragMatch
  expectedKeywords?: string[];  // OpenQ : mots-clés attendus
  referenceCourse?: string;     // OpenQ : extrait cours référence
  explication?: string | null;
  tags?: string[];      // <-- nouveau
};

export type UserAnswer =
  | { kind: 'QCM'; values: string[] }
  | { kind: 'QR'; value: string | null }
  | { kind: 'VF'; value: 'V' | 'F' | null }
  | { kind: 'DragMatch'; matches: Record<string, string> }
  | { kind: 'OpenQ'; text: string; isCorrect?: boolean };
