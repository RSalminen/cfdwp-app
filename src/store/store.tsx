import { create } from "zustand";
import { IMessage } from "../types";

type MyStore = {
    authHasFailed: boolean;
    authFailed: () => void;
    reLoginSuccess: () => void;
    message:IMessage;
    updateMessage: (input:IMessage) => void;
};

const useMyStore = create<MyStore>((set) => ({
    authHasFailed: false,
    authFailed: () => set(() => ({ authHasFailed: true})),
    reLoginSuccess: () => set(() => ({ authHasFailed: false})),

    message:{
        message:"",
        status: 0,
    },
    updateMessage: (input:IMessage) => set(() => ({ message: input }))

}))

export default useMyStore;