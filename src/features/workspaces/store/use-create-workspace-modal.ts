import { atom, useAtom } from "jotai"

const modalState = atom(false);

export const useCreateWorkspaceModalAtom = () => useAtom(modalState)