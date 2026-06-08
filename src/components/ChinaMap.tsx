import { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Work } from '../lib/types'

interface Props {
  works: Work[]
}

// Province name → adcode mapping for loading province GeoJSON
const PROVINCE_ADCODE: Record<string, string> = {
  '北京': '110000', '天津': '120000', '河北': '130000', '山西': '140000',
  '内蒙古': '150000', '辽宁': '210000', '吉林': '220000', '黑龙江': '230000',
  '上海': '310000', '江苏': '320000', '浙江': '330000', '安徽': '340000',
  '福建': '350000', '江西': '360000', '山东': '370000', '河南': '410000',
  '湖北': '420000', '湖南': '430000', '广东': '440000', '广西': '450000',
  '海南': '460000', '重庆': '500000', '四川': '510000', '贵州': '520000',
  '云南': '530000', '西藏': '540000', '陕西': '610000', '甘肃': '620000',
  '青海': '630000', '宁夏': '640000', '新疆': '650000',
  '台湾': '710000', '香港': '810000', '澳门': '820000',
}

export default function ChinaMap({ works }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [geoLoaded, setGeoLoaded] = useState(false)
  const [currentProvince, setCurrentProvince] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Load China GeoJSON
  useEffect(() => {
    fetch('/china.json')
      .then((res) => res.json())
      .then((geoJson) => {
        echarts.registerMap('china', geoJson)
        setGeoLoaded(true)
      })
  }, [])

  // Get works for current view
  const getWorksForView = useCallback(() => {
    if (!currentProvince) return works
    return works.filter((w) => w.province === currentProvince)
  }, [works, currentProvince])

  // Build national map option
  const buildNationalOption = useCallback((): echarts.EChartsOption => {
    const scatterData = works
      .filter((w) => w.longitude && w.latitude)
      .map((w) => ({
        name: w.scenic_spot,
        value: [w.longitude, w.latitude, w.id],
        work: w,
      }))

    const provinceCount: Record<string, number> = {}
    works.forEach((w) => {
      if (w.province) {
        provinceCount[w.province] = (provinceCount[w.province] || 0) + 1
      }
    })
    const mapData = Object.entries(provinceCount).map(([name, value]) => ({ name, value }))

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        className: 'echarts-tooltip-custom',
        formatter: (params: any) => {
          if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
            const w = params.data.work
            if (!w) return ''
            return `
              <div style="font-family: 'Noto Serif SC', serif;">
                <div style="font-size: 14px; color: #f0c060; margin-bottom: 4px;">${w.title}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7);">${w.author} · ${w.dynasty}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px;">${w.scenic_spot}</div>
              </div>
            `
          }
          if (params.data?.value) {
            return `<div style="font-family: 'Noto Sans SC', sans-serif;">
              <span style="color: #f0c060;">${params.name}</span>
              <span style="color: rgba(255,255,255,0.6); margin-left: 8px;">${params.data.value} 篇作品</span>
              <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px;">点击进入省份</div>
            </div>`
          }
          return ''
        },
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: isMobile ? 1.0 : 1.2,
        center: isMobile ? [104, 38] : [104, 35],
        scaleLimit: { min: 0.8, max: 12 },
        animationDurationUpdate: 1000,
        animationEasingUpdate: 'cubicInOut',
        label: {
          show: true,
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: isMobile ? 9 : 11,
          fontFamily: 'Noto Sans SC',
        },
        itemStyle: {
          areaColor: '#1a1a25',
          borderColor: 'rgba(240, 192, 96, 0.3)',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(240, 192, 96, 0.15)',
            borderColor: '#f0c060',
            borderWidth: 2,
            shadowBlur: 20,
            shadowColor: 'rgba(240, 192, 96, 0.3)',
          },
          label: {
            show: true,
            color: '#f0c060',
            fontSize: isMobile ? 12 : 14,
            fontFamily: 'Noto Sans SC',
            fontWeight: 'bold',
          },
        },
      },
      series: [
        {
          name: '作品分布',
          type: 'map',
          map: 'china',
          geoIndex: 0,
          data: mapData,
          animationDurationUpdate: 1000,
          animationEasingUpdate: 'cubicInOut',
        },
        {
          name: '景点',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: scatterData,
          symbolSize: isMobile ? 5 : 8,
          rippleEffect: {
            brushType: 'stroke',
            scale: isMobile ? 2 : 3,
            period: 4,
          },
          itemStyle: {
            color: '#5ce0d8',
            shadowBlur: isMobile ? 5 : 10,
            shadowColor: 'rgba(92, 224, 216, 0.5)',
          },
          emphasis: {
            itemStyle: {
              color: '#f0c060',
              shadowBlur: 20,
              shadowColor: 'rgba(240, 192, 96, 0.8)',
            },
            scale: true,
          },
          animationDelay: (idx: number) => idx * 10,
        },
      ],
    }
  }, [works, isMobile])

  // Build province-level option
  const buildProvinceOption = useCallback((provinceName: string): echarts.EChartsOption => {
    const provinceWorks = works.filter((w) => w.province === provinceName)
    const scatterData = provinceWorks
      .filter((w) => w.longitude && w.latitude)
      .map((w) => ({
        name: w.scenic_spot,
        value: [w.longitude, w.latitude, w.id],
        work: w,
      }))

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        className: 'echarts-tooltip-custom',
        formatter: (params: any) => {
          if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
            const w = params.data?.work
            if (!w) return ''
            return `
              <div style="font-family: 'Noto Serif SC', serif;">
                <div style="font-size: 14px; color: #f0c060; margin-bottom: 4px;">${w.title}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7);">${w.author} · ${w.dynasty}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px;">📍 ${w.scenic_spot}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px;">点击查看详情</div>
              </div>
            `
          }
          return ''
        },
      },
      geo: {
        map: provinceName,
        roam: true,
        zoom: isMobile ? 0.9 : 1.1,
        scaleLimit: { min: 0.6, max: 6 },
        animationDurationUpdate: 800,
        animationEasingUpdate: 'cubicOut',
        itemStyle: {
          areaColor: 'rgba(26, 26, 37, 0.9)',
          borderColor: 'rgba(92, 224, 216, 0.4)',
          borderWidth: 1.5,
          shadowBlur: 15,
          shadowColor: 'rgba(92, 224, 216, 0.2)',
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(92, 224, 216, 0.1)',
            borderColor: '#5ce0d8',
            borderWidth: 2,
          },
          label: {
            show: true,
            color: '#5ce0d8',
            fontSize: 13,
          },
        },
        label: {
          show: true,
          color: 'rgba(255,255,255,0.3)',
          fontSize: 11,
        },
      },
      series: [
        {
          name: '景点标记',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: scatterData,
          symbolSize: isMobile ? 10 : 14,
          rippleEffect: {
            brushType: 'stroke',
            scale: isMobile ? 3 : 5,
            period: 3,
          },
          label: {
            show: !isMobile,
            position: 'right',
            formatter: (params: any) => params.data?.work?.scenic_spot || '',
            color: 'rgba(240, 192, 96, 0.8)',
            fontSize: 12,
            fontFamily: 'Noto Serif SC',
          },
          itemStyle: {
            color: '#f0c060',
            shadowBlur: 15,
            shadowColor: 'rgba(240, 192, 96, 0.6)',
          },
          emphasis: {
            itemStyle: {
              color: '#5ce0d8',
              shadowBlur: 25,
              shadowColor: 'rgba(92, 224, 216, 0.8)',
            },
            label: {
              color: '#5ce0d8',
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          animationDelay: (idx: number) => 300 + idx * 80,
          animationDuration: 800,
          animationEasing: 'elasticOut',
        },
      ],
    }
  }, [works, isMobile])

  // Handle drill-down into province
  const drillDown = useCallback(async (provinceName: string) => {
    const adcode = PROVINCE_ADCODE[provinceName]
    if (!adcode) return

    setTransitioning(true)

    // Try to load province GeoJSON if not registered
    if (!echarts.getMap(provinceName)) {
      try {
        const res = await fetch(`/provinces/${adcode}.json`)
        if (res.ok) {
          const geoJson = await res.json()
          echarts.registerMap(provinceName, geoJson)
        } else {
          setTransitioning(false)
          return
        }
      } catch {
        setTransitioning(false)
        return
      }
    }

    setCurrentProvince(provinceName)
    setTimeout(() => setTransitioning(false), 600)
  }, [])

  // Handle going back to national view
  const goBack = useCallback(() => {
    setTransitioning(true)
    setCurrentProvince(null)
    setTimeout(() => setTransitioning(false), 600)
  }, [])

  // Initialize/update chart
  useEffect(() => {
    if (!chartRef.current || !geoLoaded) return

    const chart = chartInstance.current || echarts.init(chartRef.current, undefined, { renderer: 'canvas' })
    chartInstance.current = chart

    const option = currentProvince
      ? buildProvinceOption(currentProvince)
      : buildNationalOption()

    chart.clear()
    chart.setOption(option, true)

    // Remove old handlers
    chart.off('click')

    if (!currentProvince) {
      // National view: click province region to drill down
      chart.on('click', (params: any) => {
        if (params.componentType === 'geo' || params.seriesType === 'map') {
          const name = params.name
          if (name && PROVINCE_ADCODE[name]) {
            drillDown(name)
          }
        }
        if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
          const workId = params.data?.value?.[2]
          if (workId) navigate(`/work/${workId}`)
        }
      })
    } else {
      // Province view: click scatter point to go to detail
      chart.on('click', (params: any) => {
        if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
          const workId = params.data?.value?.[2]
          if (workId) navigate(`/work/${workId}`)
        }
      })
    }

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [geoLoaded, works, currentProvince, navigate, buildNationalOption, buildProvinceOption, drillDown, isMobile])

  // Cleanup
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  const provinceWorks = currentProvince
    ? works.filter((w) => w.province === currentProvince)
    : []

  return (
    <div className="relative w-full h-full">
      {!geoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-white/40 font-serif text-lg animate-pulse">山河图加载中...</div>
        </div>
      )}

      {/* Province navigation breadcrumb */}
      <AnimatePresence>
        {currentProvince && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute top-4 left-4 md:top-20 md:left-6 z-30 flex items-center gap-2 md:gap-3"
          >
            <button
              onClick={goBack}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-gold-400/40 hover:bg-white/10 transition-all duration-300"
            >
              <svg className="w-4 h-4 text-gold-400 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-white/60 text-sm group-hover:text-white/90">全国</span>
            </button>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gold-400 font-serif text-lg"
            >
              {currentProvince}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/30 text-sm"
            >
              {provinceWorks.length} 篇作品
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Province info panel */}
      <AnimatePresence>
        {currentProvince && provinceWorks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:top-20 md:right-6 z-30 md:w-72 max-h-[40vh] md:max-h-[60vh] overflow-y-auto"
          >
            <div className="bg-ink-900/90 md:bg-ink-900/80 backdrop-blur-xl border-t md:border border-white/10 md:rounded-2xl rounded-t-2xl p-4 space-y-2">
              <h3 className="text-white/70 text-xs uppercase tracking-wider mb-3">作品列表</h3>
              {provinceWorks.slice(0, 15).map((w, i) => (
                <motion.button
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  onClick={() => navigate(`/work/${w.id}`)}
                  className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-gold-400/20 transition-all duration-200 group"
                >
                  <div className="text-white/80 text-sm font-serif group-hover:text-gold-400 transition-colors">
                    {w.title}
                  </div>
                  <div className="text-white/40 text-xs mt-1">
                    {w.author} · {w.dynasty} · {w.scenic_spot}
                  </div>
                </motion.button>
              ))}
              {provinceWorks.length > 15 && (
                <button
                  onClick={() => navigate(`/explore?province=${currentProvince}`)}
                  className="w-full text-center text-gold-400/60 text-xs py-2 hover:text-gold-400 transition-colors"
                >
                  查看全部 {provinceWorks.length} 篇 →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 bg-ink-900/50 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-gold-400 font-serif text-xl"
            >
              {currentProvince || ''}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart container */}
      <div ref={chartRef} className="w-full h-full" />
    </div>
  )
}
