export interface LiteraryRouteStop {
  name: string
  province?: string
}

export interface LiteraryRoute {
  id: string
  title: string
  poet: string
  theme: string
  summary: string
  stops: LiteraryRouteStop[]
}

export const LITERARY_ROUTES: LiteraryRoute[] = [
  {
    id: 'li-bai-out-of-shu',
    title: '李白出蜀',
    poet: '李白',
    theme: '少年远游',
    summary: '从蜀地山水出发，顺江东下，追随李白初离故土后的壮阔远游。',
    stops: [
      { name: '江油', province: '四川' },
      { name: '绵阳', province: '四川' },
      { name: '成都', province: '四川' },
      { name: '峨眉山 / 乐山', province: '四川' },
      { name: '重庆' },
      { name: '宜昌', province: '湖北' },
      { name: '荆州', province: '湖北' },
      { name: '武汉', province: '湖北' },
      { name: '九江', province: '江西' },
      { name: '南京', province: '江苏' },
    ],
  },
  {
    id: 'du-fu-wandering',
    title: '杜甫漂泊',
    poet: '杜甫',
    theme: '乱世行旅',
    summary: '从关中到巴蜀、荆湘，串起杜甫晚年漂泊中的山河与忧思。',
    stops: [
      { name: '西安', province: '陕西' },
      { name: '天水', province: '甘肃' },
      { name: '成都', province: '四川' },
      { name: '重庆' },
      { name: '宜昌', province: '湖北' },
      { name: '荆州', province: '湖北' },
      { name: '岳阳', province: '湖南' },
      { name: '长沙', province: '湖南' },
      { name: '衡阳', province: '湖南' },
    ],
  },
  {
    id: 'bai-juyi-jiangnan',
    title: '白居易江南',
    poet: '白居易',
    theme: '仕宦江南',
    summary: '从长安、洛阳到杭州、苏州，呈现白居易在江南城市中的诗意治理与闲适。',
    stops: [
      { name: '西安', province: '陕西' },
      { name: '洛阳', province: '河南' },
      { name: '杭州', province: '浙江' },
      { name: '苏州', province: '江苏' },
      { name: '扬州', province: '江苏' },
      { name: '九江', province: '江西' },
      { name: '庐山', province: '江西' },
    ],
  },
  {
    id: 'su-shi-southbound',
    title: '苏轼南行',
    poet: '苏轼',
    theme: '贬谪与旷达',
    summary: '沿苏轼数次外放与贬谪的南行轨迹，连接黄州、惠州、儋州等精神转折地。',
    stops: [
      { name: '开封', province: '河南' },
      { name: '杭州', province: '浙江' },
      { name: '湖州', province: '浙江' },
      { name: '黄州', province: '湖北' },
      { name: '惠州', province: '广东' },
      { name: '儋州', province: '海南' },
    ],
  },
  {
    id: 'xin-qiji-looking-north',
    title: '辛弃疾北望',
    poet: '辛弃疾',
    theme: '北望中原',
    summary: '从济南故土到江南仕宦地，突出辛弃疾词中的家国眺望与壮志难酬。',
    stops: [
      { name: '济南', province: '山东' },
      { name: '镇江', province: '江苏' },
      { name: '南京', province: '江苏' },
      { name: '上饶', province: '江西' },
      { name: '鹰潭', province: '江西' },
      { name: '福州', province: '福建' },
    ],
  },
  {
    id: 'lu-you-into-shu',
    title: '陆游入蜀',
    poet: '陆游',
    theme: '入蜀纪行',
    summary: '沿陆游入蜀途中经过的江南、荆楚、三峡与巴蜀，呈现一条真实感强的行旅线。',
    stops: [
      { name: '绍兴', province: '浙江' },
      { name: '杭州', province: '浙江' },
      { name: '南京', province: '江苏' },
      { name: '镇江', province: '江苏' },
      { name: '武汉', province: '湖北' },
      { name: '宜昌', province: '湖北' },
      { name: '重庆' },
      { name: '成都', province: '四川' },
    ],
  },
  {
    id: 'wang-wei-zhongnan',
    title: '王维终南山水',
    poet: '王维',
    theme: '山水禅意',
    summary: '以长安周边山水为中心，展开王维诗中空灵、幽静的终南世界。',
    stops: [
      { name: '西安', province: '陕西' },
      { name: '蓝田', province: '陕西' },
      { name: '华阴', province: '陕西' },
      { name: '洛阳', province: '河南' },
      { name: '嵩山', province: '河南' },
    ],
  },
  {
    id: 'frontier-poetry-road',
    title: '边塞诗路',
    poet: '岑参 / 高适 / 王昌龄',
    theme: '西北边塞',
    summary: '从关中一路向西，连接河西走廊的关城、沙漠与边塞诗歌传统。',
    stops: [
      { name: '西安', province: '陕西' },
      { name: '天水', province: '甘肃' },
      { name: '兰州', province: '甘肃' },
      { name: '武威', province: '甘肃' },
      { name: '张掖', province: '甘肃' },
      { name: '嘉峪关', province: '甘肃' },
      { name: '敦煌', province: '甘肃' },
    ],
  },
  {
    id: 'xin-qiji-jiangnan',
    title: '辛弃疾江南登临',
    poet: '辛弃疾',
    theme: '登临怀古',
    summary: '以江南登临地串起辛弃疾的现实处境、北伐理想与沉郁词心。',
    stops: [
      { name: '济南', province: '山东' },
      { name: '南京', province: '江苏' },
      { name: '镇江', province: '江苏' },
      { name: '扬州', province: '江苏' },
      { name: '上饶', province: '江西' },
      { name: '鹰潭', province: '江西' },
      { name: '福州', province: '福建' },
    ],
  },
  {
    id: 'bai-juyi-jiangzhou-wuyue',
    title: '白居易江州吴越',
    poet: '白居易',
    theme: '江州与吴越',
    summary: '从中原政治中心到江州贬谪，再到杭州、苏州，呈现白居易人生地理的明暗转折。',
    stops: [
      { name: '西安', province: '陕西' },
      { name: '洛阳', province: '河南' },
      { name: '九江', province: '江西' },
      { name: '庐山', province: '江西' },
      { name: '杭州', province: '浙江' },
      { name: '苏州', province: '江苏' },
    ],
  },
]
