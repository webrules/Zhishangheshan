import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Work } from '../lib/types'

interface Props {
  work: Work
  index?: number
}

export default function WorkCard({ work, index = 0 }: Props) {
  const coverImage = work.images?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <Link to={`/work/${work.id}`} className="block glass-card-hover overflow-hidden group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-ink-700">
          {coverImage ? (
            <img
              src={coverImage}
              alt={work.scenic_spot}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-serif text-white/20">{work.scenic_spot[0]}</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
          {/* Dynasty badge */}
          <span className="absolute top-3 right-3 px-2 py-1 text-xs rounded-full bg-gold-400/20 text-gold-400 border border-gold-400/30 backdrop-blur-sm">
            {work.dynasty}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-lg text-white/90 group-hover:text-gold-400 transition-colors mb-1">
            {work.title}
          </h3>
          <p className="text-sm text-white/50 mb-2">
            {work.author} · {work.scenic_spot}
          </p>
          <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
            {work.description}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
