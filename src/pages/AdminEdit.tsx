import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchWork, createWork, updateWork } from '../lib/api'
import { DYNASTIES, PROVINCES, CATEGORIES } from '../lib/constants'

export default function AdminEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    scenic_spot: '',
    author: '',
    dynasty: '',
    description: '',
    province: '',
    latitude: 0,
    longitude: 0,
    category: '',
    images: [''],
  })

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    if (id) {
      fetchWork(Number(id)).then((res) => {
        if (res.success && res.data) {
          const w = res.data
          setForm({
            title: w.title || '',
            scenic_spot: w.scenic_spot || '',
            author: w.author || '',
            dynasty: w.dynasty || '',
            description: w.description || '',
            province: w.province || '',
            latitude: w.latitude || 0,
            longitude: w.longitude || 0,
            category: w.category || '',
            images: w.images?.length ? w.images : [''],
          })
        }
        setLoading(false)
      })
    }
  }, [id])

  const updateField = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateImage = (index: number, value: string) => {
    const newImages = [...form.images]
    newImages[index] = value
    setForm((prev) => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  const removeImageField = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)

    const payload = {
      ...form,
      images: form.images.filter((url) => url.trim()),
    }

    let res
    if (isNew) {
      res = await createWork(payload, token)
    } else {
      res = await updateWork(Number(id), payload, token)
    }

    if (res.success) {
      navigate('/admin')
    } else {
      alert(res.error || '保存失败')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 md:px-8 bg-ink-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl text-white/90">
            {isNew ? '新增作品' : '编辑作品'}
          </h1>
          <Link to="/admin" className="text-white/40 text-sm hover:text-white/70">
            ← 返回列表
          </Link>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 md:p-8 space-y-5"
        >
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">作品名称 *</label>
              <input
                required
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-gold-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">对应景点 *</label>
              <input
                required
                value={form.scenic_spot}
                onChange={(e) => updateField('scenic_spot', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-gold-400/50 transition-colors"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">作者</label>
              <input
                value={form.author}
                onChange={(e) => updateField('author', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-gold-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">朝代/时期</label>
              <select
                value={form.dynasty}
                onChange={(e) => updateField('dynasty', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm outline-none focus:border-gold-400/50 appearance-none"
              >
                <option value="">选择朝代</option>
                {DYNASTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">分类</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm outline-none focus:border-gold-400/50 appearance-none"
              >
                <option value="">选择分类</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">省份</label>
              <select
                value={form.province}
                onChange={(e) => updateField('province', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm outline-none focus:border-gold-400/50 appearance-none"
              >
                <option value="">选择省份</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">纬度</label>
              <input
                type="number"
                step="0.01"
                value={form.latitude || ''}
                onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-gold-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">经度</label>
              <input
                type="number"
                step="0.01"
                value={form.longitude || ''}
                onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-gold-400/50 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/50 text-sm mb-1">景点简介</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-gold-400/50 transition-colors resize-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-white/50 text-sm mb-2">图片链接</label>
            <div className="space-y-2">
              {form.images.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={url}
                    onChange={(e) => updateImage(i, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-gold-400/50 transition-colors"
                  />
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(i)}
                      className="px-3 text-red-400/50 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 text-sm text-jade-400/60 hover:text-jade-400 transition-colors"
            >
              + 添加图片
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-gold-400/20 text-gold-400 border border-gold-400/30 hover:bg-gold-400/30 disabled:opacity-50 transition-all text-sm font-medium"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <Link
              to="/admin"
              className="px-6 py-2.5 rounded-lg bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-all text-sm"
            >
              取消
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
