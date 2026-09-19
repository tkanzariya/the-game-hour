type StepIndicatorProps = {
  current: number
  labels: string[]
}

export function StepIndicator({ current, labels }: StepIndicatorProps) {
  const total = labels.length
  return (
    <ul
      className="steps w-full max-w-full min-w-0 text-sm sm:text-base"
      aria-label={`Step ${current} of ${total}`}
    >
      {labels.map((label, index) => {
        const step = index + 1
        const done = current > step
        const active = current >= step
        return (
          <li
            key={label}
            className={`min-w-0 ${active ? 'step step-primary' : 'step'}`}
            data-content={done ? '✓' : String(step)}
          >
            <span className="px-1">{label}</span>
          </li>
        )
      })}
    </ul>
  )
}
