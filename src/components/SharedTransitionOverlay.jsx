import { AnimatePresence, motion } from 'framer-motion'
import { useUltraExperience } from '../context/UltraExperienceContext'
import { useContent } from '../context/ContentContext'
import './SharedTransitionOverlay.css'

export default function SharedTransitionOverlay() {
  const { transition } = useUltraExperience()
  const { content } = useContent()
  const enabled = content?.experience_settings?.cinematic_transitions_enabled !== 0

  return (
    <AnimatePresence>
      {enabled && transition && (
        <motion.div className="shared-transition-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
          <motion.div
            className="shared-transition-card elite-glass"
            initial={{ x: transition.sourceRect?.left || 0, y: transition.sourceRect?.top || 0, scale: 0.42, opacity: 0.72 }}
            animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.54, ease: [0.23, 1, 0.32, 1] }}
          >
            {transition.item?.image ? <img src={transition.item.image} alt="" /> : <span>{transition.item?.item_name?.slice(0, 1)}</span>}
            <strong>{transition.item?.item_name}</strong>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
