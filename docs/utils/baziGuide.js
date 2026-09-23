/**
 * 八字「导览层」：给不懂命理的人看的一栏 —— 术语翻译 + 这张盘上的事实 + 各家说法
 * ===========================================================================
 * 为什么单开一层：结构 / 判断 / 推演 三层用的都是**表格语言**
 * （「月令本气透干取格」「相神见二处」），懂行的人看得懂，普通人看不出跟自己有什么关系。
 * 本层把同一批事实**翻成人话**，并按普通人真正会问的几件事
 * （财运 / 感情姻缘 / 事业与性格 / 健康与六亲）重新组织。
 *
 * 与前几层的关系 —— 这不是新算法，是**另一种排法**：
 *   事实全部取自结构层与判断层的既有产物（透干 / 通根 / 关系矩阵 / 格局候选 / 五行统计），
 *   本层**不新增任何命理判据**，只做「翻译」与「归题」；全层仅「神煞速查」一项是新查表。
 *
 * 与站内专文的关系 —— **能链就不抄**（重要）：
 *   `docs/fate/` 下已有一整套八字专文（八字命理 / 八字怎么批 / 天干地支 / 五行 / 十神 /
 *   日主旺衰 / 格局 / 用神 / 神煞 / 地支关系 / 十二长生 / 大运与流年 / 纳音）。
 *   本层**只给一句话的定义 + 链接**，不把它们的正文章节重抄一遍 ——
 *   之前那版在这里铺了一张十神速查大表，与《十神》专文重复，且两处一改就会走样。
 *   各主题的「① 传统怎么看」只解释**这张盘上真正用到**的那几个词（食伤 / 比劫 / 官杀 / 印…）。
 *
 * 三条硬约束：
 *   ① **不下结论**。只说「传统看什么」「你这盘上是哪几个字」「各家怎么说」，
 *      不写「你会发财 / 你会晚婚 / 你某处有病」这类断语。判断权交回读者。
 *      「通俗结果」一栏同理：它只是拿这一题自己的问句，把事实逐条答一遍，不新增判断。
 *   ② **术语必译**。每个名词都配一句白话，读者不需要任何基础。
 *   ③ **事实与说法分离**。`groups` 是可核对的事实（都点明落在哪一柱哪个字），
 *      `schools` 是解释（各派与民间，正反并列）。界面上必须分区显示，不得混排。
 *
 * 文本记号约定：字符串里用 `**…**` 表示强调，由组件（BaziGuide.vue 的 rich()）
 * 转成 <strong> 再输出 —— 组件**不得**直接 {{ }} 渲染，否则页面上会出现裸露的星号。
 *
 * 纯函数；不依赖 SolarTerm；不重算排盘。
 */

import {
  TG_TO_ELEMENT, FIVE_ELEMENT, ALL_ELEMENTS, DZ_CANG_GAN,
  HEAVENLY_STEMS, SAN_HE, getBranchRelations
} from './ganzhiRelation.js';
import { getTenGod } from './baziUtils.js';
// 禄位 / 刃位两份表在判断层（那边取格先用到）；此处**复用**而非复制，避免两处分叉
import { LU_POSITION, REN_POSITION } from './baziJudgment.js';
// 摊平十神 / 建柱两份实现同样复用，不再另写
import { collectTenGods } from './baziInference.js';
import { toPillars } from './baziStructure.js';

const QI_TYPE = ['本气', '中气', '余气'];
const BRANCH_POS = ['年支', '月支', '日支', '时支'];

/** 把可能为单值或数组的查表结果统一成数组 */
const toArr = (v) => (Array.isArray(v) ? v : (v ? [v] : []));

/** 某地支所属三合局（键的拼法与 `FIVE_ELEMENT_NAME_OF_SANHE` 一致，如「申子辰」） */
export const sanHeKeyOf = (branch) => {
  const g = SAN_HE.find((x) => x.includes(branch));
  return g ? g.join('') : '';
};

// ===================== 〇、站内专文索引（能链就不抄）=====================
//
// 本层凡遇到「这门知识已有专文」的地方，一律只给一句话 + 链接。
// `slug` 即 `docs/fate/<slug>.md` 的文件名，也是构建后的 URL 段（`/fate/<slug>`）。

export const FATE_ARTICLES = [
  { slug: 'bazi', title: '八字命理' },
  { slug: 'piming', title: '八字怎么批' },
  { slug: 'ganzhi', title: '天干地支' },
  { slug: 'wuxing', title: '五行' },
  { slug: 'shishen', title: '十神' },
  { slug: 'wangshuai', title: '日主旺衰' },
  { slug: 'geju', title: '格局' },
  { slug: 'yongshen', title: '用神' },
  { slug: 'shensha', title: '神煞' },
  { slug: 'dizhi-relation', title: '地支关系：合冲刑害' },
  { slug: 'changsheng', title: '十二长生' },
  { slug: 'dayun', title: '大运与流年' },
  { slug: 'nayin', title: '纳音' }
];

/** 各主题读到该处时，最值得接着看的那几篇 */
export const THEME_REFS = {
  wealth: ['shishen', 'wangshuai', 'wuxing'],
  marriage: ['shishen', 'dizhi-relation', 'shensha'],
  career: ['geju', 'shishen', 'yongshen'],
  health: ['wuxing', 'shishen', 'ganzhi']
};

/** 全栏通用的延伸阅读（页尾一节） */
export const COMMON_REFS = ['bazi', 'piming', 'wangshuai', 'yongshen', 'dayun'];

// ===================== 一、入门：八字到底在看什么 =====================
//
// 这一节是全栏的地基，只答三个问题，各配一篇专文。
// 少了它，后面满篇的「日主」「十神」「月令」都是空中楼阁。

export const BASICS = [
  {
    q: '这八个字到底是什么？',
    a: '就是你出生那一刻的**年、月、日、时**，每一格配两个汉字（一个「天干」、一个「地支」），' +
      '四格合起来正好八个字。它本质上是**一套记号**，和农历、生肖属于同一类东西 —— ' +
      '用符号把时间写成可以推算的形式。',
    ref: 'ganzhi'
  },
  {
    q: '八个字凭什么能「说事」？',
    a: '因为这八个字每个都归入五行（金木水火土）之一。传统设定五行之间会互相**生**' +
      '（例如水生木）、互相**克**（例如水克火），于是八个字之间就织出一张关系网。' +
      '所谓「看八字」，就是看这张网哪里通、哪里堵、哪一路独旺、哪一路空缺。' +
      '**这套生克是传统规定的，不是物理规律。**',
    ref: 'wuxing'
  },
  {
    q: '「我」指的是哪一个字？',
    a: '出生**那一天的天干**，叫「日干」或「日主」，代表你自己。' +
      '其余七个字都是**相对它**来定关系的 —— 所以同一个字，对不同的人意义完全不同。' +
      '先定下「我」，后面一切才有得谈。',
    ref: 'shishen'
  }
];

/**
 * 十神：本栏**只给一句话定义 + 名字 + 链接**，正文不铺开。
 *
 * 为什么不铺开：站内《十神》专文已写全（推算原则 / 十神一览 / 与六亲 / 与心性事业取向），
 * 而且各主题的「① 传统怎么看」已经在具体语境里解释了这张盘真正用到的那几个词。
 * 再抄一份清单，只会两处走样。
 */
export const TEN_GOD_BRIEF = {
  intro: '十神不是形容人的词，而是**关系名**：把盘上其余的字逐个跟「我」（日干）比一比' +
    '五行方位与阴阳，能归成十种。**这张表里没有「好」与「坏」，只有关系朝着哪个方向。**',
  names: ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印'],
  hint: '本栏正文里反复出现的就是这些名字；每一个在用到的地方都会当场解释一遍，' +
    '完整推法与含义见站内《十神》。',
  ref: 'shishen'
};

export const READ_STEPS = [
  {
    n: '一', t: '先认字',
    d: '上面那三个问答看懂就够用了：八个字是什么、十个关系名各指什么。' +
      '正文里遇到别的名词，都会当场再解释一遍；想细读的，每条都挂了站内专文的链接。'
  },
  {
    n: '二', t: '再看事实',
    d: '每个主题中间那一段是**你这张盘上的客观事实**，每条都写着「哪一柱、哪个字」，' +
      '你可以逐条对着上面的四柱核。这一段里没有任何评价。'
  },
  {
    n: '三', t: '然后看通俗结果',
    d: '紧接着的「通俗结果」用这一题自己的问句，把刚看过的**事实逐条答一遍** —— ' +
      '只换说法，不添判断。它就是回答读者那句「所以呢」。'
  },
  {
    n: '四', t: '最后读说法',
    d: '每个主题最后一段是**各家与民间的说法**，一律正反并列。' +
      '请把它当成「这门学问里存在哪些不同意见」，而不是答案 —— 这正是本栏不下结论的原因。'
  }
];

/** 五行的性质（白话），用于解释「为什么统计五行」 */
export const ELEMENT_PLAIN = {
  木: '向上生长、向外舒展',
  火: '升腾外显、热烈明亮',
  土: '承载包容、居中调和',
  金: '收敛肃降、刚硬有断',
  水: '流动潜藏、润下通达'
};

// ===================== 二、神煞速查 =====================
//
// 神煞是**查表**一类的内容：给定一个基准字（年支 / 日支 / 日干），查得「应当见到的字」，
// 再看它在不在四支里。通用推法见站内《神煞》；本层只做「这张盘命中与否」这一件文章做不了的事。
//
// 口径说明（重要）：
//   ① 桃花 / 驿马 / 华盖 / 将星 四项传统有**两个基准**（年支或日支），两法常得不同结果。
//      本工具**两个基准都算**，并在 `hits[].from` 里标明命中的是哪一路 —— 分歧不藏起来。
//   ② 天乙贵人亦有「日干查」与「年干查」两说，此处取日干（较通行）。
//   ③ 羊刃传统只论阳干（阴干是否论刃本身即分歧），故此处只列五个阳干。
//
// 全部神煞都只是「有此一字」的事实，其吉凶各家说法相反，`note` 逐条交代。
// `plain` 是「一句话说它是什么」—— 名称本身（华盖？驿马？）最劝退，必须先给白话。

export const SHEN_SHA = [
  {
    key: 'taohua',
    name: '桃花（咸池）',
    basis: 'branch',
    of: '年支或日支',
    rule: '申子辰见酉 · 寅午戌见卯 · 巳酉丑见午 · 亥卯未见子',
    map: { 申子辰: '酉', 寅午戌: '卯', 巳酉丑: '午', 亥卯未: '子' },
    plain: '一句话：传统拿它来问「异性缘、人缘好不好」。',
    note: '主异性缘与人缘。一说主感情纠葛，一说主社交魅力，各派对它是喜是忌看法正好相反；' +
      '它只表示盘上有这一个字，不表示任何关于现实关系的判断。'
  },
  {
    key: 'yima',
    name: '驿马',
    basis: 'branch',
    of: '年支或日支',
    rule: '申子辰马在寅 · 寅午戌马在申 · 巳酉丑马在亥 · 亥卯未马在巳',
    map: { 申子辰: '寅', 寅午戌: '申', 巳酉丑: '亥', 亥卯未: '巳' },
    plain: '一句话：传统拿它来问「走动多不多、会不会离乡奔波」。',
    note: '主移动、外出、变迁。传统多用来问「走动多不多、是否离乡」，亦有「驿马逢冲则动得更急」之说。'
  },
  {
    key: 'huagai',
    name: '华盖',
    basis: 'branch',
    of: '年支或日支',
    rule: '申子辰见辰 · 寅午戌见戌 · 巳酉丑见丑 · 亥卯未见未',
    map: { 申子辰: '辰', 寅午戌: '戌', 巳酉丑: '丑', 亥卯未: '未' },
    plain: '一句话：传统拿它来问「性子是否孤高、是否亲近宗教艺术」。',
    note: '传统主孤高、宗教、艺术、不喜俗务。一说主聪明超脱，一说主孤独寡合 —— 说法正好相反。'
  },
  {
    key: 'jiangxing',
    name: '将星',
    basis: 'branch',
    of: '年支或日支',
    rule: '申子辰见子 · 寅午戌见午 · 巳酉丑见酉 · 亥卯未见卯',
    map: { 申子辰: '子', 寅午戌: '午', 巳酉丑: '酉', 亥卯未: '卯' },
    plain: '一句话：传统拿它来问「有没有担当、能不能主事带头」。',
    note: '即三合局的中神（帝旺之位）。传统主担当、主事、领导，是诸神煞中争议较小的一位。'
  },
  {
    key: 'tianyiguiren',
    name: '天乙贵人',
    basis: 'stem',
    of: '日干（亦有以年干查者）',
    rule: '甲戊庚见丑未 · 乙己见子申 · 丙丁见亥酉 · 壬癸见卯巳 · 辛见寅午',
    map: {
      甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'],
      乙: ['子', '申'], 己: ['子', '申'],
      丙: ['亥', '酉'], 丁: ['亥', '酉'],
      壬: ['卯', '巳'], 癸: ['卯', '巳'],
      辛: ['寅', '午']
    },
    plain: '一句话：传统拿它来问「遇事有没有人搭把手」。',
    note: '神煞中最被看重的一位，主贵人相助、逢难有解。口诀「甲戊庚牛羊，乙己鼠猴乡，' +
      '丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎」。各派所用基准（日干 / 年干）不同，结论会不一样。'
  },
  {
    key: 'wenchang',
    name: '文昌贵人',
    basis: 'stem',
    of: '日干',
    rule: '甲巳 · 乙午 · 丙戊申 · 丁己酉 · 庚亥 · 辛子 · 壬寅 · 癸卯',
    map: {
      甲: ['巳'], 乙: ['午'], 丙: ['申'], 戊: ['申'], 丁: ['酉'],
      己: ['酉'], 庚: ['亥'], 辛: ['子'], 壬: ['寅'], 癸: ['卯']
    },
    plain: '一句话：传统拿它来问「读书考试、动笔写东西在不在行」。',
    note: '取日干「食神」的临官之位，传统主读书、考试、文才。此口诀与取法各本小有出入。'
  },
  {
    key: 'yangren',
    name: '羊刃（阳刃）',
    basis: 'stem',
    of: '日干，看地支',
    rule: '甲卯 · 丙午 · 戊午 · 庚酉 · 壬子（阴干传统多不论刃）',
    map: REN_POSITION,
    plain: '一句话：传统拿它来问「性子刚不刚烈、能不能扛硬事」。',
    note: '日主的「帝旺」之地。一说主刚烈果决、能担事，一说主刑伤破败，两派评价极端；' +
      '阴干是否论刃本身即是分歧点，故此处只列五个阳干。'
  },
  {
    key: 'luchen',
    name: '禄神',
    basis: 'stem',
    of: '日干，看地支',
    rule: '甲寅 · 乙卯 · 丙戊巳 · 丁己午 · 庚申 · 辛酉 · 壬亥 · 癸子',
    map: LU_POSITION,
    plain: '一句话：传统拿它来问「能不能自立、有没有一份安稳食禄」。',
    note: '日干的「临官」之位，即常说的「建禄」。传统主自立、食禄、有担当；月支逢之即为「建禄格」。'
  }
];

/**
 * 查这张盘上的神煞。
 *
 * @param {Array}  pillars `baziStructure.toPillars` 的产物
 * @param {string} dayGan
 * @returns {Array} 每项 { key, name, of, rule, plain, note, bases, hits, found, summary }
 */
export const findShenSha = (pillars, dayGan) => {
  const branches = (pillars || []).map((p) => p.branch);

  return SHEN_SHA.map((s) => {
    // ---- 基准：branch 类取「年支」与「日支」两路；stem 类取日干 ----
    const bases = [];
    if (s.basis === 'branch') {
      [{ i: 0, label: '年支' }, { i: 2, label: '日支' }].forEach(({ i, label }) => {
        const b = branches[i];
        if (!b) return;
        const key = sanHeKeyOf(b);
        const targets = key && s.map[key] ? toArr(s.map[key]) : [];
        if (targets.length) bases.push({ label, char: b, group: key, targets });
      });
    } else {
      const targets = dayGan && s.map[dayGan] ? toArr(s.map[dayGan]) : [];
      if (targets.length) bases.push({ label: '日干', char: dayGan, group: '', targets });
    }

    // ---- 命中：四支中出现应见之字。同一「位置 + 字」只记一次 ----
    const hits = [];
    bases.forEach((b) => {
      b.targets.forEach((t) => {
        branches.forEach((br, i) => {
          if (br !== t) return;
          if (hits.some((h) => h.pos === BRANCH_POS[i] && h.char === t)) return;
          hits.push({ pos: BRANCH_POS[i], char: t, from: b.label, fromChar: b.char });
        });
      });
    });

    const applicable = bases.length > 0;
    return {
      key: s.key,
      name: s.name,
      of: s.of,
      rule: s.rule,
      plain: s.plain,
      note: s.note,
      bases,
      hits,
      found: hits.length > 0,
      summary: hits.length ? hits.map((h) => `${h.pos}${h.char}`).join('、') : '未见',
      // 查不起来时（如日干为阴干，传统不论羊刃）必须写明原因 ——
      // 这一取舍本身就是分歧点，不能悄悄留一片空白让读者以为是漏了。
      noBasisNote: applicable ? '' : (
        s.basis === 'stem' && !s.map[dayGan]
          ? `${s.name}传统只取 ${Object.keys(s.map).join('、')}；本盘日干为 ${dayGan}，不在其中，` +
            '故无从查起 —— 这一取舍本身即是分歧点。'
          : '本盘条件不足，无法确定查法基准。'
      )
    };
  });
};

// ===================== 三、四墓库 =====================
//
// 墓库是「十二长生」的一站，通用推法见站内《十二长生》；此处只列这张盘上命中哪一支、库里藏什么。

/** 四库的通行归属 —— 辰水库、戌火库、丑金库、未木库 */
export const KU_NAME = { 辰: '水库', 戌: '火库', 丑: '金库', 未: '木库' };

/**
 * 四墓库：本盘哪些地支是库，库中各藏着什么十神。
 *
 * 这里只列**事实**（哪一柱是库、库里藏什么），不判「财入库主守财」之类的吉凶 ——
 * 那类说法两派并存（一主守财、一主闭而不出），故只写进 `note`。
 */
export const analyzeMuKu = (pillars, dayGan) => {
  const list = [];
  (pillars || []).forEach((p) => {
    if (!KU_NAME[p.branch]) return;
    const cang = (DZ_CANG_GAN[p.branch] || []).map((gan, qi) => ({
      gan,
      qiType: QI_TYPE[qi] || '',
      god: getTenGod(dayGan, gan)
    }));
    list.push({
      pos: p.pos,
      branch: p.branch,
      ku: KU_NAME[p.branch],
      cang,
      desc: cang.map((c) => `${c.gan}（${c.god}·${c.qiType}）`).join('、')
    });
  });
  return {
    list,
    has: list.length > 0,
    note: '辰戌丑未称「四库」：辰为水库、戌为火库、丑为金库、未为木库。' +
      '传统一说「财星入库主守财」，一说「入库即闭而不出」，两种说法并存；' +
      '另有「冲开库门」之说，谓库逢冲反而动用。故库之于人是好是坏，各派并无一致答案。'
  };
};

// ===================== 四、性格用表（皆民间通行说法）=====================

/** 十神归五类 —— 论性格时按类聚合，比单看某一个十神稳 */
export const GROUP_OF_GOD = {
  比肩: '比劫', 劫财: '比劫',
  食神: '食伤', 伤官: '食伤',
  正财: '财', 偏财: '财',
  正官: '官杀', 七杀: '官杀',
  正印: '印', 偏印: '印'
};

/** 五类的性格说法（传统/民间通行，非定论） */
export const GROUP_TRAIT = {
  比劫: '自主、独立、重朋友义气、行动直接。传统也说易固执、与人相争不让。',
  食伤: '聪明外露、点子多、善于表达与创作。传统也说易恃才傲物、不服管束。',
  财: '务实、重视实际效用、善于经营与安排。传统也说易过于计较得失、偏保守。',
  官杀: '守规矩、有责任感、能扛压力、重名誉。传统也说易拘谨自束、要求过严。',
  印: '好学、心慈、重长辈缘、喜欢钻研。传统也说易依赖、行动迟缓。'
};

/** 十神的单条性格说法（更细一层，界面按需引用） */
export const GOD_TRAIT = {
  比肩: '自我、有主见、能自立；传统亦说易与人争、不轻易低头。',
  劫财: '敢冒险、重情义、行动力强；传统亦说易冲动、易与人有财务牵缠。',
  食神: '温和、有口福、懂享受、表达从容；传统称「福星」。',
  伤官: '聪明、外放、才气足、不服权威；传统亦说易恃才傲物。',
  正财: '节俭、守信、按部就班、看重实在；传统亦说偏保守。',
  偏财: '交游广、慷慨、机会感强；传统亦说易散财、不专一。',
  正官: '守规、尽责、重名声、讲秩序；传统亦说易拘谨。',
  七杀: '果决、能吃苦抗压、有魄力；传统亦说易急躁、刚硬。',
  正印: '好学、仁慈、重情、有长辈缘；传统亦说易依赖。',
  偏印: '思路独特、善钻研、耐得住寂寞；传统亦说易多疑、孤僻。'
};

// ===================== 五、健康与六亲用表 =====================

/** 五行 → 传统所主脏腑（**只是取象类比，不是医学内容**） */
export const ORGAN_OF_ELEMENT = {
  木: '肝、胆', 火: '心、小肠', 土: '脾、胃', 金: '肺、大肠', 水: '肾、膀胱'
};

/** 四柱宫位（六亲）的传统说法 */
export const PALACE_ROLE = {
  年: '祖辈与父母早年之事（一说为祖上宫）',
  月: '父母与兄弟（最通行的说法；月柱亦称「提纲」，是取格之所）',
  日: '日干为自己、日支为配偶（夫妻宫）',
  时: '子女与晚年之事（一说为下属、门生）'
};

/** 四柱宫位的**短**标签（通俗结果里用，太长会把一行撑爆） */
export const PALACE_SHORT = {
  年: '祖辈父母', 月: '父母兄弟', 日: '配偶（夫妻宫）', 时: '子女晚年'
};

/** 十神 → 传统所主六亲（各派说法出入很大，务必并列） */
export const GOD_KIN = {
  正印: '母亲（一说父母、师长）',
  偏印: '继母、庶母或长辈（一说祖父）',
  偏财: '父亲',
  正财: '（男命）妻子；（女命）泛主财物，不主夫',
  比肩: '兄弟、同辈；女命亦主姐妹',
  劫财: '姐妹、异性同辈',
  正官: '（女命）丈夫；（男命）子女（一说官职、名位）',
  七杀: '（女命）偏夫、情人；（男命）子女',
  食神: '（女命）子女；（男命）才艺、福气',
  伤官: '（女命）子女；（男命）才艺、名声'
};

// ===================== 六、四大主题的「传统怎么看」（静态知识）=====================
//
// `plain` 是「先说人话」—— 在认名词之前，先把这一题的传统框架整体讲一遍，
//         并说明这一题在传统里被拆成哪几个小问题（`keys`；「通俗结果」就按 `keys` 逐条作答）。
// `terms` 是把术语翻成白话；`schools` 是各家与民间的相反说法。
// 全部是**静态知识**，不随命盘变化；随盘变化的部分见 `analyzeGuide` 的 `groups` 与 `result`。

export const THEME_GUIDE = {
  wealth: {
    title: '财运',
    ask: '钱从哪里来？守不守得住？',
    plain: '传统看财运，追根究底是三个问题：**钱从哪条路来**（有没有能换成钱的本事）、' +
      '**这条路上有多少**（财星够不够、在明处还是暗处）、**你拿不拿得住**（自身够不够强）。' +
      '说白了就是：有没有挣钱的手艺 → 挣来的分量够不够 → 这个分量你受不受得住。',
    keys: [
      '有没有「生财」的本事 —— 食神、伤官（手艺、作品、点子）',
      '财星在盘上出现了几处，在明处（天干）还是暗处（地支里藏着）',
      '有没有同类的人来分 —— 比肩、劫财（同行、搭档、竞争者）',
      '自身够不够强，能不能担得起这个分量（传统叫「任财」）'
    ],
    terms: [
      {
        name: '「财」是什么',
        plain: '八字里的「财」**不是钱本身**，而是**你能支配、能使唤的东西** —— ' +
          '管得住的人、办得成的事，都算。对男命，传统还把它兼作妻子的位置。'
      },
      {
        name: '正财 / 偏财',
        plain: '两者都是「财」，分别只在与你阴阳相同还是不同。传统把它们理解成两种**来路**：' +
          '正财像固定工资、自己经营的本业；偏财像外快、投资、别人带来的机会。' +
          '这只是给两路财安的名字，**不代表一个好一个坏**。'
      },
      {
        name: '食伤生财',
        plain: '「食神」「伤官」代表**你自己产生出来的东西** —— 手艺、本事、作品、点子。' +
          '传统说它们能「生」财，意思就是**本事能换成钱**。所以盘上有食伤，等于说财有源头。'
      },
      {
        name: '比劫夺财',
        plain: '「比肩」「劫财」代表**跟你同类、也想要同一份东西的人** —— 同行、搭档、竞争对手。' +
          '传统说他们会跟你的财「抢食」，叫「比劫夺财」。不过人多也可能是帮手，要看具体情形。'
      },
      {
        name: '身强任财',
        plain: '「钱扛不扛得动」是传统问财运的第一句。意思是：盘上财再多，' +
          '**你自己够不够强去拿住**。传统把「自身弱、财星旺」叫「财多身弱」——' +
          '说是有财摆在眼前却使不上劲。'
      },
      {
        name: '财库',
        plain: '辰、戌、丑、未四个字叫「四库」，各归一行（辰是水库、戌是火库、丑是金库、未是木库）。' +
          '财星落在库里，传统有两种相反的说法：一说「入库是存得住」，一说「入库是关起来用不上」。'
      }
    ],
    schools: [
      { claim: '财星宜透干、宜有根，主财路外显、取之有道。', counter: '透干即「露白」，反易招人分夺；藏于库中反能积存。' },
      { claim: '命中有食伤生财为佳，谓之「财有源头」。', counter: '食伤太旺则日主泄气，若身又弱，反成「财多身弱」，源头反倒成了负担。' },
      { claim: '比劫夺财是财格的大忌。', counter: '身弱而财旺时正须比劫帮身，此时比劫不是夺财，而是帮手。' },
      { claim: '财多身弱，传统多说是「富屋贫人」—— 看得见财却享不到。', counter: '旺衰要看全局，原局身弱若行帮身之运反能得力，不能只看原局就下判语。' }
    ],
    caveat: '财运一项最容易被拿去做承诺，此处须说清：上面全是**传统判读的框架**，' +
      '本工具不推演任何具体数额、时间与结果。',
    limit: '上面这四条只是把「② 事实」里的字换个说法答了一遍，没有新增任何判断。' +
      '传统到这一步常会接着问「什么时候」—— 那属于「时间」与「推演」两栏，且各派分歧极大，本栏不接。'
  },

  marriage: {
    title: '感情与姻缘',
    ask: '配偶是什么样的？婚姻顺不顺？',
    plain: '传统看婚姻只用两个入口：**配偶是哪个字**（男命看「财」、女命看「官杀」，' +
      '这个字叫「配偶星」），**配偶坐在哪个位置**（日柱的地支，叫「夫妻宫」）。' +
      '两个入口必须合起来看 —— 只看一个，传统认为都会看走眼。',
    keys: [
      '配偶星（男看财、女看官杀）在不在盘上、落在哪一柱、是明处还是暗处',
      '夫妻宫（日支）里藏着什么字、对应什么十神',
      '夫妻宫跟另外三个字的关系：相合（亲近）、相冲（动荡）、相刑、相害',
      '有没有「桃花」这个字（只说明异性缘，与婚姻好坏无必然关系）'
    ],
    terms: [
      {
        name: '配偶星',
        plain: '传统规定：**男命拿「财」当妻子的位置、女命拿「官杀」当丈夫的位置**，' +
          '这个字就叫配偶星。看婚姻，先看它在不在盘上、在哪一柱、旺不旺。'
      },
      {
        name: '夫妻宫',
        plain: '**日柱下面那个字（日支）**叫夫妻宫，是传统给配偶留的「座位」。' +
          '看它跟另外三个字处得怎么样，是第二个入口。'
      },
      {
        name: '合与冲',
        plain: '两个字相合（六合、三合），传统多说主亲近、牵绊；相冲主变动、动荡。' +
          '但**合不一定是好事、冲不一定是坏事** —— 要看合的是什么、冲的在哪里。'
      },
      {
        name: '十神（本栏反复出现的名字）',
        plain: '就是上面那十个关系名。它们**不固定在某个字上**，' +
          '而是「某个字相对你的日干算什么关系」；换一个人，同一个字的十神就不同。'
      },
      {
        name: '桃花',
        plain: '神煞里的一个查表项，传统用来指异性缘与人缘。' +
          '它只说明**盘上有这个字**，跟婚姻好不好没有必然联系。'
      },
      {
        name: '宫星同看',
        plain: '传统讲究「宫、星合看」：只看夫妻宫（宫）或只看配偶星（星）都容易失准，' +
          '两边要合起来看。'
      }
    ],
    schools: [
      { claim: '男以财为妻、女以官为夫，配偶星宜生旺有助，主婚姻得人。', counter: '配偶星太过反主「受制于配偶」，宜中和而不喜过旺。' },
      { claim: '夫妻宫喜六合、三合，主感情和顺。', counter: '合多反主牵绊、易生外情（所谓「合多主情多」）；亦有「合能解冲」之说，两说并存。' },
      { claim: '夫妻宫逢冲，主婚姻动荡。', counter: '冲未必主离：须看冲的是喜是忌、有无合来化解，且男女命的判法并不相同。' },
      { claim: '传统有「女命伤官克夫」「男命比劫争妻」之说。', counter: '这一类是旧时代角色观念的产物（把婚姻看作从属关系），今天不少流派已不采用，其必然性也从未得到一致认可。' }
    ],
    caveat: '婚姻一项的传统判法带很强的时代背景（男以财为妻、女以官为夫本身即是旧制），' +
      '请当作**文化史料**来看，不要用来衡量现实中的人。',
    limit: '这四条只是把「② 事实」里的字换个说法答了一遍，没有新增任何判断。' +
      '另外提醒：本项的整套路子（男以财为妻、女以官为夫）本身是旧制，请连同上面的第 ③ 段一起看。'
  },

  career: {
    title: '事业与性格',
    ask: '适合做什么？我是什么性子？',
    plain: '传统看事业分两步：先按「出生当月那个字里，谁在管事」把整张盘归成一个类型（叫「格局」），' +
      '再看三路力量各落在哪、旺不旺 —— **管束你的一路**（官杀：职位与压力）、' +
      '**供养你的一路**（印：学业与靠山）、**你往外冒的一路**（食伤：才华与作品）。',
    keys: [
      '格局候选：月令当权的那一位是谁（本工具三法并列，可能得出不止一个）',
      '官杀（职位 · 责任 · 压力）、印（学业 · 名声 · 靠山）、食伤（才华 · 技术 · 表达）各落在哪一柱',
      '哪一类十神在盘上最多，传统据此论性子',
      '日主是谁、旺衰倾向如何'
    ],
    terms: [
      {
        name: '格局',
        plain: '传统把八字按「出生当月那个字里，哪一位在管事」归纳成一个类型，叫格局' +
          '（正官格、七杀格…）。格局被当作看事业路向的总纲。'
      },
      {
        name: '官杀（被管的一路）',
        plain: '正官、七杀是**管束你**的一路。传统拿它代表职位、规矩、责任、名声与压力。'
      },
      {
        name: '印（被养的一路）',
        plain: '正印、偏印是**供养你**的一路。传统拿它代表学业、师长、名声、资历与靠山。'
      },
      {
        name: '食伤（往外冒的一路）',
        plain: '食神、伤官是**你自己产生出来、往外冒**的一路。' +
          '传统拿它代表才华、技术、表达与作品。'
      },
      {
        name: '十神与性格',
        plain: '传统拿盘上「哪一类十神最多」论性子（同辈多者自主、往外冒的多者外放、' +
          '财多者务实、被管的多者守规、被养的多者好学）。这是**一门说法**，不是给人贴标签的依据。'
      }
    ],
    schools: [
      { claim: '官杀为事业职位之星，宜有印来化、有食伤来制。', counter: '身强时官杀正可为用，不必制化；只有身弱时才怕官杀攻身。' },
      { claim: '印星主读书、名声、有靠山，宜旺。', counter: '印重则依赖、迟滞，反而不好，传统另有「印多为病」之说。' },
      { claim: '格局以月令取，格局正者，事业路向清楚。', counter: '取格有「透干 / 本气 / 司权」三法，同一命造常得不同格局，格局本身并无唯一答案。' },
      { claim: '食伤旺者宜做技术、创作、表达一类的事。', counter: '食伤旺而日主又弱，反主劳碌而未受用，仍须与旺衰合看。' }
    ],
    caveat: '性格与职业的对应是最容易变成「贴标签」的一项。此处只列传统普遍怎么归类，' +
      '**不代表任何个人**；也请勿据此限制自己或他人的选择。',
    limit: '这四条只是把「② 事实」里的字换个说法答了一遍，没有新增任何判断。' +
      '性格一项尤其容易被拿来贴标签：上列描述的是**盘上哪类字多**，不是说的你这个人。'
  },

  health: {
    title: '健康与六亲',
    ask: '身体要注意什么？与家人的缘分如何？',
    plain: '传统把八个字按五行分门别类，看**哪一行特别多、哪一行一个都没有**（这叫「偏枯」），' +
      '再把它对应到脏腑与家人。**这一项从头到尾都是取象类比，不是医学，也不是体检结论。**',
    keys: [
      '五行各占几个字（含地支藏干），有没有哪一行完全不见',
      '最多的一行与最少的一行分别是哪一行',
      '四柱宫位各代表哪一位家人（年看祖辈父母、月看父母兄弟、日支看配偶、时看子女晚年）',
      '十神与六亲的对应（印对母亲、偏财对父亲、比劫对兄弟姐妹…）'
    ],
    terms: [
      {
        name: '五行偏枯',
        plain: '八个字分属五行。若某一行特别多，或某一行**一个都没有**，传统叫「偏枯」，' +
          '并认为与对应的脏腑相干。'
      },
      {
        name: '五行配脏腑',
        plain: '传统把五行对应到脏腑：木—肝、火—心、土—脾、金—肺、水—肾（各带一腑）。' +
          '这是**打比方式的取象类比**，不是诊断学，也不能当体检结论看。'
      },
      {
        name: '宫位',
        plain: '四柱各代表一处家人，叫「宫」：年柱看祖辈与父母早年，月柱看父母与兄弟，' +
          '日支看配偶，时柱看子女与晚年。'
      },
      {
        name: '星（十神）',
        plain: '十神也各自对应一位家人，叫「星」：印对母亲一类、偏财对父亲、' +
          '比劫对兄弟姐妹；女命的官杀对丈夫，其余见下方事实表。'
      },
      {
        name: '宫星合看',
        plain: '传统要求宫位与十神合看 —— 只查「宫」或只查「星」，传统都认为不足为凭。'
      }
    ],
    schools: [
      { claim: '五行偏枯（某行过旺或全无），传统认为易牵连对应的脏腑。', counter: '五行配脏腑只是取象类比，不构成诊断；且同一处偏枯，各家所主的病名也不相同。' },
      { claim: '年柱看祖辈父母、月柱看父母兄弟、日支看配偶、时柱看子女。', counter: '宫位须与十神合看，单看宫位不验；另有把父母归年柱、兄弟归月柱的另一套排法，与此互异。' },
      { claim: '六亲各自的「星」若受克，主与该亲缘分薄。', counter: '星之受克在盘上极常见，且六亲是否得力还看行运，不宜据一字定亲缘厚薄。' }
    ],
    caveat: '本项不是医学内容。 五行配脏腑只是传统的取象类比，不能用来判断任何健康状况，' +
      '更不构成医疗建议 —— 身体不适请及时就医。',
    limit: '这几条只是把「② 事实」里的字换个说法答了一遍，没有新增任何判断。' +
      '健康一项尤其要说清：这里数的是**盘上有几个什么字**，与你的身体状况没有任何关系，' +
      '更不是诊断，身体不适请及时就医。'
  }
};

/** 主题显示顺序 */
export const THEME_ORDER = ['wealth', 'marriage', 'career', 'health'];

// ===================== 七、事实层（随盘变化）=====================
//
// 先把盘上的事实算成一组 `xxxFacts`，再由两个消费者各自取用：
//   `buildXxx`  → 按「哪一柱哪个字」排成事实清单（段落式）
//   `resultXxx` → 按这一题的问句排成「通俗结果」（问答式）
// 同一批事实只算一次，两处口径不会分叉。
//
// 写法要求（这一条踩过坑）：事实的 `text` 必须是**白话** —— 直接当人话读得通；
// 术语与盘上定位放 `sub`。上一版把术语塞进 text（「八字以『我克者为财』，木所克者为土」），
// 读者第一句就被行话绊住，等于没翻。

/** 把十神列表压成一句紧凑的「位置+字（十神）」串 */
const fmtGods = (list) =>
  list.length ? list.map((g) => `${g.at}${g.char}（${g.god}）`).join('、') : '未见';

/** 某字在天干/地支时的白话补充 */
const positionPlain = (kind) => (kind === '天干'
  ? '这个字**在天干上** —— 传统叫「透干」，意思是摆在明面上，谁都看得见。'
  : '这个字**藏在地支里** —— 传统叫「藏干」，意思是不在明面上，要扒开才见。');

/**
 * 「共几处，其中明面几处、藏干几处」—— 通俗结果里反复要用。
 * 只数个数与位置，不带任何评价。
 */
const countPhrase = (list) => {
  if (!list.length) return '一处也没有';
  const exposed = list.filter((g) => g.kind === '天干').length;
  const hidden = list.length - exposed;
  if (exposed && hidden) return `共 ${list.length} 处（明面 ${exposed} 处、藏干 ${hidden} 处）`;
  return exposed
    ? `共 ${list.length} 处，都在天干上（明面）`
    : `共 ${list.length} 处，都在地支里（藏着）`;
};

/** 财运事实 */
const wealthFacts = ({ dayGan, dayEl, gods, muKu }) => {
  const caiEl = (FIVE_ELEMENT[dayEl] || {}).restrain || '';
  const caiChars = HEAVENLY_STEMS.filter((s) => TG_TO_ELEMENT[s] === caiEl);
  const caiGodNames = [...new Set(caiChars.map((c) => getTenGod(dayGan, c)).filter(Boolean))];
  const cai = gods.filter((g) => g.god === '正财' || g.god === '偏财');
  const sheng = gods.filter((g) => g.god === '食神' || g.god === '伤官');
  const biJie = gods.filter((g) => g.god === '比肩' || g.god === '劫财');
  const caiKu = (muKu && muKu.list ? muKu.list : [])
    .filter((k) => k.cang.some((c) => caiGodNames.includes(c.god)));
  return { caiEl, caiChars, caiGodNames, cai, sheng, biJie, caiKu };
};

/** 婚姻事实 */
const marriageFacts = ({ pillars, dayGan, gods, isFemale }) => {
  const spouseGods = isFemale ? ['正官', '七杀'] : ['正财', '偏财'];
  const spouseName = isFemale ? '夫星（正官 · 七杀）' : '妻星（正财 · 偏财）';
  const sp = gods.filter((g) => spouseGods.includes(g.god));
  const dayBranch = pillars[2].branch;
  const dayCang = (DZ_CANG_GAN[dayBranch] || []).map((gan, qi) => ({
    gan, qiType: QI_TYPE[qi] || '', god: getTenGod(dayGan, gan)
  }));
  // 夫妻宫与其余三支的关系 —— 一对支可能同时成立多重关系，故全列
  const rels = [];
  pillars.forEach((p, i) => {
    if (i === 2) return;
    getBranchRelations(dayBranch, p.branch).forEach((r) => {
      rels.push({ pos: p.pos, char: p.branch, type: r.type, tone: r.tone, desc: r.desc });
    });
  });
  return { spouseGods, spouseName, sp, dayBranch, dayCang, rels };
};

/** 事业与性格事实 */
const careerFacts = ({ gods, judgment }) => {
  const geCandidates = (judgment && judgment.geJu && Array.isArray(judgment.geJu.candidates))
    ? judgment.geJu.candidates.map((c) => ({ school: c.school, name: c.name, gan: c.gan, god: c.god }))
    : [];
  const pick = (names) => gods.filter((g) => names.includes(g.god));
  // 按五类聚合计数 —— 单看某一个十神太容易失真
  const tally = {};
  gods.forEach((g) => {
    const gk = GROUP_OF_GOD[g.god];
    if (gk) tally[gk] = (tally[gk] || 0) + 1;
  });
  const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return {
    geCandidates,
    guanSha: pick(['正官', '七杀']),
    yin: pick(['正印', '偏印']),
    shiShang: pick(['食神', '伤官']),
    cai: pick(['正财', '偏财']),
    biJie: pick(['比肩', '劫财']),
    ranked,
    topGroup: ranked.length ? ranked[0][0] : ''
  };
};

/** 健康与六亲事实 */
const healthFacts = ({ pillars, dayGan, elements }) => {
  const count = (elements && elements.count) || {};
  const els = ALL_ELEMENTS.map((el) => ({ el, n: count[el] || 0 }));
  const max = els.reduce((a, b) => (b.n > a.n ? b : a), { el: '', n: -1 });
  const min = els.reduce((a, b) => (b.n < a.n ? b : a), { el: '', n: 99 });
  const missing = els.filter((e) => e.n === 0).map((e) => e.el);
  const palaces = pillars.map((p) => ({
    pos: p.pos,
    role: PALACE_ROLE[p.pos] || '',
    short: PALACE_SHORT[p.pos] || '',
    branch: p.branch,
    cang: (DZ_CANG_GAN[p.branch] || []).map((gan, qi) => ({
      gan, qiType: QI_TYPE[qi] || '', god: getTenGod(dayGan, gan)
    }))
  }));
  return { els, max, min, missing, palaces };
};

// ---- 事实清单（段落式）----

/** 财运 */
const buildWealth = ({ dayGan, dayEl, wangShuai, facts }) => {
  const { caiEl, caiChars, caiGodNames, cai, sheng, biJie, caiKu } = facts;

  const groups = [
    {
      label: '你的「财星」是哪几个字 —— 先定「我」，再定「财」',
      items: [{
        text: `你是「${dayGan}」，属${dayEl}。传统的规定是「**我能支配的，就归作财**」；` +
          `${dayEl}能支配的是${caiEl}，所以对你这张盘来说，${caiEl}就是财。`,
        sub: `具体到天干，${caiEl}即「${caiChars.join('」「')}」两个字；` +
          `相对${dayGan}来说，它们的名字是：${caiGodNames.join('、') || '—'}。`
      }]
    },
    {
      label: '财星在这张盘上出现在哪里',
      items: cai.length
        ? cai.map((g) => ({
            text: `${g.at}${g.char}（${g.god}）`,
            sub: positionPlain(g.kind),
            tone: g.kind === '天干' ? 'exposed' : 'hidden'
          }))
        : [{
            text: '四柱天干与地支藏干里，都没有找到财星。传统称这种情况为「财星不见」。',
            sub: '财星不见不等于没有财路 —— 传统多会改从「生财的食伤」或「管财的官杀」那一路去看。',
            tone: 'none'
          }]
    },
    {
      label: '能让钱生钱的一路，与会来分钱的一路',
      items: [
        {
          text: `能让钱生钱的一路（你的本事）：${fmtGods(sheng)}`,
          sub: '食神、伤官代表你自己的手艺、作品、点子 —— 传统说它们能「生」财，所以叫财的源头。'
        },
        {
          text: `会来分钱的一路（同类的人）：${fmtGods(biJie)}`,
          sub: '比肩、劫财代表同行、搭档、与你竞争的人 —— 传统说他们会跟你的财「抢食」，称「比劫夺财」。'
        }
      ]
    },
    {
      label: '「扛不扛得动」—— 你自己够不够强',
      items: [{
        text: `综合三条来看（出生的那个月帮不帮它 · 地支里有没有落脚点 · 同类的字多不多），` +
          `本工具得出的倾向是「${wangShuai ? wangShuai.verdict : '—'}」。`,
        // 不用 `wangShuai.caveat`：它原文是「月令司令、刑冲合化、透干会支」这类行话，
        // 拼进导读栏正好把刚翻译好的话又绕回去。此处另写一句白话。
        sub: '传统说自身强才「任得住」财，自身弱而财旺就叫「财多身弱」——有财却使不上劲。' +
          '不过旺衰要怎么算，各派的权重分歧极大，上列只是一条最常用的入口，不宜据以定论。'
      }]
    }
  ];

  // 财星入墓库（若有）
  if (caiKu.length) {
    groups.push({
      label: '财星入墓库的情形',
      items: caiKu.map((k) => ({
        text: `${k.pos}支${k.branch}是${k.ku}，里面藏着：${k.desc}`,
        sub: '其中含财星。库里藏财，传统一说主存得住，一说主关起来用不上，两种说法并存。'
      }))
    });
  }

  return groups;
};

/** 感情与姻缘 */
const buildMarriage = ({ isFemale, facts }) => {
  const { spouseName, sp, dayBranch, dayCang, rels } = facts;

  return [
    {
      label: `配偶星 —— 传统给配偶留的那个字（本盘以${isFemale ? '女命' : '男命'}论）`,
      items: [
        {
          text: `传统规矩：**男命看「财」、女命看「官杀」**。` +
            `本盘按${isFemale ? '女命' : '男命'}论，配偶星定为「${spouseName}」。`,
          sub: '这就是「十神」的用处 —— 先定「我」（日干），才知道哪个字代表配偶。'
        },
        {
          text: sp.length ? `盘上找到这几处：${fmtGods(sp)}` : `${spouseName}在四柱天干与藏干里都没有找到。`,
          sub: sp.length
            ? '位置前的「年/月/日/时」是它落在哪一柱，「干」表示在天干上、「支」表示藏在地支里。'
            : '传统称这种情况为配偶星不见，多会改从别处（如夫妻宫）去看婚缘。',
          tone: sp.length ? 'normal' : 'none'
        }
      ]
    },
    {
      label: '夫妻宫（日支）里坐着什么',
      items: [
        {
          text: `夫妻宫是日支「${dayBranch}」。这个位置上藏着：` +
            `${dayCang.map((c) => `${c.gan}（${c.god}·${c.qiType}）`).join('、') || '—'}`,
          sub: '日支在传统里是配偶的「座位」，藏在里面的字则像是这位配偶带来的东西（以十神论）。'
        }
      ]
    },
    {
      label: '夫妻宫与其他三支的关系',
      items: rels.length
        ? rels.map((r) => ({
            text: `与${r.pos}支${r.char}：${r.type}`,
            sub: r.desc,
            tone: r.tone
          }))
        : [{
            text: '夫妻宫与其他三支之间，没有成立六合 · 三合 · 六冲 · 相刑 · 六害 · 六破。',
            sub: '传统把这看作「夫妻宫未被牵动」。',
            tone: 'none'
          }]
    }
  ];
};

/** 事业与性格 */
const buildCareer = ({ dayGan, dayEl, wangShuai, facts }) => {
  const { geCandidates, guanSha, yin, shiShang, cai, biJie, ranked, topGroup } = facts;

  return [
    {
      label: '格局候选 —— 摘自「论断」栏（三法并列）',
      items: geCandidates.length
        ? geCandidates.map((c) => ({
            text: `${c.name}　·　${c.school}`,
            sub: c.gan ? `取的是「${c.gan}」，相对你的日主属「${c.god}」。` : ''
          }))
        : [{ text: '未能取到格局候选。', sub: '取格需要月令藏干，本盘条件不足。' }],
      note: geCandidates.length > 1
        ? '同一张盘取出了多个格局，这不是出错 —— 取格本有「透干 / 本气 / 司权」三法，各法所见不同。'
        : ''
    },
    {
      label: '三层力量各落在哪里',
      items: [
        { text: `管束你的一路（职位 · 责任 · 压力）：${fmtGods(guanSha)}`, sub: '即正官、七杀。传统用来代表单位、上司、规矩与压力。' },
        { text: `供养你的一路（学业 · 名声 · 靠山）：${fmtGods(yin)}`, sub: '即正印、偏印。传统用来代表师长辈、学历、资历与庇荫。' },
        { text: `你往外冒的一路（才华 · 技术 · 表达）：${fmtGods(shiShang)}`, sub: '即食神、伤官。传统用来代表手艺、口才、作品与点子的来源。' },
        { text: `你能支配的一路（实务 · 经营）：${fmtGods(cai)}`, sub: '即正财、偏财。传统用来代表你能管住、能用的资源。' },
        { text: `与你同类的一路（同辈 · 竞争 · 自主）：${fmtGods(biJie)}`, sub: '即比肩、劫财。传统用来代表同辈、伙伴与竞争者。' }
      ]
    },
    {
      label: '十神分布与性格倾向（传统说法）',
      items: [
        {
          text: `各类关系在盘上的数量：${ranked.length ? ranked.map(([k, n]) => `${k} ${n}`).join('、') : '—'}`,
          sub: '统计口径：不含日干自身，四个天干 + 四个地支的藏干一并计入，故总数多于八个字。'
        },
        {
          text: topGroup
            ? `盘上最多的一类是「${topGroup}」。传统对此类的说法：${GROUP_TRAIT[topGroup] || '—'}`
            : '未能统计出占多的一类。',
          sub: '注意：这里说的是「盘上哪一类字多」，说的是传统怎么归类，**不是说你就是这样的人**。'
        },
        {
          text: '日主与旺衰',
          sub: `日主${dayGan}（${dayEl}），旺衰倾向「${wangShuai ? wangShuai.verdict : '—'}」。`
        }
      ]
    }
  ];
};

/** 健康与六亲 */
const buildHealth = ({ isFemale, facts }) => {
  const { els, max, min, missing, palaces } = facts;

  return [
    {
      label: '五行分布（传统用它看「偏枯」）',
      items: [
        {
          text: `各五行字数：${els.map((e) => `${e.el} ${e.n}`).join('　')}`,
          sub: '五行各代表一类性质：' +
            ALL_ELEMENTS.map((e) => `${e}主${ELEMENT_PLAIN[e] || ''}`).join('；') + '。'
        },
        {
          text: missing.length
            ? `完全不见的五行：${missing.join('、')}`
            : '五行皆有，没有完全缺失的一行。',
          sub: '统计口径：四个天干 + 四个地支的藏干一并计入，故总数多于八个字。'
        },
        {
          text: `最多的是${max.el}（${max.n} 个），最少的是${min.el}（${min.n} 个）。`,
          sub: '传统把「某一行独多、或某一行全无」叫偏枯，并牵连对应的脏腑 —— ' +
            '但这只是取象类比的说法，各派所主之病名也不同，**不是诊断**。'
        }
      ]
    },
    {
      label: '四柱宫位各代表哪一位家人',
      items: palaces.map((p) => ({
        text: `${p.pos}柱 · ${p.branch}　${p.role}`,
        sub: `这一柱地支里藏的字：${p.cang.map((c) => `${c.gan}（${c.god}·${c.qiType}）`).join('、') || '—'}`
      }))
    },
    {
      label: '十神与六亲的传统对应（叫「星」）',
      items: [
        {
          text: '印 → 母亲一类　·　偏财 → 父亲　·　比劫 → 兄弟姐妹',
          sub: '这是最通行的一套对应，各家所主出入很大。'
        },
        {
          text: isFemale ? '本盘按女命论：官杀 → 丈夫　·　食伤 → 子女' : '本盘按男命论：财 → 妻子　·　官杀 → 子女',
          sub: '同一颗星，男命与女命所指的家人不同（例如官杀：女命指丈夫，男命指子女），' +
            '所以本栏必须先知道是男命还是女命。'
        }
      ]
    }
  ];
};

// ===================== 八、通俗结果（随盘变化）=====================
//
// 「通俗结果」= 拿这一题**自己的问句**（`THEME_GUIDE[key].keys`），逐条给出**事实的答案**。
//
// 它不是批语，也不是结论 —— 每一条的答案都能在上面「事实」里逐字核对到，没有一个字是新判断。
// 之所以要做这一块：事实清单读起来是散的，读者看完不知道「所以呢」；把同一批事实按问句重排
// 一遍，就回答了「所以呢」，而**不必**去下任何吉凶断语。
//
// 因此规矩是硬的：`lines[].a` 只能说「有几处 / 在哪一柱 / 判为某某倾向」这类**盘上的事实**，
// 不得出现吉凶、数量级、时间与结果。`t_guide.mjs` 有专门的禁语扫描守这一条；
// 另有断言要求 `lines.length === keys.length`（确系逐条作答，不是挑着答）。

/** 财运 */
const resultWealth = ({ wangShuai, facts }) => {
  const { cai, sheng, biJie } = facts;
  return [
    { q: '有没有「生财」的本事', a: sheng.length ? `有。${countPhrase(sheng)}：${fmtGods(sheng)}` : '盘上未见食神、伤官。' },
    { q: '财星在明处还是暗处', a: cai.length ? `${countPhrase(cai)}：${fmtGods(cai)}` : '盘上未见财星。' },
    { q: '有没有同类的人来分', a: biJie.length ? `有。${countPhrase(biJie)}：${fmtGods(biJie)}` : '盘上未见比肩、劫财。' },
    { q: '你自己扛不扛得动', a: `本工具按三条判据得出的倾向是「${wangShuai ? wangShuai.verdict : '—'}」。` }
  ];
};

/** 感情与姻缘 */
const resultMarriage = ({ isFemale, facts, shenSha }) => {
  const { sp, dayBranch, dayCang, rels } = facts;
  const taohua = (shenSha || []).find((s) => s.key === 'taohua');
  return [
    {
      q: '配偶星在不在盘上、在哪一柱',
      a: sp.length
        ? `在。${countPhrase(sp)}：${fmtGods(sp)}`
        : `不在。四柱天干与藏干里都没有找到（本盘按${isFemale ? '女命' : '男命'}取配偶星）。`
    },
    {
      q: '夫妻宫里坐着什么',
      a: `日支是「${dayBranch}」，里面藏着${dayCang.map((c) => `${c.gan}（${c.god}·${c.qiType}）`).join('、') || '—'}。`
    },
    {
      q: '夫妻宫跟另外三支处得怎么样',
      a: rels.length
        ? rels.map((r) => `与${r.pos}支${r.char}：${r.type}`).join('；') + '。'
        : '三支之间没有成立六合 · 三合 · 六冲 · 相刑 · 六害 · 六破。'
    },
    {
      q: '有没有「桃花」这个字',
      a: taohua && taohua.found
        ? `有，出现在${taohua.summary}。`
        : (taohua && taohua.noBasisNote ? '无法查（' + taohua.noBasisNote + '）' : '没有，四支里未见应见之字。')
    }
  ];
};

/** 事业与性格 */
const resultCareer = ({ dayGan, dayEl, wangShuai, facts }) => {
  const { geCandidates, guanSha, yin, shiShang, ranked, topGroup } = facts;
  return [
    {
      q: '格局候选是谁',
      a: geCandidates.length
        ? geCandidates.map((c) => `${c.name}（${c.school}）`).join('；') + '。'
        : '本盘未能取到格局候选。'
    },
    {
      q: '三路力量各落在哪里',
      a: `管束你的一路（官杀）${countPhrase(guanSha)}；` +
        `供养你的一路（印）${countPhrase(yin)}；` +
        `你往外冒的一路（食伤）${countPhrase(shiShang)}。`
    },
    {
      q: '哪一类在盘上最多',
      a: topGroup
        ? `「${topGroup}」，共 ${ranked[0][1]} 处（全盘：${ranked.map(([k, n]) => `${k} ${n}`).join('、')}）。`
        : '未能统计出占多的一类。'
    },
    {
      q: '日主是谁、旺衰倾向如何',
      a: `日主${dayGan}（${dayEl}），倾向「${wangShuai ? wangShuai.verdict : '—'}」。`
    }
  ];
};

/** 健康与六亲 */
const resultHealth = ({ isFemale, facts }) => {
  const { els, max, min, missing, palaces } = facts;
  return [
    {
      q: '五行各占几个字',
      a: `${els.map((e) => `${e.el} ${e.n}`).join('　')}（含地支藏干）。`
    },
    {
      q: '有没有哪一行完全没有',
      a: missing.length
        ? `有：${missing.join('、')}一个都没见。`
        : '没有，五行都见得到。'
    },
    {
      q: '最多与最少分别是哪一行',
      a: `最多${max.el}（${max.n} 个），最少${min.el}（${min.n} 个）。`
    },
    {
      q: '四柱各主哪一位家人',
      a: palaces.map((p) => `${p.pos}柱${p.branch}（${p.short}）`).join(' · ') + '。'
    }
  ];
};

// ===================== 九、组装 =====================

export const GUIDE_CAVEAT =
  '本栏是全站最贴近「给普通人读的批语」的一栏，因此也最需要说明白：' +
  '① **它不预测任何事。** 上列「事实」都能在盘上核到具体某柱某字，但「这些字意味着什么」属于解释，' +
  '各家不同，本栏一律并列，不替你作选；「通俗结果」也只是把这些事实按问句重答一遍。' +
  '② **传统判法带着它的时代。** 例如「男以财为妻、女以官为夫」本身即是旧制，' +
  '其中不少观念今天已不适用，请当作文化史料来看。' +
  '③ **涉及健康的部分不是医学内容。** 五行配脏腑只是取象类比，不能用于判断健康状况，身体不适请就医。' +
  '④ 内容为传统文化知识整理，不作预测承诺，不构成任何现实建议。';

/**
 * 导览层全景。
 *
 * @param {Object}  o
 * @param {string[]} o.gzList    四柱干支 [年,月,日,时]
 * @param {string}  [o.gender]   'male' | 'female'
 * @param {Object}  [o.judgment] `baziJudgment.analyzeJudgment` 的结果（取格局候选）
 * @param {Object}  [o.wangShuai]`baziUtils.assessWangShuai` 的结果
 * @param {Object}  [o.elements] `baziUtils.analyzeElements` 的结果
 * @param {Object}  [o.structure]`baziStructure.analyzeStructure` 的结果（有则直接复用）
 */
export const analyzeGuide = (options) => {
  // 用 `options || {}` 兜住 null —— 默认参数 `= {}` 只在 undefined 时生效，传 null 会当场抛错
  const {
    gzList, gender = 'male', judgment = null, wangShuai = null, elements = null, structure = null
  } = options || {};

  const pillars = (structure && Array.isArray(structure.pillars) && structure.pillars.length >= 4)
    ? structure.pillars
    : toPillars(gzList || []);
  if (!pillars || pillars.length < 4) return null;

  const dayGan = pillars[2].stem;
  if (!dayGan) return null;
  const dayEl = TG_TO_ELEMENT[dayGan] || '';
  const isFemale = gender === 'female';

  // 摊平十神并补一个「年干 / 年支」这样的可读位置（组件直接用，免得各写一遍）
  const gods = collectTenGods(pillars, dayGan).map((g) => ({
    ...g, at: `${g.pos}${g.kind === '天干' ? '干' : '支'}`
  }));

  const muKu = analyzeMuKu(pillars, dayGan);
  const shenSha = findShenSha(pillars, dayGan);

  // 事实只算一次，事实清单与通俗结果共用（见第七节说明）
  const fWealth = wealthFacts({ dayGan, dayEl, gods, muKu });
  const fMarriage = marriageFacts({ pillars, dayGan, gods, isFemale });
  const fCareer = careerFacts({ gods, judgment });
  const fHealth = healthFacts({ pillars, dayGan, elements });

  const groupsOf = {
    wealth: buildWealth({ dayGan, dayEl, wangShuai, facts: fWealth }),
    marriage: buildMarriage({ isFemale, facts: fMarriage }),
    career: buildCareer({ dayGan, dayEl, wangShuai, facts: fCareer }),
    health: buildHealth({ isFemale, facts: fHealth })
  };

  const resultsOf = {
    wealth: resultWealth({ wangShuai, facts: fWealth }),
    marriage: resultMarriage({ isFemale, facts: fMarriage, shenSha }),
    career: resultCareer({ dayGan, dayEl, wangShuai, facts: fCareer }),
    health: resultHealth({ isFemale, facts: fHealth })
  };

  /** slug → { slug, title, to }；`to` 是站内路径（组件再用 withBase 补 base） */
  const refOf = (slug) => {
    const a = FATE_ARTICLES.find((x) => x.slug === slug);
    return a ? { slug: a.slug, title: a.title, to: `/fate/${a.slug}` } : null;
  };

  const themes = THEME_ORDER.map((key) => {
    const meta = THEME_GUIDE[key] || {};
    return {
      key,
      title: meta.title || key,
      ask: meta.ask || '',
      plain: meta.plain || '',
      keys: meta.keys || [],
      terms: meta.terms || [],
      schools: meta.schools || [],
      caveat: meta.caveat || '',
      limit: meta.limit || '',
      groups: groupsOf[key] || [],
      result: { title: '通俗结果', lines: resultsOf[key] || [] },
      refs: (THEME_REFS[key] || []).map(refOf).filter(Boolean)
    };
  });

  return {
    dayGan,
    dayEl,
    gender,
    genderLabel: isFemale ? '女命' : '男命',
    basics: BASICS.map((b) => ({ q: b.q, a: b.a, ref: refOf(b.ref) })),
    tenGod: { intro: TEN_GOD_BRIEF.intro, names: TEN_GOD_BRIEF.names, hint: TEN_GOD_BRIEF.hint, ref: refOf(TEN_GOD_BRIEF.ref) },
    readSteps: READ_STEPS,
    themes,
    articles: FATE_ARTICLES.map((a) => refOf(a.slug)).filter(Boolean),
    commonRefs: COMMON_REFS.map(refOf).filter(Boolean),
    shenSha,
    muKu,
    caveat: GUIDE_CAVEAT
  };
};

export default {
  FATE_ARTICLES,
  THEME_REFS,
  COMMON_REFS,
  BASICS,
  TEN_GOD_BRIEF,
  READ_STEPS,
  ELEMENT_PLAIN,
  SHEN_SHA,
  KU_NAME,
  GROUP_OF_GOD,
  GROUP_TRAIT,
  GOD_TRAIT,
  ORGAN_OF_ELEMENT,
  PALACE_ROLE,
  PALACE_SHORT,
  GOD_KIN,
  THEME_GUIDE,
  THEME_ORDER,
  GUIDE_CAVEAT,
  sanHeKeyOf,
  findShenSha,
  analyzeMuKu,
  analyzeGuide
};
