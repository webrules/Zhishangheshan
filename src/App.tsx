import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Home from './pages/Home'
import Explore from './pages/Explore'
import WorkDetail from './pages/WorkDetail'
import About from './pages/About'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'
import AdminEdit from './pages/AdminEdit'

export default function App() {
  return (
    <div className="min-h-screen bg-ink-900">
      <Header />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/work/:id" element={<WorkDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/edit/:id" element={<AdminEdit />} />
          <Route path="/admin/new" element={<AdminEdit />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
