import * as XLSX from 'xlsx'
import { PROVINCE_COORDS } from './constants'

interface ParsedRow {
  title: string
  scenic_spot: string
  author: string
  dynasty: string
  description: string
  province: string
  latitude: number
  longitude: number
  category: string
  images: string[]
}

/**
 * Parse Excel file (xlsx/xls) into structured data
 * Expected columns: 序号, 作品名称, 对应景点, 作者, 朝代/时期, 景点简介, 省份, 纬度, 经度
 */
export async function parseExcelFile(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet)

  // Debug: log column headers for first row
  if (rows.length > 0) {
    console.log('[Excel Parser] Detected columns:', Object.keys(rows[0]))
    console.log('[Excel Parser] First row sample:', rows[0])
  }

  // Build a column mapping: normalize all headers and map to our field names
  const colHeaders = rows.length > 0 ? Object.keys(rows[0]) : []
  const columnMap = buildColumnMap(colHeaders)
  console.log('[Excel Parser] Column mapping:', columnMap)

  return rows
    .map((row) => {
      // Get value using mapped column name
      const get = (field: string): string => {
        const col = columnMap[field]
        if (!col) return ''
        const val = row[col]
        return val !== undefined ? String(val).trim() : ''
      }

      const title = get('title')
      const scenic_spot = get('scenic_spot')
      if (!title || !scenic_spot) return null

      const rawProvince = get('province')
      // Strip suffixes like 省/市/自治区 to match our constants
      const province = rawProvince
        ? normalizeProvince(rawProvince)
        : guessProvince(scenic_spot)
      const coords = province ? (PROVINCE_COORDS[province] || [0, 0]) : [0, 0]

      // Support combined coordinate column "坐标" (e.g., "111.6531,34.3891" = lng,lat)
      let lat = 0
      let lng = 0
      const combinedCoord = get('coordinates')
      if (combinedCoord) {
        const parts = combinedCoord.split(/[,，\s]+/)
        if (parts.length === 2) {
          lng = parseFloat(parts[0].trim()) || 0
          lat = parseFloat(parts[1].trim()) || 0
        }
      }
      // Fallback to separate columns
      if (!lat) lat = parseFloat(get('latitude')) || coords[1]
      if (!lng) lng = parseFloat(get('longitude')) || coords[0]

      const dynasty = get('dynasty')

      return {
        title,
        scenic_spot,
        author: get('author'),
        dynasty,
        description: get('description'),
        province,
        latitude: lat,
        longitude: lng,
        category: get('category'),
        images: (() => {
          const imgStr = get('images')
          return imgStr ? imgStr.split(/[,，]/).map(s => s.trim()).filter(Boolean) : []
        })(),
      }
    })
    .filter(Boolean) as ParsedRow[]
}

/**
 * Build a mapping from our internal field names to actual Excel column headers.
 * Uses keyword matching to handle various naming conventions.
 */
function buildColumnMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {}

  // Normalize a header for matching: remove spaces, BOM, invisible chars, normalize slashes
  const normalize = (s: string) =>
    s.replace(/[\s\u200B\uFEFF\u00A0]/g, '')
     .replace(/[／∕/]/g, '/')
     .toLowerCase()

  // Define matching rules: field → list of keywords (any match wins)
  const rules: [string, string[]][] = [
    ['title', ['作品名称', '作品名', '作品', 'title']],
    ['scenic_spot', ['对应景点', '景点', 'scenic', 'spot']],
    ['author', ['作者', 'author']],
    ['dynasty', ['朝代', '时期', 'dynasty', '年代']],
    ['description', ['景点简介', '简介', 'description', '介绍', '描述']],
    ['province', ['省份', 'province', '省']],
    ['coordinates', ['坐标', 'coordinate', '经纬度']],
    ['latitude', ['纬度', 'latitude', 'lat']],
    ['longitude', ['经度', 'longitude', 'lng']],
    ['category', ['分类', 'category', '类别', '类型']],
    ['images', ['图片', 'image', '链接', '照片']],
  ]

  for (const [field, keywords] of rules) {
    if (map[field]) continue
    for (const header of headers) {
      const nh = normalize(header)
      for (const kw of keywords) {
        if (nh.includes(normalize(kw)) || normalize(kw).includes(nh)) {
          map[field] = header
          break
        }
      }
      if (map[field]) break
    }
  }

  return map
}

// Simple province guesser based on known scenic spots
function guessProvince(spot: string): string {
  const mapping: Record<string, string> = {
    '庐山': '江西', '滕王阁': '江西',
    '岳阳楼': '湖南', '岳麓山': '湖南',
    '黄鹤楼': '湖北', '赤壁': '湖北',
    '西湖': '浙江',
    '寒山寺': '江苏', '瓜洲': '江苏', '乌衣巷': '江苏',
    '泰山': '山东',
    '鹳雀楼': '山西',
    '白帝城': '重庆',
    '长安': '陕西', '华清池': '陕西',
    '玉门关': '甘肃', '阳关': '甘肃',
    '天门山': '安徽', '黄山': '安徽',
  }
  for (const [key, prov] of Object.entries(mapping)) {
    if (spot.includes(key)) return prov
  }
  return ''
}

// Normalize province names: "河南省" → "河南", "内蒙古自治区" → "内蒙古", etc.
function normalizeProvince(raw: string): string {
  const trimmed = raw.trim()
  // Direct match first
  if (PROVINCE_COORDS[trimmed]) return trimmed
  // Strip common suffixes
  const stripped = trimmed
    .replace(/省$/, '')
    .replace(/市$/, '')
    .replace(/自治区$/, '')
    .replace(/特别行政区$/, '')
    .replace(/壮族$/, '')
    .replace(/维吾尔$/, '')
    .replace(/回族$/, '')
  if (PROVINCE_COORDS[stripped]) return stripped
  // Fuzzy match: check if any known province starts with or is contained in the input
  for (const prov of Object.keys(PROVINCE_COORDS)) {
    if (trimmed.includes(prov) || prov.includes(stripped)) return prov
  }
  return stripped
}
