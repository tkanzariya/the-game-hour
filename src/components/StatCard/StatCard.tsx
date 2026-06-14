import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

type StatCardProps = {
  value: string
  label: string
  icon?: ReactNode
  className?: string
}

export default function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'surface-clay flex flex-col items-center rounded-3xl px-8 py-10 text-center transition-brand hover:shadow-card-hover',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl surface-accent-light text-2xl text-on-accent-subtle">
          {icon}
        </div>
      )}
      <p className="font-heading text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
        {value}
      </p>
      <p className="mt-3 text-sm font-medium leading-relaxed text-accent-muted-grey">{label}</p>
    </motion.div>
  )
}
