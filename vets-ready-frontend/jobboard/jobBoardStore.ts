import { create } from "zustand"
import { JobPosting, VeteranJobProfile, JobApplication } from "../types"

export type JobBoardState = {
  jobs: JobPosting[]
  veteranProfile: VeteranJobProfile | null
  applications: JobApplication[]
  setJobs: (jobs: JobPosting[]) => void
  setVeteranProfile: (profile: VeteranJobProfile) => void
  addApplication: (app: JobApplication) => void
  setApplications: (apps: JobApplication[]) => void
}

export const useJobBoardStore = create<JobBoardState>((set) => ({
  jobs: [],
  veteranProfile: null,
  applications: [],
  setJobs: (jobs) => set({ jobs }),
  setVeteranProfile: (profile) => set({ veteranProfile: profile }),
  addApplication: (app) => set((state) => ({ applications: [...state.applications, app] })),
  setApplications: (apps) => set({ applications: apps }),
}))
