import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchWork, fetchWorks } from '../lib/api'
import type { Work } from '../lib/types'

export default function WorkDetail() {
  const { id } = useParams()
  const [work, setWork] = useState<Work | null>(null)
  const [related, setRelated] = useState<Work[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchWork(Number(id)).then((res) => {
      if (res.success && res.data) {
        setWork(res.data)
        // Fetch related works (same scenic spot or same author)
        fetchWorks({ limit: 4, province: res.data.province }).then((r) => {
          if (r.success && r.data) {
            setRelated(r.data.filter((w: Work) => w.id !== res.data.id).slice(0, 3))
          }
        })
      }
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 animate-pulse font-serif text-lg">加载中...</div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/30 font-serif text-lg">作品未找到</div>
      </div>
    )
  }

  const images = work.images || []

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 ink-texture">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link to="/explore" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            ← 返回探索
          </Link>
        </motion.div>

        {/* Hero image carousel */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden mb-8 aspect-[16/9]"
          >
            <img
              src={images[currentImage]}
              alt={work.scenic_spot}
              className="w-full h-full object-cover transition-all duration-1000"
              style={{ animation: 'kenburns 20s ease-in-out infinite alternate' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />

            {/* Carousel dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImage ? 'bg-gold-400 w-6' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 md:p-10"
        >
          {/* Title & meta */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl text-white/95 mb-4 glow-text">
              {work.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-gold-400/15 text-gold-400 text-sm border border-gold-400/20">
                {work.dynasty}
              </span>
              <span className="text-white/60 text-sm">{work.author}</span>
              <span className="text-white/30">·</span>
              <span className="text-jade-400/80 text-sm">{work.scenic_spot}</span>
              {work.category && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="text-white/40 text-sm">{work.category}</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none">
            <p className="text-white/70 leading-relaxed text-base whitespace-pre-wrap">
              {work.description}
            </p>
          </div>

          {/* Location info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{work.province} · {work.scenic_spot}</span>
            </div>
          </div>
        </motion.div>

        {/* Related works */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <h2 className="font-serif text-xl text-white/70 mb-4">相关作品</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/work/${r.id}`}
                  className="glass-card-hover p-4"
                >
                  <h3 className="font-serif text-white/80 mb-1">{r.title}</h3>
                  <p className="text-sm text-white/40">{r.author} · {r.scenic_spot}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Ken Burns animation keyframes */}
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }
      `}</style>
    </div>
  )
}
