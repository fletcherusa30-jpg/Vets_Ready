import { TransitionTimelineTask, TransitionTimeline } from "../types"

const CRITICAL_TASKS: TransitionTimelineTask[] = [
  {
    id: "24m-1",
    monthsBeforeSeparation: 24,
    category: "finance",
    title: "Start financial planning",
    description: "Begin comprehensive financial review and planning for post-service life",
    priority: "high",
    completed: false,
  },
  {
    id: "24m-2",
    monthsBeforeSeparation: 24,
    category: "employment",
    title: "Update resume and LinkedIn",
    description: "Translate military experience to civilian format",
    priority: "high",
    completed: false,
  },
  {
    id: "18m-1",
    monthsBeforeSeparation: 18,
    category: "healthcare",
    title: "Review medical records",
    description: "Obtain copies of medical records and treatment history for VA claims",
    priority: "high",
    completed: false,
  },
  {
    id: "18m-2",
    monthsBeforeSeparation: 18,
    category: "benefits",
    title: "Understand VA benefits",
    description: "Complete VA benefits overview and begin eligibility assessment",
    priority: "high",
    completed: false,
  },
  {
    id: "12m-1",
    monthsBeforeSeparation: 12,
    category: "employment",
    title: "Identify target employers",
    description: "Research veteran-friendly companies and industries",
    priority: "high",
    completed: false,
  },
  {
    id: "12m-2",
    monthsBeforeSeparation: 12,
    category: "education",
    title: "Explore education options",
    description: "Research GI Bill approved schools and programs",
    priority: "medium",
    completed: false,
  },
  {
    id: "6m-1",
    monthsBeforeSeparation: 6,
    category: "finance",
    title: "File VA disability claim",
    description: "Submit VA Form 21-0966 with medical evidence",
    priority: "high",
    completed: false,
  },
  {
    id: "6m-2",
    monthsBeforeSeparation: 6,
    category: "housing",
    title: "Obtain CoE for VA home loan",
    description: "Request Certificate of Eligibility from VA",
    priority: "medium",
    completed: false,
  },
  {
    id: "3m-1",
    monthsBeforeSeparation: 3,
    category: "employment",
    title: "Initiate job search",
    description: "Apply to target positions, schedule interviews",
    priority: "high",
    completed: false,
  },
  {
    id: "3m-2",
    monthsBeforeSeparation: 3,
    category: "healthcare",
    title: "Enroll in VA healthcare",
    description: "Complete VA.gov enrollment and schedule first appointment",
    priority: "high",
    completed: false,
  },
  {
    id: "0m-1",
    monthsBeforeSeparation: 0,
    category: "legal",
    title: "Obtain DD-214",
    description: "Request discharge papers from military records",
    priority: "high",
    completed: false,
  },
  {
    id: "post1",
    monthsBeforeSeparation: -1,
    category: "benefits",
    title: "Register for unemployment benefits",
    description: "File unemployment claim if needed",
    priority: "medium",
    completed: false,
  },
  {
    id: "post2",
    monthsBeforeSeparation: -3,
    category: "finance",
    title: "Monitor TSP rollover options",
    description: "Review and execute TSP distribution strategy if applicable",
    priority: "high",
    completed: false,
  },
]

export function generateTransitionTimeline(separationDate: Date): TransitionTimelineTask[] {
  const now = new Date()
  const monthsUntil = (separationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44)

  return CRITICAL_TASKS.filter((task) => task.monthsBeforeSeparation <= monthsUntil + 1).map((task) => ({ ...task }))
}

export function getTasksByCategory(tasks: TransitionTimelineTask[], category: string) {
  return tasks.filter((t) => t.category === category)
}

export function calculateProgress(tasks: TransitionTimelineTask[]): { completed: number; total: number; percent: number } {
  const completed = tasks.filter((t) => t.completed).length
  const total = tasks.length
  return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
}
