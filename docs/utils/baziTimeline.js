/**
 * 八字「时间轴」层：大运 / 流年 / 流月
 * ================
 * 三层时间单位各自的**干支序列**，以及每一柱与原局的关系。
 *
 * 边界（与结构层一致）：本层只算**干支与关系**，不下吉凶结论。
 * 「冲了月令是不利还是激发」「合住忌神是否转吉」这类判断各派分歧极大，
 * 属判断层，须并列呈现。
 *
 * 复用关系判定：不另写「流年 vs 原局」的判定函数 —— 把该柱 append 进原局四柱、
 * 用 `focus` 指向它，就是 `ganzhiRelation.relationMatrix` 的既有能力。
 * 这是「原局结构」与「流年流月」共用一个内核的意义所在。
 *
 * 纯函数：节气时刻由调用方传入（同 `baziUtils.computeDaYun` 的约定），不依赖 SolarTerm。
 */

import {
  HEAVENLY_STEMS, EARTHLY_BRANCHES, mod, splitGanZhi, getZodiacByGanZhi, relationMatrix,
  getBranchRelations, getStemRelations
} from './ganzhiRelation.js';
import { getTenGod } from './baziUtils.js';
import { toPillars } from './baziStructure.js';

/** 流月地支序：自寅月起（立春为岁首） */
export const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
export const MONTH_LABELS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
/** `SolarTerm.getSolarTermDate(year)` 以立春起、24 项顺排，**偶数下标即十二「节」** */
export const JIE_NAMES = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];

/**
 * 大运步 → 覆盖的公历年份。
 *
 * `ageFrom` 是「3 日折 1 岁」得出的岁数（周岁意义），故公历年 ≈ 出生年 + ageFrom。
 * 交运时刻与岁数折算法各派略有出入，此处只作粗略定位，界面须照此声明。
 *
 * 时间轴（`BaziTimeline.vue`）与推演层（`BaziInference.vue`）都要这份映射，
 * 故提到共享内核，避免两处各写一份（口径一旦分叉，两个栏会给出不同的年份）。
 *
 * @param {Object} daYun `baziUtils.computeDaYun` 的结果
 * @param {number?} birthYear 出生公历年；不给则 range 为 null
 */
export const daYunRanges = (daYun, birthYear) => {
  const list = (daYun && Array.isArray(daYun.list)) ? daYun.list : [];
  return list.map((x) => {
    if (birthYear === null || birthYear === undefined) return { ...x, range: null };
    const from = birthYear + Math.floor(x.ageFrom || 0);
    return { ...x, range: { from, to: from + 9 } };
  });
};

/**
 * 某公历年的年柱干支（以立春为界）。
 * 1984 为甲子：天干取 (Y−4) mod 10，地支取 (Y−4) mod 12。
 *
 * 注意这是「该年立春之后」的年柱；立春之前的时段仍属上一年的年柱。
 * 需要精确到日请走 `SolarTerm.getYearGanZhi`。
 */
export const ganZhiOfYear = (year) =>
  HEAVENLY_STEMS[mod(year - 4, 10)] + EARTHLY_BRANCHES[mod(year - 4, 12)];

/**
 * 流年序列（含十神与生肖）。
 *
 * @param {Object} o
 * @param {number} o.from      起始公历年（含）
 * @param {number} o.to        结束公历年（含）
 * @param {string} o.dayGan    日主天干（算流年十神）
 * @param {number?} [o.birthYear=null] 出生年 —— 给了就附**虚岁**（出生年即 1 岁）
 */
export const computeLiuNian = ({ from, to, dayGan, birthYear = null }) => {
  const out = [];
  for (let y = from; y <= to; y++) {
    const gz = ganZhiOfYear(y);
    out.push({
      year: y,
      ganZhi: gz,
      gan: gz.charAt(0),
      zhi: gz.charAt(1),
      tenGod: getTenGod(dayGan, gz.charAt(0)),
      zodiac: getZodiacByGanZhi(gz),
      age: birthYear === null ? null : (y - birthYear + 1)
    });
  }
  return out;
};

/**
 * 某个流年（立春起）的十二个流月。
 *
 * 月支自寅月起（立春→寅、惊蛰→卯 …… 小寒→丑）；
 * 月干用**五虎遁**：寅月之干 = ((年干序 mod 5) × 2 + 2) mod 10，逐月递进。
 * 校验：甲己之年丙作首、乙庚之岁戊为头、丙辛必定寻庚起、丁壬壬位顺行流、戊癸甲寅好追求。
 *
 * @param {Object} o
 * @param {string}   o.yearGanZhi 该流年的年柱干支
 * @param {Date[]}   o.termDates  该年的二十四节气（`SolarTerm.getSolarTermDate(year)`）
 * @param {string}   o.dayGan     日主天干（算十神）
 */
export const computeLiuYue = ({ yearGanZhi, termDates, dayGan }) => {
  const list = termDates || [];
  const yg = HEAVENLY_STEMS.indexOf((yearGanZhi || '').charAt(0));
  if (yg < 0) return [];
  const firstStem = ((yg % 5) * 2 + 2) % 10;

  const out = [];
  for (let k = 0; k < 12; k++) {
    const stemIdx = (firstStem + k) % 10;
    const zhi = MONTH_BRANCHES[k];
    const gz = HEAVENLY_STEMS[stemIdx] + zhi;
    const startRaw = list[k * 2];
    // 末月（腊月）的下一个「节」在列表之外 —— 即次年立春，此处留空由界面说明
    const endRaw = list[(k + 1) * 2];
    out.push({
      index: k + 1,
      label: MONTH_LABELS[k],
      branchName: zhi + '月',
      jie: JIE_NAMES[k],
      ganZhi: gz,
      gan: HEAVENLY_STEMS[stemIdx],
      zhi,
      tenGod: getTenGod(dayGan, HEAVENLY_STEMS[stemIdx]),
      start: startRaw ? new Date(startRaw) : null,
      end: endRaw ? new Date(endRaw) : null
    });
  }
  return out;
};

/**
 * 某一柱（大运 / 流年 / 流月）与原局的关系。
 *
 * 实现即「把该柱追加进原局四柱 + focus 指向它」，故不新增任何判定逻辑。
 * `includeSameBranch` 打开：该柱与原局同支（传统称伏吟 / 值太岁）有意味，保留下来由界面单列。
 *
 * @param {string[]} originalGanZhi 原局四柱 [年,月,日,时]
 * @param {string}   incomingGanZhi 该柱干支
 * @param {string}   label          该柱的位置标签（'大运' / '流年' / '流月'）
 */
export const relationsWithOriginal = (originalGanZhi, incomingGanZhi, label) => {
  if (!incomingGanZhi || incomingGanZhi.length !== 2) return null;
  const { stem, branch } = splitGanZhi(incomingGanZhi);
  const cols = [
    ...toPillars(originalGanZhi),
    { pos: label, stem, branch, ganZhi: incomingGanZhi }
  ];
  const m = relationMatrix(cols, { focus: label, includeSameBranch: true });
  return {
    label,
    ganZhi: incomingGanZhi,
    stem,
    branch,
    branchPairs: m.branchPairs,
    stemPairs: m.stemPairs,
    formations: m.formations,
    halves: m.halves,
    // 界面常用分组：真正的关系（合冲刑害）与「同支」分开
    sameBranch: m.branchPairs.filter((p) => p.relations.every((r) => r.type === '同支')),
    realPairs: m.branchPairs.filter((p) => !p.relations.every((r) => r.type === '同支')),
    total: m.branchPairs.length + m.stemPairs.length + m.formations.length + m.halves.length
  };
};

// ===================== 引动点（判断层的入口，不是结论）=====================
//
// 流年 / 大运 / 流月 与原局的关系里，传统最看重的是**它引动了哪个位置**：
// 冲合月令（取格取用之所）、冲合日支（身宫 / 夫妻宫）、与日干相合相冲（直接对日主）、
// 以及「天克地冲」这种干支俱动的组合。本函数把这些位置标出来。
//
// 边界：只标「传统视为重点」，**不判吉凶** —— 冲了月令是伤是发、合住忌神是吉是凶，
// 各派分歧极大，属下一层的事（见 `baziJudgment.js` 的并列式呈现）。

/** 原局中被引动时最受看重的位置 */
export const KEY_TARGETS = {
  年: { label: '年支', note: '祖上 · 根基之位' },
  月: { label: '月支（月令）', note: '取格取用之所，传统视为全局枢纽' },
  日: { label: '日支（夫妻宫）', note: '日主所坐之地，传统视为身宫' },
  时: { label: '时支', note: '子女 · 晚运之位' }
};

const KEY_POS = ['月', '日'];

/**
 * 某一柱（大运 / 流年 / 流月）对原局的「引动点」。
 *
 * @param {string[]} originalGanZhi 原局四柱 [年,月,日,时]
 * @param {string}   incomingGanZhi 该柱干支
 * @param {string}   label          该柱位置标签（'大运' / '流年' / '流月'）
 * @returns {null|Object} { hits, tianKeDiChong, fuYin, hasKeyHit, counts }
 */
export const findKeyActivations = (originalGanZhi, incomingGanZhi, label) => {
  const rel = relationsWithOriginal(originalGanZhi, incomingGanZhi, label);
  if (!rel) return null;

  const { stem, branch } = splitGanZhi(incomingGanZhi);
  const orig = toPillars(originalGanZhi);

  // ---- 地支层面的引动 ----
  const hits = [];
  rel.realPairs.forEach((p) => {
    const target = p.a.pos === label ? p.b : (p.b.pos === label ? p.a : null);
    if (!target || !KEY_TARGETS[target.pos]) return;
    hits.push({
      kind: '地支',
      target: target.pos,
      targetLabel: KEY_TARGETS[target.pos].label,
      targetChar: target.char,
      targetNote: KEY_TARGETS[target.pos].note,
      types: p.relations.map((r) => r.type),
      tone: p.tone,
      isKey: KEY_POS.includes(target.pos)
    });
  });

  // ---- 天干层面的引动：与日干五合 / 相冲（直接作用于日主）----
  rel.stemPairs.forEach((p) => {
    const isFocusA = p.a.pos === label;
    const target = isFocusA ? p.b : (p.b.pos === label ? p.a : null);
    if (!target) return;
    hits.push({
      kind: '天干',
      target: target.pos,
      targetLabel: target.pos === '日' ? '日干（日主）' : `${target.pos}干`,
      targetChar: target.char,
      targetNote: target.pos === '日' ? '日主本身，传统视为最直接的一层' : '',
      types: p.relations.map((r) => r.type),
      tone: p.relations.some((r) => r.type === '天干相冲') ? 'chong' : 'he',
      isKey: target.pos === '日'
    });
  });

  // ---- 天克地冲：同一柱上，天干相冲且地支亦相冲 ----
  const tianKeDiChong = [];
  orig.forEach((q) => {
    const stemChong = getStemRelations(stem, q.stem).some((r) => r.type === '天干相冲');
    const branchChong = getBranchRelations(branch, q.branch).some((r) => r.type === '六冲');
    if (stemChong && branchChong) {
      tianKeDiChong.push({
        pos: q.pos,
        posLabel: q.pos + '柱',
        original: q.ganZhi || (q.stem + q.branch),
        note: '天干相冲而地支亦相冲，干支俱动，传统视为动荡最显的一种组合'
      });
    }
  });

  // ---- 伏吟 / 值太岁：与原局某柱同支 ----
  // 直接比对地支，不走 `sameBranch` 分组 —— 午午、酉酉、辰辰、亥亥 这些既是同支**又**是自刑，
  // 会被 `sameBranch`（要求「全部关系皆为同支」）排除在外。同支这件事本身即成立，与是否附带自刑无关。
  const fuYin = orig
    .filter((q) => q.branch && q.branch === branch)
    .map((q) => ({ pos: q.pos, posLabel: q.pos + '支', char: q.branch }));

  return {
    label,
    ganZhi: incomingGanZhi,
    hits,
    tianKeDiChong,
    fuYin,
    keyHits: hits.filter((h) => h.isKey),
    hasKeyHit: hits.some((h) => h.isKey) || tianKeDiChong.length > 0,
    counts: {
      total: hits.length,
      key: hits.filter((h) => h.isKey).length,
      tianKeDiChong: tianKeDiChong.length,
      fuYin: fuYin.length
    }
  };
};

export default {
  MONTH_BRANCHES,
  MONTH_LABELS,
  JIE_NAMES,
  KEY_TARGETS,
  daYunRanges,
  ganZhiOfYear,
  computeLiuNian,
  computeLiuYue,
  relationsWithOriginal,
  findKeyActivations
};
