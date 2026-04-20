import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  activeBrandId: string | null;
  setActiveBrandId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeBrandId: null,
      setActiveBrandId: (id) => set({ activeBrandId: id }),
    }),
    { name: "smb-social-app-store" }
  )
);
