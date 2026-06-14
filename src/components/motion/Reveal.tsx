import { motion, type HTMLMotionProps } from 'framer-motion'
import { slideUp, stagger, staggerItem } from '@/animations'
import { viewportOnce } from '@/animations/config'
import { cn } from '@/utils/cn'

type RevealProps = HTMLMotionProps<'div'> & {
  staggerChildren?: boolean
}

/** Scroll-triggered reveal, brand motion language */
export function Reveal({
  children,
  className,
  staggerChildren = false,
  ...props
}: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerChildren ? stagger : slideUp}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={staggerItem} className={cn(className)} {...props}>
      {children}
    </motion.div>
  )
}
