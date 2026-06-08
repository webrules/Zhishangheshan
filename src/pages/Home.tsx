import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChinaMap from '../components/ChinaMap'
import ParticleBackground from '../components/ParticleBackground'
import SearchBar from '../components/SearchBar'
import { fetchWorks } from '../lib/api'
import type { Work } from '../lib/types'

export default function Home() {
  const [works, setWorks] = useState<Work[]>([])
  const [stats, setStats] = useState({ total: 0, spots: 0, dynasties: 0 })
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDynasty, setSelectedDynasty] = useState('')

  useEffect(() => {
    fetchWorks({ limit: 2000 }).then((res) => {
      if (res.success && res.data) {
        setWorks(res.data)
        const spots = new Set(res.data.map((w: Work) => w.scenic_spot)).size
        const dynasties = new Set(res.data.map((w: Work) => w.dynasty)).size
        setStats({ total: res.data.length, spots, dynasties })
      }
    })
  }, [])

  const provinces = useMemo(() => {
    const set = new Set(works.map((w) => w.province).filter(Boolean))
    return Array.from(set).sort()
  }, [works])

  const dynasties = useMemo(() => {
    const set = new Set(works.map((w) => w.dynasty).filter(Boolean))
    return Array.from(set).sort()
  }, [works])

  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      if (selectedProvince && w.province !== selectedProvince) return false
      if (selectedDynasty && w.dynasty !== selectedDynasty) return false
      return true
    })
  }, [works, selectedProvince, selectedDynasty])

  return (
    <div className="relative w-screen h-screen overflow-hidden ink-texture">
      <ParticleBackground />

      {/* Map - full screen */}
      <div className="absolute inset-0 z-10">
        <ChinaMap works={filteredWorks} />
      </div>

      {/* Top overlay - Search + Filters */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
        <SearchBar />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-3 flex items-center justify-center gap-3 flex-wrap"
        >
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="px-3 py-1.5 rounded-full text-sm bg-ink-900/70 backdrop-blur-md border border-white/10 text-white/80 focus:outline-none focus:border-gold-400/40 appearance-none cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="">全部省份</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={selectedDynasty}
            onChange={(e) => setSelectedDynasty(e.target.value)}
            className="px-3 py-1.5 rounded-full text-sm bg-ink-900/70 backdrop-blur-md border border-white/10 text-white/80 focus:outline-none focus:border-gold-400/40 appearance-none cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="">全部朝代</option>
            {dynasties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <AnimatePresence>
            {(selectedProvince || selectedDynasty) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => { setSelectedProvince(''); setSelectedDynasty('') }}
                className="px-3 py-1.5 rounded-full text-xs bg-gold-400/10 border border-gold-400/30 text-gold-400 hover:bg-gold-400/20 transition-colors"
              >
                清除筛选
              </motion.button>
            )}
          </AnimatePresence>
          {(selectedProvince || selectedDynasty) && (
            <span className="text-white/40 text-xs">
              {filteredWorks.length} 篇
            </span>
          )}
        </motion.div>
      </div>

      {/* Bottom overlay - Stats & tagline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
      >
        <div className="bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent pt-20 pb-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-3xl md:text-4xl text-white/90 mb-3 glow-text">
              纸上山河
            </h1>
            <p className="text-white/50 text-sm md:text-base mb-6">
              在地图上探索古诗词中的名胜古迹，寻找文学与山河的交汇之处
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gradient-gold">{stats.total}</span>
                <span className="text-white/40 mt-1">篇作品</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gradient-jade">{stats.spots}</span>
                <span className="text-white/40 mt-1">个景点</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gradient-gold">{stats.dynasties}</span>
                <span className="text-white/40 mt-1">个朝代</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l border-t border-gold-400/20 z-20" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r border-t border-gold-400/20 z-20" />
    </div>
  )
}
