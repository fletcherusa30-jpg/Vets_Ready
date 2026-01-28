import create from 'zustand';

type User = { email: string } | null;

type AppState = {
  user: User;
  setUser: (user: User) => void;
  scannerProgress: number;
  setScannerProgress: (progress: number) => void;
  resumeData: string;
  setResumeData: (data: string) => void;
  jobMatches: any[];
  setJobMatches: (matches: any[]) => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  scannerProgress: 0,
  setScannerProgress: (progress) => set({ scannerProgress: progress }),
  resumeData: '',
  setResumeData: (data) => set({ resumeData: data }),
  jobMatches: [],
  setJobMatches: (matches) => set({ jobMatches: matches }),
}));
