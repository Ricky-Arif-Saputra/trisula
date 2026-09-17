export type ScreenType = 'beranda' | 'materi' | 'latihan' | 'latihan-rme' | 'simulasi' | 'dashboard';

export type MathCategory = 'bilangan' | 'aljabar' | 'geometri' | 'trigonometri' | 'peluang';

export interface StudentProfile {
  name: string;
  className: string;
  rank: number;
  totalStudents: number;
  totalXp: number;
  streakDays: number;
  rmeIndex: number;
  level: string;
  avatarUrl: string;
}

export interface CognitiveAspect {
  label: string;
  score: number;
  color: string;
  icon: string;
}

export interface StrandProgress {
  id: MathCategory;
  name: string;
  subtext: string;
  percentage: number;
  isPriority?: boolean;
  statusText: string;
}

export interface TrisulaBadge {
  id: string;
  name: string;
  status: 'unlocked' | 'in_progress' | 'locked';
  subtext: string;
  icon: string;
  progress?: number;
  color: string;
}
