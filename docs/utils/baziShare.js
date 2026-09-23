/**
 * 八字查询：分享链接的 query 编解码
 * ================
 * 把「够用来复现同一张盘」的输入项编进 URL，便于分享与回访：
 *   d   出生日期（YYYY-MM-DD）
 *   t   出生时间（HH:mm）
 *   g   性别（m / f）—— 大运顺逆要看它
 *   c   出生地城市键（可选，与 lng 互为印证）
 *   lng 经度（可选，用于真太阳时）
 *   ts  是否启用真太阳时（1 / 0）
 *   zi  子时约定（nextDay / lateZi）
 *
 * 设计取舍：
 * - **不编码四柱本身**，只编码输入。四柱是排盘的产物，重算一次比存一份更可靠；
 *   何况经度、真太阳时、子时约定这些口径若丢掉，同样的四柱也复现不出同一张盘。
 * - 一律走 `URLSearchParams`，转义交给它，自己不做字符串拼接。
 * - 纯函数，不碰 `window` / `location`，便于单测；取用当前地址由调用点负责。
 */

export const SHARE_KEYS = ['d', 't', 'g', 'c', 'lng', 'ts', 'zi'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{1,2}:\d{2}$/;

/** 经度只保留两位小数，避免链接里出现一长串浮点尾巴 */
const roundLng = (v) => Math.round(Number(v) * 100) / 100;

/**
 * 输入状态 → query 串（不带 `?`）。空值项一律省略，链接尽量短。
 * @param {Object} state { date, time, gender, city, longitude, trueSolar, ziConvention }
 * @returns {string} 形如 `d=1994-12-13&t=12%3A00&g=m`；无可编码项时返回 ''
 */
export const buildShareQuery = (state = {}) => {
  const { date, time, gender, city, longitude, trueSolar, ziConvention } = state;
  const p = new URLSearchParams();

  if (date && DATE_RE.test(String(date))) p.set('d', String(date));
  if (time && TIME_RE.test(String(time))) p.set('t', String(time));
  if (gender === 'male' || gender === 'female') p.set('g', gender === 'female' ? 'f' : 'm');
  if (city) p.set('c', String(city));
  if (longitude !== null && longitude !== undefined && longitude !== '' && isFinite(Number(longitude))) {
    p.set('lng', String(roundLng(longitude)));
  }
  p.set('ts', trueSolar ? '1' : '0');
  if (ziConvention) p.set('zi', String(ziConvention));

  return p.toString();
};

/**
 * query 串 → 输入状态。非法或缺失的项**不写入**结果，交由调用点沿用默认值。
 * @param {string} search 带或不带 `?` 均可
 * @returns {null|Object} 一项都没解出来时返回 null（便于判断「本次不是分享链接进入的」）
 */
export const parseShareQuery = (search = '') => {
  const raw = String(search || '').replace(/^\?/, '');
  if (!raw) return null;

  let p;
  try {
    p = new URLSearchParams(raw);
  } catch (err) {
    return null;
  }

  const out = {};

  const d = p.get('d');
  if (d && DATE_RE.test(d)) out.date = d;

  const t = p.get('t');
  if (t && TIME_RE.test(t)) {
    const [hh, mm] = t.split(':');
    // 补零，<input type="time"> 只认两位小时
    out.time = `${String(hh).padStart(2, '0')}:${mm}`;
  }

  const g = p.get('g');
  if (g === 'm' || g === 'f') out.gender = g === 'f' ? 'female' : 'male';

  const c = p.get('c');
  if (c) out.city = c;

  const lng = p.get('lng');
  if (lng !== null && lng !== '' && isFinite(Number(lng))) out.longitude = roundLng(lng);

  const ts = p.get('ts');
  if (ts !== null) out.trueSolar = ts === '1';

  const zi = p.get('zi');
  if (zi && (zi === 'nextDay' || zi === 'lateZi')) out.ziConvention = zi;

  return Object.keys(out).length ? out : null;
};

/** 该地址上是否带着可识别的八字输入参数 */
export const hasShareParams = (search = '') => parseShareQuery(search) !== null;

export default {
  SHARE_KEYS,
  buildShareQuery,
  parseShareQuery,
  hasShareParams
};
