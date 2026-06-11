import gzip
import json
import os
import re
import gzip
import json
import os
import re
import sqlite3
import time
import urllib.parse
import urllib.request
from pathlib import Path

schema = Path('schema.sql').read_text(encoding='utf-8')
seed = Path('seed.sql').read_text(encoding='utf-8')

conn = sqlite3.connect(':memory:')
cur = conn.cursor()
cur.executescript(schema)
cur.executescript(seed)
rows = cur.execute(
	"SELECT id, title, scenic_spot, author, dynasty, description, province, "
	"latitude, longitude, category, images FROM works ORDER BY id"
).fetchall()

UA = (
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
	'AppleWebKit/537.36 (KHTML, like Gecko) '
	'Chrome/120.0.0.0 Safari/537.36'
)
last_request_time = 0.0
api_calls = 0
newly_filled = 0
processed_missing = 0
MAX_MISSING = int(os.environ.get('MAX_MISSING', '475'))
MIN_INTERVAL = float(os.environ.get('MIN_INTERVAL', '3.0'))


def wait_rate_limit():
	global last_request_time
	elapsed = time.time() - last_request_time
	if elapsed < MIN_INTERVAL:
		time.sleep(MIN_INTERVAL - elapsed)


def baidu_image_lookup(query):
	global last_request_time, api_calls
	wait_rate_limit()
	params = urllib.parse.urlencode({
		'tn': 'resultjson_com', 'ipn': 'rj', 'ct': '201326592',
		'fp': 'result', 'word': query, 'queryWord': query,
		'cl': '2', 'lm': '-1', 'ie': 'utf-8', 'oe': 'utf-8',
		'st': '-1', 'ic': '0', 'face': '0', 'istype': '2',
		'nc': '1', 'pn': '0', 'rn': '5',
	})
	url = 'https://image.baidu.com/search/acjson?' + params
	req = urllib.request.Request(url, headers={
		'User-Agent': UA,
		'Referer': 'https://image.baidu.com/search/index?tn=baiduimage&word='
				   + urllib.parse.quote(query),
		'Accept': 'text/plain, */*; q=0.01',
		'Accept-Language': 'zh-CN,zh;q=0.9',
		'Accept-Encoding': 'gzip, deflate',
	})
	try:
		with urllib.request.urlopen(req, timeout=10) as resp:
			last_request_time = time.time()
			api_calls += 1
			raw = resp.read()
			try:
				raw = gzip.decompress(raw).decode('utf-8', errors='replace')
			except Exception:
				raw = raw.decode('utf-8', errors='replace')
			d = json.loads(raw)
			for item in d.get('data', []):
				if not item:
					continue
				img_url = item.get('middleURL') or item.get('thumbURL') or ''
				if img_url and img_url.startswith('https://'):
					return img_url
	except Exception:
		pass
	return ''


def norm_spot(s):
	s = (s or '').strip()
	s = re.sub(r'遗址$', '', s).strip()
	s = re.sub(r'景区$', '', s).strip()
	return s


def find_image(spot, province):
	spot_n = norm_spot(spot)
	queries = [spot_n, f'{province} {spot_n}'.strip()]
	for q in queries:
		q = q.strip()
		if len(q) < 2:
			continue
		u = baidu_image_lookup(q)
		if u:
			return u
	return ''


def esc(s):
	return str(s).replace("'", "''")


out = []
for r in rows:
	_id, title, spot, author, dynasty, desc, province, lat, lng, category, images = r

	urls = []
	try:
		arr = json.loads(images or '[]')
		if isinstance(arr, list):
			urls = [u for u in arr if isinstance(u, str) and u.startswith('https://')]
	except Exception:
		urls = []

	if not urls and processed_missing < MAX_MISSING:
		processed_missing += 1
		found = find_image(spot or '', province or '')
		if found:
			urls = [found]
			newly_filled += 1
		if processed_missing % 15 == 0:
			print(
				f'[Progress] processed_missing={processed_missing} '
				f'newly_filled={newly_filled} api_calls={api_calls}'
			)

	out.append((
		title or '', spot or '', author or '', dynasty or '', desc or '',
		province or '', float(lat or 0), float(lng or 0),
		(category or '其他').strip() or '其他',
		json.dumps(urls[:1], ensure_ascii=False),
	))

lines = [
	'-- 纸上山河 种子数据（由 Excel: 纸上山河数据整理.xlsx 自动生成，图片来源 Wikimedia + Baidu）',
	f'-- 共 {len(out)} 条记录（分批插入以避免 SQL 语句过大）',
	'',
]

batch_size = 50
for batch_idx in range(0, len(out), batch_size):
	batch = out[batch_idx:batch_idx + batch_size]
	lines.append(
		'INSERT INTO works (title, scenic_spot, author, dynasty, description, '
		'province, latitude, longitude, category, images) VALUES'
	)
	for i, row in enumerate(batch):
		t, sp, au, dy, de, pr, la, lo, ca, im = row
		stmt = "('{}', '{}', '{}', '{}', '{}', '{}', {:.6f}, {:.6f}, '{}', '{}')".format(
			esc(t), esc(sp), esc(au), esc(dy), esc(de), esc(pr), la, lo, esc(ca), esc(im)
		)
		lines.append(stmt + (',' if i < len(batch) - 1 else ';'))
	lines.append('')

Path('seed.sql').write_text('\n'.join(lines), encoding='utf-8')

filled_total = sum(1 for row in out if json.loads(row[9]))
print('DONE')
print('PROCESSED_MISSING', processed_missing)
print('NEWLY_FILLED (Baidu)', newly_filled)
print('FILLED_TOTAL', filled_total)
print('API_CALLS', api_calls)
print('PROCESSED_MISSING', processed_missing)
print('NEWLY_FILLED', newly_filled)
print('FILLED_TOTAL', filled_total)
print('API_CALLS', api_calls)
