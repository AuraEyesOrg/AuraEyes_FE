import { create } from 'zustand';

type ScreeningState = {
  selectedFile: File | null;
  setSelectedFile: (file: File) => void;
  clearFile: () => void;
};

export const useScreeningStore = create<ScreeningState>((set) => ({
  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),
  clearFile: () => set({ selectedFile: null }),
}));
