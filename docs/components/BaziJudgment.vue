<template>
  <div v-if="judgment">
    <!-- 本栏的性质声明：与前三栏不同，这里开始「下判断」 -->
    <div class="analysis-section">
      <h3 class="section-title">关于本栏</h3>
      <div class="nature-box">
        <div class="nature-row">
          <span class="nature-tag fact">前三栏</span>
          <span class="nature-text">四柱 · 结构 · 时间 —— 列的是<strong>客观事实</strong>：哪些字成立哪种关系、哪个藏干透了、哪一年是哪组干支。</span>
        </div>
        <div class="nature-row">
          <span class="nature-tag judge">本栏</span>
          <span class="nature-text">取什么<strong>格局</strong>、用哪味<strong>用神</strong> —— 这是<strong>判断</strong>。传统命理恰恰在这里分歧最大，故一律<strong>并列各家口径</strong>，不给唯一答案。</span>
        </div>
      </div>
      <p class="section-caveat">
        本工具的做法是：把每一派的判据、依据与分歧都摆出来，由读者自行参看。
        <strong>不作吉凶推断，也不构成任何现实建议。</strong>
      </p>
    </div>

    <!-- ============ 格局取法 ============ -->
    <div class="analysis-section" v-if="judgment.geJu">
      <h3 class="section-title">格局取法</h3>

      <div class="sub-label">月令藏干（取格看的就是这里）</div>
      <div class="cang-row">
        <div class="cang-item" v-for="(c, i) in geJu.cangGan" :key="'cg' + i" :class="{ exposed: c.exposed }">
          <span class="cang-gan">{{ c.gan }}</span>
          <span class="cang-el" :class="'el-' + c.element">{{ c.element }}</span>
          <span class="cang-god">{{ c.god }}</span>
          <span class="cang-qi">{{ c.qiType }}</span>
          <span class="cang-exposed" v-if="c.exposed">透{{ c.exposedAt.join('、') }}干</span>
          <span class="cang-hidden" v-else>未透干</span>
        </div>
      </div>

      <div class="luwang-banner" v-if="geJu.luWang">
        <span class="luwang-name">{{ geJu.luWang.label }}</span>
        <span class="luwang-why">{{ geJu.luWang.reason }}</span>
      </div>

      <div class="sub-label">三法并列 —— 同一命造常得出不同格局</div>
      <div class="cand-list" v-if="geJu.candidates.length">
        <div class="cand-card" v-for="(c, i) in geJu.candidates" :key="'cd' + i">
          <div class="cand-head">
            <span class="cand-idx">{{ i + 1 }}</span>
            <span class="ge-name">{{ c.name }}</span>
            <span class="school-tag">{{ c.school }}</span>
            <span class="cand-gan" v-if="c.gan">{{ c.gan }} · {{ c.god }}</span>
          </div>
          <div class="cand-basis">{{ c.basis }}</div>
        </div>
      </div>
      <p class="plain-note" v-else>未能按三法取出格局（柱数不足）。</p>

      <ul class="note-list">
        <li v-for="(n, i) in geJu.notes" :key="'gn' + i">{{ n }}</li>
      </ul>
    </div>

    <!-- ============ 用神三法 ============ -->
    <div class="analysis-section">
      <h3 class="section-title">用神三法</h3>
      <p class="sub-intro">
        取用有三条互不相同的路子：<strong>扶抑</strong>看旺衰之平衡、<strong>调候</strong>看气候之寒暖、
        <strong>通关</strong>看两势之对峙。三者常各指一味，孰主孰从各派不一，此处并列。
      </p>

      <!-- 扶抑 -->
      <div class="law-card" v-if="judgment.fuYi">
        <div class="law-head">
          <span class="law-name">{{ judgment.fuYi.school }}</span>
          <span class="law-verdict">日主{{ judgment.fuYi.verdict }}</span>
        </div>
        <div class="law-basis">{{ judgment.fuYi.basis }}</div>
        <div class="yc-list">
          <div class="yc-item" v-for="(c, i) in judgment.fuYi.candidates" :key="'fy' + i">
            <span class="role-tag" :class="'role-' + c.role">{{ c.role }}</span>
            <span class="yc-el" :class="'el-' + c.element">{{ c.element }}</span>
            <span class="yc-gods">{{ c.gods.join(' · ') }}</span>
            <span class="stem-chips">
              <span class="stem-chip" v-for="(s, j) in c.stems" :key="'s' + j">{{ s }}</span>
            </span>
            <span class="align-tag" v-if="c.alignsMonthLing">与月令同气</span>
            <div class="yc-reason">{{ c.reason }}</div>
          </div>
        </div>
        <p class="law-note">{{ judgment.fuYi.note }}</p>
      </div>

      <!-- 调候 -->
      <div class="law-card" v-if="judgment.tiaoHou">
        <div class="law-head">
          <span class="law-name">{{ judgment.tiaoHou.school }}</span>
          <span class="law-climate">{{ judgment.tiaoHou.season }} · {{ judgment.tiaoHou.climate }}</span>
        </div>
        <div class="urgency-row" :class="{ high: judgment.tiaoHou.urgency.level === 'high' }">
          <span class="urgency-tag">{{ judgment.tiaoHou.urgency.level === 'high' ? '调候尤切' : '常例参看' }}</span>
          <span class="urgency-why">{{ judgment.tiaoHou.urgency.why }}</span>
        </div>
        <div class="yc-list">
          <div class="yc-item" v-for="(c, i) in judgment.tiaoHou.candidates" :key="'th' + i">
            <span class="role-tag" :class="c.tier === '主' ? 'role-克' : 'role-耗'">{{ c.tier }}</span>
            <span class="yc-el" :class="'el-' + c.element">{{ c.element }}</span>
            <span class="stem-chips">
              <span class="stem-chip" v-for="(s, j) in c.stems" :key="'ts' + j">{{ s }}</span>
            </span>
            <div class="yc-reason">{{ c.reason }}</div>
          </div>
        </div>
        <p class="law-note">{{ judgment.tiaoHou.note }}</p>
      </div>

      <!-- 通关 -->
      <div class="law-card">
        <div class="law-head">
          <span class="law-name">通关取用（两神相战）</span>
          <span class="law-verdict" v-if="judgment.tongGuan.length">{{ judgment.tongGuan.length }} 组相战</span>
          <span class="law-verdict muted" v-else>不见相战</span>
        </div>
        <div class="yc-list" v-if="judgment.tongGuan.length">
          <div class="yc-item" v-for="(p, i) in judgment.tongGuan" :key="'tg' + i">
            <span class="yc-el" :class="'el-' + p.a">{{ p.a }}{{ p.aCount }}</span>
            <span class="vs-mark">克</span>
            <span class="yc-el" :class="'el-' + p.b">{{ p.b }}{{ p.bCount }}</span>
            <span class="bridge-mark">→</span>
            <span class="yc-el bridge" :class="'el-' + p.bridge">{{ p.bridge }}</span>
            <span class="stem-chips">
              <span class="stem-chip" v-for="(s, j) in p.stems" :key="'gs' + j">{{ s }}</span>
            </span>
            <span class="align-tag" v-if="p.involvesDayMaster">涉日主</span>
            <div class="yc-reason">{{ p.reason }}</div>
          </div>
        </div>
        <p class="plain-note" v-else>
          原局五行中没有出现「两方俱成气候而对峙相克」的局面，故无从谈起通关。
          （此处以某一五行在八个字中出现两枚及以上为「成气候」，是便于复核的简化门槛。）
        </p>
        <p class="law-note">
          通关之法源出「两神相战」之说：金木相战取水、水火相战取木，取的是相生链的中段，
          使克战之气转为相生之流。是否真需通关，仍取决于旺衰与格局，各派取舍不一。
        </p>
      </div>

      <div class="conflict-box" v-if="judgment.conflict">
        <div class="conflict-head">三法往往各持一说（本盘给出 {{ judgment.conflict.views }} 种取向）</div>
        <div class="conflict-body">{{ judgment.conflict.note }}</div>
      </div>
    </div>

    <p class="section-caveat final">{{ judgment.caveat }}</p>
  </div>

  <div v-else class="plain-note pad">尚未排盘。</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  judgment: { type: Object, default: null }
});

/**
 * 月令藏干那一块要读好几层属性，单独取出来并做 null 兜底 —— SSR 阶段 judgment 可能为空。
 * 注意**不能**写成 `const judgment = props.judgment`：那样会遮住模板自动暴露的 prop，
 * 变成一次性快照，父组件换一盘时不会更新。
 */
const geJu = computed(() => (props.judgment && props.judgment.geJu) || null);
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
  border-left: 4px solid var(--bz-violet-border-accent-deep);
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

.section-caveat.final {
  margin-top: 28px;
  background: var(--bz-red-tint);
  border-left-color: var(--bz-red-border-2);
  color: var(--bz-red-fg-mid);
}

.section-caveat.final strong { color: var(--bz-red-fg-mid); }

.plain-note {
  margin: 0;
  color: var(--bz-text-4);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.plain-note.pad { padding: 24px 0; }

/* ===== 性质声明 ===== */
.nature-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nature-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
  color: var(--bz-text-2);
}

.nature-tag {
  flex: 0 0 auto;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--bz-fs-1);
  font-weight: 600;
  white-space: nowrap;
}

.nature-tag.fact { background: var(--bz-blue-bg); color: var(--bz-blue-text); border: 1px solid var(--bz-blue-border-alt); }
.nature-tag.judge { background: var(--bz-violet-tint); color: var(--bz-violet-fg-vivid-mid); border: 1px solid var(--bz-violet-border); }

.nature-text strong { color: var(--bz-text-1); }

/* ===== 月令藏干 ===== */
.sub-label {
  font-size: var(--bz-fs-2);
  color: var(--bz-text-3);
  margin: 0 0 12px;
  font-weight: 600;
}

.sub-intro {
  margin: 0 0 16px;
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.sub-intro strong { color: var(--bz-text-2); }

.cang-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.cang-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-surface-1);
  border: 1px solid var(--bz-blue-border-alt);
  font-size: var(--bz-fs-2);
  color: var(--bz-text-3);
}

.cang-item.exposed {
  background: var(--bz-green-tint);
  border-color: var(--bz-green-border-2);
  color: var(--bz-green-text);
}

.cang-gan {
  font-size: var(--bz-fs-4);
  font-weight: 700;
  color: var(--bz-text-1);
}

.cang-item.exposed .cang-gan { color: var(--bz-green-text); }

.cang-god { font-weight: 600; }
.cang-qi { font-size: var(--bz-fs-1); opacity: 0.8; }

.cang-exposed,
.cang-hidden {
  font-size: var(--bz-fs-1);
  padding: 0px 8px;
  border-radius: 20px;
}

.cang-exposed { background: var(--bz-green-tint-2); color: var(--bz-green-text); }
.cang-hidden { background: var(--bz-blue-tint); color: var(--bz-blue-fg-soft); }

/* ===== 禄刃 ===== */
.luwang-banner {
  display: flex;
  gap: 12px;
  align-items: baseline;
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-warn-bg);
  border: 1px solid var(--bz-amber-border-2);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.luwang-name {
  flex: 0 0 auto;
  font-weight: 700;
  color: var(--bz-amber-fg-vivid-deep);
}

.luwang-why { color: var(--bz-amber-fg-mid); }

/* ===== 候选卡 ===== */
.cand-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.cand-card {
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: var(--bz-r-sm);
  padding: 12px 16px;
  background: var(--bz-surface);
  border-left: 4px solid var(--bz-violet-border-accent-deep);
}

.cand-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cand-idx {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bz-violet-tint);
  color: var(--bz-violet-fg-vivid-mid);
  font-size: var(--bz-fs-1);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.ge-name {
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

.cand-gan {
  margin-left: auto;
  font-size: var(--bz-fs-2);
  color: var(--bz-violet-fg-vivid-mid);
  font-weight: 600;
}

.cand-basis {
  margin-top: 8px;
  font-size: var(--bz-fs-2);
  color: var(--bz-text-2);
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

/* ===== 用神三法 ===== */
.law-card {
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  background: var(--bz-surface);
}

.law-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.law-name {
  font-size: var(--bz-fs-4);
  font-weight: 700;
  color: var(--bz-text-1);
}

.law-verdict,
.law-climate {
  font-size: var(--bz-fs-1);
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--bz-blue-bg);
  color: var(--bz-blue-text);
  border: 1px solid var(--bz-blue-border-alt);
}

.law-verdict.muted { background: var(--bz-surface); color: var(--bz-blue-fg-soft); border-color: var(--bz-blue-border-alt); }

.law-basis {
  margin-top: 8px;
  font-size: var(--bz-fs-2);
  color: var(--bz-text-2);
  line-height: var(--bz-lh-loose);
}

.yc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.yc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bz-surface-1);
  font-size: var(--bz-fs-2);
}

.role-tag {
  font-size: var(--bz-fs-1);
  font-weight: 700;
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-blue-tint);
  color: var(--bz-text-2);
}

.role-克, .role-泄 { background: var(--bz-danger-bg); color: var(--bz-red-fg-vivid-mid); }
.role-耗, .role-生 { background: var(--bz-green-tint); color: var(--bz-green-text); }
.role-扶 { background: var(--bz-blue-bg); color: var(--bz-blue-text); }

.yc-gods { color: var(--bz-text-2); }

.stem-chips { display: inline-flex; gap: 4px; }

.stem-chip {
  display: inline-block;
  min-width: 20px;
  text-align: center;
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  color: var(--bz-blue-fg-deep);
  font-size: var(--bz-fs-1);
}

.yc-el {
  font-weight: 700;
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  font-size: var(--bz-fs-2);
}

.el-木 { background: var(--bz-green-tint); color: var(--bz-green-text); }
.el-火 { background: var(--bz-danger-bg); color: var(--bz-red-text); }
.el-土 { background: var(--bz-amber-tint); color: var(--bz-amber-fg-vivid-mid); }
.el-金 { background: var(--bz-amber-tint); color: var(--bz-amber-fg-vivid-deep); }
.el-水 { background: var(--bz-blue-bg); color: var(--bz-blue-text); }

.yc-el.bridge { box-shadow: 0 0 0 2px var(--bz-blue-border) inset; }

.vs-mark, .bridge-mark {
  color: var(--bz-blue-fg-soft);
  font-size: var(--bz-fs-1);
}

.bridge-mark { color: var(--bz-accent); font-weight: 700; }

.align-tag {
  font-size: var(--bz-fs-1);
  padding: 0px 8px;
  border-radius: 20px;
  background: var(--bz-warn-bg);
  color: var(--bz-amber-fg-vivid-deep);
  border: 1px solid var(--bz-amber-border-2);
}

.yc-reason {
  flex: 1 1 100%;
  color: var(--bz-text-3);
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
  margin-top: 4px;
}

.urgency-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bz-surface-1);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.urgency-row.high { background: var(--bz-warn-bg); }

.urgency-tag {
  flex: 0 0 auto;
  font-weight: 700;
  color: var(--bz-amber-fg-vivid-deep);
}

.urgency-row:not(.high) .urgency-tag { color: var(--bz-text-3); }

.urgency-why { color: var(--bz-text-3); }

.law-note {
  margin: 12px 0 0;
  color: var(--bz-text-4);
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
}

/* ===== 三法冲突提示 ===== */
.conflict-box {
  margin-top: 8px;
  padding: 16px 20px;
  border-radius: 12px;
  background: var(--bz-violet-tint);
  border: 1px dashed var(--bz-violet-border-2);
}

.conflict-head {
  font-size: var(--bz-fs-2);
  font-weight: 700;
  color: var(--bz-violet-fg-vivid-mid);
  margin-bottom: 8px;
}

.conflict-body {
  font-size: var(--bz-fs-2);
  color: var(--bz-violet-fg-mid);
  line-height: var(--bz-lh-loose);
}
</style>
