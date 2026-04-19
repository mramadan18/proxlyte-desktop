import { create } from "zustand";

export type UpdateStatus = 
  | "idle" 
  | "checking" 
  | "available" 
  | "not-available" 
  | "downloading" 
  | "downloaded" 
  | "error";

interface UpdateState {
  status: UpdateStatus;
  message: string;
  progress: number;
  version: string | null;
  error: string | null;
  
  setStatus: (status: UpdateStatus) => void;
  setMessage: (message: string) => void;
  setProgress: (progress: number) => void;
  setVersion: (version: string | null) => void;
  setError: (error: string | null) => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  status: "idle",
  message: "",
  progress: 0,
  version: null,
  error: null,

  setStatus: (status) => set({ status }),
  setMessage: (message) => set({ message }),
  setProgress: (progress) => set({ progress }),
  setVersion: (version) => set({ version }),
  setError: (error) => set({ error }),
}));
