import { useTransitionStore } from "../transitionStore"
import { ChecklistItem } from "../types"

const SAMPLE_ITEMS: ChecklistItem[] = [
  {
    id: "fin1",
    category: "finance",
    title: "Review financial status",
    description: "Comprehensive review of income, expenses, and savings",
    completed: false,
    priority: "high",
  },
  {
    id: "emp1",
    category: "employment",
    title: "Update resume",
    description: "Translate military experience to civilian format",
    completed: false,
    priority: "high",
  },
  {
    id: "heal1",
    category: "healthcare",
    title: "Obtain medical records",
    description: "Request copies from military medical facilities",
    completed: false,
    priority: "high",
  },
  {
    id: "edu1",
    category: "education",
    title: "Research education benefits",
    description: "Explore GI Bill and other education options",
    completed: false,
    priority: "medium",
  },
]

export function TransitionChecklist() {
  const { checklist, setChecklist, toggleItem } = useTransitionStore()

  const handleInitialize = () => {
    setChecklist({
      id: "checklist-1",
      userId: "user-123",
      items: SAMPLE_ITEMS,
      completedCount: 0,
      totalCount: SAMPLE_ITEMS.length,
      progressPercent: 0,
    })
  }

  if (!checklist) {
    return <button onClick={handleInitialize}>Load Checklist</button>
  }

  return (
    <div className="transition-checklist">
      <h2>Transition Checklist</h2>
      <div className="progress-bar">
        <div style={{ width: `${checklist.progressPercent}%` }} className="progress-fill" />
      </div>
      <p>
        {checklist.completedCount} of {checklist.totalCount} ({checklist.progressPercent}%)
      </p>

      <ul>
        {checklist.items.map((item) => (
          <li key={item.id}>
            <input type="checkbox" checked={item.completed} onChange={() => toggleItem(item.id)} />
            <div>
              <strong>{item.title}</strong> <span className={`priority ${item.priority}`}>{item.priority}</span>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
