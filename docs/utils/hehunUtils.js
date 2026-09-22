/**
 * 八字合婚工具类
 *
 * 说明：本模块整理传统「合婚」术数的**通行判据**，用于把两人八字的若干可量化项目
 * 逐条比对、给出倾向性描述。所有结论均为传统术数语言，**不是**现代科学结论，
 * 不构成婚恋决策建议。各派在取用与权重上分歧较大，本模块只做客观罗列与说明。
 *
 * 主要判据（传统通行项目）：
 *   1. 年支（生肖）关系：六合、三合、六冲、相刑、相害、相破
 *   2. 日柱关系：日干五合（天干合）、日支关系、天克地冲
 *   3. 夫妻宫（日支）比对
 *   4. 五行互补：双方命局五行的多寡与互济
 *   5. 纳音五行生克（传统「六十甲子纳音」一路的合婚法）
 *   6. 用神喜忌参考（需旺衰前提，此处只作提示，不下硬判）
 */

// ===================== 基础常量（复用共享模块） =====================

import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_LIST,
  TG_TO_ELEMENT,
  TG_YIN_YANG,
  DZ_TO_ELEMENT,
  DZ_YIN_YANG,
  DZ_CANG_GAN,
  FIVE_ELEMENT,
  HE_LIU,
  LIU_CHONG,
  LIU_HAI,
  LIU_PO,
  SAN_HE,
  SAN_HUI,
  FIVE_ELEMENT_NAME_OF_SANHE,
  FIVE_ELEMENT_NAME_OF_SANHUI,
  XING_RULES,
  TG_HE,
  TG_CHONG,
  ALL_ELEMENTS,
  getBranchRelations,
  getStemRelations,
  mod
} from './ganzhiRelation.js';

// 六合/六冲/六害/六破/三合/三会/相刑、天干五合相冲、五行阴阳、藏干
// 均定义在 `./ganzhiRelation.js`（全站唯一来源），此处只做转发，
// 以便既有调用方（组件、默认导出）无需改动。
export {
  HEAVENLY_STEMS, EARTHLY_BRANCHES, ZODIAC_LIST,
  TG_TO_ELEMENT, TG_YIN_YANG, DZ_TO_ELEMENT, DZ_YIN_YANG, DZ_CANG_GAN, FIVE_ELEMENT,
  HE_LIU, LIU_CHONG, LIU_HAI, LIU_PO, SAN_HE, SAN_HUI, XING_RULES, TG_HE, TG_CHONG,
  FIVE_ELEMENT_NAME_OF_SANHE, FIVE_ELEMENT_NAME_OF_SANHUI
};

// 六十甲子纳音五行（传统口诀「甲子乙丑海中金……」）——合婚/纳音专有，留在此处
const NAYIN_TABLE = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
};

// 纳音所属五行（由纳音名末字取）
const NAYIN_TO_ELEMENT = {
  '金': '金', '火': '火', '木': '木', '土': '土', '水': '水'
};

// 六合/六冲/六害/六破/三合/三会/相刑/天干五合相冲 已移至 `./ganzhiRelation.js`

// ===================== 工具函数 =====================

/** 由年份取年干支（以立春为界更准确，此处为简便算法，与太岁工具一致） */
export const getYearGanZhi = (year) => {
  const stem = HEAVENLY_STEMS[mod(year - 4, 10)];
  const branch = EARTHLY_BRANCHES[mod(year - 4, 12)];
  return stem + branch;
};

/** 干支 → 生肖 */
export const getZodiacByGanZhi = (ganZhi) => {
  const branch = ganZhi.charAt(1);
  const idx = EARTHLY_BRANCHES.indexOf(branch);
  return idx >= 0 ? ZODIAC_LIST[idx] : '';
};

// ===================== 关系判定（转发到共享实现） =====================

/**
 * 判断两地支的关系。
 * 实现已移至 `./ganzhiRelation.js#getBranchRelations`（全站唯一来源），此处保留同名别名。
 * @returns {Array} 关系描述数组，可能有多重关系（如寅亥 = 六合 + 六破）
 */
export const getBranchRelation = getBranchRelations;

/** 判断两天干的关系（实现见 `./ganzhiRelation.js#getStemRelations`） */
export const getStemRelation = getStemRelations;

// ===================== 五行统计 =====================

/** 统计一组干支的五行分布（天干各计 1，地支本气计 1） */
export const countElements = (ganZhiList) => {
  const count = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  for (const gz of ganZhiList) {
    if (!gz || gz.length !== 2) continue;
    const tg = gz.charAt(0), dz = gz.charAt(1);
    if (TG_TO_ELEMENT[tg]) count[TG_TO_ELEMENT[tg]] += 1;
    if (DZ_TO_ELEMENT[dz]) count[DZ_TO_ELEMENT[dz]] += 1;
  }
  return count;
};

/**
 * 找出命局中偏多 / 偏少的五行。
 * 判据：以「平均每行应有几个」为基准，多出 1 个以上为偏多，少 1 个以上为偏少，为 0 为缺。
 */
export const analyzeElementBalance = (count) => {
  const total = Object.values(count).reduce((a, b) => a + b, 0);
  const avg = total / 5;
  const strong = [], weak = [], missing = [];
  for (const el of ALL_ELEMENTS) {
    if (count[el] === 0) missing.push(el);
    else if (count[el] > avg + 0.5) strong.push(el);
    else if (count[el] < avg - 0.5) weak.push(el);
  }
  return { total, avg, strong, weak, missing };
};

/**
 * 判断双方五行是否互补。
 * 传统合婚看重的一点：一方所「缺/弱」的五行，恰是另一方「有（≥2）」的，视为可相济。
 * @returns {Object} 双向的互补情况 + 双方各自偏枯的五行
 */
export const getElementComplement = (countA, countB) => {
  const balA = analyzeElementBalance(countA);
  const balB = analyzeElementBalance(countB);
  // A 所缺所弱，B 是否有力供给
  const aNeeds = ALL_ELEMENTS.filter(el => (countA[el] === 0) || balA.weak.includes(el));
  const bNeeds = ALL_ELEMENTS.filter(el => (countB[el] === 0) || balB.weak.includes(el));
  const aFilled = aNeeds.filter(el => countB[el] >= 2);
  const bFilled = bNeeds.filter(el => countA[el] >= 2);
  return {
    balA,
    balB,
    aNeeds, bNeeds,
    aFilled, bFilled,
    bothMissing: ALL_ELEMENTS.filter(el => countA[el] === 0 && countB[el] === 0)
  };
};

// ===================== 跨两人全盘的关系判定 =====================

/**
 * 扫描两人全部八柱地支，判定能否凑成完整的「三合局」（三字齐全）。
 * 这是传统合婚里分量较重的一项：单看两人某两支只是「半合」，
 * 但若把双方四支放在一起能凑齐申子辰之类，传统视为「合局」，比半合重得多。
 *
 * @param {Array} dzA 甲方四地支
 * @param {Array} dzB 乙方四地支
 * @returns {Array} 成局信息
 */
export const findSanHeFormation = (dzA, dzB) => {
  const all = [...dzA, ...dzB].filter(Boolean);
  const seen = new Set(all);
  const out = [];
  for (const g of SAN_HE) {
    // 全部三字都出现，且至少有一字来自双方不同的人（跨命局）
    if (g.every(z => seen.has(z))) {
      const fromA = g.filter(z => dzA.includes(z));
      const fromB = g.filter(z => dzB.includes(z));
      // 必须双方都参与才叫「合婚合局」
      if (fromA.length && fromB.length) {
        const el = FIVE_ELEMENT_NAME_OF_SANHE[g.join('')] || '';
        out.push({
          group: g.join(''),
          element: el,
          fromA, fromB,
          desc: `${g.join('')}三合${el}局（${fromA.join('')}在第一方，${fromB.join('')}在第二方）`
        });
      }
    }
  }
  return out;
};

/**
 * 扫描两人全部八柱地支，判定能否凑成完整的「三会方」（三字齐全）。
 * 道理同三合，但三会力量更强（取时令旺势）。
 */
export const findSanHuiFormation = (dzA, dzB) => {
  const all = [...dzA, ...dzB].filter(Boolean);
  const seen = new Set(all);
  const out = [];
  for (const g of SAN_HUI) {
    if (g.every(z => seen.has(z))) {
      const fromA = g.filter(z => dzA.includes(z));
      const fromB = g.filter(z => dzB.includes(z));
      if (fromA.length && fromB.length) {
        const el = FIVE_ELEMENT_NAME_OF_SANHUI[g.join('')] || '';
        out.push({
          group: g.join(''),
          element: el,
          fromA, fromB,
          desc: `${g.join('')}三会${el}方（${fromA.join('')}在第一方，${fromB.join('')}在第二方）`
        });
      }
    }
  }
  return out;
};

/**
 * 「一方日支」与「另一方全部四支」的关系。
 * 传统论夫妻宫，是看日支与对方全盘的互动，而不是只比两个日支。
 *
 * @param {string} dayZhi 本方的日支（夫妻宫）
 * @param {Array} otherDz 对方的四地支
 * @param {string} otherLabel 对方称谓
 * @param {Object} [opts]
 * @param {boolean} [opts.skipSame=true] 跳过「同为某支」的项——
 *   互照的目的是找**异于相等**的互动，两支相同只是同气，不是关系，列出来会污染列表
 * @returns {Array} { pair, targetPos, relations }（relations 已剔掉「同支」类中性项）
 */
export const getBranchVsAll = (dayZhi, otherDz, otherLabel, opts = {}) => {
  const { skipSame = true } = opts;
  const POS = ['年支', '月支', '日支', '时支'];
  const out = [];
  if (!dayZhi) return out;
  otherDz.forEach((dz, i) => {
    if (!dz) return;
    if (skipSame && dz === dayZhi) return;
    const rels = getBranchRelation(dayZhi, dz)
      .filter(r => r.type !== '同支');
    if (rels.length) {
      out.push({
        pair: `${dayZhi}—${dz}`,
        targetPos: POS[i] || '',
        otherLabel,
        relations: rels
      });
    }
  });
  return out;
};

/**
 * 「一方日干」与「另一方全部四干」的关系（天干层面的互照）。
 *
 * 只取**天干五合 / 天干相冲**两类。理由：五行生克（相生/相克）在天干之间几乎处处成立，
 * 若一并列出，四柱里会冒出七八条，把真正有分量的「合」与「冲」淹没掉。
 * 这与传统论夫妻宫时「先看合冲、生克另论」的取法一致。
 *
 * @param {Object} [opts]
 * @param {boolean} [opts.onlyHeChong=true] 只保留天干五合 / 天干相冲
 */
export const getStemVsAll = (dayGan, otherTg, otherLabel, opts = {}) => {
  const { onlyHeChong = true } = opts;
  const POS = ['年干', '月干', '日干', '时干'];
  const out = [];
  if (!dayGan) return out;
  otherTg.forEach((tg, i) => {
    if (!tg) return;
    let rels = getStemRelation(dayGan, tg);
    if (onlyHeChong) {
      rels = rels.filter(r => r.type === '天干五合' || r.type === '天干相冲');
    }
    if (rels.length) {
      out.push({
        pair: `${dayGan}—${tg}`,
        targetPos: POS[i] || '',
        otherLabel,
        relations: rels
      });
    }
  });
  return out;
};

// ===================== 民俗婚配口诀 =====================

/**
 * 民间流行的生肖婚配俗谚（「白马怕青牛」一路）。
 * 郑重说明：这类口诀出自通俗命书与民间传说，**与八字命理主流论法不同层**，
 * 本站只作民俗收录，不主张据此论婚配。见《[纳音](/fate/nayin)》页的说明。
 */
export const FOLK_ZODIAC_RHYMES = [
  { a: '马', b: '牛', text: '白马怕青牛', note: '午丑相害' },
  { a: '羊', b: '鼠', text: '羊鼠相逢一旦休', note: '未子相害' },
  { a: '蛇', b: '虎', text: '蛇虎如刀错', note: '巳寅相害又相刑' },
  { a: '龙', b: '兔', text: '龙兔泪交流', note: '辰卯相害' },
  { a: '金鸡', b: '玉犬', text: '金鸡怕玉犬', note: '酉戌相害' },
  { a: '猪', b: '猴', text: '猪猴不到头', note: '亥申相害' }
];

/** 查两人的生肖是否命中民俗口诀 */
export const checkFolkRhyme = (zodiacA, zodiacB) => {
  if (!zodiacA || !zodiacB) return null;
  for (const r of FOLK_ZODIAC_RHYMES) {
    const hit =
      (r.a.includes(zodiacA) && r.b.includes(zodiacB)) ||
      (r.a.includes(zodiacB) && r.b.includes(zodiacA));
    if (hit) return r;
  }
  return null;
};

/** 生肖六合 / 三合（民间「上等婚」「中等婚」一路） */
export const getFolkZodiacGrade = (zodiacA, zodiacB) => {
  const bA = branchOfZodiac(zodiacA);
  const bB = branchOfZodiac(zodiacB);
  if (!bA || !bB) return null;
  if (HE_LIU[bA] === bB) return { grade: '六合', tone: 'he', desc: `${zodiacA}${zodiacB}六合，民间称「上等婚」` };
  for (const g of SAN_HE) {
    if (g.includes(bA) && g.includes(bB)) {
      return { grade: '三合', tone: 'he', desc: `${zodiacA}${zodiacB}三合，民间称「上等婚」` };
    }
  }
  if (LIU_CHONG[bA] === bB) return { grade: '相冲', tone: 'chong', desc: `${zodiacA}${zodiacB}相冲` };
  if (LIU_HAI[bA] === bB) return { grade: '相害', tone: 'chong', desc: `${zodiacA}${zodiacB}相害` };
  return null;
};

const branchOfZodiac = (z) => {
  const i = ZODIAC_LIST.indexOf(z);
  return i >= 0 ? EARTHLY_BRANCHES[i] : '';
};

/**
 * 时柱质量评估。
 * 传统批八字须有准确时辰；若用户只给了日期，时柱为默认值，则：
 * 五行统计 8 字中有 2 字不可靠，且任何「时支 / 时干」相关的关系都不可信。
 * 这里返回一条可读的提示，供界面显式展示。
 */
export const assessHourReliability = (hourKnownA, hourKnownB) => {
  const knownCount = (hourKnownA ? 1 : 0) + (hourKnownB ? 1 : 0);
  if (knownCount === 2) {
    return { level: 'ok', text: '双方时辰均已填写，四柱完整。' };
  }
  if (knownCount === 1) {
    return {
      level: 'warn',
      text: '有一方未填具体时辰，该方时柱为默认值：其五行分布与「时支 / 时干」相关的关系仅供参考，不宜作主判据。'
    };
  }
  return {
    level: 'warn',
    text: '双方均未填具体时辰，两人时柱均为默认值：五行分布（八字中 4 字不可靠）与所有时柱相关的关系仅供参考。传统批命以时辰准确为前提，建议补全后重看。'
  };
};

// ===================== 纳音 =====================

export const getNaYin = (ganZhi) => NAYIN_TABLE[ganZhi] || '';

export const getNaYinElement = (ganZhi) => {
  const ny = NAYIN_TABLE[ganZhi];
  if (!ny) return '';
  return NAYIN_TO_ELEMENT[ny.charAt(ny.length - 1)] || '';
};

/** 纳音两五行之间关系（传统纳音合婚法的核心） */
export const getNaYinRelation = (a, b) => {
  const ea = getNaYinElement(a), eb = getNaYinElement(b);
  if (!ea || !eb) return null;
  if (ea === eb) return { type: '比和', tone: 'he', desc: '纳音五行相同（比和）' };
  if (FIVE_ELEMENT[ea].beHelped === eb) return { type: '我生', tone: 'he', desc: `纳音${ea}生${eb}` };
  if (FIVE_ELEMENT[ea].help === eb) return { type: '生我', tone: 'he', desc: `纳音${eb}生${ea}` };
  if (FIVE_ELEMENT[ea].restrain === eb) return { type: '我克', tone: 'neutral', desc: `纳音${ea}克${eb}` };
  if (FIVE_ELEMENT[ea].beRestrained === eb) return { type: '克我', tone: 'chong', desc: `纳音${eb}克${ea}` };
  return null;
};

// ===================== 合婚评分（传统倾向，非科学结论） =====================

/**
 * 对一组关系做倾向性汇总。
 * 说明：这是把传统「吉/凶」用语折算成可读的倾向标记，**不是**科学评分，
 * 也不应作为现实判断依据。仅帮助理解传统合婚的取舍逻辑。
 */
export const scoreRelations = (rels) => {
  let he = 0, chong = 0;
  for (const r of rels) {
    if (!r) continue;
    if (r.tone === 'he') he += 1;
    else if (r.tone === 'chong') chong += 1;
  }
  return { he, chong };
};

export default {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_LIST,
  TG_TO_ELEMENT,
  TG_YIN_YANG,
  DZ_TO_ELEMENT,
  DZ_YIN_YANG,
  DZ_CANG_GAN,
  FIVE_ELEMENT,
  NAYIN_TABLE,
  ALL_ELEMENTS,
  HE_LIU,
  LIU_CHONG,
  LIU_HAI,
  LIU_PO,
  SAN_HE,
  SAN_HUI,
  XING_RULES,
  TG_HE,
  TG_CHONG,
  FIVE_ELEMENT_NAME_OF_SANHE,
  FIVE_ELEMENT_NAME_OF_SANHUI,
  getYearGanZhi,
  getZodiacByGanZhi,
  getBranchRelation,
  getBranchRelations,
  getStemRelation,
  getStemRelations,
  countElements,
  analyzeElementBalance,
  getElementComplement,
  getNaYin,
  getNaYinElement,
  getNaYinRelation,
  scoreRelations,
  findSanHeFormation,
  findSanHuiFormation,
  getBranchVsAll,
  getStemVsAll,
  checkFolkRhyme,
  getFolkZodiacGrade,
  assessHourReliability,
  FOLK_ZODIAC_RHYMES
};
