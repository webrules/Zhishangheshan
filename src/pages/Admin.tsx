import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchWorks, deleteWork } from '../lib/api'
import { parseExcelFile } from '../lib/excel'
import type { Work } from '../lib/types'

export default function Admin() {
  const [works, setWorks] = useState<Work[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const token = sessionStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    loadData()
  }, [page, search])

  const loadData = async () => {
    setLoading(true)
    const res = await fetchWorks({ page, limit: 20, search })
    if (res.success) {
      setWorks(res.data || [])
      setTotal(res.total || 0)
    }
    setLoading(false)
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`确定删除「${title}」？此操作不可恢复。`)) return
    if (!token) return
    const res = await deleteWork(id, token)
    if (res.success) {
      loadData()
    } else {
      alert(res.error || '删除失败')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    try {
      const data = await parseExcelFile(file)
      if (data.length === 0) {
        alert('未解析到有效数据')
        return
      }

      // Show preview of parsed data for validation
      const dynastySample = [...new Set(data.slice(0, 50).map(d => d.dynasty).filter(Boolean))]
      const previewMsg = `解析到 ${data.length} 条数据。\n\n` +
        `朝代示例: ${dynastySample.length > 0 ? dynastySample.join(', ') : '(未检测到朝代数据!)'}\n` +
        `省份示例: ${[...new Set(data.slice(0, 20).map(d => d.province).filter(Boolean))].join(', ')}\n\n` +
        `点击"确定"覆盖导入（清空旧数据）\n点击"取消"增量追加`

      const mode = confirm(previewMsg) ? 'replace' : 'append'

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode, data }),
      })
      const result = await res.json()
      if (result.success) {
        alert(`导入成功！共导入 ${result.data?.count || 0} 条记录。`)
        loadData()
      } else {
        alert(result.error || '导入失败')
      }
    } catch (err: any) {
      alert('Excel 解析失败: ' + err.message)
    }
    e.target.value = ''
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 md:px-8 bg-ink-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl text-white/90">后台管理</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              回到前台
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem('admin_token')
                navigate('/admin/login')
              }}
              className="px-3 py-1.5 rounded-lg text-red-400/60 text-sm hover:text-red-400 transition-colors"
            >
              退出
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass-card p-4 mb-6 flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="搜索..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-gold-400/50 transition-colors"
          />
          <Link
            to="/admin/new"
            className="px-4 py-2 rounded-lg bg-jade-400/20 text-jade-400 text-sm border border-jade-400/30 hover:bg-jade-400/30 transition-colors"
          >
            + 新增作品
          </Link>
          <label className="px-4 py-2 rounded-lg bg-gold-400/20 text-gold-400 text-sm border border-gold-400/30 hover:bg-gold-400/30 transition-colors cursor-pointer">
            导入 Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
          </label>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center text-white/40 animate-pulse">加载中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-white/40 font-normal">ID</th>
                    <th className="px-4 py-3 text-left text-white/40 font-normal">作品名称</th>
                    <th className="px-4 py-3 text-left text-white/40 font-normal">作者</th>
                    <th className="px-4 py-3 text-left text-white/40 font-normal">景点</th>
                    <th className="px-4 py-3 text-left text-white/40 font-normal">朝代</th>
                    <th className="px-4 py-3 text-left text-white/40 font-normal">省份</th>
                    <th className="px-4 py-3 text-right text-white/40 font-normal">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {works.map((work) => (
                    <tr key={work.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white/30">{work.id}</td>
                      <td className="px-4 py-3 text-white/80">{work.title}</td>
                      <td className="px-4 py-3 text-white/60">{work.author}</td>
                      <td className="px-4 py-3 text-white/60">{work.scenic_spot}</td>
                      <td className="px-4 py-3 text-gold-400/70">{work.dynasty}</td>
                      <td className="px-4 py-3 text-white/50">{work.province}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/edit/${work.id}`}
                          className="text-jade-400/70 hover:text-jade-400 mr-3 transition-colors"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(work.id, work.title)}
                          className="text-red-400/50 hover:text-red-400 transition-colors"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-sm disabled:opacity-30 hover:bg-white/10"
            >
              上一页
            </button>
            <span className="text-white/40 text-sm">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-sm disabled:opacity-30 hover:bg-white/10"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
