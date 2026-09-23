/**
 * 八字「推演层」：格局成破 · 用神落点 · 十神引动
 * ================
 * 三层分工（越往下争议越大，界面须逐层加注）：
 *   结构层 `baziStructure.js` —— 只列**客观存在**：哪些字成立哪种关系、哪个藏干透了、哪个天干有根。
 *   判断层 `baziJudgment.js` —— 取何**格局**、用何**用神**。诸说并列，不给单一答案。
 *   本层（推演）   —— 在判断层的结论之上再走一步：格是**成**是**破**、用神在盘中**落在何处**、
 *                     流年大运的**十神**与这些结论如何对应。
 *
 * 本层是全站争议最大的一层，故取三条硬约束：
 *   ① **不产出吉凶词**。本层不给「吉/凶/利/不利」任何结论，只做「对应关系」与「命中与否」的呈现。
 *      传统所谓吉凶，各派对同一十神往往判然相反（伤官可忌可为用、七杀可畏可成事），
 *      详见 `DIVERGENCE_CASES` —— 那一节存在的意义正是说明「单一结论不可能成立」。
 *   ② **一切结论可回溯到判据**。每一条「成格之据 / 破格之嫌」都注明是哪个十神、落在哪一柱、
 *      是透干还是藏干，以及引的是哪一派的说法。
 *   ③ **计数不等于结论**。本层会给出「相神见几处、忌神见几处」这类**算术计数**，
 *      但明确声明：多寡不决定成破，权重各派不同，读者自行参看。
 *
 * 纯函数：不依赖 `SolarTerm`；流年大运序列由调用方传入（`baziTimeline` 的产物）。
 */

import {
  TG_TO_ELEMENT, FIVE_ELEMENT, ALL_ELEMENTS, HEAVENLY_STEMS,
  DZ_CANG_GAN, splitGanZhi, getBranchRelations
} from './ganzhiRelation.js';

import { getTenGod, getRootsByElement } from './baziUtils.js';
import { toPillars } from './baziStructure.js';

/** 藏干序位 → 名称（与结构层同一套叫法） */
const QI_TYPE = ['本气', '中气', '余气'];

// ===================== 格局成破：规则表 =====================
//
// 传统「成格 / 破格」的核心是**相神**之说（《子平真诠》一系讲得最系统）：
//   格局既立，须有字来「辅」它，此字即相神；相神得用则成，被伤则破。
// 各派对「谁是相神、谁算破格」出入不小，故每条都写明理由，并附 `note` 说明分歧。
//
// cheng —— 通常视为**辅格**的十神（相神一路）
// po    —— 通常视为**伤格**的十神（破格一路）
// 同一十神可能既在某些派里是相神、又在另一些派里是忌神 —— 那正是 `note` 要交代的。

export const GE_CHENG_PO = {
  正官: {
    label: '正官格',
    cheng: [
      { god: '正财', why: '财能生官，使官星有源不孤' },
      { god: '偏财', why: '偏财亦能生官，官星得财为源' },
      { god: '正印', why: '官生印、印生身，官印相生；印又制食伤以护官' },
      { god: '偏印', why: '偏印亦能护官，兼制食伤使官星不受克' }
    ],
    po: [
      { god: '伤官', name: '伤官见官', why: '伤官克官，官星受伤；传统有「伤官见官，为祸百端」之谚' },
      { god: '七杀', name: '官杀混杂', why: '官杀并见，取用无所适从，传统视为混杂' }
    ],
    note: '正官为「六格之首」之说，出自《子平真诠》一系：官星最喜财印为辅、最忌伤官。' +
      '但「伤官见官」是否一概不利，各家并不一致 —— 有「伤官去官」之说，亦有专看有无印制、身强身弱者。'
  },

  七杀: {
    label: '七杀格（偏官格）',
    cheng: [
      { god: '食神', why: '食神制杀，使杀不为身害，是杀格第一路正解' },
      { god: '正印', why: '印能化杀生身（杀印相生），杀气转为身之助力' },
      { god: '偏印', why: '偏印亦能化杀生身，唯传统认为不如正印之纯粹' },
      { god: '伤官', why: '伤官亦能制杀（伤官驾杀），唯传统认为不如食神之和缓' }
    ],
    po: [
      { god: '正财', name: '财党杀', why: '财生杀而杀愈旺，身反受克，传统称「财党杀」' },
      { god: '偏财', name: '财党杀', why: '偏财亦生杀，助长杀气而身愈受克' }
    ],
    note: '七杀的关键是「有制」还是「无制」：食制与印化各成一路，孰优孰劣各家取舍不一。' +
      '身强杀浅时，杀本身即可为用 —— 此时「财党杀」也未必为破。故本条只是罗列常法，非定论。'
  },

  正财: {
    label: '正财格',
    cheng: [
      { god: '食神', why: '食神生财，使财星有源头' },
      { god: '伤官', why: '伤官生财，财源亦旺，唯传统认为不如食神之纯粹' },
      { god: '正官', why: '身强足以任财，则财生官而财官相生' },
      { god: '七杀', why: '身强财旺则财可生杀，杀为我用而不为害' }
    ],
    po: [
      { god: '比肩', name: '比劫夺财', why: '比肩分夺财星，财格所忌' },
      { god: '劫财', name: '比劫夺财', why: '劫财分夺财星，其夺尤甚于比肩' }
    ],
    note: '财格最忌比劫，是各派大体一致的一条；然「身弱财旺」时反须比劫帮身，比劫便不为夺。' +
      '故本条的「破」也要与旺衰合看，不能单凭十神之名定夺。'
  },

  偏财: {
    label: '偏财格',
    cheng: [
      { god: '食神', why: '食神生财，使偏财有源头' },
      { god: '伤官', why: '伤官生财，偏财得食伤之生而愈旺' },
      { god: '正官', why: '身强任财，则财生官而财官相生' },
      { god: '七杀', why: '身强财旺，财可生杀而杀为我用' }
    ],
    po: [
      { god: '比肩', name: '比劫夺财', why: '比肩分夺财星，偏财尤忌人多分' },
      { god: '劫财', name: '比劫夺财', why: '劫财夺偏财尤甚，传统视为最直接的破格' }
    ],
    note: '偏财与正财的成破之理基本相同，分别主要在各派对「正 / 偏」轻重与来路的看法上。'
  },

  正印: {
    label: '正印格',
    cheng: [
      { god: '正官', why: '官星生印，官印相生，使印有源头' },
      { god: '七杀', why: '杀能生印（杀印相生），亦为印之源头' },
      { god: '比肩', why: '身弱受生，印比同气而能扶身' },
      { god: '劫财', why: '身弱则劫财亦可帮身，与印同扶日主' }
    ],
    po: [
      { god: '正财', name: '财破印', why: '财克印，印星受伤，传统称「贪财坏印」' },
      { god: '偏财', name: '财破印', why: '偏财亦克印星，同为坏印之字' }
    ],
    note: '印格忌财破印是常法；但身强印重时反喜财以损印 —— 这一条最能说明「破格」与「取用」' +
      '两层常被混为一谈：同一处财星，在破格层是忌、在取用层可能正是用神。'
  },

  偏印: {
    label: '偏印格（枭神格）',
    cheng: [
      { god: '正官', why: '官星生印，使偏印亦有源头' },
      { god: '七杀', why: '杀能生印，杀印相生，偏印得杀为源' },
      { god: '比肩', why: '身弱受生，印比同气而能扶身' },
      { god: '劫财', why: '身弱则劫财亦可帮身，与印同扶日主' }
    ],
    po: [
      { god: '正财', name: '财破印', why: '财克偏印，印星受伤，偏印格亦忌之' },
      { god: '偏财', name: '财破印', why: '偏财亦克偏印，同属坏印之字' },
      { god: '食神', name: '枭神夺食', why: '偏印克食神，传统称「枭神夺食」；然此条属「食神格」之忌，' +
        '在偏印格上是否也算自坏，各家说法不一' }
    ],
    note: '偏印（枭神）一物，各派评价差异极大：有视其为「夺食之凶神」者，亦有视为「能化杀护身」者。' +
      '故此处把「枭神夺食」列为破格之嫌，同时标明这不是各派共识。'
  },

  食神: {
    label: '食神格',
    cheng: [
      { god: '正财', why: '食神生财，使食之秀气得有所归' },
      { god: '偏财', why: '偏财亦受食神之生，同使秀气有归' },
      { god: '比肩', why: '身强食旺，比劫帮身以任食神之泄' },
      { god: '劫财', why: '身强食旺，劫财亦可帮身任泄' }
    ],
    po: [
      { god: '偏印', name: '枭神夺食', why: '偏印克食神，食神不能生财，传统视为破格' }
    ],
    note: '食神格最忌偏印，是各派大体一致的一条。另「食神制杀」是杀格的成格之路，' +
      '与食神格本身的成破互参，不要混为一谈。'
  },

  伤官: {
    label: '伤官格',
    cheng: [
      { god: '正印', why: '伤官佩印，印制伤官而护官、并生身，是伤官格第一路正解' },
      { god: '偏印', why: '偏印亦能制伤护官，唯力度各派看法不一' },
      { god: '正财', why: '伤官生财，使伤官之秀气有所归' },
      { god: '偏财', why: '偏财亦受伤官之生，同使秀气有归' },
      { god: '七杀', why: '伤官驾杀，伤官制杀而不攻身' }
    ],
    po: [
      { god: '正官', name: '伤官见官', why: '伤官克正官，官星受伤；传统有「伤官见官，为祸百端」之谚' }
    ],
    note: '伤官格变化最多：佩印、生财、驾杀皆可成格，独「伤官见官」为各家共同之忌 —— ' +
      '但即便是这一条，仍有「伤官去官」的异说。'
  },

  比劫: {
    label: '建禄格 / 阳刃格 / 月劫格',
    cheng: [
      { god: '正官', why: '官星制比劫，是禄刃格最正的出路' },
      { god: '七杀', why: '杀亦能制比劫，然须有制有化方为可用' },
      { god: '正财', why: '财耗比劫之旺气，且为身任财之物' },
      { god: '偏财', why: '偏财亦耗旺气，同使比劫有所归' },
      { god: '食神', why: '食神泄比劫之旺，且能生财' },
      { god: '伤官', why: '伤官泄秀，唯须有印制或财收方佳' }
    ],
    po: [
      { god: '比肩', name: '比劫成群', why: '满盘比劫而无官杀财食可用，传统称「旺无所依」' },
      { god: '劫财', name: '比劫成群', why: '劫财叠加比劫之势，夺财更烈而愈无出路' }
    ],
    note: '禄刃一格专看「旺气有无出路」：有官杀、有食伤财则气有所归；一无所用则旺无所依。' +
      '故本格的成破判读，比其余各格更依赖旺衰与全局，单看十神名目容易失真。'
  }
};

/** 十神 → 规则表键；取格层出的「比肩 / 劫财」一律走禄刃一条 */
const ruleKeyOf = (god) => (god === '正官' || god === '七杀' || god === '正财' || god === '偏财'
  || god === '正印' || god === '偏印' || god === '食神' || god === '伤官') ? god : '比劫';

// ===================== 原局十神分布 =====================

/**
 * 摊平原局里所有的十神（四天干 + 四地支藏干）。
 *
 * **日柱天干必须排除**：它是日主本身，不是十神；把它算进来会凭空多出一个「比肩」，
 * 且正好落在日位，最容易误导。
 *
 * @param {Array} pillars `toPillars` 的产物（须为原局四柱，顺序年/月/日/时）
 * @param {string} dayGan
 * @returns {Array<{god,char,pos,kind,qiType,element}>}
 */
export const collectTenGods = (pillars, dayGan) => {
  const out = [];
  (pillars || []).forEach((p, i) => {
    if (!p) return;
    if (i !== 2 && p.stem) {
      const god = getTenGod(dayGan, p.stem);
      if (god) out.push({ god, char: p.stem, pos: p.pos, kind: '天干', qiType: '', element: TG_TO_ELEMENT[p.stem] || '' });
    }
    (DZ_CANG_GAN[p.branch] || []).forEach((gan, qi) => {
      const god = getTenGod(dayGan, gan);
      if (god) out.push({ god, char: gan, pos: p.pos, kind: '藏干', qiType: QI_TYPE[qi] || '', element: TG_TO_ELEMENT[gan] || '' });
    });
  });
  return out;
};

/** 某五行相对日主对应哪几个十神（由天干反推，避免再抄一份对照表） */
export const godsOfElement = (element, dayGan) =>
  HEAVENLY_STEMS
    .filter((s) => TG_TO_ELEMENT[s] === element)
    .map((s) => getTenGod(dayGan, s))
    .filter(Boolean);

// ===================== 成破：月令受伤 =====================

/**
 * 月令受伤：月支与其余三支成立「冲 / 刑 / 害 / 破」的情形。
 *
 * 传统认为取格看月令，月令被伤则格亦不稳，故「月令不可伤」是取格之后第一个要看的地方。
 * 轻重各家不同，此处只按关系类型排一个**常见的**轻重次序，并注明这一点。
 */
const MONTH_HURT_WEIGHT = { 六冲: 3, 相刑: 2, 自刑: 1, 六害: 1, 六破: 1 };

const monthHurtOf = (pillars) => {
  const month = pillars[1];
  if (!month || !month.branch) return null;
  const items = [];
  pillars.forEach((p, i) => {
    if (i === 1 || !p || !p.branch) return;
    getBranchRelations(month.branch, p.branch).forEach((r) => {
      if (!(r.type in MONTH_HURT_WEIGHT)) return;
      items.push({
        pos: p.pos,
        char: p.branch,
        type: r.type,
        weight: MONTH_HURT_WEIGHT[r.type],
        desc: r.desc
      });
    });
  });
  items.sort((a, b) => b.weight - a.weight);

  const worst = items.length ? items[0] : null;
  return {
    branch: month.branch,
    items,
    hurt: items.length > 0,
    level: !items.length ? 'none' : (worst.weight >= 3 ? 'heavy' : (worst.weight >= 2 ? 'medium' : 'light')),
    levelLabel: !items.length ? '月令未受伤' : (worst.weight >= 3 ? '月令逢冲' : (worst.weight >= 2 ? '月令逢刑' : '月令逢害破')),
    note: '「月令不可伤」是取格之后的常法：月令受伤则格亦不稳。' +
      '但冲与刑是否真的坏格、合能否解冲，各派分歧很大（传统有「合能解冲」「冲开反为动」等说），' +
      '此处只标出关系本身与一个常见的轻重次序，不作成破之断。'
  };
};

// ===================== 成破：组装 =====================

/**
 * 对**每一个**格局候选，列出本盘所见的成格之据与破格之嫌。
 *
 * 注意输出里的 `counts` 只是**算术计数**（相神见到几处、忌神见到几处），
 * 多寡不决定成破 —— 一处伤官即可破官格，三处相神若不透干亦未必有力。故界面须照此声明。
 *
 * @param {Object} o
 * @param {Object} o.judgment  `baziJudgment.analyzeJudgment` 的结果
 * @param {string[]} o.gzList  四柱干支（用于摊平十神与查月令受伤）
 */
export const assessGeChengPo = ({ judgment, gzList }) => {
  const pillars = toPillars(gzList);
  if (pillars.length < 4 || !judgment || !judgment.geJu) return null;

  const dayGan = pillars[2].stem;
  const all = collectTenGods(pillars, dayGan);
  const monthHurt = monthHurtOf(pillars);

  const items = (judgment.geJu.candidates || []).map((c) => {
    const key = ruleKeyOf(c.god);
    const rule = GE_CHENG_PO[key] || null;

    const hit = (entry) => all
      .filter((t) => t.god === entry.god)
      .map((t) => ({ ...t, isBenQi: t.qiType === '本气' }));

    const cheng = rule
      ? rule.cheng.map((e) => ({ ...e, hits: hit(e) })).filter((e) => e.hits.length)
      : [];
    const po = rule
      ? rule.po.map((e) => ({ ...e, hits: hit(e) })).filter((e) => e.hits.length)
      : [];

    return {
      school: c.school,
      key: c.key,
      name: c.name,
      gan: c.gan,
      god: c.god,
      basis: c.basis,
      ruleKey: key,
      ruleLabel: rule ? rule.label : '',
      cheng,
      po,
      counts: {
        cheng: cheng.reduce((n, e) => n + e.hits.length, 0),
        po: po.reduce((n, e) => n + e.hits.length, 0),
        chengKinds: cheng.length,
        poKinds: po.length
      },
      note: rule ? rule.note : '此格不在本工具的成破规则表内。'
    };
  });

  return {
    dayGan,
    monthHurt,
    items,
    // 全盘十神分布：界面用于「某十神在原局何处」的核对
    tenGods: all,
    notes: [
      '「成格 / 破格」出自相神之说：格局既立，须有字辅之，辅而得用为成、辅而受伤为破。' +
      '《子平真诠》一系讲得最系统，古法（《渊海子平》一系）另有「有官先论官」等取法，与此互异。',
      '本栏会把「相神见几处、忌神见几处」数出来，但**计数不等于结论**：一处忌神即可坏格，' +
      '多处相神若尽落空亡或透而无根，也未必能成。权重各家不同，此处只供核对。',
      '同一处字，在「成破」层与「取用」层常得相反评价 —— 如财星在印格是破印之忌，' +
      '在身强印重时又正是损印之用。这是两层最容易被混为一谈的地方。'
    ]
  };
};

// ===================== 用神落点 =====================

/**
 * 某一五行在四柱中的「落脚」情况 —— 判断层取出用神之后，最该看的就是它到底落在哪里。
 *
 * 四个维度都是客观的：
 *   透干（天干上出现了哪些字） · 通根（四支藏干中有没有根、有无本气根） ·
 *   有源（生它的是哪些字） · 受制（克它的是哪些字）
 *
 * @param {string} el 五行
 * @param {Array} pillars `toPillars` 的产物
 */
export const elementFooting = (el, pillars) => {
  const cols = pillars || [];
  const stems = cols
    .filter((p) => p && TG_TO_ELEMENT[p.stem] === el)
    .map((p) => ({ pos: p.pos, char: p.stem }));

  // `getRootsByElement` 返回的字段是 `gan`（结构层沿用该名），此处补一个 `char`：
  // 本层四个列表（透干 / 通根 / 有源 / 受制）统一都叫 `char`，界面才好用同一套渲染 ——
  // 否则通根那一栏会渲染成「月支 」而缺字。
  const roots = getRootsByElement(el, cols.map((p) => (p && p.branch) || ''))
    .map((r) => ({ ...r, char: r.gan }));
  const hasBenQiRoot = roots.some((r) => r.qiType === '本气');
  const hasZhongQiRoot = roots.some((r) => r.qiType === '中气');

  const genEl = FIVE_ELEMENT[el] ? FIVE_ELEMENT[el].help : '';
  const killEl = FIVE_ELEMENT[el] ? FIVE_ELEMENT[el].beRestrained : '';

  const scan = (target) => {
    const hits = [];
    if (!target) return hits;
    cols.forEach((p) => {
      if (!p) return;
      if (TG_TO_ELEMENT[p.stem] === target) hits.push({ pos: p.pos, char: p.stem, kind: '天干', qiType: '' });
      (DZ_CANG_GAN[p.branch] || []).forEach((gan, qi) => {
        if (TG_TO_ELEMENT[gan] === target) {
          hits.push({ pos: p.pos, char: gan, kind: '藏干', qiType: QI_TYPE[qi] || '' });
        }
      });
    });
    return hits;
  };

  const sources = scan(genEl);      // 生此五行者（印）—— 有无源头
  const enemies = scan(killEl);     // 克此五行者（官杀）—— 有无受制

  let level, label;
  if (!stems.length && !roots.length) {
    level = 'absent'; label = '全局不见';
  } else if (stems.length && roots.length) {
    level = 'solid'; label = hasBenQiRoot ? '透干且得本气根' : '透干且有根';
  } else if (stems.length) {
    level = 'exposed'; label = '透干而地支无根';
  } else if (hasBenQiRoot) {
    level = 'rooted'; label = '藏于地支、得本气根';
  } else {
    level = 'hidden'; label = hasZhongQiRoot ? '仅藏于地支（中气）' : '仅藏于地支（余气）';
  }

  return {
    element: el,
    stems,
    roots,
    sourceElement: genEl,
    sources,
    enemyElement: killEl,
    enemies,
    total: stems.length + roots.length,
    hasBenQiRoot,
    level,
    label,
    note: level === 'absent'
      ? `四柱天干与地支藏干中均未见${el}，此用神在本盘无着落。`
      : `${el}：天干见 ${stems.length} 处、地支藏干见根 ${roots.length} 处；` +
        `生${el}者（${genEl}）见 ${sources.length} 处、克${el}者（${killEl}）见 ${enemies.length} 处。`
  };
};

/**
 * 用神落点：把判断层三法各自取出的用神，逐个查到盘中的落脚处。
 *
 * `isDayElement` 为真时，该「用神」其实就是日主自己（取比劫一路），
 * 它的「有力」等同于日主自身的旺衰，不能按外来之字看。
 *
 * @param {Object} o
 * @param {string[]} o.gzList
 * @param {Object} o.judgment `baziJudgment.analyzeJudgment` 的结果
 */
export const analyzeYongShenFooting = ({ gzList, judgment }) => {
  const pillars = toPillars(gzList);
  if (pillars.length < 4 || !judgment) return null;

  const dayGan = pillars[2].stem;
  const dayEl = TG_TO_ELEMENT[dayGan] || '';

  const items = [];
  const seenKey = {};   // 同一法内同一五行只登记一次（通关可能多组同桥）
  const push = (source, tier, element, reason) => {
    if (!element) return;
    const key = source + '|' + tier + '|' + element;
    if (seenKey[key]) return;
    seenKey[key] = true;
    items.push({
      source,
      tier,
      element,
      reason: reason || '',
      gods: godsOfElement(element, dayGan),
      isDayElement: element === dayEl,
      footing: elementFooting(element, pillars)
    });
  };

  if (judgment.fuYi) {
    (judgment.fuYi.candidates || []).forEach((c) => push('扶抑', c.role, c.element, c.reason));
  }
  if (judgment.tiaoHou) {
    (judgment.tiaoHou.candidates || []).forEach((c) => push('调候', c.tier, c.element, c.reason));
  }
  (judgment.tongGuan || []).forEach((p) => push('通关', '桥', p.bridge, p.reason));

  // 按法归类，界面逐法成组
  const groups = [];
  ['扶抑', '调候', '通关'].forEach((src) => {
    const list = items.filter((x) => x.source === src);
    if (list.length) groups.push({ source: src, items: list });
  });

  return {
    dayGan,
    dayEl,
    items,
    groups,
    notes: [
      '用神既经取出，接着要看它**落在哪里**：透在干上还是仅藏于支、有无本气根、' +
      '生它的是谁、克它的是谁。这一层比取用本身客观得多 —— 位置与字都是看得见的。',
      '不过「透干无根便无力」「藏支本气根即算有力」这类说法，各派尺度仍有出入，' +
      '尤其在地支刑冲合化之后根是否还成立，分歧更大。故此处只列事实与常见表述。',
      '若取出的用神五行正是日主自己（取比劫一路），其「有力」等同于日主旺衰，' +
      '不可与外来之字同看 —— 该情形已在卡上单标。'
    ]
  };
};

// ===================== 十神引动 =====================

/**
 * 十神引动：把流年 / 大运的十神，与原局已有的十神、以及三法所取的用神对上号。
 *
 * **本函数不产出吉凶**。它只回答三个客观问题：
 *   ① 这一柱的天干 / 地支本气是什么十神？
 *   ② 这个十神在原局中**已经出现在哪些位置**（是「重现」还是「初见」）？
 *   ③ 这个十神**属不属于**三法各自取出的用神范围？
 * 第 ③ 问的答案写成 `matched: true/false`，含义只是「对应」，**不是**「吉 / 凶」——
 * 因为「用神」本身尚未定论，且各派对同一十神吉凶判然相反（见 `DIVERGENCE_CASES`）。
 *
 * @param {Object} o
 * @param {string[]} o.gzList
 * @param {string}   o.dayGan
 * @param {Object}   o.judgment `baziJudgment.analyzeJudgment` 的结果
 * @param {Array}    o.columns  待查的柱 [{label, heading, sub, gan, zhi, ganZhi}]
 */
export const analyzeTenGodActivation = ({ gzList, dayGan, judgment, columns }) => {
  const pillars = toPillars(gzList);
  if (pillars.length < 4 || !dayGan) return null;

  const seen = collectTenGods(pillars, dayGan);

  // ---- 三法各自所取的五行 → 十神名 ----
  const methods = [];
  if (judgment && judgment.fuYi) {
    methods.push({
      method: '扶抑',
      elements: [...new Set((judgment.fuYi.candidates || []).map((c) => c.element))].filter(Boolean)
    });
  }
  if (judgment && judgment.tiaoHou) {
    methods.push({
      method: '调候',
      elements: [...new Set((judgment.tiaoHou.candidates || []).map((c) => c.element))].filter(Boolean)
    });
  }
  if (judgment && judgment.tongGuan && judgment.tongGuan.length) {
    methods.push({ method: '通关', elements: [...new Set(judgment.tongGuan.map((p) => p.bridge))].filter(Boolean) });
  }
  methods.forEach((m) => {
    m.gods = [...new Set(m.elements.flatMap((el) => godsOfElement(el, dayGan)))];
  });

  const items = (columns || []).map((col) => {
    const ganGod = getTenGod(dayGan, col.gan);
    const zhiBenQi = (DZ_CANG_GAN[col.zhi] || [])[0] || '';
    const zhiGod = getTenGod(dayGan, zhiBenQi);
    const ganEl = TG_TO_ELEMENT[col.gan] || '';

    const matchedBy = methods
      .filter((m) => m.gods.includes(ganGod))
      .map((m) => m.method);

    const seenAt = seen.filter((s) => s.god === ganGod);

    return {
      label: col.label,
      heading: col.heading || '',
      sub: col.sub || '',
      ganZhi: col.ganZhi,
      gan: col.gan,
      zhi: col.zhi,
      ganGod,
      ganElement: ganEl,
      zhiGod,
      zhiBenQi,
      matchedBy,
      matched: matchedBy.length > 0,
      seenAt,
      isNew: seenAt.length === 0,
      seenNote: seenAt.length
        ? `原局已在${[...new Set(seenAt.map((s) => s.pos))].join('、')}见${ganGod}` +
          `（${[...new Set(seenAt.map((s) => s.kind))].join('、')}）`
        : `原局四柱（含藏干）中不见${ganGod}，此柱为初见`
    };
  });

  return {
    dayGan,
    methods,
    seen,
    items,
    notes: [
      '这一节只做**对应**，不作吉凶：把流年 / 大运的十神与原局已有的十神、以及三法所取的用神对上号。' +
      '「属某法所取」只表示五行相同，**不等于吉**；「不属某法所取」也**不等于凶**。',
      '「原局已见 / 初见」是传统相当看重的一层：原局已见者，此柱属**重现**（可视为同类之事再临）；' +
      '原局全无者属**初见**（可视为新出现的因素）。这只是传统表述，本工具不据此推断何事。',
      '传统命理在十神吉凶上的分歧是本层最大的不确定源：同一十神，看格局、看旺衰、看有无制化，' +
      '结论可以完全相反 —— 详见下方「各派歧见」。'
    ]
  };
};

// ===================== 各派歧见 =====================
//
// 这一节的目的不是给出「正确解释」，而是**证明单一结论不可能成立**：
// 下列每一条，传统文献里都能找到立场相反的明确说法。故本工具到此为止，不再往下推。

export const DIVERGENCE_CASES = [
  {
    term: '伤官见官',
    scene: '正官格而伤官亦现（或伤官格而官星现）',
    views: [
      { school: '《子平真诠》一系', view: '伤官克官，官星受伤则格破。传统有「伤官见官，为祸百端」之谚，是六格中最重的一条忌讳。' },
      { school: '「伤官去官」说', view: '若官星本是病神（如身弱官旺），伤官去之反为去病，其格转清。' },
      { school: '《神峰通考》病药之说', view: '重「何者为病、何者为药」，不专以十神名目定吉凶。' }
    ]
  },
  {
    term: '七杀',
    scene: '日主受克；或七杀当令、透干',
    views: [
      { school: '通行之说', view: '七杀攻身，须食神制之或印绶化之，否则为祸。' },
      { school: '身强杀浅一路', view: '身强足以任杀，反以杀为用，能成事业。' },
      { school: '有制无制之别', view: '「有制之杀」与「无制之杀」吉凶迥异 —— 这是各家大体共认的分界。' }
    ]
  },
  {
    term: '枭神夺食',
    scene: '食神格而偏印（枭神）现',
    views: [
      { school: '通行之说', view: '偏印克食神，食不能生财，故以为忌。' },
      { school: '亦有反用', view: '若食神本身是忌神，偏印夺之反得其宜；偏印能化杀时亦为可用。' }
    ]
  },
  {
    term: '比劫夺财',
    scene: '财格而比肩、劫财众',
    views: [
      { school: '财格常法', view: '比劫分夺财星，财格忌之。' },
      { school: '身弱财旺一路', view: '身弱不胜财，反须比劫帮身，此时比劫不为夺。' }
    ]
  },
  {
    term: '财破印',
    scene: '印格而财星现',
    views: [
      { school: '印格常法', view: '财克印，印星受伤，称「贪财坏印」，印格所忌。' },
      { school: '身强印重一路', view: '身强印重则印反为累，喜财损印，此时财正是用神。' }
    ]
  },
  {
    term: '合而化不化',
    scene: '天干五合、地支六合',
    views: [
      { school: '主化之说', view: '合而得月令之气、有化神透出，则论化，化作他神。' },
      { school: '不化之说', view: '合而不化者多，仅论「合住」（羁绊、牵制）而不改其性。' },
      { school: '争合妒合', view: '两字争合一字、或合而逢冲，各本处理互异。' }
    ]
  },
  {
    term: '从格与扶抑',
    scene: '日主极旺或极弱',
    views: [
      { school: '扶抑常法', view: '旺则抑之、弱则扶之，始终以日主为中心。' },
      { school: '从格之说', view: '极弱不可扶则从财、从杀、从儿；极旺不可抑则从旺、从强，反以顺其气势为要。' },
      { school: '分歧所在', view: '「弱到什么程度才算可从」没有公认尺度，这是八字判读中出入最大的地方之一。' }
    ]
  }
];

/** 本层收束时的统一声明 */
export const INFERENCE_CAVEAT =
  '本栏是全站争议最大的一层：格之成破、用之吉凶、流年之休咎，传统各家自有一套体系，' +
  '彼此并不兼容。本工具的做法是**把每一派的判据与分歧并列摆出，到此为止** —— ' +
  '不替任何体系下断语，也不把任何一条对应关系说成吉凶。' +
  '所列内容属传统文化知识整理，不构成医疗、投资、婚恋或任何现实建议。';

// ===================== 组装 =====================

/**
 * 推演层全景：格局成破 + 用神落点 + 十神引动。
 *
 * @param {Object} o
 * @param {string[]} o.gzList
 * @param {Object} o.judgment  `baziJudgment.analyzeJudgment` 的结果
 * @param {Array}  [o.columns] 十神引动待查的柱（大运 / 流年 / 流月）
 */
export const analyzeInference = ({ gzList, judgment, columns = [] }) => {
  const pillars = toPillars(gzList);
  if (pillars.length < 4 || !judgment) return null;

  const dayGan = pillars[2].stem;
  const chengPo = assessGeChengPo({ judgment, gzList });
  const footing = analyzeYongShenFooting({ gzList, judgment });
  const activation = analyzeTenGodActivation({ gzList, dayGan, judgment, columns });

  return {
    dayGan,
    dayEl: TG_TO_ELEMENT[dayGan] || '',
    chengPo,
    footing,
    activation,
    divergences: DIVERGENCE_CASES,
    caveat: INFERENCE_CAVEAT
  };
};

export default {
  GE_CHENG_PO,
  DIVERGENCE_CASES,
  INFERENCE_CAVEAT,
  collectTenGods,
  godsOfElement,
  elementFooting,
  assessGeChengPo,
  analyzeYongShenFooting,
  analyzeTenGodActivation,
  analyzeInference
};
