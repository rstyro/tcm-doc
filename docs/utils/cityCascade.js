/**
 * 出生地「省 → 市 / 区」级联选择的纯逻辑。
 *
 * 为什么单列一份：
 *   1. `chinaCities.js` 由 `.workbuddy/scripts/gen-cities.py` 整文件生成，重跑会覆盖，
 *      派生逻辑不能写在里面；
 *   2. 逻辑从组件里抽出来后，测试可以直接 import 真实实现（过去 `t_ui_logic.mjs`
 *      是「照抄一份再验」，抄本会与实现悄悄分叉）。
 *
 * 数据形状：`CITY_GROUPS` 的 34 个分组里，5 个「面积相当于一个省」的省级单元
 *   （京津沪渝 + 香港）额外铺了市辖区，条目形如 `北京·东城区`；其余分组只是
 *   地级行政区平铺。所以二级下拉按「市中心 / 市辖区 / 地级行政区」三桶给出。
 */

import { CITY_GROUPS } from './chinaCities.js';

/** 省 / 自治区 / 直辖市 / 特别行政区（34 个），顺序与 CITY_GROUPS 一致 */
export const PROVINCE_LABELS = CITY_GROUPS.map((g) => g.label);

/**
 * 含市辖区的省级单元（京津沪渝 + 香港）。
 * 判据是「条目里出现中点」，不由名单硬编码 —— 数据表重生成后仍自动成立。
 * @type {string[]}
 */
export const SPLIT_PROVINCES = CITY_GROUPS
  .filter((g) => g.cities.some((c) => c.indexOf('·') >= 0))
  .map((g) => g.label);

const SPLIT = new Set(SPLIT_PROVINCES);

/** 城市名 → 省份。城市名在全表唯一（t_cities.mjs 有断言钉住），故映射无歧义。 */
const PROVINCE_OF = (() => {
  const m = Object.create(null);
  for (const g of CITY_GROUPS) {
    for (const c of g.cities) m[c] = g.label;
  }
  return m;
})();

const groupOf = (label) => CITY_GROUPS.find((g) => g.label === label) || null;
const norm = (q) => (q === null || q === undefined ? '' : String(q)).trim();

/**
 * 城市名 → 所属省份（查不到返回 ''）。分享链接还原时用它把二级状态补齐。
 * @param {string} city
 * @returns {string}
 */
export function provinceOfCity(city) {
  return PROVINCE_OF[city] || '';
}

/**
 * 该省收录多少个条目。
 * @param {string} province
 * @returns {number}
 */
export function cityCountOf(province) {
  const g = groupOf(province);
  return g ? g.cities.length : 0;
}

/** 关键词是否命中某省：省名命中，或省内任一条目命中 */
function provinceHit(g, q) {
  return g.label.indexOf(q) >= 0 || g.cities.some((c) => c.indexOf(q) >= 0);
}

/**
 * 一级下拉的省份列表。
 * 关键词为空 → 全部 34 个；否则只留「省名命中 或 其下有城市命中」的省。
 * `keep` 用于兜住「已选省份被筛选排除」——否则原生 select 会显示空白，
 * 出现「状态里选了、界面显示未选」的不一致。
 * @param {string} [query]
 * @param {string} [keep]
 * @returns {string[]}
 */
export function provinceList(query = '', keep = '') {
  const q = norm(query);
  return CITY_GROUPS
    .filter((g) => !q || g.label === keep || provinceHit(g, q))
    .map((g) => g.label);
}

/**
 * 二级下拉的选项，分三桶返回。
 * @param {string} province 一级选中的省 label
 * @param {string} [query] 关键词，命中规则同上一级（省名命中则整省保留）
 * @param {string} [keep] 已选条目，必须留在列表里（理由同 provinceList）
 * @returns {{label: string, center: string | null, districts: string[], cities: string[]}}
 */
export function cityGroupsOf(province, query = '', keep = '') {
  const g = groupOf(province);
  if (!g) return { label: '', center: null, districts: [], cities: [] };
  const q = norm(query);
  const hit = (c) => !q || c === keep || c.indexOf(q) >= 0 || g.label.indexOf(q) >= 0;
  if (SPLIT.has(g.label)) {
    // 生成脚本保证首项即市中心（如「北京」「香港」），其余为市辖区
    const center = g.cities[0];
    return {
      label: g.label,
      center: hit(center) ? center : null,
      districts: g.cities.slice(1).filter(hit),
      cities: []
    };
  }
  return { label: g.label, center: null, districts: [], cities: g.cities.filter(hit) };
}

/**
 * 二级下拉有没有可选项（供提示文案判断，避免读者以为是自己看漏了）。
 * @param {{center: string | null, districts: string[], cities: string[]}} detail
 * @returns {boolean}
 */
export function hasCityHit(detail) {
  if (!detail) return false;
  return !!detail.center || detail.districts.length > 0 || detail.cities.length > 0;
}

/** 城市名在二级下拉里的显示名：`北京·东城区` → `东城区`（上下文已能确定是哪个市） */
export function cityShortName(city) {
  const s = String(city || '');
  const i = s.indexOf('·');
  return i >= 0 ? s.slice(i + 1) : s;
}

export default {
  PROVINCE_LABELS,
  SPLIT_PROVINCES,
  provinceOfCity,
  cityCountOf,
  provinceList,
  cityGroupsOf,
  hasCityHit,
  cityShortName
};
