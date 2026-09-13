type StepIndicatorProps = {
  step: 1 | 2
  labels?: [string, string]
}

export function StepIndicator({
  step,
  labels = ['Event details', 'Advance payment'],
}: StepIndicatorProps) {
  return (
    <ul className="steps w-full" aria-label={`Step ${step} of 2`}>
      <li className="step step-primary" data-content={step > 1 ? '✓' : '1'}>
        {labels[0]}
      </li>
      <li className={step === 2 ? 'step step-primary' : 'step'} data-content="2">
        {labels[1]}
      </li>
    </ul>
  )
}
