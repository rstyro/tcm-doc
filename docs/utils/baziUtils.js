/**
 * 八字分析工具层
 * ================
 * 承接 `SolarTerm.js` 排出的四柱，做「读盘」这一层的事：
 *   1. 五行统计（用神喜忌之前的准备工作）
 *   2. 日主旺衰（得令 / 得地 / 得势 三判据）
 *   3. 大运与起运
 *   4. 空亡（旬空）
 *
 * 约定：
 * - 干支常量与关系表**一律从 `ganzhiRelation.js` 取**，本文件不另起一份。
 * - 本层是**纯函数**，不依赖 `SolarTerm`（节气时刻由调用方传入）。
 * - 所有结论都是**传统通行说法**，各派权重分歧很大，界面须保留免责说明。
 */

import {
  HEAVENLY_STEMS, EARTHLY_BRANCHES, TG_TO_ELEMENT, TG_YIN_YANG,
  DZ_TO_ELEMENT, DZ_CANG_GAN, FIVE_ELEMENT, ALL_ELEMENTS, mod
} from './ganzhiRelation.js';

// 五行统计这几个辅助目前住在 `hehunUtils.js`（虽然那个文件叫「合婚」）。
// 它们本身是通用的，后续宜下沉到 `ganzhiRelation.js`；此处先复用，不再复制一份实现。
import { countElements, analyzeElementBalance, getElementComplement } from './hehunUtils.js';

// 出生地经度表（全国地级行政区全量），单独成模块便于维护与重新生成。
import { CITY_GROUPS, CITY_LONGITUDE, CITY_COUNT } from './chinaCities.js';

// ===================== 60 甲子 =====================

/** 六十甲子表。生成规则保证 i%10 配天干、i%12 配地支（甲子起）。 */
export const SIXTY_JIAZI = (() => {
  const out = [];
  for (let i = 0; i < 60; i++) {
    out.push(HEAVENLY_STEMS[i % 10] + EARTHLY_BRANCHES[i % 12]);
  }
  return out;
})();

/** 干支在六十甲子中的序（0-59）；非法输入返回 -1 */
export const getJiaZiIndex = (ganZhi) => SIXTY_JIAZI.indexOf(ganZhi);

/** 天干阴阳：甲丙戊庚壬为阳 */
export const isYangStem = (gan) => TG_YIN_YANG[gan] === '阳';

// ===================== 十神 =====================

/**
 * 十神判定（与 `SolarTerm.getTgGod` 同一套逻辑，但做成纯函数以便本层独立使用）。
 *
 * 注意：这是**第二处**十神实现——`SolarTerm` 里那份是实例方法且依赖 `this.XXX` 实例属性，
 * 属天文类的既有结构，未动它。若以后要改十神规则，**两处都要改**。
 *
 * @param {string} dayGan 日主天干
 * @param {string} targetGan 被判断的天干
 * @returns {string} 正印/偏印/比肩/劫财/食神/伤官/正财/偏财/正官/七杀，或 ''
 */
export const getTenGod = (dayGan, targetGan) => {
  const dayEl = TG_TO_ELEMENT[dayGan];
  const tEl = TG_TO_ELEMENT[targetGan];
  if (!dayEl || !tEl) return '';
  const same = TG_YIN_YANG[dayGan] === TG_YIN_YANG[targetGan];

  if (FIVE_ELEMENT[tEl].beHelped === dayEl) return same ? '偏印' : '正印';   // 生我 → 印
  if (FIVE_ELEMENT[dayEl].beHelped === tEl) return same ? '食神' : '伤官';   // 我生 → 食伤
  if (FIVE_ELEMENT[dayEl].restrain === tEl) return same ? '偏财' : '正财';   // 我克 → 财
  if (FIVE_ELEMENT[tEl].restrain === dayEl) return same ? '七杀' : '正官';   // 克我 → 官杀
  if (tEl === dayEl) return same ? '比肩' : '劫财';                          // 同我 → 比劫
  return '';
};

/** 十神归类：生扶日主（印+比劫） / 克泄耗（官杀+财+食伤） */
export const TEN_GOD_GROUP = {
  '正印': 'support', '偏印': 'support', '比肩': 'support', '劫财': 'support',
  '正官': 'drain', '七杀': 'drain', '正财': 'drain', '偏财': 'drain',
  '食神': 'drain', '伤官': 'drain'
};

export const GROUP_LABEL = { support: '生扶（印·比劫）', drain: '克泄耗（官杀·财·食伤）' };

// ===================== 空亡（旬空）=====================

/**
 * 旬空：以某柱干支定旬，返回该旬「空」掉的两个地支。
 *
 * 原理：一旬 10 干支只用掉 12 支中的 10 支，剩 2 支即空亡。
 * 旬首地支下标 +10 / +11 即所空之支。
 * 校验：甲子旬空戌亥、甲戌旬空申酉、甲申旬空午未、甲午旬空辰巳、甲辰旬空寅卯、甲寅旬空子丑。
 */
export const getXunKong = (ganZhi) => {
  const idx = getJiaZiIndex(ganZhi);
  if (idx < 0) return null;
  const headIdx = idx - (idx % 10);          // 本旬旬首在 60 甲子中的序
  const headBranch = headIdx % 12;           // 旬首地支下标
  return {
    xunHead: SIXTY_JIAZI[headIdx],
    xunHeadIndex: headIdx,
    branches: [
      EARTHLY_BRANCHES[mod(headBranch + 10, 12)],
      EARTHLY_BRANCHES[mod(headBranch + 11, 12)]
    ]
  };
};

/**
 * 标出四支中哪些落空亡。
 * @param {string} dayGanZhi 日柱（八字以日柱定旬为主流；亦有以年柱起者，各派不同）
 * @param {string[]} diZhiList 四支 [年,月,日,时]
 */
export const markXunKong = (dayGanZhi, diZhiList) => {
  const kong = getXunKong(dayGanZhi);
  if (!kong) return null;
  const POS = ['年支', '月支', '日支', '时支'];
  const hits = [];
  diZhiList.forEach((zhi, i) => {
    if (kong.branches.includes(zhi)) hits.push({ pos: POS[i], zhi });
  });
  return { ...kong, hits };
};

// ===================== 日主旺衰：得令 / 得地 / 得势 =====================

/**
 * 得令：以月支（月令）判日主的「旺相休囚死」。
 *
 * 旺相休囚死是相对**当令五行**而言：
 *   当令者旺 · 令生者相 · 生令者休 · 克令者囚 · 令克者死
 * 换算到「相对日主」即：同类→旺、月生我(印)→相、我生月→休、我克月→囚、月克我→死。
 * 得令 = 旺 或 相。
 */
export const getDeLing = (dayGan, monthZhi) => {
  const monthEl = DZ_TO_ELEMENT[monthZhi];
  const dayEl = TG_TO_ELEMENT[dayGan];
  if (!monthEl || !dayEl) return null;

  let level, why;
  if (monthEl === dayEl) {
    level = '旺'; why = `月令${monthZhi}属${monthEl}，与日主同类（比劫当令）`;
  } else if (FIVE_ELEMENT[monthEl].beHelped === dayEl) {
    level = '相'; why = `月令${monthZhi}属${monthEl}，${monthEl}生${dayEl}（印星当令）`;
  } else if (FIVE_ELEMENT[dayEl].beHelped === monthEl) {
    level = '休'; why = `月令${monthZhi}属${monthEl}，日主${dayEl}生${monthEl}（我生月令，泄气）`;
  } else if (FIVE_ELEMENT[dayEl].restrain === monthEl) {
    level = '囚'; why = `月令${monthZhi}属${monthEl}，日主${dayEl}克${monthEl}（我克月令，耗力）`;
  } else {
    level = '死'; why = `月令${monthZhi}属${monthEl}，${monthEl}克${dayEl}（官杀当令，受克）`;
  }
  return { level, deLing: level === '旺' || level === '相', monthEl, dayEl, why };
};

/**
 * 「根」的通用判定：某五行在地支藏干中的根（通根），与位置无关。
 *
 * 传统按**同五行**论根 —— 甲、乙同属木，藏干见乙亦算甲木之根；
 * 更实的是**同字之根**（甲见藏干甲）。藏干序位定分量：本气 > 中气 > 余气。
 *
 * @param {string} element 五行（木火土金水）
 * @param {string[]} diZhiList 四支 [年,月,日,时]
 */
export const getRootsByElement = (element, diZhiList) => {
  const POS = ['年支', '月支', '日支', '时支'];
  const out = [];
  (diZhiList || []).forEach((zhi, i) => {
    (DZ_CANG_GAN[zhi] || []).forEach((gan, qi) => {
      if (TG_TO_ELEMENT[gan] !== element) return;
      out.push({ pos: POS[i] || ('#' + i), zhi, gan, qiType: ['本气', '中气', '余气'][qi] || '' });
    });
  });
  return out;
};

/**
 * 某个天干在地支中的根 —— `getDeDi` 的泛化版（原先只给日主算，现任何天干都能算）。
 * `isSameStem` 标出同字之根：甲见藏干甲，比甲见藏干乙更实。
 */
export const getRoots = (stem, diZhiList) =>
  getRootsByElement(TG_TO_ELEMENT[stem], diZhiList)
    .map((r) => ({ ...r, isSameStem: r.gan === stem }));

/** 根的质量：有本气根最实，其次中气、余气，皆无则为「无」 */
export const strongestRoot = (roots) => {
  const list = roots || [];
  if (list.some((r) => r.qiType === '本气')) return '本气';
  if (list.some((r) => r.qiType === '中气')) return '中气';
  return list.length ? '余气' : '无';
};

/**
 * 得地：看日主天干（以及生它的印星）在四支藏干中有无「根」。
 *
 * 通根强弱按藏干序位：本气 > 中气 > 余气。
 * 传统上只把**日主本字**入藏干算作比劫之根；这里另列印星之根，因印能生身，
 * 对旺衰同样有意义（各派对是否计入分歧较大，仅作参考信息展示）。
 *
 * 实现已改为调用 `getRootsByElement`（与「原局结构」层共用同一判定），返回形状不变。
 */
export const getDeDi = (dayGan, diZhiList) => {
  const dayEl = TG_TO_ELEMENT[dayGan];
  const yinEl = (dayEl && FIVE_ELEMENT[dayEl]) ? FIVE_ELEMENT[dayEl].help : null; // 生我者 = 印之五行

  const selfRoots = getRootsByElement(dayEl, diZhiList);
  const yinRoots = yinEl ? getRootsByElement(yinEl, diZhiList) : [];
  const strongest = strongestRoot(selfRoots);

  return {
    selfRoots, yinRoots,
    strongest,
    deDi: selfRoots.length > 0,
    strongRoot: strongest === '本气'
  };
};

/**
 * 得势：统计「生扶日主」与「克泄耗日主」的力量对比。
 *
 * 计法（透明、可复算，但**非唯一标准**）：
 *   天干：年干 / 月干 / 时干，各计 1（日干本身是参照，不计）
 *   地支藏干：本气计 1、中气计 0.6、余气计 0.4
 * 各派在权重上分歧极大（有重月令者、有重透干者），故此处只给**倾向**，不作定论。
 */
export const getDeShi = (dayGan, ganList, diZhiList) => {
  const support = [];
  const drain = [];

  // 天干：跳过日干（index 2）
  ganList.forEach((gan, i) => {
    if (i === 2) return;
    const god = getTenGod(dayGan, gan);
    const g = TEN_GOD_GROUP[god];
    const item = { pos: ['年干', '月干', '日干', '时干'][i], gan, god, weight: 1 };
    if (g === 'support') support.push(item);
    else if (g === 'drain') drain.push(item);
  });

  // 地支藏干
  const POS = ['年支', '月支', '日支', '时支'];
  const QI_W = [1, 0.6, 0.4];
  diZhiList.forEach((zhi, i) => {
    (DZ_CANG_GAN[zhi] || []).forEach((gan, qi) => {
      const god = getTenGod(dayGan, gan);
      const g = TEN_GOD_GROUP[god];
      const item = {
        pos: POS[i], zhi, gan, god,
        qiType: ['本气', '中气', '余气'][qi] || '',
        weight: QI_W[qi] !== undefined ? QI_W[qi] : 0.3
      };
      if (g === 'support') support.push(item);
      else if (g === 'drain') drain.push(item);
    });
  });

  const sum = (arr) => Math.round(arr.reduce((s, x) => s + x.weight, 0) * 10) / 10;
  const supportScore = sum(support);
  const drainScore = sum(drain);

  return {
    support, drain, supportScore, drainScore,
    deShi: supportScore >= drainScore,
    diff: Math.round((supportScore - drainScore) * 10) / 10
  };
};

/**
 * 旺衰综合：得令 + 得地 + 得势 三判据。
 *
 * **重要**：这只是把传统最常用的三条判据并置，得出一个**倾向**。
 * 真正的旺衰还须看月令司令（人元用事）、地支刑冲合化、透干与会支等，
 * 各派取用分歧极大，不能仅凭这三条下断语。
 */
export const assessWangShuai = (dayGan, ganList, diZhiList) => {
  // 兜底：模板会无条件读 deLing.level，故此处保证 deLing 非 null
  const deLing = getDeLing(dayGan, diZhiList[1]) || {
    level: '—', deLing: false, monthEl: '', dayEl: TG_TO_ELEMENT[dayGan] || '', why: '月令或日主信息不足，无法判定得令'
  };
  const deDi = getDeDi(dayGan, diZhiList);
  const deShi = getDeShi(dayGan, ganList, diZhiList);

  const score = (deLing.deLing ? 1 : 0) + (deDi.strongRoot ? 1 : (deDi.deDi ? 0.5 : 0)) + (deShi.deShi ? 1 : 0);

  let verdict, tone;
  if (score >= 2.5) { verdict = '偏强'; tone = 'strong'; }
  else if (score >= 1.5) { verdict = '中和偏强'; tone = 'mid-strong'; }
  else if (score >= 1) { verdict = '中和偏弱'; tone = 'mid-weak'; }
  else { verdict = '偏弱'; tone = 'weak'; }

  const dayEl = TG_TO_ELEMENT[dayGan];
  return {
    deLing, deDi, deShi,
    score,
    verdict, tone,
    dayEl,
    dayYinYang: TG_YIN_YANG[dayGan],
    // 传统取用的大方向（仅方向，不是具体用神）
    direction: (tone === 'strong' || tone === 'mid-strong')
      ? { label: '宜泄、宜克、宜耗', detail: `${dayEl}偏旺，传统多从「泄（食伤）· 克（官杀）· 耗（财）」取用。` }
      : { label: '宜生、宜扶', detail: `${dayEl}偏弱，传统多从「生（印）· 扶（比劫）」取用。` },
    caveat: '旺衰高下有赖月令司令、刑冲合化、透干会支等，各派权重分歧极大；上列三判据只是最常用的入口，不宜据以定论。'
  };
};

// ===================== 五行分析 =====================

/** 五行统计 + 强弱 + 缺失（复用了合婚层的通用实现） */
export const analyzeElements = (gzList) => {
  const count = countElements(gzList);
  const balance = analyzeElementBalance(count);
  return {
    count,
    list: ALL_ELEMENTS.map(el => ({
      name: el,
      count: count[el],
      pct: Math.round((count[el] / 8) * 100)
    })),
    balance,
    // 日主自身五行，便于界面标出
    strong: balance.strong,
    weak: balance.weak,
    missing: balance.missing
  };
};

export { countElements, analyzeElementBalance, getElementComplement };

// ===================== 大运 =====================

/**
 * 排大运。
 *
 * 顺逆规则：**阳年男、阴年女顺排；阴年男、阳年女逆排**（此处「年」看年干阴阳）。
 * 起运规则：顺排数到「下一个节气」、逆排数到「上一个节气」，**3 日折 1 岁**
 *          （1 日折 4 个月，1 时辰折 10 日）。此为通行算法，另有按「时辰数」折算等变体。
 *
 * @param {Object}   o
 * @param {Date}     o.birthDate    出生时刻（本地时间的绝对时刻）
 * @param {'male'|'female'} o.gender
 * @param {string}   o.yearGanZhi   年柱
 * @param {string}   o.monthGanZhi  月柱（大运自月柱起排）
 * @param {string}   o.dayGan       日主天干（用于算大运十神）
 * @param {Date[]|string[]} o.termDates 覆盖出生年前后的二十四节气时刻（越多越稳）
 * @param {number}   [o.steps=10]   排几步大运
 */
export const computeDaYun = ({ birthDate, gender, yearGanZhi, monthGanZhi, dayGan, termDates, steps = 10 }) => {
  const monthIdx = getJiaZiIndex(monthGanZhi);
  if (monthIdx < 0) return null;

  const yearGan = yearGanZhi.charAt(0);
  const yangYear = isYangStem(yearGan);
  const male = gender === 'male';
  // 阳年男顺、阴年男逆；阴年女顺、阳年女逆。
  // 四种组合化简即「年干阴阳 === 是否男命」→ 顺排。
  const forward = (yangYear === male);

  // 规整节气时刻
  const terms = (termDates || [])
    .map(t => (t instanceof Date ? t : new Date(t)))
    .filter(t => !isNaN(t.getTime()))
    .sort((a, b) => a - b);

  const birthMs = birthDate.getTime();
  let startAgeYears = null, startDetail = null, refTerm = null;

  if (terms.length) {
    if (forward) {
      refTerm = terms.find(t => t.getTime() > birthMs);
    } else {
      const before = terms.filter(t => t.getTime() <= birthMs);
      refTerm = before.length ? before[before.length - 1] : null;
    }
    if (refTerm) {
      const diffDays = Math.abs(refTerm.getTime() - birthMs) / 86400000;
      // 3 日 = 1 岁；1 日 = 4 个月
      const years = Math.floor(diffDays / 3);
      const remDays = diffDays - years * 3;
      const monthsFloat = remDays * 4;
      const months = Math.floor(monthsFloat);
      const days = Math.floor((monthsFloat - months) * 30);
      startAgeYears = Math.round((years + months / 12) * 100) / 100;
      startDetail = { years, months, days, diffDays: Math.round(diffDays * 1000) / 1000 };
    }
  }

  // 排大运干支
  const list = [];
  for (let k = 1; k <= steps; k++) {
    const idx = mod(forward ? monthIdx + k : monthIdx - k, 60);
    const gz = SIXTY_JIAZI[idx];
    const ageFrom = startAgeYears === null ? (k - 1) * 10 : Math.round((startAgeYears + (k - 1) * 10) * 100) / 100;
    list.push({
      step: k,
      ganZhi: gz,
      gan: gz.charAt(0),
      zhi: gz.charAt(1),
      tenGod: getTenGod(dayGan, gz.charAt(0)),
      ageFrom,
      ageTo: Math.round((ageFrom + 10) * 100) / 100
    });
  }

  return {
    forward,
    directionLabel: forward ? '顺排' : '逆排',
    reason: `${yearGan}为${yangYear ? '阳' : '阴'}年 · ${male ? '男' : '女'}命 → ${forward ? '顺排' : '逆排'}`,
    monthGanZhi,
    startAgeYears,
    startDetail,
    refTerm,
    list,
    caveat: '起运折算法（3日折1岁等）与交运时刻的取法各派略有出入，岁数为估算，仅供参考。'
  };
};

// ===================== 第0层：时刻校准（真太阳时 · 子时约定）=====================
//
// 为什么需要这一层：输入框里填的是**行政区时间**（北京时间），而八字用的是**天体时刻**。
// 两者相差两项，都是确定的天文/地理量，没有流派争议：
//   1. 经度差：东八区中央经线 120°E，偏西 1° 就慢 4 分钟。乌鲁木齐（约 87.6°E）比钟表慢约 130 分钟。
//   2. 均时差：真太阳日长短不等，全年在 ±16 分钟内摆动。
// 时柱以 2 小时为界，西部城市「钟表 12:00」很可能其实是巳时。

/** 东八区标准经线（东经） */
export const STANDARD_MERIDIAN = 120;

// 出生地经度表已独立成 `chinaCities.js`：
//   收录地级行政区全量（地级市 / 自治州 / 地区 / 盟 / 省直辖县级市），
//   直辖市与香港另含市辖区 —— 二者面积相当于一个省，市中心代表不了全市。
//   数据来源、精度与生成方式见该文件头部注释；此处只做转出，调用点无需改动。
export { CITY_GROUPS, CITY_LONGITUDE, CITY_COUNT };

/**
 * 均时差（分钟）：真太阳时 − 平太阳时。
 * 用 NOAA/Spencer 级数，全年误差约 ±30 秒 —— 相对 2 小时一个时辰可忽略，
 * 但若出生时刻恰好卡在整点前后半分钟内，仍应提示不确定性。
 */
export const equationOfTimeMinutes = (y, m, d) => {
  const doy = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
  const g = (2 * Math.PI / 365) * (doy - 1);
  return 229.18 * (
    0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g)
  );
};

export const pad2 = (n) => String(n).padStart(2, '0');

/** {y,m,d,h,mi} → 'YYYY-MM-DD HH:mm:ss' */
export const formatMoment = (o) =>
  `${o.y}-${pad2(o.m)}-${pad2(o.d)} ${pad2(o.h)}:${pad2(o.mi)}:00`;

/**
 * 真太阳时换算：真太阳时 = 钟表时间（北京时间） + 经度差 + 均时差
 * @returns {null|Object} 未给经度时返回 null
 */
export const toTrueSolarTime = ({ y, m, d, h = 12, mi = 0, longitude }) => {
  if (longitude === null || longitude === undefined || !isFinite(Number(longitude))) return null;
  const lng = Number(longitude);

  const eot = equationOfTimeMinutes(y, m, d);
  const lngOffset = (lng - STANDARD_MERIDIAN) * 4;      // 1° = 4 分钟
  const offsetMin = lngOffset + eot;
  const shiftSec = Math.round(offsetMin * 60);

  const base = new Date(y, m - 1, d, h, mi, 0);
  const t = new Date(base.getTime() + shiftSec * 1000);

  const dayDiff = Math.round(
    (Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - Date.UTC(y, m - 1, d)) / 86400000
  );

  return {
    y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate(),
    h: t.getHours(), mi: t.getMinutes(),
    longitude: lng,
    lngOffsetMinutes: Math.round(lngOffset * 10) / 10,
    eotMinutes: Math.round(eot * 10) / 10,
    offsetMinutes: Math.round(offsetMin * 10) / 10,
    offsetSeconds: shiftSec,
    dayShift: dayDiff
  };
};

/**
 * 子时约定（23:00–23:59 的归属，传统上两派各有道理）
 * - nextDay：23:00 起即算次日，日柱与时柱**同时**进次日（主流排盘软件默认）
 * - lateZi ：夜子时归当日，日柱用当日、时干按当日日干起子时
 */
export const ZI_CONVENTIONS = [
  { value: 'nextDay', label: '23点换日', detail: '23:00 起算次日：日柱与时柱同时进次日（通行做法）' },
  { value: 'lateZi', label: '夜子时归当日', detail: '日柱仍用当日，时干按当日日干起子时' }
];

/** 按子时约定折算「排盘用时刻」（只对 23:00–23:59 有影响） */
export const applyZiConvention = ({ y, m, d, h = 12, mi = 0, ziConvention = 'nextDay' }) => {
  if (ziConvention === 'nextDay' && h >= 23) {
    const nd = new Date(y, m - 1, d, h, mi, 0);
    nd.setDate(nd.getDate() + 1);
    return { y: nd.getFullYear(), m: nd.getMonth() + 1, d: nd.getDate(), h, mi, shifted: true };
  }
  return { y, m, d, h, mi, shifted: false };
};

/**
 * 把「钟表时间」折算成「排盘用时刻」，并返回每一步的中间量供界面展示。
 * 顺序：钟表时间 →（真太阳时：经度差 + 均时差）→（子时约定）
 */
export const resolveMoment = ({
  y, m, d, h = 12, mi = 0,
  longitude = null, trueSolar = false, ziConvention = 'nextDay'
}) => {
  const clock = { y, m, d, h, mi };
  const steps = [{
    key: 'clock',
    label: '钟表时间',
    value: formatMoment(clock),
    note: '出生地行政区时间（国内即北京时间）'
  }];

  let solar = null;
  let eff = { ...clock };

  if (trueSolar && longitude !== null && longitude !== undefined && isFinite(Number(longitude))) {
    solar = toTrueSolarTime({ ...clock, longitude });
    if (solar) {
      eff = { y: solar.y, m: solar.m, d: solar.d, h: solar.h, mi: solar.mi };
      steps.push({
        key: 'lng',
        label: '经度校正',
        value: `${solar.lngOffsetMinutes >= 0 ? '+' : '-'}${Math.abs(solar.lngOffsetMinutes).toFixed(1)} 分`,
        note: `东经 ${Number(longitude).toFixed(2)}° 与 120°E 相差 ${(Number(longitude) - STANDARD_MERIDIAN).toFixed(2)}°（1° = 4 分钟）`
      });
      steps.push({
        key: 'eot',
        label: '均时差',
        value: `${solar.eotMinutes >= 0 ? '+' : '-'}${Math.abs(solar.eotMinutes).toFixed(1)} 分`,
        note: '真太阳时与平太阳时之差（天文量，全年约 ±16 分钟）'
      });
      steps.push({
        key: 'solar',
        label: '真太阳时',
        value: formatMoment(eff),
        note: solar.dayShift !== 0 ? '已跨日' : '未跨日'
      });
    }
  } else {
    steps.push({
      key: 'solar',
      label: '真太阳时',
      value: '未启用',
      note: '按钟表时间直接排盘；东部城市影响小，西部城市可能相差一个时辰'
    });
  }

  const zi = applyZiConvention({ ...eff, ziConvention });
  if (zi.shifted) {
    steps.push({
      key: 'zi',
      label: '子时换日',
      value: formatMoment(zi),
      note: '23:00 起算次日，日柱与时柱同时进次日'
    });
  }

  return {
    clock,
    clockStr: formatMoment(clock),
    solar,
    trueSolarApplied: !!solar,
    ziConvention,
    ziShifted: zi.shifted,
    effective: { y: zi.y, m: zi.m, d: zi.d, h: zi.h, mi: zi.mi },
    effectiveStr: formatMoment(zi),
    steps
  };
};

export default {
  SIXTY_JIAZI,
  TEN_GOD_GROUP,
  GROUP_LABEL,
  getJiaZiIndex,
  isYangStem,
  getTenGod,
  getXunKong,
  markXunKong,
  getDeLing,
  getDeDi,
  getRootsByElement,
  getRoots,
  strongestRoot,
  getDeShi,
  assessWangShuai,
  analyzeElements,
  computeDaYun,
  // 第0层：时刻校准
  STANDARD_MERIDIAN,
  CITY_LONGITUDE,
  CITY_GROUPS,
  CITY_COUNT,
  equationOfTimeMinutes,
  toTrueSolarTime,
  ZI_CONVENTIONS,
  applyZiConvention,
  resolveMoment,
  formatMoment,
  pad2
};
