import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import WorkCard from '../components/WorkCard'
import { fetchWorks } from '../lib/api'
import { DYNASTIES, PROVINCES, CATEGORIES } from '../lib/constants'
import type { Work } from '../lib/types'

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [works, setWorks] = useState<Work[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const search = searchParams.get('search') || ''
  const dynasty = searchParams.get('dynasty') || ''
  const province = searchParams.get('province') || ''
  const category = searchParams.get('category') || ''

  useEffect(() => {
    setLoading(true)
    fetchWorks({ page, limit: 12, search, dynasty, province, category }).then((res) => {
      if (res.success) {
        setWorks(res.data || [])
        setTotal(res.total || 0)
      }
      setLoading(false)
    })
  }, [page, search, dynasty, province, category])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    setPage(1)
    setSearchParams(params)
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 ink-texture">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-3xl text-white/90 mb-2">探索</h1>
          <p className="text-white/40 text-sm">共收录 {total} 篇作品</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-8"
        >
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="搜索作品、作者或景点..."
              className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-gold-400/50 transition-colors"
            />

            {/* Dynasty filter */}
            <select
              value={dynasty}
              onChange={(e) => updateFilter('dynasty', e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="">全部朝代</option>
              {DYNASTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Province filter */}
            <select
              value={province}
              onChange={(e) => updateFilter('province', e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="">全部省份</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="">全部分类</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Results grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-white/40 animate-pulse font-serif">加载中...</div>
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-white/30 font-serif text-lg">暂无相关作品</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {works.map((work, i) => (
              <WorkCard key={work.id} work={work} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              上一页
            </button>
            <span className="text-white/40 text-sm px-4">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
