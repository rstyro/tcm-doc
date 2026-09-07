<template>
  <div class="jieqi-container">
    <!-- 头部标题区域 -->
    <div class="header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="title-wrapper">
          <h1 class="title">节气查询系统</h1>
        </div>
        <p class="subtitle">查询任意公历年份的二十四节气时间、农历日期与季节归属</p>
        <div class="header-decoration"></div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="query-card">
      <div class="query-header">
        <i class="icon-year"></i>
        <h2>节气年查询</h2>
      </div>

      <div class="query-form">
        <div class="form-group">
          <label for="yearInput" class="form-label">查询年份：</label>
          <div class="input-wrapper">
            <input
                type="number"
                id="yearInput"
                v-model="inputYear"
                placeholder="请输入公历年份（如：2026）"
                class="year-input"
                :min="minYear"
                :max="maxYear"
                @keyup.enter="runQuery"
            />
            <i class="icon-calendar"></i>
          </div>
          <div class="year-range">年份范围：{{ minYear }} - {{ maxYear }}</div>
        </div>

        <div class="year-presets">
          <button
              v-for="preset in yearPresets"
              :key="preset.year"
              @click="setPresetYear(preset.year)"
              class="year-preset-btn"
              :class="{ 'current': preset.current }"
          >
            {{ preset.label }}
          </button>
        </div>

        <button
            @click="runQuery"
            class="query-btn"
            :class="{ 'disabled': !isValidYear }"
            :disabled="!isValidYear"
        >
          <i class="icon-search"></i>
          查询节气
        </button>
      </div>

      <div class="query-tips">
        <i class="icon-info"></i>
        <span>传统以「立春」为一岁之始：输入年份即查询自该年立春起、至次年大寒的 24 个节气交节时刻（北京时间）</span>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div v-if="result" class="result-card">
      <div class="result-header">
        <div class="result-title">
          <i class="icon-result"></i>
          <h2>查询结果</h2>
        </div>
        <div class="result-year">
          <div class="result-year-main">{{ result.queryYear }} 节气年</div>
          <div class="result-year-range">
            {{ result.firstDateText }} 立春 至 {{ result.lastDateText }} 大寒
          </div>
        </div>
      </div>

      <!-- 节 / 中气 图例 -->
      <div class="legend-bar">
        <span class="legend-item">
          <span class="type-badge type-jie">节</span>
          「节」· 月令之始（立春、惊蛰、清明等十二个）
        </span>
        <span class="legend-item">
          <span class="type-badge type-zhong">中气</span>
          「中气」· 月中主气（雨水、春分、秋分等十二个）
        </span>
        <span class="legend-item">
          <span class="legend-note">黄经自立春 315° 起，每节气递增 15°（春分 0° 即 360°）</span>
        </span>
      </div>

      <!-- 四季分组 -->
      <section
          v-for="season in result.seasons"
          :key="season.key"
          class="season-section"
          :class="'season-' + season.key"
      >
        <h3 class="section-title">
          <span class="season-icon">{{ season.icon }}</span>
          {{ season.name }}季 · {{ season.headName }}至{{ season.tailName }}
        </h3>
        <div class="term-grid">
          <article
              v-for="term in season.terms"
              :key="term.index"
              class="term-card"
              :class="[term.seasonCls, term.isNearest ? 'is-nearest' : '']"
          >
            <div class="term-head">
              <h4 class="term-name">{{ term.name }}</h4>
              <span
                  class="type-badge"
                  :class="term.type === '节' ? 'type-jie' : 'type-zhong'"
              >{{ term.type }}</span>
            </div>
            <div class="term-jing">太阳到达黄经 {{ term.jing }}°</div>
            <div class="term-solar">
              <i class="mini-icon">📅</i>{{ term.dateText }} {{ term.timeText }}
            </div>
            <div class="term-lunar">
              <i class="mini-icon">🌙</i>农历 {{ term.lunarText }}
            </div>
            <p class="term-desc">{{ term.desc }}</p>
            <div v-if="term.isNearest" class="term-near">☀️ 距今日最近的节气 · {{ term.nearText }}</div>
          </article>
        </div>
      </section>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button @click="clearResult" class="clear-btn">
          <i class="icon-refresh"></i>
          重新查询
        </button>
        <button @click="setCurrentYear" class="current-year-btn">
          <i class="icon-clock"></i>
          今年
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🌱</div>
      <h3>输入年份查询节气</h3>
      <p>请输入要查询的公历年份，查看以立春为岁首的二十四节气交节时刻与农历日期</p>
      <button @click="setCurrentYear" class="current-year-btn empty-btn">
        <i class="icon-clock"></i>
        查询今年
      </button>
      <div class="empty-decoration"></div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <div class="footer-content">
        <p>节气查询系统 &copy; {{ getCurrentYear() }} 传统文化工具</p>
        <div class="footer-decoration"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SolarTerm from '../utils/SolarTerm.js';

const solarTerm = new SolarTerm();

// 响应式数据
const inputYear = ref('');
const result = ref(null);

// 年份范围
const minYear = 1900;
const maxYear = 2999;

// 节气名称常量：顺序与 getSolarTermDate 返回一致（自该年立春起）
const TERM_NAMES = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
];

// 每节气太阳黄经度数：立春 315°，每节气递增 15°，春分为 0°（即 360°）
const TERM_JING = TERM_NAMES.map((_, i) => (315 + i * 15) % 360);

// 一句话传统文化释义（客观介绍，不作天气与吉凶预测）
const TERM_DESCS = [
  '二十四节气之首，古人以立春为春季之始，此后阳气渐升、万物复苏。',
  '传统认为此时气温回升、冰雪消融、降水渐增，利于草木萌发。',
  '古人以为春雷乍动，惊醒蛰伏过冬的虫兽，田间农事自此展开。',
  '此日昼夜几乎等长，古人视春分为春季之中点，此后白昼渐长。',
  '天气回暖、草木繁茂，自古有踏青郊游与祭扫先人的习俗。',
  '古称“雨生百谷”，传统认为此时雨水增多，最宜谷类作物生长。',
  '夏季之始，古人以立夏为万物由生转盛、加速生长的时节。',
  '麦类夏熟作物籽粒渐满而未大熟，取其“小得盈满”之意。',
  '有芒的麦子可收、谷黍可种，农事繁忙，民间谐称为“忙种”。',
  '北半球白昼最长之日，古人以夏至为盛夏之极，此后白昼渐短。',
  '暑热渐盛而未至极点，古人将炎热之候分为小暑与大暑两级。',
  '一年中最炎热的时段，传统认为此期湿热交蒸、雨量丰沛。',
  '秋季之始，古人以立秋为暑气渐消、禾谷渐次成熟之候。',
  '“处”含终止之意，古人认为此时暑气退去，秋凉即将到来。',
  '昼夜温差渐大，清晨草木凝露，传统以此表征秋意加深。',
  '此日昼夜再次几乎等长，古人视秋分为秋季之中点。',
  '气温继续走低，露水转凉近寒，传统以此划分深秋之候。',
  '古人认为此时气温骤降、露凝为霜，正值秋末向初冬过渡。',
  '冬季之始，古人以立冬为万物收敛归藏、规避寒冷的时节。',
  '降水渐以雪的形式出现而雪量尚小，传统以此标志初冬之雪。',
  '降雪渐密、范围渐广，古人以大雪表征仲冬严寒之候。',
  '北半球白昼最短、黑夜最长之日，古人称其为“阴极阳生”的转折点。',
  '一年中最冷时段之一，传统常“小寒大寒”并称，喻寒冬正盛。',
  '二十四节气之末，古人认为此时寒气至盛，过后又将迎来新的立春。'
];

// 四季分组定义（每季 6 个节气，按立春起的节气年切分）
const SEASON_DEFS = [
  { key: 'spring', name: '春', icon: '🌸', color: '#6aab77' },
  { key: 'summer', name: '夏', icon: '☀️', color: '#dfa04e' },
  { key: 'autumn', name: '秋', icon: '🍂', color: '#c99a3f' },
  { key: 'winter', name: '冬', icon: '❄️', color: '#5c83ad' }
];

// 农历日文本映射：1→初一、10→初十、21→廿一、30→三十
const lunarDayText = (day) => {
  const text1 = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九'];
  const text2 = ['初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九'];
  const text3 = ['二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九'];
  if (!day || day < 1 || day > 30) return '';
  if (day < 10) return text1[day];
  if (day < 20) return text2[day - 10];
  if (day < 30) return text3[day - 20];
  return '三十';
};

const pad2 = (n) => String(n).padStart(2, '0');
const fmtDateText = (d) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
const fmtTimeText = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

// 年份预设快捷按钮
const yearPresets = computed(() => {
  const cy = getCurrentYear();
  return [
    { year: cy - 2, label: `${cy - 2}` },
    { year: cy - 1, label: '去年' },
    { year: cy, label: '今年', current: true },
    { year: cy + 1, label: '明年' },
    { year: cy + 2, label: `${cy + 2}` }
  ];
});

// 计算属性
const isValidYear = computed(() => {
  const year = parseInt(inputYear.value);
  return !isNaN(year) && year >= minYear && year <= maxYear;
});

// 方法
const getCurrentYear = () => new Date().getFullYear();

const setPresetYear = (year) => {
  inputYear.value = year;
  runQuery();
};

const setCurrentYear = () => {
  inputYear.value = getCurrentYear();
  runQuery();
};

// 农历日期文本：如「腊月廿五」「闰六月廿三」，转换失败返回 '—'
const buildLunarText = (dateObj) => {
  try {
    const lunar = solarTerm.solarToLunar(dateObj);
    if (!lunar) return '—';
    const dayText = lunarDayText(lunar.lunarDay);
    return dayText ? `${lunar.mon}${dayText}` : '—';
  } catch (e) {
    console.error('农历转换失败：', e);
    return '—';
  }
};

const buildResult = (year) => {
  // 返回 24 个 Date：自该年立春起至次年大寒，已含北京时间
  const dates = solarTerm.getSolarTermDate(year);
  if (!dates || dates.length !== 24) {
    throw new Error('节气数据返回异常');
  }

  // 找出距今日最近的节气
  const now = Date.now();
  let nearestIndex = 0;
  let nearestDiff = Infinity;
  dates.forEach((d, i) => {
    const diff = Math.abs(d.getTime() - now);
    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearestIndex = i;
    }
  });

  const items = dates.map((date, i) => {
    const days = Math.round((date.getTime() - now) / 86400000);
    const nearText = days === 0 ? '今日交节' : (days > 0 ? `还有 ${days} 天` : `已过 ${Math.abs(days)} 天`);
    return {
      index: i,
      name: TERM_NAMES[i],
      date,
      jing: TERM_JING[i],
      type: i % 2 === 0 ? '节' : '中气',
      dateText: fmtDateText(date),
      timeText: fmtTimeText(date),
      lunarText: buildLunarText(date),
      desc: TERM_DESCS[i],
      isNearest: i === nearestIndex,
      nearText
    };
  });

  const seasons = SEASON_DEFS.map((def, s) => ({
    ...def,
    headName: TERM_NAMES[s * 6],
    tailName: TERM_NAMES[s * 6 + 5],
    terms: items.slice(s * 6, s * 6 + 6).map(t => ({ ...t, seasonCls: 'clr-' + def.key }))
  }));

  return {
    queryYear: year,
    firstDateText: items[0].dateText,
    lastDateText: items[23].dateText,
    seasons
  };
};

const runQuery = () => {
  if (!isValidYear.value) {
    alert(`请输入有效的年份（${minYear}-${maxYear}）`);
    return;
  }

  const year = parseInt(inputYear.value);
  try {
    result.value = buildResult(year);
  } catch (err) {
    alert(`查询失败：${err.message}`);
    console.error('节气查询异常：', err);
  }
};

const clearResult = () => {
  result.value = null;
  inputYear.value = '';
};

// 组件挂载时默认填入今年
onMounted(() => {
  inputYear.value = getCurrentYear();
});
</script>

<style scoped>
/* 全局样式 */
.jieqi-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
  background: linear-gradient(165deg, #f7faf6 0%, #edf3ea 55%, #f6f2e6 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 头部样式 */
.header {
  position: relative;
  margin-bottom: 40px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  background: linear-gradient(135deg, #2f6d5a 0%, #4a9d82 100%);
  clip-path: polygon(0 0, 100% 0, 100% 86%, 0 100%);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 56px 20px 38px;
  color: white;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 14px;
}

.title {
  font-size: 2.8rem;
  color: white;
  margin: 0;
  font-weight: 700;
  letter-spacing: 4px;
  background: linear-gradient(120deg, #f6e7b2, #fdf6dd, #ecd396);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.92);
  font-size: 1.12rem;
  margin: 0 0 18px;
}

.header-decoration {
  width: 220px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #ecd396, transparent);
  margin: 0 auto;
  border-radius: 2px;
}

/* 查询卡片 */
.query-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 28px 32px;
  margin: 0 20px 30px;
  box-shadow: 0 15px 35px rgba(47, 109, 90, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.query-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: #2f6d5a;
  padding-bottom: 14px;
  border-bottom: 2px solid #e2efe6;
}

.query-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.query-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #2f5f50;
  font-size: 1rem;
  margin-bottom: 2px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.year-input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border: 2px solid #bcd6c9;
  border-radius: 12px;
  font-size: 1.05rem;
  color: #2f5f50;
  background: #f7fbf8;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.year-input:focus {
  outline: none;
  border-color: #2f6d5a;
  background: white;
  box-shadow: 0 0 0 3px rgba(47, 109, 90, 0.12);
}

.year-range {
  color: #6f8d80;
  font-size: 0.88rem;
  margin-top: 2px;
}

.year-presets {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.year-preset-btn {
  padding: 8px 18px;
  background: #eef5f1;
  border: 1.5px solid #bcd6c9;
  border-radius: 9px;
  font-size: 0.95rem;
  color: #2f6d5a;
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 500;
}

.year-preset-btn:hover {
  background: #2f6d5a;
  color: white;
  border-color: #2f6d5a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 109, 90, 0.25);
}

.year-preset-btn.current {
  background: linear-gradient(135deg, #2f6d5a 0%, #4a9d82 100%);
  color: #fff;
  border-color: #2f6d5a;
  box-shadow: 0 4px 12px rgba(47, 109, 90, 0.28);
}

.query-btn {
  background: linear-gradient(135deg, #2f6d5a 0%, #4a9d82 100%);
  color: white;
  border: none;
  padding: 15px 36px;
  border-radius: 12px;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-top: 6px;
  letter-spacing: 2px;
  box-shadow: 0 6px 18px rgba(47, 109, 90, 0.25);
}

.query-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(47, 109, 90, 0.35);
}

.query-btn.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #9db8ad;
  box-shadow: none;
}

.query-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #f1f7f3;
  border-left: 3px solid #bcd6c9;
  border-radius: 8px;
  color: #55796c;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* 结果卡片 */
.result-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 20px;
  padding: 28px 32px;
  margin: 0 20px 30px;
  box-shadow: 0 15px 35px rgba(47, 109, 90, 0.12);
  animation: fadeUp 0.5s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #edf2e8;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-title h2 {
  margin: 0;
  font-size: 1.45rem;
  color: #2f5f50;
  font-weight: 600;
}

.result-year {
  text-align: right;
}

.result-year-main {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2f6d5a;
  font-family: 'SimSun', 'STKaiti', serif;
}

.result-year-range {
  font-size: 0.85rem;
  color: #6f8d80;
  margin-top: 2px;
}

/* 图例条 */
.legend-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 22px;
  padding: 12px 16px;
  margin-bottom: 24px;
  background: #f6f8f2;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #55796c;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-note {
  color: #7b8f86;
  font-size: 0.85rem;
}

/* 节/中气 徽标 */
.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.6;
  white-space: nowrap;
}

.type-jie {
  background: #f8edd2;
  color: #96701c;
  border: 1px solid #e2c98a;
}

.type-zhong {
  background: #ddede5;
  color: #2f6d5a;
  border: 1px solid #a7cdbd;
}

/* 四季分区 */
.season-section {
  margin-top: 28px;
}

.season-section .section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  font-size: 1.18rem;
  font-weight: 600;
  color: #33413c;
  padding-left: 12px;
  border-left: 5px solid #ccc;
}

.season-icon {
  font-size: 1.25rem;
}

.season-spring .section-title { border-left-color: #6aab77; }
.season-summer .section-title { border-left-color: #dfa04e; }
.season-autumn .section-title { border-left-color: #c99a3f; }
.season-winter .section-title { border-left-color: #5c83ad; }

/* 节气卡片网格 */
.term-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}

.term-card {
  position: relative;
  background: white;
  border-radius: 14px;
  border: 1px solid #e6e9df;
  border-top: 4px solid #ccc;
  padding: 16px 16px 14px;
  box-shadow: 0 4px 14px rgba(51, 65, 60, 0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.term-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 26px rgba(51, 65, 60, 0.14);
}

/* 四季卡片配色 */
.term-card.clr-spring { border-top-color: #6aab77; }
.term-card.clr-summer { border-top-color: #dfa04e; }
.term-card.clr-autumn { border-top-color: #c99a3f; }
.term-card.clr-winter { border-top-color: #5c83ad; }

.term-card.clr-spring:hover { border-color: #a9cfae; }
.term-card.clr-summer:hover { border-color: #ecc598; }
.term-card.clr-autumn:hover { border-color: #dcc488; }
.term-card.clr-winter:hover { border-color: #a9c0da; }

/* 距今日最近节气高亮 */
.term-card.is-nearest {
  border: 1.5px solid #d4b36a;
  box-shadow: 0 6px 20px rgba(196, 156, 66, 0.22);
}

.term-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.term-name {
  margin: 0;
  font-size: 1.42rem;
  color: #2c4a3e;
  font-weight: 700;
  font-family: 'SimSun', 'STKaiti', serif;
  letter-spacing: 2px;
}

.term-jing {
  font-size: 0.82rem;
  color: #8a9c92;
  margin-bottom: 10px;
  font-family: 'SimSun', 'STKaiti', serif;
  letter-spacing: 0.5px;
}

.term-solar,
.term-lunar {
  font-size: 0.92rem;
  color: #3d514a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini-icon {
  font-style: normal;
  font-size: 0.9rem;
}

.term-desc {
  margin: 10px 0 4px;
  padding-top: 10px;
  border-top: 1px dashed #e3e8de;
  font-size: 0.84rem;
  color: #687a72;
  line-height: 1.65;
  flex-grow: 1;
}

.term-near {
  margin-top: 8px;
  padding: 4px 10px;
  background: #fdf3d8;
  color: #8a6a1e;
  border-radius: 6px;
  font-size: 0.8rem;
  text-align: center;
  font-weight: 500;
}

/* 操作区域 */
.action-section {
  margin-top: 32px;
  padding-top: 22px;
  border-top: 2px solid #edf2e8;
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

.clear-btn,
.current-year-btn {
  padding: 13px 34px;
  border-radius: 11px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
}

.clear-btn {
  background: #e9eeea;
  color: #33413c;
}

.clear-btn:hover {
  background: #d5e0d9;
  transform: translateY(-1px);
}

.current-year-btn {
  background: linear-gradient(135deg, #2f6d5a 0%, #4a9d82 100%);
  color: white;
  box-shadow: 0 5px 14px rgba(47, 109, 90, 0.25);
}

.current-year-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(47, 109, 90, 0.35);
}

/* 空状态 */
.empty-state {
  position: relative;
  text-align: center;
  padding: 70px 30px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 20px;
  margin: 0 20px 30px;
  color: #8a9c92;
  border: 1.5px solid #d8e4db;
  box-shadow: 0 15px 35px rgba(47, 109, 90, 0.1);
  overflow: hidden;
}

.empty-icon {
  font-size: 3.6rem;
  margin-bottom: 18px;
  animation: floatPulse 2.4s ease-in-out infinite;
}

@keyframes floatPulse {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.empty-state h3 {
  margin: 0 0 10px;
  color: #2f5f50;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 0.98rem;
  color: #6f8d80;
  line-height: 1.6;
}

.empty-btn {
  margin: 0 auto;
}

.empty-decoration {
  position: absolute;
  bottom: -30px;
  right: -30px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(106, 171, 119, 0.08) 0%, rgba(106, 171, 119, 0) 70%);
  z-index: 0;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 34px 20px;
  color: #5d7a6e;
  font-size: 0.95rem;
  border-top: 1.5px solid #dfe8dd;
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.55);
  position: relative;
}

.footer-content {
  position: relative;
  z-index: 1;
}

.footer-decoration {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #bcd6c9, transparent);
}

.footer p {
  margin: 0;
  font-weight: 500;
}

/* 图标样式 */
.icon-year::before {
  content: "📅";
  font-size: 1.35rem;
}

.icon-calendar::before {
  content: "📅";
  position: absolute;
  left: 17px;
  top: 50%;
  transform: translateY(-50%);
  color: #6f8d80;
  font-size: 1.05rem;
}

.icon-search::before {
  content: "🔍";
}

.icon-info::before {
  content: "💡";
}

.icon-result::before {
  content: "🍃";
  font-size: 1.3rem;
}

.icon-refresh::before {
  content: "🔄";
}

.icon-clock::before {
  content: "⏰";
}

/* 响应式设计 */
@media (max-width: 768px) {
  .jieqi-container {
    padding: 0;
  }

  .title {
    font-size: 2.1rem;
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 0.98rem;
    line-height: 1.6;
  }

  .query-card,
  .result-card {
    padding: 20px 18px;
    margin: 0 12px 22px;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-year {
    text-align: left;
  }

  .term-grid {
    grid-template-columns: 1fr;
  }

  .empty-state {
    padding: 50px 20px;
    margin: 0 12px 22px;
  }
}
</style>
