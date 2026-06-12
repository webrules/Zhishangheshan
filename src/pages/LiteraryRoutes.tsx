import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as echarts from 'echarts'
import { fetchWorks } from '../lib/api'
import { LITERARY_ROUTES } from '../lib/routes'
import type { LiteraryRoute } from '../lib/routes'
import type { Work } from '../lib/types'

const ROUTE_CITY_COORDS: Record<string, [number, number]> = {
  江油: [104.745, 31.778],
  绵阳: [104.679, 31.467],
  成都: [104.066, 30.572],
  '峨眉山 / 乐山': [103.765, 29.552],
  重庆: [106.551, 29.563],
  宜昌: [111.286, 30.692],
  荆州: [112.239, 30.336],
  武汉: [114.305, 30.593],
  九江: [115.953, 29.662],
  南京: [118.797, 32.06],
  西安: [108.94, 34.342],
  天水: [105.724, 34.581],
  岳阳: [113.129, 29.357],
  长沙: [112.938, 28.228],
  衡阳: [112.572, 26.894],
  洛阳: [112.454, 34.619],
  杭州: [120.155, 30.274],
  苏州: [120.585, 31.299],
  扬州: [119.412, 32.394],
  庐山: [115.974, 29.557],
  开封: [114.307, 34.798],
  湖州: [120.086, 30.894],
  黄州: [114.879, 30.435],
  惠州: [114.416, 23.112],
  儋州: [109.58, 19.52],
  济南: [117.12, 36.652],
  镇江: [119.425, 32.189],
  上饶: [117.943, 28.454],
  鹰潭: [117.069, 28.26],
  福州: [119.296, 26.074],
  绍兴: [120.582, 29.998],
  蓝田: [109.323, 34.151],
  华阴: [110.089, 34.565],
  嵩山: [113.05, 34.453],
  兰州: [103.834, 36.061],
  武威: [102.638, 37.928],
  张掖: [100.449, 38.925],
  嘉峪关: [98.289, 39.773],
  敦煌: [94.662, 40.142],
}

interface RouteCityPoem {
  title: string
  author: string
  lines: string[]
}

const ROUTE_CITY_POEMS: Record<string, Record<string, RouteCityPoem>> = {
  'li-bai-out-of-shu': {
    重庆: {
      title: '早发白帝城',
      author: '李白',
      lines: ['朝辞白帝彩云间，千里江陵一日还。', '两岸猿声啼不住，轻舟已过万重山。'],
    },
    宜昌: {
      title: '渡荆门送别',
      author: '李白',
      lines: ['渡远荆门外，来从楚国游。', '山随平野尽，江入大荒流。'],
    },
    荆州: {
      title: '荆州歌',
      author: '李白',
      lines: ['白帝城边足风波，瞿塘五月谁敢过。', '荆州麦熟茧成蛾，缲丝忆君头绪多。'],
    },
    武汉: {
      title: '黄鹤楼送孟浩然之广陵',
      author: '李白',
      lines: ['故人西辞黄鹤楼，烟花三月下扬州。', '孤帆远影碧空尽，唯见长江天际流。'],
    },
    南京: {
      title: '登金陵凤凰台',
      author: '李白',
      lines: ['凤凰台上凤凰游，凤去台空江自流。', '总为浮云能蔽日，长安不见使人愁。'],
    },
  },
  'du-fu-wandering': {
    成都: {
      title: '春夜喜雨',
      author: '杜甫',
      lines: ['好雨知时节，当春乃发生。', '晓看红湿处，花重锦官城。'],
    },
    荆州: {
      title: '公安县怀古',
      author: '杜甫',
      lines: ['野旷吕蒙营，江深刘备城。', '寒天催日短，风浪与云平。'],
    },
    岳阳: {
      title: '登岳阳楼',
      author: '杜甫',
      lines: ['昔闻洞庭水，今上岳阳楼。', '吴楚东南坼，乾坤日夜浮。'],
    },
    长沙: {
      title: '江南逢李龟年',
      author: '杜甫',
      lines: ['岐王宅里寻常见，崔九堂前几度闻。', '正是江南好风景，落花时节又逢君。'],
    },
  },
  'bai-juyi-jiangnan': {
    杭州: {
      title: '忆江南',
      author: '白居易',
      lines: ['江南好，风景旧曾谙。', '日出江花红胜火，春来江水绿如蓝。'],
    },
    九江: {
      title: '琵琶行',
      author: '白居易',
      lines: ['浔阳江头夜送客，枫叶荻花秋瑟瑟。', '同是天涯沦落人，相逢何必曾相识。'],
    },
  },
  'su-shi-southbound': {
    杭州: {
      title: '饮湖上初晴后雨',
      author: '苏轼',
      lines: ['水光潋滟晴方好，山色空蒙雨亦奇。', '欲把西湖比西子，淡妆浓抹总相宜。'],
    },
    黄州: {
      title: '定风波',
      author: '苏轼',
      lines: ['竹杖芒鞋轻胜马，谁怕？', '一蓑烟雨任平生。'],
    },
    惠州: {
      title: '惠州一绝',
      author: '苏轼',
      lines: ['罗浮山下四时春，卢橘杨梅次第新。', '日啖荔枝三百颗，不辞长作岭南人。'],
    },
  },
  'xin-qiji-looking-north': {
    镇江: {
      title: '永遇乐·京口北固亭怀古',
      author: '辛弃疾',
      lines: ['千古江山，英雄无觅，孙仲谋处。', '想当年，金戈铁马，气吞万里如虎。'],
    },
    南京: {
      title: '水龙吟·登建康赏心亭',
      author: '辛弃疾',
      lines: ['楚天千里清秋，水随天去秋无际。', '把吴钩看了，栏杆拍遍，无人会，登临意。'],
    },
  },
  'lu-you-into-shu': {
    绍兴: {
      title: '沈园二首',
      author: '陆游',
      lines: ['城上斜阳画角哀，沈园非复旧池台。', '伤心桥下春波绿，曾是惊鸿照影来。'],
    },
    镇江: {
      title: '书愤',
      author: '陆游',
      lines: ['楼船夜雪瓜洲渡，铁马秋风大散关。', '出师一表真名世，千载谁堪伯仲间。'],
    },
  },
  'wang-wei-zhongnan': {
    西安: {
      title: '终南别业',
      author: '王维',
      lines: ['行到水穷处，坐看云起时。', '偶然值林叟，谈笑无还期。'],
    },
    蓝田: {
      title: '辋川闲居赠裴秀才迪',
      author: '王维',
      lines: ['寒山转苍翠，秋水日潺湲。', '渡头余落日，墟里上孤烟。'],
    },
  },
  'frontier-poetry-road': {
    武威: {
      title: '凉州馆中与诸判官夜集',
      author: '岑参',
      lines: ['弯弯月出挂城头，城头月出照凉州。', '凉州七里十万家，胡人半解弹琵琶。'],
    },
    敦煌: {
      title: '白雪歌送武判官归京',
      author: '岑参',
      lines: ['忽如一夜春风来，千树万树梨花开。', '瀚海阑干百丈冰，愁云惨淡万里凝。'],
    },
  },
  'xin-qiji-jiangnan': {
    南京: {
      title: '水龙吟·登建康赏心亭',
      author: '辛弃疾',
      lines: ['楚天千里清秋，水随天去秋无际。', '把吴钩看了，栏杆拍遍，无人会，登临意。'],
    },
    镇江: {
      title: '永遇乐·京口北固亭怀古',
      author: '辛弃疾',
      lines: ['千古江山，英雄无觅，孙仲谋处。', '想当年，金戈铁马，气吞万里如虎。'],
    },
  },
  'bai-juyi-jiangzhou-wuyue': {
    九江: {
      title: '琵琶行',
      author: '白居易',
      lines: ['浔阳江头夜送客，枫叶荻花秋瑟瑟。', '同是天涯沦落人，相逢何必曾相识。'],
    },
    杭州: {
      title: '忆江南',
      author: '白居易',
      lines: ['江南好，风景旧曾谙。', '日出江花红胜火，春来江水绿如蓝。'],
    },
  },
}

function getRouteViewport(coords: Array<[number, number]>) {
  if (coords.length === 0) return { center: [104, 35] as [number, number], zoom: 1.15 }

  const longitudes = coords.map(([longitude]) => longitude)
  const latitudes = coords.map(([, latitude]) => latitude)
  const minLongitude = Math.min(...longitudes)
  const maxLongitude = Math.max(...longitudes)
  const minLatitude = Math.min(...latitudes)
  const maxLatitude = Math.max(...latitudes)
  const longitudeSpan = Math.max(maxLongitude - minLongitude, 4)
  const latitudeSpan = Math.max(maxLatitude - minLatitude, 3)
  const zoom = Math.min(5.2, Math.max(1.25, Math.min(34 / longitudeSpan, 24 / latitudeSpan)))

  return {
    center: [(minLongitude + maxLongitude) / 2, (minLatitude + maxLatitude) / 2] as [number, number],
    zoom,
  }
}

function stopKeywords(stopName: string) {
  return stopName.split('/').map((name) => name.trim()).filter(Boolean)
}

function routeMatchesWork(route: LiteraryRoute, work: Work) {
  const poets = route.poet.split('/').map((name) => name.trim())
  const matchesPoet = poets.some((poet) => work.author.includes(poet))
  const matchesStop = route.stops.some((stop) => {
    return stopKeywords(stop.name).some((keyword) => {
      return work.scenic_spot.includes(keyword) || work.description.includes(keyword)
    })
  })

  return matchesPoet || matchesStop
}

function RouteChinaMap({ route }: { route: LiteraryRoute }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [geoLoaded, setGeoLoaded] = useState(Boolean(echarts.getMap('china')))
  const [hoveredPoem, setHoveredPoem] = useState<RouteCityPoem | null>(null)
  const [poemPosition, setPoemPosition] = useState({ x: 24, y: 24 })
  const routePoints = useMemo(() => {
    return route.stops
      .map((stop, index) => {
        const coord = ROUTE_CITY_COORDS[stop.name]
        if (!coord) return null
        return {
          name: stop.name,
          value: [...coord, index + 1] as [number, number, number],
          stop,
        }
      })
      .filter(Boolean) as Array<{ name: string; value: [number, number, number]; stop: LiteraryRoute['stops'][number] }>
  }, [route])

  useEffect(() => {
    if (echarts.getMap('china')) {
      setGeoLoaded(true)
      return
    }

    fetch('/china.json')
      .then((res) => res.json())
      .then((geoJson) => {
        echarts.registerMap('china', geoJson)
        setGeoLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (!chartRef.current || !geoLoaded) return

    const chart = chartInstance.current || echarts.init(chartRef.current, undefined, { renderer: 'canvas' })
    chartInstance.current = chart

    const lineData = routePoints.slice(0, -1).map((point, index) => ({
      coords: [point.value.slice(0, 2), routePoints[index + 1].value.slice(0, 2)],
      fromName: point.name,
      toName: routePoints[index + 1].name,
    }))
    const routeViewport = getRouteViewport(routePoints.map((point) => [point.value[0], point.value[1]]))

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        show: false,
        triggerOn: 'none',
      },
      geo: {
        map: 'china',
        tooltip: {
          show: false,
          triggerOn: 'none',
        },
        roam: true,
        zoom: routeViewport.zoom,
        center: routeViewport.center,
        scaleLimit: { min: 0.8, max: 8 },
        label: {
          show: false,
        },
        itemStyle: {
          areaColor: 'rgba(26, 26, 37, 0.88)',
          borderColor: 'rgba(240, 192, 96, 0.22)',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(92, 224, 216, 0.08)',
            borderColor: '#5ce0d8',
          },
          label: {
            show: false,
          },
        },
      },
      series: [
        {
          name: '诗路连线',
          type: 'lines',
          coordinateSystem: 'geo',
          tooltip: {
            show: false,
          },
          data: lineData,
          zlevel: 2,
          lineStyle: {
            color: '#f0c060',
            width: 2,
            opacity: 0.76,
            curveness: 0.18,
          },
          effect: {
            show: true,
            period: 6,
            trailLength: 0.18,
            symbol: 'arrow',
            symbolSize: 8,
            color: '#5ce0d8',
          },
        },
        {
          name: '路线城市',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          tooltip: {
            show: false,
          },
          data: routePoints,
          zlevel: 3,
          symbolSize: 10,
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
          },
          label: {
            show: true,
            formatter: (params: any) => `${params.data.value[2]}. ${params.name}`,
            position: 'right',
            color: 'rgba(255,255,255,0.78)',
            fontSize: 11,
            fontFamily: 'Noto Serif SC',
          },
          itemStyle: {
            color: '#5ce0d8',
            shadowBlur: 12,
            shadowColor: 'rgba(92, 224, 216, 0.55)',
          },
          emphasis: {
            itemStyle: {
              color: '#f0c060',
            },
            label: {
              color: '#f0c060',
              fontWeight: 'bold',
            },
          },
        },
      ],
    }, true)

    const updateHoveredPoem = (offsetX: number, offsetY: number) => {
      const nearest = routePoints.reduce<{ name: string; distance: number } | null>((currentNearest, point) => {
        const pixel = chart.convertToPixel({ geoIndex: 0 }, point.value.slice(0, 2)) as number[] | undefined
        if (!pixel) return currentNearest

        const distance = Math.hypot(pixel[0] - offsetX, pixel[1] - offsetY)
        if (!currentNearest || distance < currentNearest.distance) {
          return { name: point.name, distance }
        }
        return currentNearest
      }, null)

      if (nearest && nearest.distance <= 72) {
        setHoveredPoem(ROUTE_CITY_POEMS[route.id]?.[nearest.name] || null)
      } else {
        setHoveredPoem(null)
      }
    }

    const zr = chart.getZr()
    zr.off('mousemove')
    zr.off('mouseout')
    zr.on('mousemove', (event: any) => {
      const offsetX = event.offsetX ?? event.zrX ?? event.event?.offsetX
      const offsetY = event.offsetY ?? event.zrY ?? event.event?.offsetY
      if (typeof offsetX !== 'number' || typeof offsetY !== 'number') return

      const width = chart.getWidth()
      const height = chart.getHeight()
      setPoemPosition({
        x: Math.min(offsetX + 18, width - 360),
        y: Math.min(offsetY + 18, height - 150),
      })
      updateHoveredPoem(offsetX, offsetY)
    })
    zr.on('mouseout', () => {
      setHoveredPoem(null)
    })

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      zr.off('mousemove')
      zr.off('mouseout')
      window.removeEventListener('resize', handleResize)
    }
  }, [geoLoaded, route, routePoints])

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [])

  return (
    <div
      className="relative min-h-[460px] lg:min-h-[680px] rounded-xl overflow-hidden bg-ink-900/40 border border-white/10"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPoemPosition({
          x: Math.min(event.clientX - rect.left + 18, rect.width - 360),
          y: Math.min(event.clientY - rect.top + 18, rect.height - 150),
        })

        const chart = chartInstance.current
        if (!chart) return

        const nearest = routePoints.reduce<{ name: string; distance: number } | null>((currentNearest, point) => {
          const pixel = chart.convertToPixel({ geoIndex: 0 }, point.value.slice(0, 2)) as number[] | undefined
          if (!pixel) return currentNearest

          const distance = Math.hypot(pixel[0] - (event.clientX - rect.left), pixel[1] - (event.clientY - rect.top))
          if (!currentNearest || distance < currentNearest.distance) {
            return { name: point.name, distance }
          }
          return currentNearest
        }, null)

        if (nearest && nearest.distance <= 72) {
          setHoveredPoem(ROUTE_CITY_POEMS[route.id]?.[nearest.name] || null)
        } else {
          setHoveredPoem(null)
        }
      }}
      onMouseLeave={() => setHoveredPoem(null)}
    >
      {!geoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/40 font-serif animate-pulse">
          诗路地图加载中...
        </div>
      )}
      <div ref={chartRef} className="absolute inset-0" />
      {hoveredPoem && (
        <div
          className="pointer-events-none absolute z-20 w-80 rounded-xl border border-gold-400/25 bg-ink-900/95 backdrop-blur-md px-4 py-3 shadow-2xl"
          style={{ left: poemPosition.x, top: poemPosition.y }}
        >
          <div className="text-gold-400/80 text-xs mb-2">{hoveredPoem.author} · {hoveredPoem.title}</div>
          <div className="font-serif text-white/82 text-sm leading-7 whitespace-nowrap">
            {hoveredPoem.lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LiteraryRoutes() {
  const [works, setWorks] = useState<Work[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState(LITERARY_ROUTES[0].id)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (import.meta.env.DEV && window.location.port !== '8788') {
      setLoading(false)
      return
    }

    fetchWorks({ limit: 2000 })
      .then((res) => {
        if (res.success && res.data) {
          setWorks(res.data)
        }
      })
      .catch(() => {
        setWorks([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const selectedRoute = useMemo(() => {
    return LITERARY_ROUTES.find((route) => route.id === selectedRouteId) || LITERARY_ROUTES[0]
  }, [selectedRouteId])

  const relatedWorks = useMemo(() => {
    return works.filter((work) => routeMatchesWork(selectedRoute, work)).slice(0, 8)
  }, [selectedRoute, works])

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 ink-texture">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-gold-400/70 text-sm mb-3">Curated Routes</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-white/95 glow-text">诗路游线</h1>
              <p className="text-white/45 text-sm md:text-base mt-3 max-w-2xl">
                以诗人与主题组织山河路径，从静态城市线索出发，连接现有作品、景点和详情页。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="glass-card px-4 py-3">
                <div className="font-serif text-2xl text-gradient-gold">{LITERARY_ROUTES.length}</div>
                <div className="text-white/40 mt-1">条路线</div>
              </div>
              <div className="glass-card px-4 py-3">
                <div className="font-serif text-2xl text-gradient-jade">{selectedRoute.stops.length}</div>
                <div className="text-white/40 mt-1">个节点</div>
              </div>
              <div className="glass-card px-4 py-3">
                <div className="font-serif text-2xl text-gradient-gold">{relatedWorks.length}</div>
                <div className="text-white/40 mt-1">相关作品</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-3 lg:sticky lg:top-24"
          >
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {LITERARY_ROUTES.map((route, index) => {
                const active = route.id === selectedRoute.id
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      active
                        ? 'bg-gold-400/10 border-gold-400/40'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${active ? 'text-gold-400 border-gold-400/40' : 'text-white/35 border-white/10'}`}>
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-serif text-white/85">{route.title}</div>
                        <div className="text-xs text-white/35 mt-1">{route.theme} · {route.stops.length} 站</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            key={selectedRoute.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <section className="glass-card p-6 md:p-8 overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-jade-400/10 border border-jade-400/20 text-jade-400/80 text-xs">
                      {selectedRoute.theme}
                    </span>
                    <span className="text-white/35 text-sm">{selectedRoute.poet}</span>
                  </div>
                  <h2 className="font-serif text-3xl text-white/95">{selectedRoute.title}</h2>
                  <p className="text-white/55 leading-relaxed mt-4 max-w-3xl">{selectedRoute.summary}</p>
                </div>
                <Link
                  to={`/explore?search=${encodeURIComponent(selectedRoute.poet.split('/')[0].trim())}`}
                  className="shrink-0 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:text-gold-400 hover:border-gold-400/30 transition-colors"
                >
                  搜索相关作者
                </Link>
              </div>

              <div>
                <RouteChinaMap route={selectedRoute} />
              </div>
            </section>

            <section className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="font-serif text-xl text-white/85">馆藏关联</h3>
                  <p className="text-white/35 text-sm mt-1">按作者、景点和描述中的城市线索自动匹配。</p>
                </div>
                {loading && <span className="text-white/35 text-sm animate-pulse">加载中...</span>}
              </div>

              {!loading && relatedWorks.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-white/40 text-sm">
                  暂无匹配作品。后续可以在后台为作品补充城市字段，让路线匹配更精准。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {relatedWorks.map((work) => (
                    <Link
                      key={work.id}
                      to={`/work/${work.id}`}
                      className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.07] hover:border-gold-400/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-serif text-white/85 group-hover:text-gold-400 transition-colors">{work.title}</h4>
                          <p className="text-white/40 text-sm mt-1">{work.author} · {work.dynasty}</p>
                        </div>
                        <span className="text-jade-400/70 text-xs whitespace-nowrap">{work.province}</span>
                      </div>
                      <p className="text-white/35 text-sm mt-3 line-clamp-2">{work.scenic_spot}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
