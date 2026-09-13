type StepIndicatorProps = {
  step: 1 | 2
  labels?: [string, string]
}

export function StepIndicator({
  step,
  labels = ['Event details', 'Advance payment'],
}: StepIndicatorProps) {
  return (
    <ul className="steps w-full max-w-full min-w-0 text-sm sm:text-base" aria-label={`Step ${step} of 2`}>
      <li className="step step-primary min-w-0" data-content={step > 1 ? '✓' : '1'}>
        <span className="px-1">{labels[0]}</span>
      </li>
      <li className={`min-w-0 ${step === 2 ? 'step step-primary' : 'step'}`} data-content="2">
        <span className="px-1">{labels[1]}</span>
      </li>
    </ul>
  )
}
