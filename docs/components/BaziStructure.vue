<template>
  <div v-if="structure">
    <!-- 关系概览 -->
    <div class="analysis-section">
      <h3 class="section-title">关系概览</h3>
      <div class="stat-row">
        <span class="stat" :class="{ zero: !summary.branchPairCount }">
          <b>{{ summary.branchPairCount }}</b> 处地支关系
        </span>
        <span class="stat" :class="{ zero: !summary.stemPairCount }">
          <b>{{ summary.stemPairCount }}</b> 处天干合冲
        </span>
        <span class="stat" :class="{ zero: !summary.formationCount }">
          <b>{{ summary.formationCount }}</b> 个成局
        </span>
        <span class="stat" :class="{ zero: !summary.halfCount }">
          <b>{{ summary.halfCount }}</b> 个半合
        </span>
        <span class="stat" :class="{ zero: !summary.exposedCount }">
          <b>{{ summary.exposedCount }}</b> 个藏干透出
        </span>
      </div>
      <p class="section-caveat">
        本页只列<strong>客观存在</strong>的结构：哪些字之间成立哪种关系、哪些藏干透到了天干上、哪个天干在哪几支有根。
        「合而化不化」「成局力量多大」「据此取什么格局」属判断层面，各派分歧极大，不在此下结论。
      </p>
    </div>

    <!-- 地支关系 -->
    <div class="analysis-section">
      <h3 class="section-title">地支关系</h3>
      <div class="rel-list" v-if="structure.matrix.branchPairs.length">
        <div class="rel-row" v-for="(p, i) in structure.matrix.branchPairs" :key="'bp' + i">
          <span class="rel-pos">{{ p.a.pos }}支 {{ p.a.char }}</span>
          <span class="rel-tags">
            <span
                class="rel-tag"
                :class="'tone-' + r.tone"
                v-for="(r, j) in p.relations"
                :key="'r' + j"
                :title="r.desc"
            >{{ r.type }}</span>
          </span>
          <span class="rel-pos">{{ p.b.pos }}支 {{ p.b.char }}</span>
        </div>
      </div>
      <p class="plain-note" v-else>四支之间不见刑冲合害。</p>
      <p class="section-caveat">
        一对地支可以同时成立<strong>多重</strong>关系——寅亥＝六合＋六破，巳申＝六合＋六破＋相刑，午午＝自刑，
        这并非重复统计，而是传统关系中本就并存的几层。
      </p>
    </div>

    <!-- 天干关系 -->
    <div class="analysis-section">
      <h3 class="section-title">天干关系</h3>
      <div class="rel-list" v-if="structure.matrix.stemPairs.length">
        <div class="rel-row" v-for="(p, i) in structure.matrix.stemPairs" :key="'sp' + i">
          <span class="rel-pos">{{ p.a.pos }}干 {{ p.a.char }}</span>
          <span class="rel-tags">
            <span
                class="rel-tag"
                :class="'tone-' + r.tone"
                v-for="(r, j) in p.relations"
                :key="'sr' + j"
                :title="r.desc"
            >{{ r.type }}</span>
          </span>
          <span class="rel-pos">{{ p.b.pos }}干 {{ p.b.char }}</span>
        </div>
      </div>
      <p class="plain-note" v-else>四干之间不见五合与相冲。</p>
      <p class="section-caveat">
        此处<strong>只列五合与相冲</strong>。五行生克在天干之间几乎处处成立，一并列出会冒出七八条，
        把真正有分量的合与冲淹没掉。
      </p>
    </div>

    <!-- 成局与半合 -->
    <div class="analysis-section" v-if="structure.matrix.formations.length || structure.matrix.halves.length">
      <h3 class="section-title">成局与半合</h3>
      <div class="form-grid">
        <div class="form-card" v-for="(f, i) in structure.matrix.formations" :key="'f' + i">
          <div class="form-head">
            <span class="form-type">{{ f.type }}</span>
            <span class="form-gz">{{ f.group }}</span>
            <span class="form-el" :class="'el-' + f.element">{{ f.element }}</span>
          </div>
          <div class="form-pos">{{ f.positions.join(' · ') }} 位三字齐全</div>
          <div class="form-extra" v-if="f.exposedStems.length">
            天干已透 {{ f.exposedStems.join('、') }}
          </div>
          <div class="form-extra muted" v-else>天干未见{{ f.element }}透出</div>
        </div>

        <div class="form-card half" v-for="(h, i) in structure.matrix.halves" :key="'h' + i">
          <div class="form-head">
            <span class="form-type">{{ h.kind }}</span>
            <span class="form-gz">{{ h.group }}</span>
            <span class="form-el" :class="'el-' + h.element">{{ h.element }}</span>
          </div>
          <div class="form-pos">{{ h.positions.join(' · ') }} 位（{{ h.of }} 之半）</div>
        </div>
      </div>
      <p class="section-caveat">
        三合局与三会方以<strong>三字齐全</strong>为成局，故无论「合化」。三字未齐的两字组合按传统名称标为
        生旺半合 · 墓半合 · 拱合（三合）、半会 · 拱会（三会）—— 这些名称只描述<strong>组合形态</strong>，
        不含力量大小的定论；「透干即化」亦非通说。
      </p>
    </div>

    <!-- 透干 -->
    <div class="analysis-section">
      <h3 class="section-title">透干</h3>
      <div class="tg-grid">
        <div class="tg-col" v-for="(t, i) in structure.touGan" :key="'tg' + i">
          <div class="tg-head">
            <span class="tg-pos">{{ t.pos }}支</span>
            <span class="tg-zhi" :class="{ ling: t.isMonthLing }">{{ t.branch }}</span>
          </div>
          <div
              class="tg-item"
              v-for="(c, j) in t.cang"
              :key="'c' + j"
              :class="{ exposed: c.exposed }"
          >
            <span class="tg-gan">{{ c.gan }}</span>
            <span class="tg-god">{{ c.god }}</span>
            <span class="tg-qi">{{ c.qiType }}</span>
            <span class="tg-exposed" v-if="c.exposed">透{{ c.exposedAt.map((x) => x.pos).join('') }}</span>
          </div>
        </div>
      </div>
      <p class="section-caveat">
        透干即地支藏干在四柱天干上出现。传统论格局最重<strong>月令</strong>（月支，图中高亮）的藏干是否透出，
        但「透了便如何取用」是判断层的分歧所在，此处只标出事实。
      </p>
    </div>

    <!-- 通根 -->
    <div class="analysis-section">
      <h3 class="section-title">通根</h3>
      <div class="root-list">
        <div class="root-row" v-for="(t, i) in structure.tongGen" :key="'rr' + i">
          <div class="root-head">
            <span class="root-gan">{{ t.pos }}干 {{ t.stem }}</span>
            <span class="root-strength" :class="{ none: !t.rooted }">
              {{ t.rooted ? t.strongest + '根' : '无根' }}
            </span>
            <span class="root-sit" v-if="t.rooted">{{ t.zuoZhi.hasRoot ? '坐支有根' : '坐支无根' }}</span>
          </div>
          <div class="root-chips">
            <span class="root-chip" v-for="(r, j) in t.roots" :key="'rc' + j">
              {{ r.pos }}{{ r.zhi }}·{{ r.gan }}<em>{{ r.qiType }}</em>
            </span>
            <span class="root-none" v-if="!t.roots.length">四支藏干中无{{ t.element }}</span>
          </div>
        </div>
      </div>
      <p class="section-caveat">
        通根按<strong>同五行</strong>论 —— 甲、乙同属木，藏干见乙亦算甲木之根；其中<strong>同字之根</strong>最实，
        已在标签中注明。分量按藏干序位：本气 &gt; 中气 &gt; 余气。
      </p>
    </div>
  </div>

  <div v-else class="plain-note pad">尚未排盘。</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  structure: { type: Object, default: null }
});

const EMPTY = { branchPairCount: 0, stemPairCount: 0, formationCount: 0, halfCount: 0, exposedCount: 0 };

const summary = computed(() => {
  const s = props.structure;
  if (!s) return EMPTY;
  return {
    branchPairCount: s.matrix.branchPairs.length,
    stemPairCount: s.matrix.stemPairs.length,
    formationCount: s.matrix.formations.length,
    halfCount: s.matrix.halves.length,
    exposedCount: s.summary.exposedCount
  };
});
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
  border-left: 4px solid #3498db;
}

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

.section-caveat strong { color: #5d6d7e; }

.plain-note {
  margin: 0;
  color: #95a5a6;
  font-size: 0.88rem;
  line-height: 1.7;
}

.plain-note.pad { padding: 24px 0; }

/* ===== 概览统计 ===== */
.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat {
  padding: 8px 14px;
  background: #eaf4fd;
  border: 1px solid #cfe3f7;
  border-radius: 10px;
  color: #2471a3;
  font-size: 0.86rem;
}

.stat.zero {
  background: #f8fafc;
  border-color: #e8ecf1;
  color: #b0b8c1;
}

.stat b {
  font-size: 1.05rem;
  margin-right: 4px;
}

/* ===== 关系列表 ===== */
.rel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rel-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  flex-wrap: wrap;
}

.rel-pos {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 74px;
}

.rel-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.rel-tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
}

.rel-tag.tone-he { background: #eafaf1; border: 1px solid #b8e6cc; color: #1e8449; }
.rel-tag.tone-chong { background: #fdecea; border: 1px solid #f5b7b1; color: #c0392b; }
.rel-tag.tone-neutral { background: #f1f2f6; border: 1px solid #e0e6ed; color: #7f8c8d; }

/* ===== 成局卡片 ===== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.form-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f2fbf6;
  border: 1px solid #cdeadd;
}

.form-card.half {
  background: #f8fafc;
  border-color: #e0e6ed;
}

.form-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.form-type {
  font-size: 0.76rem;
  padding: 2px 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #cdeadd;
  color: #1e8449;
}

.form-card.half .form-type {
  border-color: #e0e6ed;
  color: #7f8c8d;
}

.form-gz {
  font-size: 1.15rem;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 2px;
}

.form-el {
  font-size: 0.82rem;
  font-weight: 600;
}

.form-el.el-木 { color: #1e8449; }
.form-el.el-火 { color: #c0392b; }
.form-el.el-土 { color: #b9770e; }
.form-el.el-金 { color: #7f8c8d; }
.form-el.el-水 { color: #2471a3; }

.form-pos {
  font-size: 0.82rem;
  color: #5d6d7e;
}

.form-extra {
  margin-top: 6px;
  font-size: 0.8rem;
  color: #1e8449;
}

.form-extra.muted { color: #95a5a6; }

/* ===== 透干 ===== */
.tg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.tg-col {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
}

.tg-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e0e6ed;
}

.tg-pos {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.tg-zhi {
  font-size: 1.05rem;
  font-weight: 600;
  color: #2c3e50;
}

.tg-zhi.ling {
  color: #2471a3;
  padding: 1px 8px;
  background: #eaf4fd;
  border-radius: 6px;
}

.tg-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  margin-bottom: 4px;
  font-size: 0.82rem;
  background: #fff;
  border: 1px solid #eef1f5;
  color: #7f8c8d;
}

.tg-item.exposed {
  background: #f2fbf6;
  border-color: #cdeadd;
  color: #2c3e50;
}

.tg-gan {
  font-weight: 600;
  color: #2c3e50;
  min-width: 18px;
}

.tg-god { flex: 1; }

.tg-qi { font-size: 0.74rem; color: #a6adb4; }

.tg-exposed {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 5px;
  background: #eafaf1;
  color: #1e8449;
  border: 1px solid #b8e6cc;
  white-space: nowrap;
}

/* ===== 通根 ===== */
.root-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.root-row {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
}

.root-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.root-gan {
  font-size: 0.92rem;
  font-weight: 600;
  color: #2c3e50;
}

.root-strength {
  font-size: 0.78rem;
  padding: 2px 9px;
  border-radius: 6px;
  background: #eafaf1;
  border: 1px solid #b8e6cc;
  color: #1e8449;
}

.root-strength.none {
  background: #f1f2f6;
  border-color: #e0e6ed;
  color: #a6adb4;
}

.root-sit {
  font-size: 0.76rem;
  color: #95a5a6;
}

.root-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.root-chip {
  padding: 3px 9px;
  background: #eaf4fd;
  border: 1px solid #cfe3f7;
  border-radius: 6px;
  color: #2471a3;
  font-size: 0.78rem;
  white-space: nowrap;
}

.root-chip em {
  font-style: normal;
  color: #7fb3d5;
  margin-left: 3px;
  font-size: 0.72rem;
}

.root-none {
  font-size: 0.8rem;
  color: #b0b8c1;
}

@media (max-width: 640px) {
  .tg-grid, .form-grid { grid-template-columns: 1fr; }
  .rel-pos { min-width: auto; }
}
</style>
