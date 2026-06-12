import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Header() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) return null

  const navItems = [
    { path: '/', label: '山河图' },
    { path: '/explore', label: '探索' },
    { path: '/routes', label: '诗路' },
    { path: '/about', label: '关于' },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-jade-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="font-serif text-xl font-semibold text-white/90 group-hover:text-white transition-colors">
            纸上山河
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-white/10 text-gold-400 backdrop-blur-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  )
}
