import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Props {
  className?: string
  placeholder?: string
}

export default function SearchBar({ className = '', placeholder = '搜索作品、作者或景点...' }: Props) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/explore?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`relative ${className}`}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/30 backdrop-blur-md outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all duration-300"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-gold-400/20 text-gold-400 text-sm hover:bg-gold-400/30 transition-colors"
      >
        探索
      </button>
    </motion.form>
  )
}
