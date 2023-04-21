import { create } from "zustand";
import { IMessage, ITeacherCollObj, ITeacherSimObj } from "../types";

type MyStore = {
    authHasFailed: boolean;
    authFailed: () => void;
    reLoginSuccess: () => void;
    message:IMessage;
    updateMessage: (input:IMessage) => void;
    simulationsByTeacher:ITeacherSimObj[] | null;
    setSimulationsByTeacher: (input:ITeacherSimObj[]) => void;
    collectionsByTeacher:ITeacherCollObj[] | null;
    setCollectionsByTeacher: (input:ITeacherCollObj[]) => void;
};

const useMyStore = create<MyStore>((set) => ({
    authHasFailed: false,
    authFailed: () => set(() => ({ authHasFailed: true})),
    reLoginSuccess: () => set(() => ({ authHasFailed: false})),

    message:{
        message:"",
        status: 0,
    },
    updateMessage: (input:IMessage) => set(() => ({ message: input })),
    simulationsByTeacher: null,
    setSimulationsByTeacher: (input:ITeacherSimObj[]) => set({ simulationsByTeacher: input}),
    collectionsByTeacher: null,
    setCollectionsByTeacher: (input:ITeacherCollObj[]) => set({ collectionsByTeacher: input })

}));

export default useMyStore;