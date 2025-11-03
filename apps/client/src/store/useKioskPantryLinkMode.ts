import {create} from 'zustand';

interface KioskPantryLinkModeStore {
  kioskPantryLinkId: string | null;
  setKioskPantryLinkId: (id: string | null) => void;
};

export const useKioskPantryLinkMode = create<KioskPantryLinkModeStore>((set) => ({
  kioskPantryLinkId: null,
  setKioskPantryLinkId: (id) => set({kioskPantryLinkId: id})
}));
