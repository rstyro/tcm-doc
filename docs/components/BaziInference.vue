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
  border-top: 2px solid #f0f2f5;
}

.analysis-section:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.section-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 20px;
  font-weight: 600;
  padding-left: 10px;
  border-left: 4px solid #c0392b;
}

.sub-label {
  font-size: 0.86rem;
  color: #7f8c8d;
  margin: 20px 0 10px;
  font-weight: 600;
}

.sub-intro {
  margin: 0 0 16px;
  color: #7f8c8d;
  font-size: 0.86rem;
  line-height: 1.75;
}

.sub-intro strong { color: #5d6d7e; }

.plain-note {
  margin: 0;
  color: #95a5a6;
  font-size: 0.88rem;
  line-height: 1.7;
}

.plain-note.pad { padding: 24px 0; }
.plain-note.pad-sm { padding: 12px 0; }

.section-caveat {
  margin: 16px 0 0;
  padding: 10px 14px;
  background: #f8f9fa;
  border-left: 3px solid #dfe6e9;
  border-radius: 6px;
  color: #7f8c8d;
  font-size: 0.82rem;
  line-height: 1.75;
}

.section-caveat.final {
  margin-top: 28px;
  background: #fdf2f0;
  border-left-color: #ecc8c2;
  color: #a0432f;
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
  gap: 10px;
  flex-wrap: wrap;
  padding: 9px 14px;
  border-radius: 8px;
  background: #f8fafc;
  border-left: 3px solid #dfe6e9;
  font-size: 0.85rem;
  line-height: 1.7;
}

.ladder-step.current {
  background: #fdf2f0;
  border-left-color: #c0392b;
}

.ladder-name {
  flex: 0 0 auto;
  font-weight: 700;
  color: #2c3e50;
}

.ladder-step.current .ladder-name { color: #a0432f; }

.ladder-tag {
  flex: 0 0 auto;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 1px 9px;
  border-radius: 20px;
  background: #eef1f4;
  color: #6b7b8a;
}

.ladder-tag.fact { background: #eaf4fd; color: #2471a3; }
.ladder-tag.judge { background: #f5ecfa; color: #7d3c98; }
.ladder-tag.infer { background: #fdecea; color: #a0432f; }

.ladder-text { color: #7f8c8d; }

.rule-box {
  padding: 14px 18px;
  border-radius: 10px;
  background: #fff8f6;
  border: 1px solid #f0dcd6;
}

.rule-head {
  font-size: 0.88rem;
  font-weight: 700;
  color: #a0432f;
  margin-bottom: 8px;
}

.rule-list {
  margin: 0;
  padding-left: 20px;
  color: #7d6a66;
  font-size: 0.83rem;
  line-height: 1.85;
}

.rule-list strong { color: #a0432f; }

/* ===== 月令受伤 ===== */
.month-banner {
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  line-height: 1.7;
  background: #f8fafc;
  border: 1px solid #e8ecf1;
}

.month-banner.lvl-heavy { background: #fdecea; border-color: #f3cdc6; }
.month-banner.lvl-medium { background: #fff8e6; border-color: #f3e3b8; }
.month-banner.lvl-light { background: #f8fafc; }

.month-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.month-tag {
  font-weight: 700;
  color: #a0432f;
}

.month-banner.lvl-medium .month-tag { color: #9c6f0b; }
.month-banner.lvl-none .month-tag { color: #1e8449; }

.month-branch { color: #7f8c8d; }

.month-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.month-item {
  font-size: 0.79rem;
  padding: 2px 10px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #e2e7ec;
  color: #5d6d7e;
}

.month-why { color: #7f8c8d; font-size: 0.81rem; }

/* ===== 成破卡 ===== */
.cp-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cp-card {
  border: 1px solid #e8ecf1;
  border-radius: 12px;
  padding: 14px 18px;
  background: #fdfdff;
  border-left: 4px solid #c0392b;
}

.cp-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cp-idx {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fdecea;
  color: #a0432f;
  font-size: 0.76rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.cp-name {
  font-size: 1.02rem;
  font-weight: 700;
  color: #2c3e50;
}

.school-tag {
  font-size: 0.74rem;
  padding: 2px 10px;
  border-radius: 20px;
  background: #eef1f4;
  color: #6b7b8a;
  border: 1px solid #e2e7ec;
}

.cp-gan {
  margin-left: auto;
  font-size: 0.82rem;
  color: #a0432f;
  font-weight: 600;
}

.cp-basis {
  margin-top: 8px;
  font-size: 0.84rem;
  color: #5d6d7e;
  line-height: 1.75;
}

.cp-block { margin-top: 14px; }

.cp-block-label {
  font-size: 0.83rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.cp-block-label.cheng { color: #1e8449; }
.cp-block-label.po { color: #a0432f; }

.cp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f8fafc;
  margin-bottom: 6px;
  font-size: 0.83rem;
}

.cp-god {
  font-weight: 700;
  padding: 1px 9px;
  border-radius: 20px;
  background: #eafaf1;
  color: #1e8449;
  flex: 0 0 auto;
}

.cp-god.po { background: #fdecea; color: #a0432f; }

.cp-po-name {
  font-weight: 600;
  color: #a0432f;
  flex: 0 0 auto;
}

.cp-why {
  color: #7f8c8d;
  font-size: 0.81rem;
  flex: 1 1 auto;
}

.hit-list { display: inline-flex; flex-wrap: wrap; gap: 5px; }

.hit-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.76rem;
  padding: 1px 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #dde3e9;
  color: #34495e;
}

.hit-chip.gan { border-color: #bcd8f0; background: #f4faff; }
.hit-chip.benqi { border-color: #bfe8d3; background: #f2fbf6; color: #1e8449; }
.hit-chip.warn { border-color: #f3cdc6; background: #fff7f5; color: #a0432f; }
.hit-chip.warn.benqi { background: #fdecea; }

.hit-kind {
  font-size: 0.68rem;
  opacity: 0.75;
}

.cp-none {
  margin: 14px 0 0;
  font-size: 0.81rem;
  color: #a6b0b8;
}

.cp-count {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px dashed #e8ecf1;
  font-size: 0.81rem;
  color: #7f8c8d;
}

.cp-count strong { color: #5d6d7e; }

.count-warn { color: #b0a09c; }

.cp-note {
  margin: 8px 0 0;
  font-size: 0.79rem;
  color: #95a5a6;
  line-height: 1.75;
}

.note-list {
  margin: 16px 0 0;
  padding-left: 20px;
  color: #7f8c8d;
  font-size: 0.82rem;
  line-height: 1.8;
}

.note-list li { margin-bottom: 4px; }

/* ===== 用神落点 ===== */
.foot-group { margin-bottom: 18px; }

.foot-group-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: #5d6d7e;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #c0392b;
}

.foot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.foot-card {
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  padding: 12px 16px;
  background: #fdfdff;
}

.foot-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.role-tag {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 1px 9px;
  border-radius: 20px;
  background: #e8ecf1;
  color: #5d6d7e;
  flex: 0 0 auto;
}

.foot-gods { color: #5d6d7e; font-size: 0.84rem; }

.foot-level {
  margin-left: auto;
  font-size: 0.76rem;
  padding: 2px 10px;
  border-radius: 20px;
  background: #f2f4f6;
  color: #6b7b8a;
  border: 1px solid #e2e7ec;
}

.foot-level.lv-solid { background: #eafaf1; color: #1e8449; border-color: #bfe8d3; }
.foot-level.lv-rooted { background: #f2fbf6; color: #1e8449; border-color: #cfe8da; }
.foot-level.lv-exposed,
.foot-level.lv-hidden { background: #fff8e6; color: #9c6f0b; border-color: #f3e3b8; }
.foot-level.lv-absent { background: #fdecea; color: #a0432f; border-color: #f3cdc6; }

.day-tag {
  font-size: 0.72rem;
  padding: 1px 8px;
  border-radius: 20px;
  background: #f5ecfa;
  color: #7d3c98;
  border: 1px solid #e3d2ee;
}

.foot-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.foot-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.81rem;
}

.foot-key {
  flex: 0 0 46px;
  color: #9aa5ae;
  font-size: 0.79rem;
}

.foot-val {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  color: #5d6d7e;
}

.foot-val.muted { color: #b0b8bf; }

.foot-hint { color: #a6b0b8; font-size: 0.77rem; }

.src-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  font-size: 0.78rem;
  padding: 1px 8px;
  border-radius: 6px;
  background: #f4faff;
  border: 1px solid #bcd8f0;
  color: #2471a3;
}

.src-chip.enemy { background: #fff7f5; border-color: #f3cdc6; color: #a0432f; }

.src-el { font-size: 0.68rem; opacity: 0.75; }

.foot-reason {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #7f8c8d;
  line-height: 1.7;
}

.foot-note {
  margin-top: 4px;
  font-size: 0.78rem;
  color: #a6b0b8;
  line-height: 1.7;
}

/* ===== 五行色（与判断栏同一套） ===== */
.foot-el, .el-mini {
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.el-mini {
  font-weight: 600;
  font-size: 0.72rem;
  padding: 0 6px;
  margin-left: 4px;
}

.el-木 { background: #e8f6ee; color: #1e8449; }
.el-火 { background: #fdecea; color: #c0392b; }
.el-土 { background: #fdf3e3; color: #b9770e; }
.el-金 { background: #f4f0e4; color: #8d6e19; }
.el-水 { background: #eaf4fd; color: #2471a3; }

/* ===== 十神表 ===== */
.method-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 0.81rem;
  margin-bottom: 6px;
}

.legend-label { color: #9aa5ae; font-size: 0.79rem; }

.legend-item { display: inline-flex; align-items: center; gap: 6px; }

.legend-method {
  font-weight: 700;
  color: #5d6d7e;
  font-size: 0.79rem;
}

.tg-table-wrap {
  overflow-x: auto;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
}

.tg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.81rem;
  min-width: 620px;
}

.tg-table th {
  text-align: left;
  padding: 9px 12px;
  background: #f8fafc;
  color: #7f8c8d;
  font-weight: 600;
  font-size: 0.78rem;
  white-space: nowrap;
  border-bottom: 1px solid #e8ecf1;
}

.tg-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f2f5f8;
  color: #5d6d7e;
  vertical-align: middle;
}

.tg-table tr:last-child td { border-bottom: none; }

.tg-table tr.matched { background: #fcfdff; }

.tg-head { white-space: nowrap; color: #7f8c8d; }

.tg-gz {
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.9rem;
  white-space: nowrap;
}

.god-chip {
  display: inline-block;
  padding: 1px 9px;
  border-radius: 20px;
  background: #eef1f4;
  color: #6b7b8a;
  font-size: 0.78rem;
}

.god-chip.hit { background: #fdecea; color: #a0432f; }

.tg-seen { font-size: 0.79rem; color: #7f8c8d; white-space: nowrap; }

.fresh-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  background: #fff8e6;
  color: #9c6f0b;
  font-size: 0.74rem;
}

.tg-method { white-space: nowrap; }

.m-chip {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  background: #fdecea;
  color: #a0432f;
  font-size: 0.74rem;
  margin-right: 4px;
}

.m-none { color: #c2cad1; }

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.pill {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e7ec;
  background: #fff;
  color: #5d6d7e;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1.35;
  transition: all 0.15s;
}

.pill:hover { border-color: #e0b9ae; color: #a0432f; }

.pill.active {
  background: #c0392b;
  border-color: #c0392b;
  color: #fff;
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
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  padding: 12px 16px;
  background: #fdfdff;
  border-left: 4px solid #95a5a6;
}

.dv-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.dv-term {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c3e50;
}

.dv-scene {
  font-size: 0.78rem;
  color: #a6b0b8;
}

.dv-views {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.dv-view {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.82rem;
  line-height: 1.75;
}

.dv-school {
  flex: 0 0 auto;
  font-weight: 700;
  color: #7d3c98;
  font-size: 0.79rem;
}

.dv-text { color: #7f8c8d; flex: 1 1 60%; }
</style>
