import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 ink-texture">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <h1 className="font-serif text-3xl text-white/90 mb-6 glow-text">关于纸上山河</h1>

          <div className="space-y-6 text-white/60 leading-relaxed">
            <p>
              「纸上山河」是一个将中国古典诗词与地理空间相结合的文化探索项目。
              我们相信，每一首诗词背后都藏着一片山河，每一处山河之中都回荡着千年的吟诵。
            </p>

            <p>
              通过交互式地图，您可以直观地看到诗人笔下的名山大川、楼阁古迹在中国版图上的分布。
              点击任何一个标记点，都能打开一扇穿越时空的窗户——
              看见李白醉卧的庐山瀑布、杜甫远眺的岳阳楼、苏轼泛舟的赤壁......
            </p>

            <h2 className="font-serif text-xl text-white/80 pt-4">数据来源</h2>
            <p>
              本站数据整理自公开的古诗词文献与地理信息资料，经人工校对后录入。
              如有疏漏或错误，欢迎反馈指正。
            </p>

            <h2 className="font-serif text-xl text-white/80 pt-4">技术实现</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>前端：React + ECharts + Framer Motion</li>
              <li>后端：Cloudflare Pages Functions + D1 Database</li>
              <li>地图：阿里云 DataV GeoJSON + ECharts 散点图</li>
              <li>部署：Cloudflare Pages 全球边缘网络</li>
            </ul>

            <div className="pt-6 border-t border-white/10">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-400/80 transition-colors text-sm"
              >
                ← 回到山河图
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
