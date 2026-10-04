import { create } from 'zustand';

interface UiState {
  isFocusMode: boolean;
  setFocusMode: (isFocusMode: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isFocusMode: false,
  setFocusMode: (isFocusMode) => set({ isFocusMode }),
}));
