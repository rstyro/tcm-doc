/**
 * 八字「判断层」：格局取法 · 用神三法
 * ================
 * 与「结构层」（`baziStructure.js`）的分工：
 *   结构层只列**客观存在** —— 哪些字之间成立哪种关系、哪个藏干透到了天干、哪个天干在哪几支有根；
 *   本层要**下判断** —— 取什么格、用什么神。
 *
 * 传统命理恰恰在这两件事上分歧最大，故本层**一律并列呈现、不给单一结论**：
 *   · 取格三法：月令透干取格 / 月令本气取格 / 司权取格（人元用事分野）
 *   · 取用三门：扶抑（旺衰） / 调候（寒暖燥湿） / 通关（两神相战）
 * 每一项都须注明出自哪一派口径、分歧在哪里。这是全站「不替用户下断语」在工具层的落地。
 *
 * 纯函数：不依赖 `SolarTerm`，需要节气信息处由调用方传入（如「生月已过几日」）。
 */

import {
  TG_TO_ELEMENT, DZ_TO_ELEMENT, DZ_CANG_GAN, FIVE_ELEMENT, ALL_ELEMENTS,
  stemsOfElement, splitGanZhi
} from './ganzhiRelation.js';

import { getTenGod } from './baziUtils.js';

// ===================== 建禄 · 月劫 =====================

/** 日主「禄」（临官）之地 —— 月令逢此即「建禄格」 */
export const LU_POSITION = {
  甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子'
};

/**
 * 阳干「阳刃」（帝旺）之地 —— 月令逢此即「阳刃格」（亦称月劫）。
 * 阴干传统多不论刃，故此处只列五个阳干；这一取舍本身也是分歧点，界面须说明。
 */
export const REN_POSITION = { 甲: '卯', 丙: '午', 戊: '午', 庚: '酉', 壬: '子' };

// ===================== 人元司令分野 =====================

/**
 * 月令藏干的**司令日数**（人元用事分野）。
 *
 * 含义：一个月并非从头到尾都由月令本气管事，而是按日数轮值 —— 前若干日某干司令，
 * 再若干日换另一干，余日归本气。司权派取格即取「出生当日在司令的那一位人元」。
 *
 * **各本日数略有出入**，常见异文有二：① 寅 / 巳 / 申 / 亥 之首干或作「己」而非「戊」；
 * ② 午月「己」与「丁」的先后。此处采通行本，界面须标注「版本不一」。
 */
export const MONTH_QI_FENYE = {
  寅: [['戊', 7], ['丙', 7], ['甲', 16]],
  卯: [['甲', 10], ['乙', 20]],
  辰: [['乙', 9], ['癸', 3], ['戊', 18]],
  巳: [['戊', 7], ['庚', 7], ['丙', 16]],
  午: [['丙', 10], ['己', 9], ['丁', 11]],
  未: [['丁', 9], ['乙', 3], ['己', 18]],
  申: [['戊', 7], ['壬', 7], ['庚', 16]],
  酉: [['庚', 10], ['辛', 20]],
  戌: [['辛', 9], ['丁', 3], ['戊', 18]],
  亥: [['戊', 7], ['甲', 7], ['壬', 16]],
  子: [['壬', 10], ['癸', 20]],
  丑: [['癸', 9], ['辛', 3], ['己', 18]]
};

/**
 * 司权取格：给出「生月已过几日」，返回当日在司令的人元。
 *
 * @param {string} monthZhi 月支
 * @param {number} daysAfterJie 出生日距本月「节」的天数（0 = 交节当日）
 * @returns {null|Object} { gan, index, dayFrom, dayTo }
 */
export const getSiQuanGan = (monthZhi, daysAfterJie) => {
  const seq = MONTH_QI_FENYE[monthZhi];
  if (!seq || daysAfterJie === null || daysAfterJie === undefined || !isFinite(Number(daysAfterJie))) return null;
  const d = Number(daysAfterJie);          // 0 起算：交节当日为第 0 日
  let acc = 0;
  for (let i = 0; i < seq.length; i++) {
    const from = acc;
    acc += seq[i][1];
    if (d < acc || i === seq.length - 1) {
      return { gan: seq[i][0], index: i, dayFrom: from, dayTo: acc - 1 };
    }
  }
  return null;
};

/**
 * 生月已过几日 —— 司权取格的输入。
 *
 * 为何要读两年节气表：`SolarTerm.getSolarTermDate(Y)` 覆盖的是**立春(Y) 到大寒(Y+1)**，
 * 故一月份的出生要落到上一年的那张表里。把 Y-1 与 Y 两年的表一并传入，即可覆盖任何日期。
 *
 * 两步走，缺一不可：
 *   ① 用**出生时刻**与交节时刻比较，定出「当值的那一个节」—— 立春当日 10:00 出生其实仍在丑月，
 *      与四柱口径一致（月柱也是这么定的）；
 *   ② 再按**日历日**数两者相差几天 —— 传统说「生于某月第几日」数的是日期，不是小时数；
 *      若按「小时差 ÷ 24 取整」，次日清晨出生会被算成第 0 日。
 *
 * @param {Array<Array<Date|string>>} termLists 若干年的二十四节气时刻（偶数下标即十二「节」）
 * @param {number} y 出生年
 * @param {number} m 出生月
 * @param {number} d 出生日
 * @param {number} [h=0]  出生时
 * @param {number} [mi=0] 出生分
 * @param {number} [s=0]  出生秒（界面上不会用到；有它在，测试才能拿交节的整秒时刻做精确对拍）
 * @returns {null|number} 交节当日为第 0 日
 */
export const daysAfterJieOf = (termLists, y, m, d, h = 0, mi = 0, s = 0) => {
  const jies = [];
  (termLists || []).forEach((list) => {
    (list || []).forEach((t, i) => {
      if (i % 2 !== 0 || !t) return;            // 只取十二「节」；奇数下标是「气」
      const x = t instanceof Date ? t : new Date(t);
      if (!isNaN(x.getTime())) jies.push(x);
    });
  });
  if (!jies.length) return null;
  jies.sort((a, b) => a - b);

  const birth = new Date(y, m - 1, d, h, mi, s);
  const before = jies.filter((t) => t.getTime() <= birth.getTime());
  if (!before.length) return null;
  const jie = before[before.length - 1];

  // 日历日之差（用 UTC 消掉夏令时/时区对「同一天」的干扰）
  const dayOf = (x) => Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
  return Math.round((dayOf(birth) - dayOf(jie)) / 86400000);
};

// ===================== 十神 → 格局名 =====================

/**
 * 十神对应的格局名。
 * 比劫当令不称「比肩格 / 劫财格」，而按禄刃立名（建禄格 / 阳刃格 / 月劫格）—— 这是传统惯例。
 */
export const GE_NAME = {
  正官: '正官格', 七杀: '七杀格（偏官格）',
  正财: '正财格', 偏财: '偏财格',
  正印: '正印格', 偏印: '偏印格（枭神格）',
  食神: '食神格', 伤官: '伤官格'
};

// ===================== 格局取法 =====================

const QI_TYPE = ['本气', '中气', '余气'];

/**
 * 格局候选（多派并列）。
 *
 * @param {Object} o
 * @param {string[]} o.gzList      四柱干支 [年, 月, 日, 时]
 * @param {number?}  [o.daysAfterJie=null] 生月已过几日（供司权取格；不给则该派不出候选）
 * @returns {null|Object}
 */
export const analyzeGeJu = ({ gzList, daysAfterJie = null }) => {
  const pillars = (gzList || []).map((g) => {
    const { stem, branch } = splitGanZhi(g);
    return { stem, branch };
  });
  if (pillars.length < 4) return null;

  const dayGan = pillars[2].stem;
  const monthZhi = pillars[1].branch;

  // 「透出」看年干 / 月干 / 时干。**日干是日主本身，不算透出** —— 这一条各家一致。
  const EXPOSE_AT = [{ pos: '年', i: 0 }, { pos: '月', i: 1 }, { pos: '时', i: 3 }];

  const cangGan = (DZ_CANG_GAN[monthZhi] || []).map((gan, qi) => {
    const at = EXPOSE_AT.filter((e) => pillars[e.i].stem === gan).map((e) => e.pos);
    return {
      gan,
      qiType: QI_TYPE[qi] || '',
      element: TG_TO_ELEMENT[gan] || '',
      god: getTenGod(dayGan, gan),
      exposed: at.length > 0,
      exposedAt: at,
      isBenQi: qi === 0
    };
  });

  // ---- 禄刃：月令为日主之禄 / 刃，或月令本气即比劫 ----
  const isLu = LU_POSITION[dayGan] === monthZhi;
  const isRen = REN_POSITION[dayGan] === monthZhi;
  const benQiGod = cangGan[0] ? cangGan[0].god : '';
  let luWang = null;
  if (isLu || isRen || benQiGod === '比肩' || benQiGod === '劫财') {
    const label = isLu ? '建禄格' : (isRen ? '阳刃格' : '月劫格');
    const reason = isLu
      ? `月支${monthZhi}正是日主${dayGan}临官（禄）之地，故立建禄`
      : (isRen
        ? `月支${monthZhi}正是日主${dayGan}帝旺（刃）之地，故立阳刃`
        : `月令${monthZhi}本气为${cangGan[0].gan}（${benQiGod}），比劫当令，传统以禄刃立名而非取「比肩格」`);
    luWang = { isLu, isRen, label, god: benQiGod || '比劫', reason };
  }

  // ---- 三法并列 ----
  const candidates = [];

  const exposed = cangGan.find((c) => c.exposed);
  if (exposed && GE_NAME[exposed.god]) {
    candidates.push({
      school: '月令透干取格',
      key: 'touGan',
      name: GE_NAME[exposed.god],
      gan: exposed.gan,
      god: exposed.god,
      basis: `月令${monthZhi}之${exposed.qiType}${exposed.gan}透于${exposed.exposedAt.join('、')}干，故取其十神立格`
    });
  }

  if (cangGan[0] && GE_NAME[cangGan[0].god]) {
    candidates.push({
      school: '月令本气取格',
      key: 'benQi',
      name: GE_NAME[cangGan[0].god],
      gan: cangGan[0].gan,
      god: cangGan[0].god,
      basis: `不论透与不透，径取月令${monthZhi}本气${cangGan[0].gan}之十神立格`
    });
  }

  const si = getSiQuanGan(monthZhi, daysAfterJie);
  if (si) {
    const god = getTenGod(dayGan, si.gan);
    candidates.push({
      school: '司权取格（人元用事）',
      key: 'siQuan',
      name: GE_NAME[god] || `${god}当权`,
      gan: si.gan,
      god,
      basis: `生于${monthZhi}月第 ${daysAfterJie} 日，当日在司令者为${si.gan}（该月人元分野中第 ${si.dayFrom}–${si.dayTo} 日），故取之立格`
    });
  }

  if (luWang) {
    candidates.push({
      school: '禄刃立格',
      key: 'luWang',
      name: luWang.label,
      gan: cangGan[0] ? cangGan[0].gan : '',
      god: luWang.god,
      basis: luWang.reason
    });
  }

  return {
    dayGan,
    monthZhi,
    monthGan: pillars[1].stem,
    daysAfterJie,
    cangGan,
    luWang,
    candidates,
    // 各派都同意的一点：取格看月令。分歧只在「看月令的哪一层」。
    notes: [
      '三家之法并非互斥：透干派看「月令人元透出者」，本气派看「月令本气」，司权派看「当日司令之人元」，同一命造常得出不同格局。',
      '《子平真诠》一系以月令为提纲，主透干取格；古法（《渊海子平》一系）另有以年柱为主、或「有官先论官」等法，与此互异。',
      '司权分野表的日数各本略有出入（如寅、巳、申、亥之首干或作己土作戊土），故司权派结论对版本敏感。',
      '取格之后尚有「成格 / 破格」一层（格是否被刑冲克害所伤），分歧更大，此处不涉及。'
    ]
  };
};

// ===================== 用神：扶抑 =====================

/**
 * 扶抑取用：由日主旺衰定取用方向。
 * 偏强 → 克（官杀）· 泄（食伤）· 耗（财）；偏弱 → 生（印）· 扶（比劫）。
 *
 * @param {Object} o
 * @param {string} o.dayGan
 * @param {Object} o.wangShuai   `baziUtils.assessWangShuai` 的结果
 * @param {string?} [o.monthLingGod] 月令本气之十神，用于标出「与月令同气」的候选
 */
export const analyzeFuYi = ({ dayGan, wangShuai, monthLingGod = '' }) => {
  const dayEl = TG_TO_ELEMENT[dayGan];
  if (!dayEl || !wangShuai) return null;

  const strong = wangShuai.tone === 'strong' || wangShuai.tone === 'mid-strong';
  const E = FIVE_ELEMENT[dayEl];

  const cands = strong
    ? [
      { role: '克', god: '官杀', element: E.beRestrained, reason: `${dayEl}偏旺，取${E.beRestrained}（官杀）制身` },
      { role: '泄', god: '食伤', element: E.beHelped, reason: `${dayEl}偏旺，取${E.beHelped}（食伤）泄其秀气` },
      { role: '耗', god: '财', element: E.restrain, reason: `${dayEl}偏旺，取${E.restrain}（财）耗其旺气` }
    ]
    : [
      { role: '生', god: '印', element: E.help, reason: `${dayEl}偏弱，取${E.help}（印）生扶日主` },
      { role: '扶', god: '比劫', element: dayEl, reason: `${dayEl}偏弱，取${dayEl}（比劫）帮扶日主` }
    ];

  const GOD_OF_ELEMENT = {
    官杀: ['正官', '七杀'], 食伤: ['食神', '伤官'], 财: ['正财', '偏财'],
    印: ['正印', '偏印'], 比劫: ['比肩', '劫财']
  };

  return {
    school: '扶抑取用（旺衰）',
    basis: `以日主旺衰为纲：判为「${wangShuai.verdict}」，故${strong ? '宜克泄耗' : '宜生扶'}。`,
    verdict: wangShuai.verdict,
    tone: wangShuai.tone,
    strong,
    candidates: cands.map((c) => ({
      ...c,
      stems: stemsOfElement(c.element),
      gods: GOD_OF_ELEMENT[c.god] || [],
      // 与月令同气者：传统常说「月令为官则先论官」，故标出来
      alignsMonthLing: monthLingGod ? (GOD_OF_ELEMENT[c.god] || []).includes(monthLingGod) : false
    })),
    note: '扶抑以旺衰为准，而旺衰本身依赖月令司令、刑冲合化、透干会支等，各派权重分歧极大；此处的「强弱」只是最常用三判据的合成倾向。'
  };
};

// ===================== 用神：调候 =====================

/** 月支 → 季节 */
export const SEASON_OF_MONTH = {
  寅: '春', 卯: '春', 辰: '春',
  巳: '夏', 午: '夏', 未: '夏',
  申: '秋', 酉: '秋', 戌: '秋',
  亥: '冬', 子: '冬', 丑: '冬'
};

/**
 * 按月令归纳的调候取向（寒暖燥湿）。
 *
 * 说明：传统调候以《穷通宝鉴》逐日干、逐月的专表为准，各本用字略有出入。
 * 本工具**不照录该表**，而按月令的气候属性归纳出主 / 次两个取向 —— 这样规则透明、可复核，
 * 不至于把一份记不准的表格当成标准答案。界面须写明这一取舍。
 */
const CLIMATE_RULE = {
  寅: { climate: '温 · 木旺', primary: ['火', '春木向阳，传统取丙火发荣'], secondary: ['水', '春木亦须癸水滋润，唯水多则木浮'] },
  卯: { climate: '温 · 木旺', primary: ['火', '春木向阳，传统取丙火发荣'], secondary: ['水', '春木亦须癸水滋润，唯水多则木浮'] },
  辰: { climate: '湿 · 土', primary: ['火', '辰为湿土、余寒未尽，传统取丙火暖土'], secondary: ['木', '土重则滞，取木疏土'] },
  巳: { climate: '热 · 火旺', primary: ['水', '夏火炎上，传统取壬水润泽解炎'], secondary: ['金', '金为水之源，佐水之力'] },
  午: { climate: '热 · 火旺', primary: ['水', '夏火炎上，传统取壬水润泽解炎'], secondary: ['金', '金为水之源，佐水之力'] },
  未: { climate: '燥 · 土', primary: ['水', '未为燥土，传统取癸水润燥'], secondary: ['金', '金能生水，佐水之力'] },
  申: { climate: '凉 · 金旺', primary: ['火', '秋金需丁火锻炼，方成器用'], secondary: ['水', '金得壬水淘洗，其气愈清'] },
  酉: { climate: '凉 · 金旺', primary: ['火', '秋金需丁火锻炼，方成器用'], secondary: ['水', '金得壬水淘洗，其气愈清'] },
  戌: { climate: '燥 · 土', primary: ['水', '戌为燥土，传统取癸水润燥'], secondary: ['金', '金能生水，佐水之力'] },
  亥: { climate: '寒 · 水旺', primary: ['火', '冬水凛冽，传统取丙火解寒'], secondary: ['木', '木能泄水之旺气'] },
  子: { climate: '寒 · 水旺', primary: ['火', '冬水凛冽，传统取丙火解寒'], secondary: ['木', '木能泄水之旺气'] },
  丑: { climate: '寒 · 湿土', primary: ['火', '丑为湿土、寒气未退，传统取丙火暖土解寒'], secondary: ['木', '木能疏土、兼泄水旺'] }
};

/**
 * 调候取用：看月令气候的寒暖燥湿。
 * @param {Object} o
 * @param {string} o.dayGan
 * @param {string} o.monthZhi
 */
export const analyzeTiaoHou = ({ dayGan, monthZhi }) => {
  const rule = CLIMATE_RULE[monthZhi];
  if (!rule) return null;
  const season = SEASON_OF_MONTH[monthZhi] || '';
  const monthEl = DZ_TO_ELEMENT[monthZhi];
  const dayEl = TG_TO_ELEMENT[dayGan];

  const mk = (tier, arr) => ({
    tier,
    element: arr[0],
    stems: stemsOfElement(arr[0]),
    reason: arr[1]
  });

  // 日主与月令同气、且季节走到寒 / 热之极 —— 调候尤为切要
  const extreme = (season === '冬' || season === '夏') && dayEl && dayEl === monthEl;
  const urgency = extreme
    ? { level: 'high', why: `日主${dayGan}属${dayEl}，又生于${season}月，气候与日主同气（${season === '冬' ? '水冷金寒' : '火炎土燥'}），调候尤为切要` }
    : { level: 'normal', why: `${season}月生，气候尚未与日主同极，调候作为参考取向` };

  return {
    school: '调候取用（寒暖燥湿）',
    monthZhi,
    season,
    climate: rule.climate,
    dayEl: dayEl || '',
    urgency,
    candidates: [mk('主', rule.primary), mk('次', rule.secondary)],
    note: '传统调候以《穷通宝鉴》逐日干、逐月的专表为准，各本用字略有出入。此处不照录该表，而按**月令的气候属性**归纳取向，规则透明可复核，仅供与前两法参看。'
  };
};

// ===================== 用神：通关 =====================

/**
 * 通关取用：两股力量对立相战，取「中间者」使相生之气贯通。
 * 若 A 克 B 而两者俱盛，则取 A 所生之五行 X（因 A 生 X、X 生 B，恰在相生链中段）。
 * 例：金木相战 → 取水通关（金生水、水生木）。
 *
 * @param {Object} count 五行计数（`baziUtils.countElements` 的结果）
 * @param {string?} [dayEl] 日主五行，用于标出「日主参与相战」
 * @param {number} [threshold=2] 两侧均须达到的枚数
 */
export const findTongGuan = (count, dayEl = '', threshold = 2) => {
  const pairs = [];
  ALL_ELEMENTS.forEach((a) => {
    const b = FIVE_ELEMENT[a].restrain;          // a 克 b
    if (!b) return;
    const ca = (count && count[a]) || 0;
    const cb = (count && count[b]) || 0;
    if (ca < threshold || cb < threshold) return;
    const bridge = FIVE_ELEMENT[a].beHelped;     // a 生 x，x 生 b
    pairs.push({
      a, b, bridge,
      aCount: ca, bCount: cb,
      stems: stemsOfElement(bridge),
      involvesDayMaster: !!dayEl && (dayEl === a || dayEl === b),
      reason: `${a}${ca} 枚克 ${b}${cb} 枚，两神相战；取${bridge}通关（${a}生${bridge}、${bridge}生${b}），使克战之气转为相生之流`
    });
  });
  return pairs.sort((x, y) => (y.aCount + y.bCount) - (x.aCount + x.bCount)).slice(0, 3);
};

// ===================== 组装 =====================

/**
 * 判断层全景：格局取法 + 用神三法。
 *
 * @param {Object} o
 * @param {string[]} o.gzList
 * @param {Object}   o.wangShuai  `baziUtils.assessWangShuai` 结果
 * @param {Object}   o.elements   `baziUtils.analyzeElements` 结果
 * @param {number?}  [o.daysAfterJie=null] 生月已过几日（司权取格用）
 */
export const analyzeJudgment = ({ gzList, wangShuai, elements, daysAfterJie = null }) => {
  const pillars = (gzList || []).map((g) => {
    const { stem, branch } = splitGanZhi(g);
    return { stem, branch };
  });
  if (pillars.length < 4 || !wangShuai) return null;

  const dayGan = pillars[2].stem;
  const monthZhi = pillars[1].branch;
  const dayEl = TG_TO_ELEMENT[dayGan] || '';

  const geJu = analyzeGeJu({ gzList, daysAfterJie });
  const monthLingGod = geJu && geJu.cangGan[0] ? geJu.cangGan[0].god : '';

  const fuYi = analyzeFuYi({ dayGan, wangShuai, monthLingGod });
  const tiaoHou = analyzeTiaoHou({ dayGan, monthZhi });
  const tongGuan = findTongGuan(elements && elements.count ? elements.count : {}, dayEl);

  return {
    dayGan,
    monthZhi,
    dayEl,
    geJu,
    fuYi,
    tiaoHou,
    tongGuan,
    // 三法结论往往不一致 —— 这正是要并列的原因
    conflict: (() => {
      const els = [];
      if (fuYi && fuYi.candidates.length) els.push(fuYi.candidates.map((c) => c.element).join(''));
      if (tiaoHou && tiaoHou.candidates.length) els.push(tiaoHou.candidates[0].element);
      if (tongGuan && tongGuan.length) els.push(tongGuan[0].bridge);
      return {
        views: els.length,
        note: '三法各自成立、结论常不相同：扶抑看旺衰之平衡，调候看气候之寒暖，通关看两势之对峙。' +
          '传统上以扶抑为正格常法、调候为急救之方、通关为解纷之剂，孰主孰从各派不一，此处并列供参，不作取舍。'
      };
    })(),
    caveat: '以上取格与取用，均是传统命理**诸说并列**的结果，没有唯一答案；' +
      '本工具只整理各派判据与依据，不作吉凶推断，也不构成任何现实建议。'
  };
};

export default {
  LU_POSITION,
  REN_POSITION,
  MONTH_QI_FENYE,
  GE_NAME,
  SEASON_OF_MONTH,
  getSiQuanGan,
  daysAfterJieOf,
  analyzeGeJu,
  analyzeFuYi,
  analyzeTiaoHou,
  findTongGuan,
  analyzeJudgment
};
