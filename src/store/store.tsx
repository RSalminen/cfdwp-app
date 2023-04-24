import { create } from "zustand";
import { IMessage, ITeacherCollObj, ITeacherSimObj } from "../types";

let interval : any;

type MyStore = {
    authHasFailed: boolean;
    authFailed: () => void;
    reLoginSuccess: () => void;
    message:IMessage;
    updateMessage: (input:IMessage) => void;
    messageProgress:number;
    simulationsByTeacher:ITeacherSimObj[] | null;
    setSimulationsByTeacher: (input:ITeacherSimObj[]) => void;
    collectionsByTeacher:ITeacherCollObj[] | null;
    setCollectionsByTeacher: (input:ITeacherCollObj[]) => void;
};

const useMyStore = create<MyStore>((set, get) => ({
    authHasFailed: false,
    authFailed: () => set(() => ({ authHasFailed: true})),
    reLoginSuccess: () => set(() => ({ authHasFailed: false})),

    messageProgress: 0,
    setMessageProgress : (input:number) => set(() => ({ messageProgress: input })),

    message:{
        message:"",
        status: 0,
    },
    updateMessage: (input:IMessage) => {

        set(() => ({ message: input }));
        clearInterval(interval);

        if (input.status > 1) {
            set(() => ({ messageProgress: 0 }));

            interval = setInterval(() => {
                if (get().messageProgress === 100 || get().message.status <2) {
                    set(() => ({ message: {message:"", status:0}, messageProgress:0 }));
                    clearInterval(interval);
                    return;
                }
                set((state) => ({ messageProgress: state.messageProgress + 1 }));
            }, 50);
        }
    },

    simulationsByTeacher: null,
    setSimulationsByTeacher: (input:ITeacherSimObj[]) => set({ simulationsByTeacher: input}),
    collectionsByTeacher: null,
    setCollectionsByTeacher: (input:ITeacherCollObj[]) => set({ collectionsByTeacher: input })

}));

export default useMyStore;