/**
 * 八字「原局结构」分析层
 * ================
 * 把四柱内部**客观存在的结构**摊开来看，共四类：
 *   1. 关系矩阵 —— 地支两两（六合 / 六冲 / 六害 / 六破 / 相刑 / 自刑）、天干两两（五合 / 相冲）
 *   2. 成局与半合 —— 三合局 / 三会方 / 生旺半合 / 墓半合 / 拱合 / 半会 / 拱会
 *   3. 透干 —— 地支藏干出现在四柱天干上（取格取用的入口信息）
 *   4. 通根 —— 每个天干在四支中的根（本气 / 中气 / 余气，同字之根最实）
 *
 * **边界（重要）**：本层只列客观信息，不判断
 *   - 合而化不化（各派分歧极大）
 *   - 成局力量有多大、是否真能成势
 *   - 取何格局（月令本气取格 / 透干取格 / 司权取格，三法互异）
 * 这些都是判断层的事，须并列呈现，不给单一结论 —— 与全站「不替用户下断语」的做法一致。
 *
 * 关系判定本身不在本文件：统一走 `ganzhiRelation.relationMatrix`，
 * 那是「原局结构」与「流年 / 流月」共用的同一个内核。
 */

import {
  DZ_CANG_GAN, TG_TO_ELEMENT, splitGanZhi, relationMatrix
} from './ganzhiRelation.js';

import { getTenGod, getRoots, strongestRoot } from './baziUtils.js';

export const POSITIONS = ['年', '月', '日', '时'];

/**
 * 四柱干支 → 带位置标签的柱（`relationMatrix` 的输入形状）。
 * 流年 / 流月也用它构造自己的柱，故导出。
 */
export const toPillars = (ganZhiList, positions = POSITIONS) =>
  (ganZhiList || []).map((gz, i) => {
    const { stem, branch } = splitGanZhi(gz);
    return { pos: positions[i] || ('#' + i), stem, branch, ganZhi: gz };
  });

/** 藏干序位 → 名称 */
const QI_TYPE = ['本气', '中气', '余气'];

/**
 * 透干：逐个地支检查其藏干是否出现在四柱天干上。
 *
 * 传统论格最重「月令人元透出」，但**哪些字算透、透了如何取用**属判断层；
 * 这里只客观标出「某藏干在某几柱天干上出现了」。
 */
export const analyzeTouGan = (pillars, dayGan) => {
  const stems = pillars.map((p) => p.stem);
  return pillars.map((p) => ({
    pos: p.pos,
    branch: p.branch,
    // 月支即月令 —— 取格时最先看的位置，单独标出便于界面强调
    isMonthLing: p.pos === '月',
    cang: (DZ_CANG_GAN[p.branch] || []).map((gan, qi) => {
      const at = [];
      stems.forEach((s, i) => {
        if (s === gan) at.push({ pos: pillars[i].pos, stem: s });
      });
      return {
        gan,
        qiType: QI_TYPE[qi] || '',
        element: TG_TO_ELEMENT[gan] || '',
        god: getTenGod(dayGan, gan),
        exposed: at.length > 0,
        exposedAt: at
      };
    })
  }));
};

/**
 * 通根：逐个天干列出它在四支里的根。
 *
 * 按**同五行**论根（甲、乙同属木），另用 `sameStemRoots` 挑出同字之根。
 * `zuoZhi` 单独记天干所坐的那一支是否为其根 —— 「坐下有根」与否最常被引用。
 */
export const analyzeTongGen = (pillars) => {
  const branches = pillars.map((p) => p.branch);
  return pillars.map((p, i) => {
    const roots = getRoots(p.stem, branches);
    const sitLabel = (pillars[i].pos || '') + '支';
    return {
      pos: p.pos,
      stem: p.stem,
      branch: p.branch,
      element: TG_TO_ELEMENT[p.stem] || '',
      roots,
      sameStemRoots: roots.filter((r) => r.isSameStem),
      strongest: strongestRoot(roots),
      rooted: roots.length > 0,
      // 坐支（同柱地支）是否为本干之根
      zuoZhi: {
        branch: p.branch,
        hasRoot: roots.some((r) => r.pos === sitLabel),
        root: roots.find((r) => r.pos === sitLabel) || null
      }
    };
  });
};

/**
 * 原局结构全景。
 *
 * @param {string[]} ganZhiList 四柱干支 [年, 月, 日, 时]
 * @returns {Object} { pillars, dayGan, matrix, touGan, tongGen, summary }
 */
export const analyzeStructure = (ganZhiList) => {
  const pillars = toPillars(ganZhiList);
  const stems = pillars.map((p) => p.stem);
  const branches = pillars.map((p) => p.branch);
  const dayGan = stems[2] || '';

  // 关系矩阵：内部两两 + 成局 + 半合（内核；此处不传 focus，即整盘自查）
  const matrix = relationMatrix(pillars);

  const touGan = analyzeTouGan(pillars, dayGan);
  const tongGen = analyzeTongGen(pillars);

  const exposedCount = touGan.reduce((n, t) => n + t.cang.filter((c) => c.exposed).length, 0);
  const rootedCount = tongGen.filter((t) => t.rooted).length;

  return {
    pillars,
    stems,
    branches,
    dayGan,
    matrix,
    touGan,
    tongGen,
    summary: {
      heCount: matrix.branchPairs.filter((p) => p.relations.some((r) => r.tone === 'he')).length,
      chongCount: matrix.branchPairs.filter((p) => p.relations.some((r) => r.tone === 'chong')).length,
      stemPairCount: matrix.stemPairs.length,
      formationCount: matrix.formations.length,
      halfCount: matrix.halves.length,
      exposedCount,
      rootedCount
    }
  };
};

export default {
  POSITIONS,
  toPillars,
  analyzeTouGan,
  analyzeTongGen,
  analyzeStructure
};
