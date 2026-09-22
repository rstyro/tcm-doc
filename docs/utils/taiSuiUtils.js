/**
 * 太岁查询工具类
 */

import {
  BRANCH_ENUM,
  HE_LIU,
  LIU_CHONG,
  LIU_HAI,
  LIU_PO,
  SAN_HE,
  XING_RULES,
  mod as sharedMod
} from './ganzhiRelation.js';

// ===================== 基础常量定义 =====================

/**
 * 地支枚举。仅为保留旧调用方的 `EARTHLY_BRANCHES.ZI` 写法，
 * 值统一改为**单个汉字**（'子'），与共享模块一致，
 * 于是原先的 `branch.name` 全部退化为 branch 本身。
 */
export const EARTHLY_BRANCHES = Object.fromEntries(
  Object.entries(BRANCH_ENUM).map(([k, v]) => [k, { name: v }])
);

export const HEAVENLY_STEMS = {
  JIA: { name: '甲' },
  YI: { name: '乙' },
  BING: { name: '丙' },
  DING: { name: '丁' },
  WU: { name: '戊' },
  JI: { name: '己' },
  GENG: { name: '庚' },
  XIN: { name: '辛' },
  REN: { name: '壬' },
  GUI: { name: '癸' }
};

// 每个生肖新增icon字段
export const CHINESE_ZODIAC = {
  RAT: { name: '鼠', branch: EARTHLY_BRANCHES.ZI, icon: '🐭' },
  OX: { name: '牛', branch: EARTHLY_BRANCHES.CHOU, icon: '🐮' },
  TIGER: { name: '虎', branch: EARTHLY_BRANCHES.YIN, icon: '🐯' },
  RABBIT: { name: '兔', branch: EARTHLY_BRANCHES.MAO, icon: '🐰' },
  DRAGON: { name: '龙', branch: EARTHLY_BRANCHES.CHEN, icon: '🐉' },
  SNAKE: { name: '蛇', branch: EARTHLY_BRANCHES.SI, icon: '🐍' },
  HORSE: { name: '马', branch: EARTHLY_BRANCHES.WU, icon: '🐎' },
  GOAT: { name: '羊', branch: EARTHLY_BRANCHES.WEI, icon: '🐑' },
  MONKEY: { name: '猴', branch: EARTHLY_BRANCHES.SHEN, icon: '🐒' },
  ROOSTER: { name: '鸡', branch: EARTHLY_BRANCHES.YOU, icon: '🐔' },
  DOG: { name: '狗', branch: EARTHLY_BRANCHES.XU, icon: '🐶' },
  PIG: { name: '猪', branch: EARTHLY_BRANCHES.HAI, icon: '🐷' }
};

export const TAI_SUI_TYPE = {
  ZHI_TAI_SUI: { name: '本命年' ,desc: '运势阻滞,吉凶参半'},
  CHONG_TAI_SUI: { name: '冲太岁',desc: '人事变动,财运波折' },
  HAI_TAI_SUI: { name: '害太岁' ,desc: '小人陷害,是非增多,事业阻滞'},
  XING_TAI_SUI: { name: '刑太岁' ,desc: '口舌纠纷,工作变动'},
  PO_TAI_SUI: { name: '破太岁' ,desc: '破财破损,事业下滑,感情易变'},
  HE_LIU_TAI_SUI: { name: '六合太岁', desc: '贵人相助,运势顺畅' },
  HE_SAN_TAI_SUI: { name: '三合太岁', desc: '合作共赢,机遇增多' }
};

// ===================== 太岁规则定义 =====================
//
// 以下规则表全部复用 `./ganzhiRelation.js` 中的规范定义，
// 只在「双向配对表 → 成对数组」这一层做形状适配，
// 避免关系表在本站出现第二份定义。

/** 双向配对表 → [[a,b], ...] 成对数组（六组） */
const toPairList = (table) => {
  const seen = new Set();
  const out = [];
  for (const [a, b] of Object.entries(table)) {
    const key = [a, b].sort().join('');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([a, b]);
  }
  return out;
};

const CHONG_RULES = toPairList(LIU_CHONG);
const HAI_RULES = toPairList(LIU_HAI);
const PO_RULES = toPairList(LIU_PO);
const HE_LIU_RULES = toPairList(HE_LIU);
const HE_SAN_RULES = SAN_HE;


/**
 * 根据地支查找对应生肖
 * 注意：`CHINESE_ZODIAC[*].branch` 沿用旧的 `{ name }` 包裹（枚举写法要求），
 * 所以这里要与 `branch.name` 比较，而不是与 branch 本身比较。
 */
const getZodiacByBranch = (branch) => {
  if (!branch) return undefined;
  return Object.values(CHINESE_ZODIAC).find(zodiac => zodiac.branch && zodiac.branch.name === branch);
};

/**
 * 处理JS负数取模问题（复用共享实现）
 */
const mod = sharedMod;

/**
 * 从双向配对规则中查找对应地支
 */
const findPairBranch = (rules, branch) => {
  for (const pair of rules) {
    if (pair.includes(branch)) {
      return pair[0] === branch ? pair[1] : pair[0];
    }
  }
  return null;
};

/**
 * 查找三合地支（排除自身）
 */
const findSanHeBranches = (branch) => {
  for (const group of HE_SAN_RULES) {
    if (group.includes(branch)) {
      return group.filter(item => item !== branch);
    }
  }
  return [];
};

/**
 * 查找双向刑太岁地支
 * 注：`XING_RULES` 复用共享模块，键名为中文（无恩之刑 / 恃势之刑 / 无礼之刑 / 自刑）。
 */
const findXingBranches = (branch) => {
  const xingList = [];
  for (const [name, group] of Object.entries(XING_RULES)) {
    if (!group.includes(branch)) continue;
    if (name === '自刑') {
      xingList.push(branch);
    } else {
      xingList.push(...group.filter(item => item !== branch));
    }
  }
  return xingList;
};

/**
 * 通用构造方法
 *
 * 约定：`mainBranch` / `branchList` 里的元素一律是**单个汉字**（'子'、'丑'…），
 * 与共享模块 `ganzhiRelation.js` 保持一致；这里不再用 `{ name }` 包一层。
 */
const buildTaiSuiVoWithList = (type, mainBranch, branchList, isSanHe) => {
  const mainZodiac = getZodiacByBranch(mainBranch);
  // 有多个就添加icon图标
  const more = branchList.length > 1;
  // 拼接「生肖(地支)」格式，顿号分隔
  const zodiacInfo = branchList.map(item => {
    const zodiac = getZodiacByBranch(item);
    return `${item}(${zodiac.name}${zodiac.icon})`;
  }).join('、');

  const zodiacList = branchList.map(item => {
    const zodiac = getZodiacByBranch(item);
    return { zodiac, branchName: item };
  });

  let desc = '';
  if (isSanHe) {
    desc = `${type.name}：${mainBranch}(${mainZodiac.name}) 合局: ${zodiacInfo}`;
  } else {
    desc = `${type.name}：${zodiacInfo}`;
  }

  return {
    type: type,
    earthlyBranch: mainBranch,
    zodiac: more ? mainZodiac : (getZodiacByBranch(branchList[0]) || mainZodiac), // 这里的zodiac包含icon字段
    desc: desc,
    zodiacList: zodiacList || []
  };
};

/**
 * 基础构造方法（`branch` 为单个汉字，如 '子'）
 */
const buildBaseTaiSuiVo = (type, branch) => {
  const zodiac = getZodiacByBranch(branch);
  const zodiacList = [];
  zodiacList.push({ zodiac, branchName: branch });
  return {
    type: type,
    earthlyBranch: branch,
    zodiac: zodiac, // 这里的zodiac包含icon字段
    desc: `${type.name}：${branch}(${zodiac.name}${zodiac.icon})`,
    zodiacList
  };
};

// ===================== 核心业务方法 =====================
/**
 * 根据年份获取干支
 */
export const getYearGanZhi = (year) => {
  if (year < 1) {
    throw new Error('暂不支持公元前年份计算');
  }
  const stems = Object.values(HEAVENLY_STEMS);
  const branches = Object.values(EARTHLY_BRANCHES);
  const stemOffset = year - 4;
  const stemIndex = mod(stemOffset, 10);
  const branchOffset = year - 4;
  const branchIndex = mod(branchOffset, 12);
  return stems[stemIndex].name + branches[branchIndex].name;
};

/**
 * 从干支解析地支（返回**单个汉字**，如 '子'）
 */
export const parseBranchFromGanZhi = (ganZhi) => {
  if (!ganZhi || ganZhi.length !== 2) {
    throw new Error('年干支格式错误，必须为2个字符（如甲辰）');
  }
  return ganZhi.charAt(1);
};

/**
 * 根据年份获取太岁信息
 */
export const getTaiSuiInfoByYear = (year) => {
  const taiSuiList = [];
  const ganZhi = getYearGanZhi(year);
  const yearBranch = parseBranchFromGanZhi(ganZhi);

  taiSuiList.push(buildBaseTaiSuiVo(TAI_SUI_TYPE.ZHI_TAI_SUI, yearBranch));

  const chongBranch = findPairBranch(CHONG_RULES, yearBranch);
  if (chongBranch) {
    taiSuiList.push(buildBaseTaiSuiVo(TAI_SUI_TYPE.CHONG_TAI_SUI, chongBranch));
  }

  const haiBranch = findPairBranch(HAI_RULES, yearBranch);
  if (haiBranch) {
    taiSuiList.push(buildBaseTaiSuiVo(TAI_SUI_TYPE.HAI_TAI_SUI, haiBranch));
  }

  const xingBranches = findXingBranches(yearBranch);
  if (xingBranches.length > 0) {
    taiSuiList.push(buildTaiSuiVoWithList(TAI_SUI_TYPE.XING_TAI_SUI, yearBranch, xingBranches, false));
  }

  const poBranch = findPairBranch(PO_RULES, yearBranch);
  if (poBranch) {
    taiSuiList.push(buildBaseTaiSuiVo(TAI_SUI_TYPE.PO_TAI_SUI, poBranch));
  }

  const heLiuBranch = findPairBranch(HE_LIU_RULES, yearBranch);
  if (heLiuBranch) {
    taiSuiList.push(buildBaseTaiSuiVo(TAI_SUI_TYPE.HE_LIU_TAI_SUI, heLiuBranch));
  }

  const sanHeBranches = findSanHeBranches(yearBranch);
  if (sanHeBranches.length > 0) {
    taiSuiList.push(buildTaiSuiVoWithList(TAI_SUI_TYPE.HE_SAN_TAI_SUI, yearBranch, sanHeBranches, true));
  }

  return taiSuiList;
};

// 新增：根据年份获取生肖（含icon），供页面调用
export const getZodiacByYear = (year) => {
  const branchOffset = year - 4;
  const branchIndex = mod(branchOffset, 12);
  const branches = Object.values(EARTHLY_BRANCHES);
  return getZodiacByBranch(branches[branchIndex].name);
};

// 导出默认对象
export default {
  getYearGanZhi,
  parseBranchFromGanZhi,
  getTaiSuiInfoByYear,
  getZodiacByYear, // 新增导出
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  CHINESE_ZODIAC,
  TAI_SUI_TYPE
};