<template>
  <div v-if="guide">
    <!-- ============ 本栏性质：给不懂命理的人读的一栏 ============ -->
    <div class="analysis-section">
      <h3 class="section-title">关于本栏</h3>

      <p class="sub-intro">
        前面几栏是<strong>表格语言</strong>——「月令本气透干取格」「相神见二处」，
        懂命理的人看得懂，多数人看不出跟自己有什么关系。
        本栏把<strong>同一批事实翻成人话</strong>，并按常被问到的四件事重新排一遍。
      </p>
      <p class="sub-intro">
        但「翻译」不能只翻译名词，还得先补上地基。下面三节看完，
        <strong>不需要任何基础</strong>就能读懂后面四张主题卡。
        凡是<strong>站内已有专文</strong>的内容（十神、格局、神煞…），本栏只给一句话加一个链接，
        不再重写一遍。
      </p>

      <div class="ladder">
        <div class="ladder-step">
          <span class="ladder-name">四柱 · 结构 · 时间</span>
          <span class="ladder-tag fact">客观</span>
          <span class="ladder-text">排盘结果与字与字的关系 —— 没有争议。</span>
        </div>
        <div class="ladder-step">
          <span class="ladder-name">论断</span>
          <span class="ladder-tag judge">判断</span>
          <span class="ladder-text">取何格局、用何用神 —— 诸说并列，不给答案。</span>
        </div>
        <div class="ladder-step">
          <span class="ladder-name">推演</span>
          <span class="ladder-tag infer">争议最大</span>
          <span class="ladder-text">成破、落点、引动 —— 各家自成体系，彼此不兼容。</span>
        </div>
        <div class="ladder-step current">
          <span class="ladder-name">导读</span>
          <span class="ladder-tag plain">翻译层</span>
          <span class="ladder-text">把上面各栏的结论<strong>换成人话</strong>，归到财、婚、事业、健康四题上。</span>
        </div>
      </div>

      <div class="rule-box">
        <div class="rule-head">本栏的三条硬约束</div>
        <ul class="rule-list">
          <li><strong>不下结论。</strong>只说「传统看什么」「你这盘上是哪几个字」「各家怎么说」，
            不写「你会发财 / 你会晚婚」这类话 —— 判断权交回你自己。
            「通俗结果」也一样，它只是把事实按问句重答一遍。</li>
          <li><strong>术语必译。</strong>每个名词都配一句白话；站内已有专文的，直接给链接，不重复写。</li>
          <li><strong>事实与说法分开。</strong>每题中间那段「事实」都能在盘上核到具体某柱某字；
            最后那段「各家怎么说」一律正反并列，不替你选。</li>
        </ul>
      </div>
    </div>

    <!-- ============ 第一节：八字到底在看什么 ============ -->
    <div class="analysis-section">
      <h3 class="section-title">一、八字到底在看什么</h3>
      <p class="sub-intro">
        这一节不涉及任何具体命盘，是后面一切的前提。三个问答看完，地基就有了。
      </p>

      <div class="qa-list">
        <div class="qa-item" v-for="(b, i) in guide.basics" :key="'b' + i">
          <div class="qa-q">问：{{ b.q }}</div>
          <div class="qa-a" v-html="rich(b.a)"></div>
          <div class="qa-ref" v-if="b.ref">
            想细读：<a :href="withBase(b.ref.to)" target="_blank" rel="noreferrer">{{ b.ref.title }}</a>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 第二节：十神只用一句话 ============ -->
    <div class="analysis-section">
      <h3 class="section-title">二、十神：一句话，其余请看专文</h3>

      <div class="brief-box">
        <div class="brief-text" v-html="rich(guide.tenGod.intro)"></div>
        <div class="name-chips">
          <span class="name-chip" v-for="(n, i) in guide.tenGod.names" :key="'tn' + i">{{ n }}</span>
        </div>
        <div class="brief-hint" v-html="rich(guide.tenGod.hint)"></div>
        <div class="ref-row" v-if="guide.tenGod.ref">
          <span class="ref-label">完整内容见站内专文：</span>
          <a class="ref-link" :href="withBase(guide.tenGod.ref.to)"
             target="_blank" rel="noreferrer">《{{ guide.tenGod.ref.title }}》</a>
        </div>
      </div>
    </div>

    <!-- ============ 第三节：这一栏怎么读 ============ -->
    <div class="analysis-section">
      <h3 class="section-title">三、这一栏怎么读</h3>
      <div class="step-list">
        <div class="step-item" v-for="(s, i) in guide.readSteps" :key="'rs' + i">
          <span class="step-n">{{ s.n }}</span>
          <div class="step-body">
            <div class="step-t">{{ s.t }}</div>
            <div class="step-d" v-html="rich(s.d)"></div>
          </div>
        </div>
      </div>
      <p class="sub-intro tip">
        一句话：<strong>认字 → 核事实 → 看通俗结果 → 读说法</strong>。四张主题卡都是这个结构，位置固定。
      </p>
    </div>

    <!-- ============ 四大主题 ============ -->
    <div class="analysis-section" v-for="(t, i) in guide.themes" :key="t.key">
      <h3 class="section-title">{{ t.title }}</h3>
      <p class="theme-ask" v-if="t.ask">常被问到的：「{{ t.ask }}」</p>

      <!-- ⓪ 先说人话 -->
      <div class="plain-box" v-if="t.plain">
        <div class="plain-head">先说人话 —— 这一题传统到底在看什么</div>
        <div class="plain-text" v-html="rich(t.plain)"></div>
        <div class="plain-keys" v-if="t.keys && t.keys.length">
          <div class="plain-keys-head">这一题被拆成几个小问题（「通俗结果」就按这几问逐条作答）：</div>
          <ul>
            <li v-for="(k, j) in t.keys" :key="'k' + i + '-' + j" v-html="rich(k)"></li>
          </ul>
        </div>
      </div>

      <!-- ① 传统怎么看：术语翻译 -->
      <div class="block">
        <div class="block-head">① 传统怎么看 —— 先把名词认清楚</div>
        <div class="term-row" v-for="(tm, j) in t.terms" :key="'tm' + i + '-' + j">
          <div class="term-name">{{ tm.name }}</div>
          <div class="term-plain" v-html="rich(tm.plain)"></div>
        </div>
      </div>

      <!-- ② 你这张盘上的事实 -->
      <div class="block">
        <div class="block-head">② 你这张盘上的事实 <span class="fact-tag">可对着四柱核</span></div>
        <div class="fact-group" v-for="(g, j) in t.groups" :key="'g' + i + '-' + j">
          <div class="fact-label">{{ g.label }}</div>
          <ul class="fact-items">
            <li v-for="(it, k) in g.items" :key="'it' + i + '-' + j + '-' + k"
                :class="'tone-' + (it.tone || 'normal')">
              <span class="fact-text" v-html="rich(it.text)"></span>
              <span class="fact-sub" v-if="it.sub" v-html="rich(it.sub)"></span>
            </li>
          </ul>
          <div class="fact-note" v-if="g.note" v-html="rich(g.note)"></div>
        </div>
      </div>

      <!-- ③ 通俗结果：按问句把事实重答一遍 -->
      <div class="block" v-if="t.result && t.result.lines && t.result.lines.length">
        <div class="block-head">
          {{ t.result.title }} <span class="result-tag">只换说法 · 不添判断</span>
        </div>
        <div class="result-box">
          <div class="result-qa" v-for="(r, j) in t.result.lines" :key="'r' + i + '-' + j">
            <div class="result-q">{{ r.q }}</div>
            <div class="result-a" v-html="rich(r.a)"></div>
          </div>
          <div class="result-limit" v-if="t.limit" v-html="rich(t.limit)"></div>
        </div>
      </div>

      <!-- ④ 各家怎么说 -->
      <div class="block">
        <div class="block-head">④ 各家怎么说 <span class="school-tag">正反并列 · 不替你选</span></div>
        <div class="school-row" v-for="(s, j) in t.schools" :key="'s' + i + '-' + j">
          <div class="school-line">
            <span class="side-badge yes">一说</span>
            <span class="side-text" v-html="rich(s.claim)"></span>
          </div>
          <div class="school-line">
            <span class="side-badge no">另一说</span>
            <span class="side-text" v-html="rich(s.counter)"></span>
          </div>
        </div>
      </div>

      <p class="section-caveat" v-if="t.caveat" v-html="rich(t.caveat)"></p>

      <div class="ref-row" v-if="t.refs && t.refs.length">
        <span class="ref-label">这一题想细读：</span>
        <a class="ref-link" v-for="(r, j) in t.refs" :key="'tr' + i + '-' + j"
           :href="withBase(r.to)" target="_blank" rel="noreferrer">《{{ r.title }}》</a>
      </div>
    </div>

    <!-- ============ 神煞速查 ============ -->
    <div class="analysis-section">
      <h3 class="section-title">附一：神煞速查</h3>
      <p class="sub-intro">
        神煞是<strong>查表</strong>一类的内容：拿一个基准字（年支 / 日支 / 日干）去查「应当见到的字」，
        再看它在不在四支里。下面「见」只表示<strong>盘上有这个字</strong>，
        <strong>不表示任何吉凶</strong> —— 各家对同一神煞的取舍往往正好相反。
        各神煞的推法与来历见站内专文<a class="inline-ref" :href="withBase('/fate/shensha')"
        target="_blank" rel="noreferrer">《神煞》</a>；这里只做专文做不了的事：<strong>看这张盘命中了没有</strong>。
      </p>

      <div class="ss-list">
        <div class="ss-card" :class="{ hit: s.found }" v-for="(s, i) in guide.shenSha" :key="'ss' + i">
          <div class="ss-head">
            <span class="ss-name">{{ s.name }}</span>
            <span class="ss-badge" :class="s.found ? 'yes' : 'no'">{{ s.found ? '见' : '未见' }}</span>
          </div>
          <div class="ss-plain" v-if="s.plain">{{ s.plain }}</div>
          <div class="ss-rule">查法：{{ s.rule }}</div>
          <div class="ss-basis">
            基准：{{ s.of }}
            <span v-if="basisText(s)">　·　本盘：{{ basisText(s) }}</span>
          </div>
          <div class="ss-nobasis" v-if="s.noBasisNote">{{ s.noBasisNote }}</div>
          <div class="ss-hits" v-if="s.found">
            <span class="ss-hit" v-for="(h, j) in s.hits" :key="'h' + i + '-' + j">
              {{ h.pos }}{{ h.char }}（由{{ h.from }}{{ h.fromChar }}）
            </span>
          </div>
          <div class="ss-none" v-else>本盘四支中未见应见之字。</div>
          <div class="ss-note" v-html="rich(s.note)"></div>
        </div>
      </div>
    </div>

    <!-- ============ 四墓库 ============ -->
    <div class="analysis-section">
      <h3 class="section-title">附二：四墓库</h3>
      <p class="sub-intro" v-if="guide.muKu && guide.muKu.has">
        本盘地支中有下列墓库。它的规矩很简单：辰戌丑未四个字各当一行的「仓库」——
        辰是水库、戌是火库、丑是金库、未是木库。这里只列<strong>库里藏着什么</strong>（客观），
        「入库是守财还是困住」属解释，见下方注。
        「墓库」在十二长生里属「墓」这一站，见站内专文
        <a class="inline-ref" :href="withBase('/fate/changsheng')" target="_blank" rel="noreferrer">《十二长生》</a>。
      </p>
      <p class="sub-intro" v-else>本盘四支中没有辰、戌、丑、未，故无墓库。</p>

      <div class="ku-list" v-if="guide.muKu && guide.muKu.has">
        <div class="ku-card" v-for="(k, i) in guide.muKu.list" :key="'ku' + i">
          <div class="ku-head">
            <span class="ku-pos">{{ k.pos }}支</span>
            <span class="ku-branch">{{ k.branch }}</span>
            <span class="ku-name">{{ k.ku }}</span>
          </div>
          <div class="ku-desc">所藏：{{ k.desc || '—' }}</div>
        </div>
      </div>

      <p class="section-caveat" v-if="guide.muKu" v-html="rich(guide.muKu.note)"></p>
    </div>

    <!-- ============ 延伸阅读 ============ -->
    <div class="analysis-section" v-if="guide.commonRefs && guide.commonRefs.length">
      <h3 class="section-title">延伸阅读</h3>
      <p class="sub-intro">
        本栏只做「翻译」，上面出现的每个概念，站内都有专文细讲。
        想往下走的，从这里进（会开新标签页，不影响你当前的排盘结果）。
      </p>
      <div class="ref-grid">
        <a class="ref-card" v-for="(r, i) in guide.commonRefs" :key="'cr' + i"
           :href="withBase(r.to)" target="_blank" rel="noreferrer">
          <span class="ref-card-title">《{{ r.title }}》</span>
        </a>
      </div>
      <details class="ref-more">
        <summary>全部 {{ (guide.articles || []).length }} 篇命理专文</summary>
        <div class="ref-grid">
          <a class="ref-card" v-for="(r, i) in guide.articles" :key="'ar' + i"
             :href="withBase(r.to)" target="_blank" rel="noreferrer">
            <span class="ref-card-title">《{{ r.title }}》</span>
          </a>
        </div>
      </details>
    </div>

    <!-- ============ 页尾免责（本栏最重）============ -->
    <p class="section-caveat final" v-html="rich(guide.caveat)"></p>
  </div>

  <p v-else class="plain-note pad">排盘结果不足，无法生成导读。</p>
</template>

<script setup>
import { computed } from 'vue';
import { withBase } from 'vitepress';

const props = defineProps({
  guide: { type: Object, default: null }
});

// 用 computed 读取，而不是把 prop 快照成常量 —— 快照会切断响应式
const guide = computed(() => props.guide || null);

/**
 * 神煞的基准字串（模板里不便写箭头函数，放这里）
 */
const basisText = (s) =>
  ((s && s.bases) || []).map((b) => `${b.label}${b.char}`).join('、');

/** HTML 转义 —— 内容虽全出自本站静态表，仍照规矩先转义再标记 */
const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/**
 * 把文本里的 `**…**` 转成 <strong>。
 *
 * 必须走这一步：内核的文案用 `**` 标强调，若模板直接 {{ }} 渲染，
 * 页面上会出现**裸露的星号**（上一版就是这样，读者看到的是一堆 ** ）。
 * 先转义再替换，故不会引入注入风险。
 */
const rich = (s) => escapeHtml(s == null ? '' : s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
</script>

<style scoped>
.analysis-section {
  padding: 24px 0;
  border-top: 1px dashed var(--bz-blue-border-alt);
}

.analysis-section:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.section-title {
  font-size: var(--bz-fs-5);
  color: var(--bz-text-1);
  margin: 0 0 16px;
  font-weight: 600;
  padding-left: 12px;
  border-left: 4px solid var(--bz-teal-border-accent-deep);
}

.sub-intro {
  margin: 0 0 16px;
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.sub-intro strong { color: var(--bz-text-2); }

.sub-intro.tip {
  margin: 16px 0 0;
  padding: 8px 12px;
  background: var(--bz-surface);
  border-radius: var(--bz-r-sm);
  color: var(--bz-teal-fg-deep);
}

.theme-ask {
  margin: 0 0 20px;
  color: var(--bz-teal-fg-vivid-deep);
  font-size: var(--bz-fs-3);
  font-weight: 500;
}

/* ---- 阶梯 ---- */
.ladder {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.ladder-step {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: 8px;
}

.ladder-step.current {
  background: var(--bz-teal-tint);
  border-color: var(--bz-teal-border-2);
}

.ladder-name {
  font-weight: 600;
  color: var(--bz-text-1);
  font-size: var(--bz-fs-2);
  min-width: 132px;
}

.ladder-tag {
  font-size: var(--bz-fs-1);
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  color: var(--bz-on-accent);
  white-space: nowrap;
}

.ladder-tag.fact { background: var(--bz-btn-grey); }
.ladder-tag.judge { background: var(--bz-violet-fill); }
.ladder-tag.infer { background: var(--bz-red-fill); }
.ladder-tag.plain { background: var(--bz-teal-fill-deep); }

.ladder-text {
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.ladder-text strong { color: var(--bz-teal-fg-vivid-deep); }

/* ---- 硬约束 ---- */
.rule-box {
  background: var(--bz-teal-tint);
  border: 1px solid var(--bz-teal-border-2);
  border-left: 3px solid var(--bz-teal-border-accent-deep);
  border-radius: 8px;
  padding: 16px 16px;
}

.rule-head {
  font-weight: 600;
  color: var(--bz-teal-fg-vivid-deep);
  font-size: var(--bz-fs-3);
  margin-bottom: 8px;
}

.rule-list {
  margin: 0;
  padding-left: 20px;
}

.rule-list li {
  color: var(--bz-text-2);
  font-size: var(--bz-fs-2);
  line-height: 1.85;
  margin-bottom: 4px;
}

.rule-list li:last-child { margin-bottom: 0; }
.rule-list strong { color: var(--bz-text-1); }

/* ---- 入门问答 ---- */
.qa-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qa-item {
  padding: 12px 16px;
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  border-left: 3px solid var(--bz-teal-border-2);
  border-radius: 8px;
}

.qa-q {
  font-weight: 600;
  color: var(--bz-teal-fg-vivid-deep);
  font-size: var(--bz-fs-3);
  margin-bottom: 8px;
}

.qa-a {
  color: var(--bz-blue-fg-deep);
  font-size: var(--bz-fs-2);
  line-height: 1.9;
}

.qa-a strong { color: var(--bz-text-1); }

.qa-ref {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dotted var(--bz-blue-border-alt);
  color: var(--bz-text-4);
  font-size: var(--bz-fs-1);
}

/* ---- 十神一句话 ---- */
.brief-box {
  padding: 16px 16px;
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  border-left: 3px solid var(--bz-teal-border-accent-deep);
  border-radius: 8px;
}

.brief-text {
  color: var(--bz-blue-fg-deep);
  font-size: var(--bz-fs-2);
  line-height: 1.9;
}

.brief-text strong { color: var(--bz-text-1); }

.name-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.name-chip {
  font-size: var(--bz-fs-2);
  padding: 4px 12px;
  border-radius: 12px;
  background: var(--bz-teal-tint);
  color: var(--bz-teal-fg-vivid-deep);
  font-weight: 500;
}

.brief-hint {
  color: var(--bz-text-4);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

/* ---- 延伸阅读链接 ---- */
.ref-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.ref-label {
  color: var(--bz-text-4);
  font-size: var(--bz-fs-1);
}

.ref-link {
  font-size: var(--bz-fs-2);
  padding: 4px 12px;
  border-radius: 12px;
  background: var(--bz-blue-tint);
  color: var(--bz-blue-fg-vivid-mid);
  text-decoration: none;
  border: 1px solid var(--bz-blue-border-alt);
  transition: background 0.15s;
}

.ref-link:hover {
  background: var(--bz-blue-tint);
  color: var(--bz-blue-fg-deep);
}

.inline-ref {
  color: var(--bz-blue-fg-vivid-mid);
  text-decoration: none;
  border-bottom: 1px dotted var(--bz-blue-border-2-alt);
}

.inline-ref:hover { color: var(--bz-blue-fg-deep); }

.ref-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.ref-card {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}

.ref-card:hover {
  background: var(--bz-blue-tint);
  border-color: var(--bz-blue-border-2-alt);
}

.ref-card-title {
  color: var(--bz-blue-fg-vivid-mid);
  font-size: var(--bz-fs-2);
}

.ref-more {
  margin-top: 16px;
}

.ref-more summary {
  cursor: pointer;
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  outline: none;
}

.ref-more summary:hover { color: var(--bz-teal-fg-vivid-deep); }

.ref-more .ref-grid { margin-top: 12px; }

/* ---- 读法步骤 ---- */
.step-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 16px;
  background: var(--bz-surface);
  border: 1px solid var(--bz-blue-border-alt);
  border-radius: 8px;
}

.step-n {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bz-teal-fill-deep);
  color: var(--bz-on-accent);
  font-size: var(--bz-fs-1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0px;
}

.step-body { flex: 1; }

.step-t {
  font-weight: 600;
  color: var(--bz-text-1);
  font-size: var(--bz-fs-2);
  margin-bottom: 4px;
}

.step-d {
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.step-d strong { color: var(--bz-teal-fg-vivid-deep); }

/* ---- 先说人话 ---- */
.plain-box {
  margin-bottom: 20px;
  padding: 16px 16px;
  background: var(--bz-surface);
  border: 1px solid var(--bz-teal-border);
  border-left: 3px solid var(--bz-teal-border-accent-deep);
  border-radius: 8px;
}

.plain-head {
  font-weight: 600;
  color: var(--bz-teal-fg-vivid-deep);
  font-size: var(--bz-fs-2);
  margin-bottom: 8px;
}

.plain-text {
  color: var(--bz-teal-fg-deep);
  font-size: var(--bz-fs-2);
  line-height: 1.9;
}

.plain-text strong { color: var(--bz-teal-fg-deep); }

.plain-keys {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--bz-teal-border);
}

.plain-keys-head {
  color: var(--bz-text-3);
  font-size: var(--bz-fs-1);
  margin-bottom: 8px;
}

.plain-keys ul {
  margin: 0;
  padding-left: 20px;
}

.plain-keys li {
  color: var(--bz-text-2);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
  margin-bottom: 4px;
}

.plain-keys li:last-child { margin-bottom: 0; }
.plain-keys strong { color: var(--bz-teal-fg-deep); }

/* ---- 三段式区块 ---- */
.block { margin-bottom: 20px; }

.block-head {
  font-weight: 600;
  color: var(--bz-text-1);
  font-size: var(--bz-fs-3);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--bz-blue-border-alt);
}

.fact-tag,
.school-tag,
.result-tag {
  font-size: 0.7rem;
  font-weight: 400;
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  margin-left: 8px;
  white-space: nowrap;
}

.fact-tag { background: var(--bz-blue-tint); color: var(--bz-blue-fg-vivid-mid); }
.school-tag { background: var(--bz-amber-tint); color: var(--bz-amber-fg-vivid-mid); }
.result-tag { background: var(--bz-teal-tint); color: var(--bz-teal-fg-vivid-deep); }

/* ---- 术语 ---- */
.term-row {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px dotted var(--bz-blue-border-alt);
}

.term-row:last-child { border-bottom: none; }

.term-name {
  flex: 0 0 116px;
  color: var(--bz-teal-fg-vivid-deep);
  font-size: var(--bz-fs-2);
  font-weight: 600;
  line-height: var(--bz-lh-loose);
}

.term-plain {
  color: var(--bz-text-2);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.term-plain strong { color: var(--bz-text-1); }

/* ---- 事实 ---- */
.fact-group {
  margin-bottom: 12px;
}

.fact-group:last-child { margin-bottom: 0; }

.fact-label {
  color: var(--bz-text-3);
  font-size: var(--bz-fs-2);
  font-weight: 600;
  margin-bottom: 8px;
}

.fact-items {
  margin: 0;
  padding-left: 20px;
}

.fact-items li {
  color: var(--bz-text-1);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
  margin-bottom: 4px;
}

.fact-items li.tone-none { color: var(--bz-text-4); }
.fact-items li.tone-exposed { color: var(--bz-blue-text-deep); }
.fact-items li.tone-hidden { color: var(--bz-violet-fg-deep); }

.fact-text strong { color: var(--bz-teal-fg-deep); }

.fact-sub {
  display: block;
  color: var(--bz-text-4);
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
}

.fact-note {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--bz-surface);
  border-radius: var(--bz-r-sm);
  color: var(--bz-text-3);
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
}

/* ---- 通俗结果 ---- */
.result-box {
  padding: 16px 16px;
  background: var(--bz-amber-tint);
  border: 1px solid var(--bz-amber-border);
  border-left: 3px solid var(--bz-amber-border-accent-deep);
  border-radius: 8px;
}

.result-qa {
  padding: 8px 0;
  border-bottom: 1px dotted var(--bz-amber-border);
}

.result-qa:first-child { padding-top: 0; }
.result-qa:last-of-type { border-bottom: none; }

.result-q {
  color: var(--bz-amber-fg-vivid-mid);
  font-size: var(--bz-fs-2);
  font-weight: 600;
  margin-bottom: 4px;
}

.result-a {
  color: var(--bz-blue-fg-deep);
  font-size: var(--bz-fs-2);
  line-height: 1.85;
}

.result-a strong { color: var(--bz-text-1); }

.result-limit {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--bz-amber-border-2);
  color: var(--bz-amber-fg-mid);
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
}

.result-limit strong { color: var(--bz-amber-fg-mid); }

/* ---- 各家说法 ---- */
.school-row {
  padding: 8px 0;
  border-bottom: 1px dotted var(--bz-blue-border-alt);
}

.school-row:last-child { border-bottom: none; }

.school-line {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 4px;
}

.school-line:last-child { margin-bottom: 0; }

.side-badge {
  flex: 0 0 auto;
  font-size: 0.7rem;
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  margin-top: 4px;
  white-space: nowrap;
}

.side-badge.yes { background: var(--bz-teal-tint); color: var(--bz-green-fg-vivid-deep); }
.side-badge.no { background: var(--bz-red-tint); color: var(--bz-red-fg-vivid); }

.side-text {
  color: var(--bz-text-2);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

.side-text strong { color: var(--bz-text-1); }

/* ---- 神煞 ---- */
.ss-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 12px;
}

.ss-card {
  padding: 12px 16px;
  border: 1px solid var(--bz-blue-border-alt);
  border-left: 3px solid var(--bz-blue-border-alt);
  border-radius: 8px;
  background: var(--bz-surface);
}

.ss-card.hit {
  border-left-color: var(--bz-teal-border-accent-deep);
  background: var(--bz-surface);
}

.ss-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.ss-name {
  font-weight: 600;
  color: var(--bz-text-1);
  font-size: var(--bz-fs-3);
}

.ss-badge {
  font-size: 0.7rem;
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  white-space: nowrap;
}

.ss-badge.yes { background: var(--bz-teal-tint); color: var(--bz-teal-fg-vivid-deep); }
.ss-badge.no { background: var(--bz-surface); color: var(--bz-text-4); }

.ss-plain {
  color: var(--bz-teal-fg-vivid-deep);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
  margin-bottom: 8px;
}

.ss-rule,
.ss-basis {
  color: var(--bz-text-3);
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
}

.ss-basis { margin-bottom: 8px; }

.ss-nobasis {
  color: var(--bz-amber-fg-vivid-mid);
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
  margin-bottom: 8px;
}

.ss-hits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.ss-hit {
  font-size: var(--bz-fs-1);
  padding: 4px 8px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-teal-tint);
  color: var(--bz-teal-fg-vivid-deep);
}

.ss-none {
  color: var(--bz-text-4);
  font-size: var(--bz-fs-1);
  margin-bottom: 8px;
}

.ss-note {
  color: var(--bz-text-4);
  font-size: var(--bz-fs-1);
  line-height: var(--bz-lh-loose);
  padding-top: 8px;
  border-top: 1px dotted var(--bz-blue-border-alt);
}

/* ---- 墓库 ---- */
.ku-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.ku-card {
  padding: 12px 12px;
  border: 1px solid var(--bz-blue-border-alt);
  border-left: 3px solid var(--bz-blue-border-alt);
  border-radius: 8px;
  background: var(--bz-surface);
}

.ku-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ku-pos { color: var(--bz-text-3); font-size: var(--bz-fs-1); }

.ku-branch {
  font-weight: 600;
  color: var(--bz-text-1);
  font-size: var(--bz-fs-4);
}

.ku-name {
  font-size: var(--bz-fs-1);
  padding: 0px 8px;
  border-radius: var(--bz-r-sm);
  background: var(--bz-blue-tint);
  color: var(--bz-blue-fg-vivid-mid);
}

.ku-desc {
  color: var(--bz-text-2);
  font-size: var(--bz-fs-2);
  line-height: var(--bz-lh-loose);
}

/* ---- 通用 ---- */
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

.plain-note.pad { padding: 24px 0; }@container gz (max-width: 560px) {
  .term-row {
 flex-direction: column; gap: 4px; 
  }
  .term-name {
 flex: none; 
  }
  .ladder-name {
 min-width: auto; 
  }
}
</style>
