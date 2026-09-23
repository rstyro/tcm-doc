<template>
  <div v-if="hasData">
    <!-- 大运 -->
    <div class="analysis-section">
      <h3 class="section-title">大运</h3>
      <div class="dayun-head">
        <span class="dayun-dir">{{ daYunMeta.directionLabel }}</span>
        <span class="dayun-reason">{{ daYunMeta.reason }}</span>
        <span class="dayun-start" v-if="daYunMeta.startDetail">
          起运约 {{ daYunMeta.startDetail.years }} 岁
          {{ daYunMeta.startDetail.months }} 个月
          {{ daYunMeta.startDetail.days }} 天
        </span>
        <span class="dayun-start missing" v-else>起运：节气数据不足，无法推算</span>
      </div>

      <div class="dayun-grid">
        <button
            class="dayun-item"
            v-for="(d, i) in daYunList"
            :key="'dy' + d.step"
            :class="{ active: i === activeDaYun }"
            @click="activeDaYun = i"
        >
          <div class="dayun-age">{{ d.ageFrom }} 岁</div>
          <div class="dayun-gz">{{ d.ganZhi }}</div>
          <div class="dayun-god">{{ d.tenGod }}</div>
          <div class="dayun-year" v-if="d.range">{{ d.range.from }}–{{ d.range.to }}</div>
        </button>
      </div>

      <div class="rel-panel" v-if="currentDaYun">
        <div class="rel-panel-head">
          {{ currentDaYun.ganZhi }} 大运（{{ currentDaYun.tenGod }}）与原局
        </div>
        <div class="rel-chips">
          <span
              class="rel-chip"
              v-for="(it, i) in currentDaYun.tags"
              :key="'dt' + i"
              :class="'tone-' + it.tone"
          >{{ it.text }}</span>
          <span class="rel-none" v-if="!currentDaYun.tags.length">此步大运与原局无刑冲合害</span>
        </div>
      </div>

      <p class="section-caveat">{{ daYunMeta.caveat }}</p>
    </div>

    <!-- 流年 -->
    <div class="analysis-section" v-if="liuNian.length">
      <h3 class="section-title">流年 · {{ currentDaYun.ganZhi }} 运内</h3>

      <div class="ln-grid">
        <button
            class="ln-item"
            v-for="n in liuNian"
            :key="'ln' + n.year"
            :class="{ active: n.year === activeYear, now: n.year === thisYear }"
            @click="activeYear = n.year"
        >
          <div class="ln-year">{{ n.year }}</div>
          <div class="ln-gz">{{ n.ganZhi }}</div>
          <div class="ln-god">{{ n.tenGod }}</div>
          <div class="ln-mark" :class="{ zero: !n.rel || !n.rel.total }">
            {{ n.rel && n.rel.total ? n.rel.total + ' 关系' : '无关系' }}
          </div>
        </button>
      </div>

      <div class="rel-panel" v-if="currentLiuNian">
        <div class="rel-panel-head">
          {{ currentLiuNian.year }} 年 {{ currentLiuNian.ganZhi }}
          （{{ currentLiuNian.tenGod }}·{{ currentLiuNian.zodiac }}）与原局
        </div>
        <div class="rel-chips">
          <span
              class="rel-chip"
              v-for="(it, i) in currentLiuNian.tags"
              :key="'nt' + i"
              :class="'tone-' + it.tone"
          >{{ it.text }}</span>
          <span class="rel-none" v-if="!currentLiuNian.tags.length">此流年与原局无刑冲合害</span>
        </div>
      </div>
    </div>

    <!-- 流月 -->
    <div class="analysis-section" v-if="liuYue.length">
      <h3 class="section-title">流月 · {{ currentLiuNian.year }} 年</h3>
      <div class="ly-list">
        <div class="ly-row" v-for="m in liuYue" :key="'ly' + m.index">
          <div class="ly-main">
            <span class="ly-label">{{ m.label }}</span>
            <span class="ly-gz">{{ m.ganZhi }}</span>
            <span class="ly-god">{{ m.tenGod }}</span>
            <span class="ly-jie">{{ m.jie }}</span>
            <span class="ly-date">{{ fmtDate(m.start) }}</span>
          </div>
          <div class="rel-chips">
            <span
                class="rel-chip"
                v-for="(it, i) in m.tags"
                :key="'mt' + i"
                :class="'tone-' + it.tone"
            >{{ it.text }}</span>
            <span class="rel-none" v-if="!m.tags.length">—</span>
          </div>
        </div>
      </div>
      <p class="section-caveat">
        月支自寅月起（立春→寅、惊蛰→卯 …… 小寒→丑），岁首为<strong>立春</strong>而非正月初一。
        腊月之后即次年立春，故末月不显示结束日。
      </p>
    </div>

    <!-- 引动点：把「这一柱到底动了原局的哪里」单独拎出来 -->
    <div class="analysis-section" v-if="activations.length">
      <h3 class="section-title">引动点</h3>
      <p class="act-intro">
        同一柱与原局的关系里，传统最看重它<strong>动到了哪个位置</strong>：月令是取格取用之所、
        日支是日主所坐之地（夫妻宫），故这两处单独标出；与日干相合相冲则是直接作用于日主的一层。
      </p>

      <div class="act-block" v-for="(a, i) in activations" :key="'ac' + i">
        <div class="act-head">
          <span class="act-title">{{ a.heading }}</span>
          <span class="act-count" :class="{ hot: a.hasKeyHit }">
            {{ a.hasKeyHit ? '动及要害' : '未及月令日支' }}
          </span>
        </div>

        <div class="act-list" v-if="a.hits.length">
          <div class="act-item" v-for="(h, j) in a.hits" :key="'ah' + j" :class="{ key: h.isKey }">
            <span class="act-kind">{{ h.kind }}</span>
            <span class="act-target">{{ h.targetLabel }}</span>
            <span class="act-char">{{ h.targetChar }}</span>
            <span class="rel-chip" :class="'tone-' + h.tone" v-for="(t, k) in h.types" :key="'at' + k">
              {{ t }}
            </span>
            <span class="act-note" v-if="h.targetNote">{{ h.targetNote }}</span>
          </div>
        </div>
        <p class="rel-none" v-else>此柱与原局不见刑冲合害。</p>

        <div class="act-extra tkdc" v-if="a.tianKeDiChong.length">
          <span class="extra-tag">天克地冲</span>
          <span class="extra-item" v-for="(x, j) in a.tianKeDiChong" :key="'tk' + j">
            {{ x.posLabel }}（{{ x.original }}）—— {{ x.note }}
          </span>
        </div>

        <div class="act-extra fuyin" v-if="a.fuYin.length">
          <span class="extra-tag">伏吟 · 值太岁</span>
          <span class="extra-item" v-for="(x, j) in a.fuYin" :key="'fy' + j">
            与{{ x.posLabel }}同{{ x.char }}（同支，传统称伏吟）
          </span>
        </div>
      </div>

      <p class="section-caveat">
        这里标注的是「<strong>关系落在哪个位置</strong>」这一层事实与传统的看重程度，
        仍然<strong>不判吉凶</strong> —— 冲月令是破是发、合日支是助是绊，各派结论相反，故不下断语。
      </p>
    </div>

    <div class="analysis-section">
      <p class="section-caveat">
        此处只列出<strong>大运 / 流年 / 流月与原局发生了哪些关系</strong>，不判断吉凶。
        「冲了月令是破格还是激发」「合住忌神是否转吉」这类论断各派分歧极大，
        同一组关系在不同流派可以得出相反结论，故不代下断语。
      </p>
    </div>
  </div>

  <div v-else class="plain-note pad">
    节气数据不足，无法推算大运与流年。
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import SolarTerm from '../utils/SolarTerm.js';
import T from '../utils/baziTimeline.js';

const props = defineProps({
  result: { type: Object, default: null },
  analysis: { type: Object, default: null },
  birthYear: { type: Number, default: null }
});

const solarTerm = new SolarTerm();
const thisYear = new Date().getFullYear();

const gzList = computed(() => {
  const r = props.result;
  if (!r) return [];
  return [r.yearGanZhi, r.monthGanZhi, r.dayGanZhi, r.hourGanZhi].filter(Boolean);
});

const dayGan = computed(() =>
  props.analysis && props.analysis.dayGan ? props.analysis.dayGan : (gzList.value[2] || '').charAt(0));

/**
 * 一柱与原局的关系 → 展示用的标签数组。
 * 这些都是**客观关系**（谁与谁成立六冲 / 六合 / 成局），不含吉凶判断。
 */
const describe = (rel) => {
  if (!rel) return [];
  const items = [];
  const pc = (p) => p.pos + p.char;
  rel.realPairs.forEach((p) => p.relations.forEach((r) =>
    items.push({ text: `${pc(p.a)}—${pc(p.b)} ${r.type}`, tone: r.tone })));
  rel.stemPairs.forEach((p) => p.relations.forEach((r) =>
    items.push({ text: `${pc(p.a)}—${pc(p.b)} ${r.type}`, tone: r.tone })));
  rel.formations.forEach((f) =>
    items.push({ text: `${f.type} ${f.group} 成${f.element}局`, tone: 'he' }));
  rel.halves.forEach((h) =>
    items.push({ text: `${h.kind} ${h.group}`, tone: 'he' }));
  rel.sameBranch.forEach((p) =>
    items.push({ text: `与原局${p.a.pos}支同字（伏吟）`, tone: 'neutral' }));
  return items;
};

const daYunMeta = computed(() => (props.analysis && props.analysis.daYun) || {});

/**
 * 大运步 → 覆盖的公历年份。
 * 映射规则在 `baziTimeline.daYunRanges`（推演栏也要用同一份，故不在组件里另写一份）。
 */
const daYunList = computed(() => T.daYunRanges(daYunMeta.value, props.birthYear));

const activeDaYun = ref(0);

const currentDaYun = computed(() => {
  const d = daYunList.value[activeDaYun.value];
  if (!d) return null;
  return { ...d, tags: describe(T.relationsWithOriginal(gzList.value, d.ganZhi, '大运')) };
});

const currentRange = computed(() => {
  const d = daYunList.value[activeDaYun.value];
  return d ? d.range : null;
});

const liuNian = computed(() => {
  const range = currentRange.value;
  if (!range || !dayGan.value || gzList.value.length !== 4) return [];
  const list = T.computeLiuNian({
    from: range.from, to: range.to,
    dayGan: dayGan.value,
    birthYear: props.birthYear
  });
  return list.map((n) => {
    const rel = T.relationsWithOriginal(gzList.value, n.ganZhi, '流年');
    return { ...n, rel, tags: describe(rel) };
  });
});

const activeYear = ref(null);

// 默认选该步大运的第一年（而不是「今年」）—— 保证前后端渲染结果一致，避免水合不匹配
watch(liuNian, (list) => {
  if (!list.length) { activeYear.value = null; return; }
  if (!list.some((n) => n.year === activeYear.value)) activeYear.value = list[0].year;
}, { immediate: true });

const currentLiuNian = computed(() =>
  liuNian.value.find((n) => n.year === activeYear.value) || null);

const liuYue = computed(() => {
  const n = currentLiuNian.value;
  if (!n || !dayGan.value) return [];
  let terms = [];
  try {
    terms = solarTerm.getSolarTermDate(n.year) || [];
  } catch (err) {
    terms = [];
  }
  return T.computeLiuYue({ yearGanZhi: n.ganZhi, termDates: terms, dayGan: dayGan.value })
    .map((m) => {
      const rel = T.relationsWithOriginal(gzList.value, m.ganZhi, '流月');
      return { ...m, rel, tags: describe(rel) };
    });
});

const hasData = computed(() => gzList.value.length === 4 && daYunList.value.length > 0);

/**
 * 引动点：某一柱「动到了原局的哪里」。
 * 只标位置与关系（客观），并注明传统上哪几处最被看重 —— 不判吉凶。
 */
const mkActivation = (ganZhi, label, heading) => {
  if (!ganZhi || gzList.value.length !== 4) return null;
  const a = T.findKeyActivations(gzList.value, ganZhi, label);
  return a ? { ...a, heading } : null;
};

const activations = computed(() => {
  const dy = currentDaYun.value;
  const ln = currentLiuNian.value;
  return [
    dy ? mkActivation(dy.ganZhi, '大运', `${dy.ganZhi} 大运（${dy.tenGod}）`) : null,
    ln ? mkActivation(ln.ganZhi, '流年', `${ln.year} 年 ${ln.ganZhi}（${ln.tenGod}）`) : null
  ].filter(Boolean);
});

const fmtDate = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return (x.getMonth() + 1) + '/' + x.getDate();
};
</script>

<style scoped>
.analysis-section {
  margin-top: 28px;
  padding-top: 28px;
  border-top: 2px solid var(--bz-border);
}

.analysis-section:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.section-title {
  font-size: var(--bz-fs-5);
  color: var(--bz-text-1);
  margin: 0 0 20px;
  font-weight: 600;
  padding-left: 12px;
  border-left: 4px solid var(--bz-blue-border-accent-deep);
}

.section-caveat {
  margin: 16px 0 0;
  padding: 12px 16px;
  background: var(--bz-surface);
  border-left: 3px solid var(--bz-blue-border-alt);
  border-radius: var(--bz-r-sm);
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.section-caveat strong { color: var(--bz-text-2); }

.plain-note {
  margin: 0;
  color: var(--bz-text-4);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.plain-note.pad { padding: 24px 0; }

/* ===== 大运 ===== */
.dayun-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  font-size: var(--bz-fs-2);
}

.dayun-dir {
  padding: 4px 12px;
  background: var(--bz-blue-bg);
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: var(--bz-r-sm);
  color: var(--bz-blue-text);
  font-weight: 500;
}

.dayun-reason { color: var(--bz-text-2); }

.dayun-start { color: var(--bz-text-3); }
.dayun-start.missing { color: var(--bz-red-text); }

.dayun-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 12px;
}

.dayun-item {
  padding: 12px 8px;
  text-align: center;
  background: var(--bz-surface-1);
  border: 1px solid var(--bz-border);
  border-radius: var(--bz-r-sm);
  transition: background-color, border-color, box-shadow 0.2s ease;
  cursor: pointer;
  font-family: inherit;
}

.dayun-item:hover { border-color: var(--bz-blue-border-accent-deep); }

.dayun-item.active {
  border-color: var(--bz-blue-border-accent-deep);
  background: var(--bz-blue-bg);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.12);
}

.dayun-age { font-size: var(--bz-fs-1); color: var(--bz-text-3); }

.dayun-gz {
  font-size: var(--bz-fs-5);
  font-weight: 600;
  color: var(--bz-text-1);
  margin: 4px 0;
  letter-spacing: 2px;
}

.dayun-god { font-size: var(--bz-fs-1); color: var(--bz-blue-text); }
.dayun-year { font-size: var(--bz-fs-1); color: var(--bz-text-3); margin-top: 4px; }

/* ===== 流年 ===== */
.ln-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.ln-item {
  padding: 12px 8px;
  text-align: center;
  background: var(--bz-surface-1);
  border: 1px solid var(--bz-border);
  border-radius: var(--bz-r-sm);
  cursor: pointer;
  transition: background-color, border-color, box-shadow 0.2s ease;
  font-family: inherit;
  position: relative;
}

.ln-item:hover { border-color: var(--bz-blue-border-accent-deep); }

.ln-item.active {
  border-color: var(--bz-blue-border-accent-deep);
  background: var(--bz-blue-bg);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.12);
}

.ln-item.now::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bz-amber-fill);
}

.ln-year { font-size: var(--bz-fs-1); color: var(--bz-text-3); }
.ln-gz { font-size: var(--bz-fs-4); font-weight: 600; color: var(--bz-text-1); margin: 4px 0; }
.ln-god { font-size: var(--bz-fs-1); color: var(--bz-blue-text); }
.ln-mark { font-size: 0.7rem; color: var(--bz-green-text); margin-top: 4px; }
.ln-mark.zero { color: var(--bz-text-4); }

/* ===== 关系面板 ===== */
.rel-panel {
  padding: 12px 16px;
  background: var(--bz-surface-1);
  border: 1px solid var(--bz-border);
  border-radius: 12px;
  margin-bottom: 8px;
}

.rel-panel-head {
  font-size: var(--bz-fs-2);
  font-weight: 500;
  color: var(--bz-text-1);
  margin-bottom: 8px;
}

.rel-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rel-chip {
  padding: 4px 8px;
  border-radius: var(--bz-r-sm);
  font-size: var(--bz-fs-1);
  white-space: nowrap;
}

.rel-chip.tone-he { background: var(--bz-green-tint); border: 1px solid var(--bz-green-border-2); color: var(--bz-green-text); }
.rel-chip.tone-chong { background: var(--bz-danger-bg); border: 1px solid var(--bz-danger-border); color: var(--bz-red-text); }
.rel-chip.tone-neutral { background: var(--bz-surface); border: 1px solid var(--bz-border); color: var(--bz-text-3); }

.rel-none { font-size: var(--bz-fs-1); color: var(--bz-text-4); }

/* ===== 流月 ===== */
.ly-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ly-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bz-surface-1);
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: var(--bz-r-sm);
  flex-wrap: wrap;
}

.ly-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 268px;
  flex: 0 0 auto;
}

.ly-label { font-size: var(--bz-fs-1); color: var(--bz-text-3); }
.ly-gz { font-size: var(--bz-fs-4); font-weight: 600; color: var(--bz-text-1); letter-spacing: 1px; }
.ly-god { font-size: var(--bz-fs-1); color: var(--bz-blue-text); }
.ly-jie { font-size: var(--bz-fs-1); color: var(--bz-text-3); }
.ly-date { font-size: var(--bz-fs-1); color: var(--bz-text-4); }

/* ===== 引动点 ===== */
.act-intro {
  margin: 0 0 16px;
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.act-intro strong { color: var(--bz-text-2); }

.act-block {
  padding: 12px 16px;
  border: 1px solid var(--bz-border);
  border-radius: 12px;
  background: var(--bz-surface-1);
  margin-bottom: 12px;
}

.act-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.act-title {
  font-size: var(--bz-fs-2);
  font-weight: 600;
  color: var(--bz-text-1);
}

.act-count {
  font-size: var(--bz-fs-1);
  padding: 4px 8px;
  border-radius: 20px;
  background: var(--bz-blue-tint);
  color: var(--bz-blue-fg-soft);
  border: 1px solid var(--bz-blue-border-alt);
}

.act-count.hot {
  background: var(--bz-danger-bg);
  color: var(--bz-red-text);
  border-color: var(--bz-danger-border);
}

.act-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.act-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  font-size: var(--bz-fs-1);
}

.act-item.key {
  background: var(--bz-amber-tint);
  border-color: var(--bz-amber-border);
}

.act-kind {
  font-size: 0.7rem;
  padding: 0px 8px;
  border-radius: 4px;
  background: var(--bz-blue-tint);
  color: var(--bz-blue-fg);
}

.act-target { color: var(--bz-text-2); }

.act-char {
  font-size: var(--bz-fs-3);
  font-weight: 700;
  color: var(--bz-text-1);
}

.act-note {
  color: var(--bz-text-4);
  font-size: var(--bz-fs-1);
}

.act-extra {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
}

.act-extra.tkdc {
  background: var(--bz-danger-bg);
  border: 1px solid var(--bz-danger-border);
}

.act-extra.fuyin {
  background: var(--bz-surface);
  border: 1px solid var(--bz-border);
}

.extra-tag {
  flex: 0 0 auto;
  font-weight: 700;
  font-size: var(--bz-fs-1);
}

.act-extra.tkdc .extra-tag, .act-extra.tkdc .extra-item { color: var(--bz-red-fg-vivid-mid); }
.act-extra.fuyin .extra-tag, .act-extra.fuyin .extra-item { color: var(--bz-blue-fg-mid); }@container gz (max-width: 560px) {
  .ln-grid {
 grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); 
  }
  .ly-main {
 min-width: auto; 
  }
}
</style>
