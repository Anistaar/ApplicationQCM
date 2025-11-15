import { Question } from '../types.js';

export type Session = {
  userId: string;
  course: string;
  mode: 'entrainement' | 'examen';
  queue: Question[];
  index: number; // 0-based
  qcmBuffer?: string[]; // selections awaiting validation
  dmBuffer?: Record<string, string>; // item -> match selections awaiting validation
};

const sessions = new Map<string, Session>(); // key: guildId:userId

function key(guildId: string, userId: string) { return `${guildId}:${userId}`; }

export function setSession(guildId: string, s: Session) {
  sessions.set(key(guildId, s.userId), s);
}

export function getSession(guildId: string, userId: string): Session | undefined {
  return sessions.get(key(guildId, userId));
}

export function clearSession(guildId: string, userId: string) {
  sessions.delete(key(guildId, userId));
}
