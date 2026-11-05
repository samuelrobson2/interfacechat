import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface PhoneState {
  isVerifyStarted: Record<string, boolean>;
}

interface PhoneActions {
  setIsVerifyStarted: (phone: string, isVerifyStarted: boolean) => void;
  clearVerifyStarted: (phone: string) => void;
}

type PhoneStore = PhoneState & PhoneActions;

export const usePhoneStore = create<PhoneStore>()(
  persist(
    immer((set) => ({
      // State
      isVerifyStarted: {},

      // Actions
      setIsVerifyStarted: (phone: string, isVerifyStarted: boolean) =>
        set((state) => {
          state.isVerifyStarted[phone] = isVerifyStarted;
        }),

      clearVerifyStarted: (phone: string) =>
        set((state) => {
          delete state.isVerifyStarted[phone];
        }),
    })),
    {
      name: "phone-store",
    },
  ),
);
