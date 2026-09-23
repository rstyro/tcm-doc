<template>
  <div v-if="inference">
    <!-- ============ 本栏性质声明：全站争议最大的一层 ============ -->
    <div class="analysis-section">
      <h3 class="section-title">关于本栏</h3>

      <div class="ladder">
        <div class="ladder-step">
          <span class="ladder-name">四柱 · 结构 · 时间</span>
          <span class="ladder-tag fact">客观</span>
          <span class="ladder-text">排盘结果、字与字的关系、干支序列 —— 没有争议。</span>
        </div>
        <div class="ladder-step">
          <span class="ladder-name">论断</span>
          <span class="ladder-tag judge">判断</span>
          <span class="ladder-text">取何格局、用何用神 —— 诸说并列，不给答案。</span>
        </div>
        <div class="ladder-step current">
          <span class="ladder-name">推演</span>
          <span class="ladder-tag infer">争议最大</span>
          <span class="ladder-text">格之成破、用神落点、十神引动 —— 各家自有一套体系，彼此并不兼容。</span>
        </div>
      </div>

      <div class="rule-box">
        <div class="rule-head">本栏的三条硬约束</div>
        <ul class="rule-list">
          <li><strong>不产出吉凶词。</strong>本栏不给「吉 / 凶 / 利 / 不利」任何结论，只做<strong>对应关系</strong>的呈现。传统所谓吉凶，各派对同一十神往往判然相反。</li>
          <li><strong>一切结论可回溯到判据。</strong>每条「成格之据 / 破格之嫌」都注明是哪个十神、落在哪一柱、透干还是藏干、引的是哪一派说法。</li>
          <li><strong>计数不等于结论。</strong>「相神见几处、忌神见几处」只是算术；一处忌神即可坏格，多处相神亦未必有力。</li>
        </ul>
      </div>
    </div>

    <!-- ============ 格局成破 ============ -->
    <div class="analysis-section" v-if="chengPo">
      <h3 class="section-title">格局成破</h3>
      <p class="sub-intro">
        格局既立，还须有字来<strong>辅</strong>它 —— 传统称此字为<strong>相神</strong>：
        相神得用为<strong>成</strong>，被伤为<strong>破</strong>。下面把每一个格局候选各自走一遍。
      </p>

      <div class="month-banner" :class="'lvl-' + monthHurt.level" v-if="monthHurt">
        <div class="month-head">
          <span class="month-tag">{{ monthHurt.levelLabel }}</span>
          <span class="month-branch">月令 {{ monthHurt.branch }}</span>
        </div>
        <div class="month-items" v-if="monthHurt.items.length">
          <span class="month-item" v-for="(h, i) in monthHurt.items" :key="'mh' + i">
            {{ h.char }}（{{ h.pos }}支）· {{ h.type }}
          </span>
        </div>
        <div class="month-why">{{ monthHurt.note }}</div>
      </div>

      <div class="cp-list">
        <div class="cp-card" v-for="(c, i) in chengPo.items" :key="'cp' + i">
          <div class="cp-head">
            <span class="cp-idx">{{ i + 1 }}</span>
            <span class="cp-name">{{ c.name }}</span>
            <span class="school-tag">{{ c.school }}</span>
            <span class="cp-gan" v-if="c.gan">{{ c.gan }} · {{ c.god }}</span>
          </div>
          <div class="cp-basis">{{ c.basis }}</div>

          <div class="cp-block" v-if="c.cheng.length">
            <div class="cp-block-label cheng">成格之据（相神一路）</div>
            <div class="cp-row" v-for="(e, j) in c.cheng" :key="'cy' + i + '-' + j">
              <span class="cp-god">{{ e.god }}</span>
              <span class="cp-why">{{ e.why }}</span>
              <span class="hit-list">
                <span class="hit-chip" v-for="(h, k) in e.hits" :key="'ch' + i + j + k"
                      :class="{ benqi: h.isBenQi, gan: h.kind === '天干' }">
                  {{ h.pos }}{{ h.kind === '天干' ? '干' : '支' }} {{ h.char }}
                  <span class="hit-kind" v-if="h.kind === '藏干'">{{ h.qiType }}</span>
                </span>
              </span>
            </div>
          </div>
          <p class="cp-none" v-else>本盘未见通常视为相神的十神。</p>

          <div class="cp-block" v-if="c.po.length">
            <div class="cp-block-label po">破格之嫌（忌神一路）</div>
            <div class="cp-row" v-for="(e, j) in c.po" :key="'po' + i + '-' + j">
              <span class="cp-god po">{{ e.god }}</span>
              <span class="cp-po-name" v-if="e.name">{{ e.name }}</span>
              <span class="cp-why">{{ e.why }}</span>
              <span class="hit-list">
                <span class="hit-chip warn" v-for="(h, k) in e.hits" :key="'ph' + i + j + k"
                      :class="{ benqi: h.isBenQi, gan: h.kind === '天干' }">
                  {{ h.pos }}{{ h.kind === '天干' ? '干' : '支' }} {{ h.char }}
                  <span class="hit-kind" v-if="h.kind === '藏干'">{{ h.qiType }}</span>
                </span>
              </span>
            </div>
          </div>
          <p class="cp-none" v-else>本盘未见通常视为伤格的十神。</p>

          <div class="cp-count">
            相神见 <strong>{{ c.counts.cheng }}</strong> 处（{{ c.counts.chengKinds }} 类）·
            忌神见 <strong>{{ c.counts.po }}</strong> 处（{{ c.counts.poKinds }} 类）
            <span class="count-warn">—— 仅为计数，多寡不决定成破</span>
          </div>
          <p class="cp-note">{{ c.note }}</p>
        </div>
      </div>

      <ul class="note-list">
        <li v-for="(n, i) in chengPo.notes" :key="'cn' + i">{{ n }}</li>
      </ul>
    </div>

    <!-- ============ 用神落点 ============ -->
    <div class="analysis-section" v-if="footing">
      <h3 class="section-title">用神落点</h3>
      <p class="sub-intro">
        取用之后，接着看它<strong>落在哪里</strong>：透在干上还是仅藏于支、有无本气根、
        谁生它、谁克它。这一层比取用本身客观得多 —— 位置与字都是看得见的。
      </p>

      <div class="foot-group" v-for="(g, gi) in footing.groups" :key="'fg' + gi">
        <div class="foot-group-name">{{ g.source }}</div>
        <div class="foot-list">
          <div class="foot-card" v-for="(it, i) in g.items" :key="'ft' + gi + '-' + i">
            <div class="foot-head">
              <span class="role-tag">{{ it.tier }}</span>
              <span class="foot-el" :class="'el-' + it.element">{{ it.element }}</span>
              <span class="foot-gods">{{ it.gods.join(' · ') || '—' }}</span>
              <span class="foot-level" :class="'lv-' + it.footing.level">{{ it.footing.label }}</span>
              <span class="day-tag" v-if="it.isDayElement">即日主本身</span>
            </div>
            <div class="foot-rows">
              <div class="foot-row">
                <span class="foot-key">透干</span>
                <span class="foot-val" v-if="it.footing.stems.length">
                  <span class="hit-chip gan" v-for="(s, j) in it.footing.stems" :key="'fs' + i + j">
                    {{ s.pos }}干 {{ s.char }}
                  </span>
                </span>
                <span class="foot-val muted" v-else>无</span>
              </div>
              <div class="foot-row">
                <span class="foot-key">通根</span>
                <span class="foot-val" v-if="it.footing.roots.length">
                  <span class="hit-chip" v-for="(r, j) in it.footing.roots" :key="'fr' + i + j"
                        :class="{ benqi: r.qiType === '本气' }">
                    {{ r.pos }}支 {{ r.char }}<span class="hit-kind">{{ r.qiType }}</span>
                  </span>
                </span>
                <span class="foot-val muted" v-else>无</span>
              </div>
              <div class="foot-row">
                <span class="foot-key">有源</span>
                <span class="foot-val" v-if="it.footing.sources.length">
                  <span class="src-chip" v-for="(s, j) in it.footing.sources" :key="'fsrc' + i + j">
                    {{ s.char }}<span class="src-el">{{ s.pos }}{{ s.kind === '天干' ? '干' : '支' }}</span>
                  </span>
                  <span class="foot-hint">生{{ it.element }}者（{{ it.footing.sourceElement }}）</span>
                </span>
                <span class="foot-val muted" v-else>无 —— 生{{ it.element }}之{{ it.footing.sourceElement }}全局不见</span>
              </div>
              <div class="foot-row">
                <span class="foot-key">受制</span>
                <span class="foot-val" v-if="it.footing.enemies.length">
                  <span class="src-chip enemy" v-for="(s, j) in it.footing.enemies" :key="'fen' + i + j">
                    {{ s.char }}<span class="src-el">{{ s.pos }}{{ s.kind === '天干' ? '干' : '支' }}</span>
                  </span>
                  <span class="foot-hint">克{{ it.element }}者（{{ it.footing.enemyElement }}）</span>
                </span>
                <span class="foot-val muted" v-else>无 —— 克{{ it.element }}之{{ it.footing.enemyElement }}全局不见</span>
              </div>
            </div>
            <div class="foot-reason" v-if="it.reason">{{ it.reason }}</div>
            <div class="foot-note">{{ it.footing.note }}</div>
          </div>
        </div>
      </div>

      <ul class="note-list">
        <li v-for="(n, i) in footing.notes" :key="'fn' + i">{{ n }}</li>
      </ul>
    </div>

    <!-- ============ 十神引动 ============ -->
    <div class="analysis-section" v-if="activation">
      <h3 class="section-title">十神引动</h3>
      <p class="sub-intro">
        把流年 / 大运的<strong>十神</strong>，与原局已有的十神、以及三法所取的用神<strong>对上号</strong>。
        本节只做对应，<strong>不作吉凶</strong>：「属某法所取」只表示五行相同，不等于吉；
        「不属某法所取」也不等于凶。
      </p>

      <div class="method-legend" v-if="activation.methods.length">
        <span class="legend-label">三法所取五行</span>
        <span class="legend-item" v-for="(m, i) in activation.methods" :key="'ml' + i">
          <span class="legend-method">{{ m.method }}</span>
          <span class="foot-el" :class="'el-' + e" v-for="(e, j) in m.elements" :key="'mle' + i + j">{{ e }}</span>
        </span>
      </div>

      <div class="sub-label">大运十步</div>
      <div class="tg-table-wrap">
        <table class="tg-table">
          <thead>
            <tr>
              <th>大运</th><th>干支</th><th>天干十神</th><th>地支本气十神</th><th>原局已见</th><th>属何法所取</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, i) in activation.items" :key="'dy' + i" :class="{ matched: it.matched }">
              <td class="tg-head">{{ it.heading }}</td>
              <td class="tg-gz">{{ it.ganZhi }}</td>
              <td><span class="god-chip" :class="{ hit: it.matched }">{{ it.ganGod || '—' }}</span>
                <span class="el-mini" :class="'el-' + it.ganElement">{{ it.ganElement }}</span></td>
              <td><span class="god-chip">{{ it.zhiGod || '—' }}</span>
                <span class="el-mini" v-if="it.zhiBenQi">{{ it.zhiBenQi }}</span></td>
              <td class="tg-seen" :class="{ fresh: it.isNew }">
                <span class="fresh-tag" v-if="it.isNew">初见</span>
                <template v-else>{{ seenPositions(it) }}</template>
              </td>
              <td class="tg-method">
                <span class="m-chip" v-for="(m, j) in it.matchedBy" :key="'mm' + i + j">{{ m }}</span>
                <span class="m-none" v-if="!it.matchedBy.length">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="plain-note pad-sm" v-if="!activation.items.length">尚无大运数据（需完整四柱）。</p>

      <!-- 选中某一步大运后，看该运十年的流年 -->
      <template v-if="daYunList.length">
        <div class="sub-label">选一步大运，看该运十年的流年十神</div>
        <div class="pill-row">
          <button
              v-for="(d, i) in daYunList"
              :key="'pill' + i"
              class="pill"
              :class="{ active: activeDaYun === i }"
              @click="activeDaYun = i"
          >{{ d.ganZhi }}<span class="pill-sub">{{ rangeLabel(d) }}</span></button>
        </div>

        <div class="tg-table-wrap" v-if="liuNianRows.length">
          <table class="tg-table">
            <thead>
              <tr>
                <th>流年</th><th>干支</th><th>天干十神</th><th>地支本气十神</th><th>原局已见</th><th>属何法所取</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, i) in liuNianRows" :key="'ln' + i" :class="{ matched: it.matched }">
                <td class="tg-head">{{ it.heading }}</td>
                <td class="tg-gz">{{ it.ganZhi }}</td>
                <td><span class="god-chip" :class="{ hit: it.matched }">{{ it.ganGod || '—' }}</span>
                  <span class="el-mini" :class="'el-' + it.ganElement">{{ it.ganElement }}</span></td>
                <td><span class="god-chip">{{ it.zhiGod || '—' }}</span>
                  <span class="el-mini" v-if="it.zhiBenQi">{{ it.zhiBenQi }}</span></td>
                <td class="tg-seen" :class="{ fresh: it.isNew }">
                  <span class="fresh-tag" v-if="it.isNew">初见</span>
                  <template v-else>{{ seenPositions(it) }}</template>
                </td>
                <td class="tg-method">
                  <span class="m-chip" v-for="(m, j) in it.matchedBy" :key="'lm' + i + j">{{ m }}</span>
                  <span class="m-none" v-if="!it.matchedBy.length">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="plain-note pad-sm" v-else>该步大运的流年数据不可得（缺出生年）。</p>
      </template>

      <ul class="note-list">
        <li v-for="(n, i) in activation.notes" :key="'an' + i">{{ n }}</li>
      </ul>
    </div>

    <!-- ============ 各派歧见 ============ -->
    <div class="analysis-section" v-if="divergences.length">
      <h3 class="section-title">各派歧见</h3>
      <p class="sub-intro">
        下面每一条，传统文献里都能找到<strong>立场相反的明确说法</strong>。
        列出它们的目的不是给出「正确解释」，而是说明：<strong>在这一层，单一结论不可能成立。</strong>
      </p>

      <div class="dv-list">
        <div class="dv-card" v-for="(d, i) in divergences" :key="'dv' + i">
          <div class="dv-head">
            <span class="dv-term">{{ d.term }}</span>
            <span class="dv-scene">{{ d.scene }}</span>
          </div>
          <div class="dv-views">
            <div class="dv-view" v-for="(v, j) in d.views" :key="'dvv' + i + j">
              <span class="dv-school">{{ v.school }}</span>
              <span class="dv-text">{{ v.view }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="section-caveat final">{{ inference.caveat }}</p>
  </div>

  <div v-else class="plain-note pad">尚未排盘。</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import T from '../utils/baziTimeline.js';
import { analyzeTenGodActivation } from '../utils/baziInference.js';

const props = defineProps({
  inference: { type: Object, default: null },
  analysis: { type: Object, default: null },
  result: { type: Object, default: null },
  birthYear: { type: Number, default: null }
});

// 用 computed 读 prop，不能用 `const x = props.x` 快照 —— 父组件换一盘时不会更新
const chengPo = computed(() => (props.inference && props.inference.chengPo) || null);
const footing = computed(() => (props.inference && props.inference.footing) || null);
const activation = computed(() => (props.inference && props.inference.activation) || null);
const divergences = computed(() => (props.inference && props.inference.divergences) || []);
const monthHurt = computed(() => (chengPo.value && chengPo.value.monthHurt) || null);

const gzList = computed(() => {
  const r = props.result;
  if (!r) return [];
  return [r.yearGanZhi, r.monthGanZhi, r.dayGanZhi, r.hourGanZhi].filter(Boolean);
});
const dayGan = computed(() =>
  (props.analysis && props.analysis.dayGan) || (gzList.value[2] || '').charAt(0));

/** 大运步 → 公历年。映射规则在共享内核里（时间栏用的是同一份） */
const daYunList = computed(() => T.daYunRanges(props.analysis && props.analysis.daYun, props.birthYear));

const rangeLabel = (d) => (d.range ? `${d.range.from}–${d.range.to}` : '');

const activeDaYun = ref(0);

/**
 * 选中大运的十年流年 → 再走一遍十神引动。
 * 复用同一个纯函数 `analyzeTenGodActivation`，故大运表与流年表的口径必然一致。
 */
const liuNianRows = computed(() => {
  const d = daYunList.value[activeDaYun.value];
  if (!d || !d.range || !dayGan.value || gzList.value.length !== 4) return [];
  const list = T.computeLiuNian({
    from: d.range.from, to: d.range.to,
    dayGan: dayGan.value,
    birthYear: props.birthYear
  });
  const columns = list.map((n) => ({
    label: '流年',
    heading: `${n.year} 年`,
    sub: n.age === null ? '' : `虚岁 ${n.age}`,
    gan: n.gan, zhi: n.zhi, ganZhi: n.ganZhi
  }));
  const a = analyzeTenGodActivation({
    gzList: gzList.value, dayGan: dayGan.value,
    judgment: props.analysis && props.analysis.judgment,
    columns
  });
  return a ? a.items : [];
});

/** 原局已见该十神的位置，去重后紧凑显示 */
const seenPositions = (it) => {
  if (!it || !it.seenAt || !it.seenAt.length) return '—';
  const pos = [...new Set(it.seenAt.map((s) => s.pos))];
  return pos.join('、');
};

// 换了新盘就把大运选中项归零，否则会停在上一盘的序位上
watch(gzList, () => { activeDaYun.value = 0; });
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
  border-left: 4px solid var(--bz-red-border-accent-deep);
}

.sub-label {
  font-size: var(--bz-fs-2);
  color: var(--bz-text-3);
  margin: 20px 0 12px;
  font-weight: 600;
}

.sub-intro {
  margin: 0 0 16px;
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.sub-intro strong { color: var(--bz-text-2); }

.plain-note {
  margin: 0;
  color: var(--bz-text-4);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.plain-note.pad { padding: 24px 0; }
.plain-note.pad-sm { padding: 12px 0; }

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

.section-caveat.final {
  margin-top: 28px;
  background: var(--bz-red-tint);
  border-left-color: var(--bz-red-border-2);
  color: var(--bz-red-fg-vivid-mid);
}

/* ===== 层次阶梯 ===== */
.ladder {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.ladder-step {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--bz-surface-1);
  border-left: 3px solid var(--bz-blue-border-alt);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.ladder-step.current {
  background: var(--bz-red-tint);
  border-left-color: var(--bz-red-border-accent-deep);
}

.ladder-name {
  flex: 0 0 auto;
  font-weight: 700;
  color: var(--bz-text-1);
}

.ladder-step.current .ladder-name { color: var(--bz-red-fg-vivid-mid); }

.ladder-tag {
  flex: 0 0 auto;
  font-size: var(--bz-fs-1);
  font-weight: 600;
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-blue-tint);
  color: var(--bz-blue-fg-mid);
}

.ladder-tag.fact { background: var(--bz-blue-bg); color: var(--bz-blue-text); }
.ladder-tag.judge { background: var(--bz-violet-tint); color: var(--bz-violet-fg-vivid-mid); }
.ladder-tag.infer { background: var(--bz-danger-bg); color: var(--bz-red-fg-vivid-mid); }

.ladder-text { color: var(--bz-text-3); }

.rule-box {
  padding: 16px 20px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-red-tint);
  border: 1px solid var(--bz-red-border);
}

.rule-head {
  font-size: var(--bz-fs-2);
  font-weight: 700;
  color: var(--bz-red-fg-vivid-mid);
  margin-bottom: 8px;
}

.rule-list {
  margin: 0;
  padding-left: 20px;
  color: var(--bz-red-fg-mid);
  font-size: var(--bz-fs-2);
  line-height: 1.85;
}

.rule-list strong { color: var(--bz-red-fg-vivid-mid); }

/* ===== 月令受伤 ===== */
.month-banner {
  padding: 12px 16px;
  border-radius: var(--bz-r-sm);
  margin-bottom: 16px;
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
  background: var(--bz-surface-1);
  border: 1px solid var(--bz-blue-border-alt);
}

.month-banner.lvl-heavy { background: var(--bz-danger-bg); border-color: var(--bz-red-border); }
.month-banner.lvl-medium { background: var(--bz-warn-bg); border-color: var(--bz-amber-border-2); }
.month-banner.lvl-light { background: var(--bz-surface-1); }

.month-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.month-tag {
  font-weight: 700;
  color: var(--bz-red-fg-vivid-mid);
}

.month-banner.lvl-medium .month-tag { color: var(--bz-amber-fg-vivid-deep); }
.month-banner.lvl-none .month-tag { color: var(--bz-green-text); }

.month-branch { color: var(--bz-text-3); }

.month-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.month-item {
  font-size: var(--bz-fs-1);
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  color: var(--bz-text-2);
}

.month-why { color: var(--bz-text-3); font-size: var(--bz-fs-1); }

/* ===== 成破卡 ===== */
.cp-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cp-card {
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: 12px;
  padding: 16px 20px;
  background: var(--bz-surface);
  border-left: 4px solid var(--bz-red-border-accent-deep);
}

.cp-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cp-idx {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bz-danger-bg);
  color: var(--bz-red-fg-vivid-mid);
  font-size: var(--bz-fs-1);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.cp-name {
  font-size: var(--bz-fs-4);
  font-weight: 700;
  color: var(--bz-text-1);
}

.school-tag {
  font-size: var(--bz-fs-1);
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--bz-blue-tint);
  color: var(--bz-blue-fg-mid);
  border: 1px solid var(--bz-blue-border-alt);
}

.cp-gan {
  margin-left: auto;
  font-size: var(--bz-fs-2);
  color: var(--bz-red-fg-vivid-mid);
  font-weight: 600;
}

.cp-basis {
  margin-top: 8px;
  font-size: var(--bz-fs-2);
  color: var(--bz-text-2);
  line-height: var(--bz-lh-loose);
}

.cp-block { margin-top: 16px; }

.cp-block-label {
  font-size: var(--bz-fs-2);
  font-weight: 700;
  margin-bottom: 8px;
}

.cp-block-label.cheng { color: var(--bz-green-text); }
.cp-block-label.po { color: var(--bz-red-fg-vivid-mid); }

.cp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bz-surface-1);
  margin-bottom: 8px;
  font-size: var(--bz-fs-2);
}

.cp-god {
  font-weight: 700;
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-green-tint);
  color: var(--bz-green-text);
  flex: 0 0 auto;
}

.cp-god.po { background: var(--bz-danger-bg); color: var(--bz-red-fg-vivid-mid); }

.cp-po-name {
  font-weight: 600;
  color: var(--bz-red-fg-vivid-mid);
  flex: 0 0 auto;
}

.cp-why {
  color: var(--bz-text-3);
  font-size: var(--bz-fs-1);
  flex: 1 1 auto;
}

.hit-list { display: inline-flex; flex-wrap: wrap; gap: 4px; }

.hit-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--bz-fs-1);
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  color: var(--bz-blue-fg-deep);
}

.hit-chip.gan { border-color: var(--bz-blue-border-2-alt); background: var(--bz-blue-tint); }
.hit-chip.benqi { border-color: var(--bz-green-border-2); background: var(--bz-green-bg); color: var(--bz-green-text); }
.hit-chip.warn { border-color: var(--bz-red-border); background: var(--bz-red-tint); color: var(--bz-red-fg-vivid-mid); }
.hit-chip.warn.benqi { background: var(--bz-danger-bg); }

.hit-kind {
  font-size: 0.68rem;
  opacity: 0.75;
}

.cp-none {
  margin: 16px 0 0;
  font-size: var(--bz-fs-1);
  color: var(--bz-blue-fg-soft);
}

.cp-count {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed var(--bz-blue-border-alt);
  font-size: var(--bz-fs-1);
  color: var(--bz-text-3);
}

.cp-count strong { color: var(--bz-text-2); }

.count-warn { color: var(--bz-red-fg-soft); }

.cp-note {
  margin: 8px 0 0;
  font-size: var(--bz-fs-1);
  color: var(--bz-text-4);
  line-height: var(--bz-lh-loose);
}

.note-list {
  margin: 16px 0 0;
  padding-left: 20px;
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.note-list li { margin-bottom: 4px; }

/* ===== 用神落点 ===== */
.foot-group { margin-bottom: 20px; }

.foot-group-name {
  font-size: var(--bz-fs-2);
  font-weight: 700;
  color: var(--bz-text-2);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--bz-red-border-accent-deep);
}

.foot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.foot-card {
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: var(--bz-r-sm);
  padding: 12px 16px;
  background: var(--bz-surface);
}

.foot-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.role-tag {
  font-size: var(--bz-fs-1);
  font-weight: 700;
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-blue-tint);
  color: var(--bz-text-2);
  flex: 0 0 auto;
}

.foot-gods { color: var(--bz-text-2); font-size: var(--bz-fs-2); }

.foot-level {
  margin-left: auto;
  font-size: var(--bz-fs-1);
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--bz-surface);
  color: var(--bz-blue-fg-mid);
  border: 1px solid var(--bz-blue-border-alt);
}

.foot-level.lv-solid { background: var(--bz-green-tint); color: var(--bz-green-text); border-color: var(--bz-green-border-2); }
.foot-level.lv-rooted { background: var(--bz-green-bg); color: var(--bz-green-text); border-color: var(--bz-green-border-alt); }
.foot-level.lv-exposed,
.foot-level.lv-hidden { background: var(--bz-warn-bg); color: var(--bz-amber-fg-vivid-deep); border-color: var(--bz-amber-border-2); }
.foot-level.lv-absent { background: var(--bz-danger-bg); color: var(--bz-red-fg-vivid-mid); border-color: var(--bz-red-border); }

.day-tag {
  font-size: var(--bz-fs-1);
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-violet-tint);
  color: var(--bz-violet-fg-vivid-mid);
  border: 1px solid var(--bz-violet-border);
}

.foot-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.foot-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  font-size: var(--bz-fs-1);
}

.foot-key {
  flex: 0 0 46px;
  color: var(--bz-blue-fg-soft);
  font-size: var(--bz-fs-1);
}

.foot-val {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  color: var(--bz-text-2);
}

.foot-val.muted { color: var(--bz-text-4); }

.foot-hint { color: var(--bz-blue-fg-soft); font-size: var(--bz-fs-1); }

.src-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: var(--bz-fs-1);
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-blue-tint);
  border: 1px solid var(--bz-blue-border-2-alt);
  color: var(--bz-blue-text);
}

.src-chip.enemy { background: var(--bz-red-tint); border-color: var(--bz-red-border); color: var(--bz-red-fg-vivid-mid); }

.src-el { font-size: 0.68rem; opacity: 0.75; }

.foot-reason {
  margin-top: 8px;
  font-size: var(--bz-fs-1);
  color: var(--bz-text-3);
  line-height: var(--bz-lh-loose);
}

.foot-note {
  margin-top: 4px;
  font-size: var(--bz-fs-1);
  color: var(--bz-blue-fg-soft);
  line-height: var(--bz-lh-loose);
}

/* ===== 五行色（与判断栏同一套） ===== */
.foot-el, .el-mini {
  font-weight: 700;
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  font-size: var(--bz-fs-1);
}

.el-mini {
  font-weight: 600;
  font-size: var(--bz-fs-1);
  padding: 0 8px;
  margin-left: 4px;
}

.el-木 { background: var(--bz-green-tint); color: var(--bz-green-text); }
.el-火 { background: var(--bz-danger-bg); color: var(--bz-red-text); }
.el-土 { background: var(--bz-amber-tint); color: var(--bz-amber-fg-vivid-mid); }
.el-金 { background: var(--bz-amber-tint); color: var(--bz-amber-fg-vivid-deep); }
.el-水 { background: var(--bz-blue-bg); color: var(--bz-blue-text); }

/* ===== 十神表 ===== */
.method-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-surface-1);
  font-size: var(--bz-fs-1);
  margin-bottom: 8px;
}

.legend-label { color: var(--bz-blue-fg-soft); font-size: var(--bz-fs-1); }

.legend-item { display: inline-flex; align-items: center; gap: 8px; }

.legend-method {
  font-weight: 700;
  color: var(--bz-text-2);
  font-size: var(--bz-fs-1);
}

.tg-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: var(--bz-r-sm);
}

.tg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--bz-fs-1);
  min-width: 620px;
}

.tg-table th {
  text-align: left;
  padding: 8px 12px;
  background: var(--bz-surface-1);
  color: var(--bz-text-3);
  font-weight: 600;
  font-size: var(--bz-fs-1);
  white-space: nowrap;
  border-bottom: 1px solid var(--bz-blue-border-alt);
}

.tg-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--bz-blue-border-alt);
  color: var(--bz-text-2);
  vertical-align: middle;
}

.tg-table tr:last-child td { border-bottom: none; }

.tg-table tr.matched { background: var(--bz-surface); }

.tg-head { white-space: nowrap; color: var(--bz-text-3); }

.tg-gz {
  font-weight: 700;
  color: var(--bz-text-1);
  font-size: var(--bz-fs-3);
  white-space: nowrap;
}

.god-chip {
  display: inline-block;
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-blue-tint);
  color: var(--bz-blue-fg-mid);
  font-size: var(--bz-fs-1);
}

.god-chip.hit { background: var(--bz-danger-bg); color: var(--bz-red-fg-vivid-mid); }

.tg-seen { font-size: var(--bz-fs-1); color: var(--bz-text-3); white-space: nowrap; }

.fresh-tag {
  display: inline-block;
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-warn-bg);
  color: var(--bz-amber-fg-vivid-deep);
  font-size: var(--bz-fs-1);
}

.tg-method { white-space: nowrap; }

.m-chip {
  display: inline-block;
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-danger-bg);
  color: var(--bz-red-fg-vivid-mid);
  font-size: var(--bz-fs-1);
  margin-right: 4px;
}

.m-none { color: var(--bz-text-4); }

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.pill {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--bz-blue-border-alt);
  background: var(--bz-surface);
  color: var(--bz-text-2);
  font-size: var(--bz-fs-2);
  font-weight: 600;
  cursor: pointer;
  line-height: 1.35;
  transition: background-color, border-color, color 0.15s;
}

.pill:hover { border-color: var(--bz-red-border-2); color: var(--bz-red-fg-vivid-mid); }

.pill.active {
  background: var(--bz-red-fill);
  border-color: var(--bz-red-border-accent-deep);
  color: var(--bz-on-accent);
}

.pill-sub {
  font-size: 0.68rem;
  font-weight: 400;
  opacity: 0.72;
}

/* ===== 歧见 ===== */
.dv-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dv-card {
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: var(--bz-r-sm);
  padding: 12px 16px;
  background: var(--bz-surface);
  border-left: 4px solid var(--bz-border-strong);
}

.dv-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.dv-term {
  font-size: var(--bz-fs-3);
  font-weight: 700;
  color: var(--bz-text-1);
}

.dv-scene {
  font-size: var(--bz-fs-1);
  color: var(--bz-blue-fg-soft);
}

.dv-views {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dv-view {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.dv-school {
  flex: 0 0 auto;
  font-weight: 700;
  color: var(--bz-violet-fg-vivid-mid);
  font-size: var(--bz-fs-1);
}

.dv-text { color: var(--bz-text-3); flex: 1 1 60%; }
</style>
