import { create } from "zustand";

type MyStore = {
    authHasFailed: boolean;
    authFailed: () => void;
    reLoginSuccess: () => void;
};

const useMyStore = create<MyStore>((set) => ({
    authHasFailed: false,
    authFailed: () => set((state) => ({ authHasFailed: true})),
    reLoginSuccess: () => set((state) => ({ authHasFailed: false})),
}))

export default useMyStore;