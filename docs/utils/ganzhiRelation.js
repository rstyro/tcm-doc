/**
 * 干支基础常量与「关系表」—— 全站唯一的定义处。
 *
 * 为什么单独抽一个模块：
 *   六合 / 六冲 / 六害 / 六破 / 三合 / 三会 / 相刑 这几张表，
 *   原先在 `hehunUtils.js` 与 `taiSuiUtils.js` 里各存了一份（写法还不一样：
 *   一份用字面量、一份用 `EARTHLY_BRANCHES.XX` 枚举引用），改一处很容易漏另一处。
 *   同时「天干/地支 → 五行、阴阳」「地支藏干」「五行生克」也在多处重复。
 *   这里统一成一份，各工具模块按需 import，不再各自定义。
 *
 * 约定：
 *   - 地支一律用**单个汉字**表示（'子'、'丑'…），不用英文枚举键。
 *     需要枚举风格的地方（如 `EARTHLY_BRANCHES.ZI`）由调用方自行映射，不要往这里加。
 *   - 关系表分两类：**双向配对表**（object，`a → b`，正反都列）与**成组表**（array of array，组内任意两字成一关系）。
 *   - 判定「两字之间有哪些关系」请直接用 `getBranchRelations`，它的返回值是**数组**——
 *     一对地支可以同时成立多重关系（寅亥 = 六合 + 六破；巳申 = 六合 + 六破 + 相刑；午午 = 自刑）。
 *     不要假设一对一。
 */

// ===================== 基础序列 =====================

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ZODIAC_LIST = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

/** 英文枚举键 → 地支汉字（仅为兼容旧代码的枚举写法） */
export const BRANCH_ENUM = {
  ZI: '子', CHOU: '丑', YIN: '寅', MAO: '卯', CHEN: '辰', SI: '巳',
  WU: '午', WEI: '未', SHEN: '申', YOU: '酉', XU: '戌', HAI: '亥'
};

// ===================== 五行 / 阴阳 =====================

/** 天干五行 */
export const TG_TO_ELEMENT = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

/** 天干阴阳 */
export const TG_YIN_YANG = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};

/** 地支五行 */
export const DZ_TO_ELEMENT = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

/** 地支阴阳 */
export const DZ_YIN_YANG = {
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳', '巳': '阴',
  '午': '阳', '未': '阴', '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴'
};

/** 地支藏干（按 本气 / 中气 / 余气 的顺序排列） */
export const DZ_CANG_GAN = {
  '子': ['癸'], '丑': ['己', '辛', '癸'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '戊', '庚'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

/** 五行生克：help=生我, beHelped=我生, restrain=我克, beRestrained=克我 */
export const FIVE_ELEMENT = {
  '木': { help: '水', beHelped: '火', restrain: '土', beRestrained: '金' },
  '火': { help: '木', beHelped: '土', restrain: '金', beRestrained: '水' },
  '土': { help: '火', beHelped: '金', restrain: '水', beRestrained: '木' },
  '金': { help: '土', beHelped: '水', restrain: '木', beRestrained: '火' },
  '水': { help: '金', beHelped: '木', restrain: '火', beRestrained: '土' }
};

/** 五行固定顺序（木火土金水），用于遍历与展示 */
export const ALL_ELEMENTS = ['木', '火', '土', '金', '水'];

// ===================== 地支关系表 =====================

/** 六合（双向配对） */
export const HE_LIU = {
  '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午'
};

/** 六冲（双向配对） */
export const LIU_CHONG = {
  '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
};

/** 六害（双向配对） */
export const LIU_HAI = {
  '子': '未', '未': '子', '丑': '午', '午': '丑', '寅': '巳', '巳': '寅',
  '卯': '辰', '辰': '卯', '申': '亥', '亥': '申', '酉': '戌', '戌': '酉'
};

/** 六破（双向配对） */
export const LIU_PO = {
  '子': '酉', '酉': '子', '丑': '辰', '辰': '丑', '寅': '亥', '亥': '寅',
  '卯': '午', '午': '卯', '巳': '申', '申': '巳', '未': '戌', '戌': '未'
};

/** 三合局（成组，任两字为「半合」，三字齐为「成局」） */
export const SAN_HE = [
  ['申', '子', '辰'],
  ['亥', '卯', '未'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑']
];

/** 三会方（成组，力量强于三合，取时令旺势） */
export const SAN_HUI = [
  ['寅', '卯', '辰'],
  ['巳', '午', '未'],
  ['申', '酉', '戌'],
  ['亥', '子', '丑']
];

/** 三合局 → 所成五行（键为按 SAN_HE 内部顺序拼接的三字） */
export const FIVE_ELEMENT_NAME_OF_SANHE = {
  '申子辰': '水', '亥卯未': '木', '寅午戌': '火', '巳酉丑': '金'
};

/** 三会方 → 所成五行（键为按 SAN_HUI 内部顺序拼接的三字） */
export const FIVE_ELEMENT_NAME_OF_SANHUI = {
  '寅卯辰': '木', '巳午未': '火', '申酉戌': '金', '亥子丑': '水'
};

/** 相刑（分四类；自刑为「同字相见」） */
export const XING_RULES = {
  '无恩之刑': ['寅', '巳', '申'],
  '恃势之刑': ['丑', '戌', '未'],
  '无礼之刑': ['子', '卯'],
  '自刑': ['辰', '午', '酉', '亥']
};

// ===================== 天干关系表 =====================

/** 天干五合（含合化五行） */
export const TG_HE = {
  '甲': { pair: '己', hua: '土' }, '己': { pair: '甲', hua: '土' },
  '乙': { pair: '庚', hua: '金' }, '庚': { pair: '乙', hua: '金' },
  '丙': { pair: '辛', hua: '水' }, '辛': { pair: '丙', hua: '水' },
  '丁': { pair: '壬', hua: '木' }, '壬': { pair: '丁', hua: '木' },
  '戊': { pair: '癸', hua: '火' }, '癸': { pair: '戊', hua: '火' }
};

/** 天干相冲（四组，甲庚 / 乙辛 / 丙壬 / 丁癸） */
export const TG_CHONG = {
  '甲': '庚', '庚': '甲', '乙': '辛', '辛': '乙',
  '丙': '壬', '壬': '丙', '丁': '癸', '癸': '丁'
};

// ===================== 关系判定（通用实现） =====================

/**
 * 判断两地支之间成立的全部关系。
 * **返回数组**：一对地支可能同时成立多重关系，调用方须自行处理多条。
 *
 * @param {string} a 地支
 * @param {string} b 地支
 * @param {Object} [opts]
 * @param {boolean} [opts.includeHalf=true] 是否把「三合/三会之二」算作半合半会
 * @returns {Array<{type:string, tone:'he'|'chong'|'neutral', desc:string}>}
 */
export const getBranchRelations = (a, b, opts = {}) => {
  const { includeHalf = true } = opts;
  const rels = [];
  if (!a || !b) return rels;

  if (a === b) {
    if (XING_RULES['自刑'].includes(a)) {
      rels.push({ type: '自刑', tone: 'chong', desc: `同为${a}，构成自刑` });
    } else {
      rels.push({ type: '同支', tone: 'neutral', desc: `同为${a}` });
    }
    return rels;
  }

  if (HE_LIU[a] === b) rels.push({ type: '六合', tone: 'he', desc: `${a}${b}六合` });
  if (LIU_CHONG[a] === b) rels.push({ type: '六冲', tone: 'chong', desc: `${a}${b}相冲` });
  if (LIU_HAI[a] === b) rels.push({ type: '六害', tone: 'chong', desc: `${a}${b}相害` });
  if (LIU_PO[a] === b) rels.push({ type: '六破', tone: 'chong', desc: `${a}${b}相破` });

  if (includeHalf) {
    for (const g of SAN_HE) {
      if (g.includes(a) && g.includes(b)) {
        rels.push({ type: '三合', tone: 'he', desc: `${a}${b}为三合局（${g.join('')}）之半` });
      }
    }
    for (const g of SAN_HUI) {
      if (g.includes(a) && g.includes(b)) {
        rels.push({ type: '三会', tone: 'he', desc: `${a}${b}为三会方（${g.join('')}）之半` });
      }
    }
  }

  for (const [name, g] of Object.entries(XING_RULES)) {
    if (name === '自刑') continue;
    if (g.includes(a) && g.includes(b)) {
      rels.push({ type: '相刑', tone: 'chong', desc: `${a}${b}相刑（${name}）` });
    }
  }
  return rels;
};

/**
 * 判断两地支的关系，返回**首条**或 null。
 * 适合「只要一个结论」的场景；需要完整关系请用 `getBranchRelations`。
 */
export const getBranchRelation = (a, b, opts) => {
  const rels = getBranchRelations(a, b, opts);
  return rels.length ? rels[0] : null;
};

/**
 * 判断两地支是否为「双向配对表」中的一对（六合/六冲/六害/六破通用）。
 * @param {Object} table HE_LIU / LIU_CHONG / LIU_HAI / LIU_PO 之一
 */
export const isPairIn = (table, a, b) => !!table && table[a] === b;

/**
 * 判断两字是否同属某个「成组表」中的一组（三合/三会/相刑通用）。
 * @returns {Array|null} 命中的那一组
 */
export const findGroup = (groups, a, b) => {
  for (const g of groups) {
    if (g.includes(a) && g.includes(b)) return g;
  }
  return null;
};

/**
 * 判断两天干之间成立的全部关系（五合 + 相冲 + 五行生克）。
 * **返回数组**，理由同 `getBranchRelations`。
 */
export const getStemRelations = (a, b) => {
  const rels = [];
  if (!a || !b) return rels;
  if (a === b) {
    rels.push({ type: '同干', tone: 'neutral', desc: `同为${a}` });
    return rels;
  }
  if (TG_HE[a] && TG_HE[a].pair === b) {
    rels.push({ type: '天干五合', tone: 'he', desc: `${a}${b}相合，合化${TG_HE[a].hua}` });
  }
  if (TG_CHONG[a] === b) {
    rels.push({ type: '天干相冲', tone: 'chong', desc: `${a}${b}相冲` });
  }
  const ea = TG_TO_ELEMENT[a], eb = TG_TO_ELEMENT[b];
  if (ea && eb && ea !== eb) {
    if (FIVE_ELEMENT[ea].beHelped === eb) {
      rels.push({ type: '相生', tone: 'he', desc: `${a}（${ea}）生${b}（${eb}）` });
    } else if (FIVE_ELEMENT[ea].restrain === eb) {
      rels.push({ type: '相克', tone: 'chong', desc: `${a}（${ea}）克${b}（${eb}）` });
    }
  }
  return rels;
};

/** 判断两天干的关系，返回首条或 null。 */
export const getStemRelation = (a, b) => {
  const rels = getStemRelations(a, b);
  return rels.length ? rels[0] : null;
};

// ===================== 小工具 =====================

/** 处理 JS 负数取模 */
export const mod = (num, m) => ((num % m) + m) % m;

/** 地支 → 生肖 */
export const getZodiacByBranch = (branch) => {
  const i = EARTHLY_BRANCHES.indexOf(branch);
  return i >= 0 ? ZODIAC_LIST[i] : '';
};

/** 生肖 → 地支 */
export const getBranchByZodiac = (zodiac) => {
  const i = ZODIAC_LIST.indexOf(zodiac);
  return i >= 0 ? EARTHLY_BRANCHES[i] : '';
};

/** 干支（如「甲子」）→ 生肖 */
export const getZodiacByGanZhi = (ganZhi) => {
  if (!ganZhi || ganZhi.length !== 2) return '';
  return getZodiacByBranch(ganZhi.charAt(1));
};

/** 干支（如「甲子」）→ { stem, branch } */
export const splitGanZhi = (ganZhi) => {
  if (!ganZhi || ganZhi.length !== 2) return { stem: '', branch: '' };
  return { stem: ganZhi.charAt(0), branch: ganZhi.charAt(1) };
};

export default {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_LIST,
  BRANCH_ENUM,
  TG_TO_ELEMENT,
  TG_YIN_YANG,
  DZ_TO_ELEMENT,
  DZ_YIN_YANG,
  DZ_CANG_GAN,
  FIVE_ELEMENT,
  ALL_ELEMENTS,
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
  getBranchRelations,
  getBranchRelation,
  isPairIn,
  findGroup,
  getStemRelations,
  getStemRelation,
  mod,
  getZodiacByBranch,
  getBranchByZodiac,
  getZodiacByGanZhi,
  splitGanZhi
};
