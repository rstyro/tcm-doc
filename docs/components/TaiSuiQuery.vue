<template>
  <div class="taisui-container">
    <!-- 头部标题区域 -->
    <div class="header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="title-wrapper">
          <h1 class="title">太岁查询系统</h1>
        </div>
        <p class="subtitle">输入年份查询该年太岁、犯太岁生肖及化解建议</p>
        <div class="header-decoration"></div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="query-card">
      <div class="query-header">
        <h2><i class="icon-year"></i> 年份查询</h2>
      </div>

      <div class="query-form">
        <div class="form-group">
          <label for="yearInput" class="form-label">查询年份：</label>
          <div class="input-wrapper">
            <input
                type="number"
                id="yearInput"
                v-model="inputYear"
                placeholder="请输入年份（如：2024）"
                class="year-input"
                :min="minYear"
                :max="maxYear"
                @keyup.enter="queryTaiSui"
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
            @click="queryTaiSui"
            class="query-btn"
            :class="{ 'disabled': !isValidYear }"
            :disabled="!isValidYear"
        >
          <i class="icon-search"></i>
          查询太岁信息
        </button>
      </div>

      <div class="query-tips">
        <i class="icon-info"></i>
        <span>太岁亦称"岁神"，每年由一位太岁神轮值，当年轮值的太岁神叫值年太岁</span>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div v-if="resultInfo" class="result-card">
      <div class="result-header">
        <div class="result-title">
          <h2><i class="icon-result"></i> 查询结果 - {{ resultInfo.year }}年</h2>
        </div>
        <div class="result-ganzhi">
          {{ resultInfo.ganZhi }}
        </div>
      </div>

      <!-- 简洁概览 -->
      <div class="summary-bar">
        <div class="summary-item">
          <span class="summary-label">当年生肖</span>
          <span class="summary-value">
            <span class="zodiac-icon">{{ resultInfo.yearZodiac?.icon || '🐲' }}</span>
            {{ resultInfo.yearZodiac?.name }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">值年太岁</span>
          <span class="summary-value">
            {{ resultInfo.taisuiList.find(t => t.type.name === '本命年')?.zodiac?.name || '未知' }} 年
          </span>
        </div>
        <div v-if="resultInfo.hasBadTaiSui" class="summary-item warning">
          <span class="summary-label">犯太岁数量</span>
          <span class="summary-value">{{ resultInfo.badTaiSuiCount }} 种</span>
        </div>
      </div>


      <!-- 太岁详情 -->
      <div class="taisui-detail-section">
        <h3 class="section-title">太岁详情</h3>

        <!-- 犯太岁生肖 -->
        <div v-if="resultInfo.badTaiSuiList.length > 0" class="bad-taisui-section">
          <h4 class="subsection-title"><i class="icon-warning"></i>犯太岁生肖</h4>
          <div class="taisui-list-container">
              <div
                   v-for="(taisui, index) in resultInfo.badTaiSuiList"
                   :key="index"
                   class="taisui-item"
                   @mouseenter="onCardHover(index, true)"
                   @mouseleave="onCardHover(index, false)"
              >
                <div class="taisui-item-header">
                  <div class="taisui-type">{{ taisui.type.name }}</div>
                </div>
                <div class="taisui-item-zodiac">
                  <div
                      class="taisui-item-zodiac-icon"
                      v-for="(zodiacItem, zIndex) in taisui.zodiacList"
                      :key="zIndex"
                  >
                      <div>{{ zodiacItem.zodiac.icon }}</div>
                      <div class="taisui-item-zodiac-name">{{ zodiacItem.zodiac.name }}</div>
                  </div>
                </div>

                <div class="taisui-desc">
                  <div v-for="(item, idx) in (taisui.type.desc || '').split(',')" :key="idx" class="desc-item">
                    {{ item }}
                  </div>
                </div>

              </div>
          </div>

        </div>

        <!-- 三合六合关系 -->
        <div v-if="resultInfo.goodTaiSuiList.length > 0" class="good-taisui-section">
          <h4 class="subsection-title"><i class="icon-good"></i>吉象太岁</h4>
          <div class="taisui-list-container">
            <div
                v-for="(taisui, index) in resultInfo.goodTaiSuiList"
                :key="index"
                class="taisui-item"
                @mouseenter="onCardHover(index, true)"
                @mouseleave="onCardHover(index, false)"
            >

              <div class="taisui-item-header">
                <div class="taisui-type">{{ taisui.type.name }}</div>
              </div>
              <div class="taisui-item-zodiac">
                <div class="taisui-item-zodiac-icon"
                    v-for="(zodiacItem, zIndex) in taisui.zodiacList"
                    :key="zIndex"
                >
                  <div>{{ zodiacItem.zodiac.icon }}</div>
                  <div class="taisui-item-zodiac-name">{{ zodiacItem.zodiac.name }}</div>
                </div>
              </div>

              <div class="taisui-desc">
                <div v-for="(item, idx) in (taisui.type.desc || '').split(',')" :key="idx" class="desc-item">
                  {{ item }}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- 犯凶星信息 -->
      <div class="evil-star-section">
        <h3 class="section-title">
          <i class="icon-evil-star"></i>
          {{ resultInfo.year }}年犯凶星生肖
        </h3>
        <div class="evil-star-grid">
          <div 
            v-for="(item, index) in sortedEvilStars"
            :key="index"
            class="evil-star-card"
            :class="{
              'big-evil': item.evilStar.luckLevel === '大凶',
              'small-evil': item.evilStar.luckLevel === '小凶',
              'neutral': item.evilStar.luckLevel === '中',
              'good': item.evilStar.luckLevel === '吉'
            }"
          >
            <div class="evil-star-icon">{{ item.icon }}</div>
            <div class="evil-star-name">{{ item.name }}</div>
            <div class="evil-star-type">{{ item.evilStar.shortName }}</div>
            <div class="evil-star-desc">
              <div v-for="(item, idx) in (item.evilStar.desc || '').split('、')" :key="idx">
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 化解建议 -->
      <div class="suggestion-section">
        <h3 class="section-title">化解建议</h3>
        <div class="suggestion-list">
          <div 
            class="suggestion-item" 
            v-for="(item, index) in suggestions" 
            :key="index"
            @mouseenter="onSuggestionHover(index, true)"
            @mouseleave="onSuggestionHover(index, false)"
          >
            <div class="suggestion-icon">{{ item.icon }}</div>
            <div class="suggestion-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 重新查询按钮 -->
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
      <div class="empty-icon">🧧</div>
      <h3>输入年份查询</h3>
      <p>请输入要查询的年份，查看该年太岁及犯太岁生肖</p>
      <button @click="setCurrentYear" class="current-year-btn empty-btn">
        <i class="icon-clock"></i>
        查询今年
      </button>
      <div class="empty-decoration"></div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <div class="footer-content">
        <p>太岁查询系统 &copy; {{ getCurrentYear() }} 传统文化工具</p>
        <div class="footer-decoration"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import TaiSuiUtils from '../utils/taiSuiUtils.js';
import EvilStarUtils from '../utils/evilStarUtils.js';

// 响应式数据
const inputYear = ref('');
const resultInfo = ref(null);
const hoveredCardIndex = ref(-1);
const hoveredSuggestionIndex = ref(-1);

// 年份范围
const minYear = 1000;
const maxYear = 10000;

// 排序后的凶星列表
const sortedEvilStars = computed(() => {
  if (!resultInfo.value?.evilStarInfo?.list) return [];
  
  // 定义排序优先级,越小优先级越高
  const luckLevelPriority = {
    '中': 1,
    '大凶': 2,
    '小凶': 3,
    '吉': 4
  };
  
  return [...resultInfo.value.evilStarInfo.list].sort((a, b) => {
    const priorityA = luckLevelPriority[a.evilStar.luckLevel] || 999;
    const priorityB = luckLevelPriority[b.evilStar.luckLevel] || 999;
    return priorityA - priorityB;
  });
});

// 年份预设
const yearPresets = computed(() => {
  const currentYear = getCurrentYear();
  return [
    {year: currentYear - 1, label: '去年'},
    {year: currentYear, label: '今年', current: true},
    {year: currentYear + 1, label: '明年'},
    {year: currentYear + 2, label: currentYear + 2},
    {year: currentYear + 3, label: currentYear + 3},
  ];
});

// 化解建议
const suggestions = [
  {
    icon: '🙏',
    title: '拜太岁',
    desc: '可前往道观或寺庙进行拜太岁仪式，祈求太岁神护佑平安。最佳时间为正月初一至十五。'
  },
  {
    icon: '🔮',
    title: '佩戴吉祥物',
    desc: '根据个人生肖和八字，佩戴相应的开光吉祥物，如太岁符、本命佛、五行手链等。'
  },
  {
    icon: '🎨',
    title: '调整风水',
    desc: '注意家中和办公室的风水布局，避免在太岁方位动土、装修，可摆放化解太岁的风水物品。'
  },
  {
    icon: '💖',
    title: '行善积德',
    desc: '多行善事，积累福报。犯太岁之年更应保持平和心态，避免口舌是非，谨慎投资。'
  },
  {
    icon: '👔',
    title: '谨言慎行',
    desc: '在工作和生活中注意言行，避免冲动决策，处理好人际关系，特别注意健康和安全。'
  },
  {
    icon: '💰',
    title: '保守理财',
    desc: '投资理财需谨慎，避免高风险投资，注意守财，可适当进行慈善捐赠化解破财风险。'
  }
];

// 计算属性
const isValidYear = computed(() => {
  const year = parseInt(inputYear.value);
  return !isNaN(year) && year >= minYear && year <= maxYear;
});

// 方法
const getCurrentYear = () => {
  return new Date().getFullYear();
};

const setPresetYear = (year) => {
    inputYear.value = year;
    queryTaiSui();
};

const setCurrentYear = () => {
  inputYear.value = getCurrentYear();
  if (!resultInfo.value) {
    queryTaiSui();
  }
};

const queryTaiSui = () => {
  if (!isValidYear.value) {
    alert(`请输入有效的年份（${minYear}-${maxYear}）`);
    return;
  }

  const year = parseInt(inputYear.value);

  try {
    // 获取干支
    const ganZhi = TaiSuiUtils.getYearGanZhi(year);

    // 获取太岁信息
    const taisuiList = TaiSuiUtils.getTaiSuiInfoByYear(year);

    console.log("taisuiList=",JSON.stringify(taisuiList));

    // 获取该年生肖
    const yearZodiac = TaiSuiUtils.getZodiacByYear(year);

    // 分离好坏太岁
    const badTaiSuiTypes = ['本命年', '冲太岁', '害太岁', '刑太岁', '破太岁'];
    const goodTaiSuiTypes = ['六合太岁', '三合太岁'];

    const badTaiSuiList = taisuiList.filter(item => badTaiSuiTypes.includes(item.type.name));
    const goodTaiSuiList = taisuiList.filter(item => goodTaiSuiTypes.includes(item.type.name));

    // 收集所有犯太岁的生肖
    const badTaiSuiZodiacs = [];
    const zodiacMap = new Map();

    badTaiSuiList.forEach(taisui => {
      if (taisui.zodiac && !zodiacMap.has(taisui.zodiac.name)) {
        zodiacMap.set(taisui.zodiac.name, taisui.zodiac);
        badTaiSuiZodiacs.push(taisui.zodiac);
      }
    });

    // 收集所有吉星生肖
    const goodTaiSuiZodiacs = [];
    const goodZodiacMap = new Map();

    goodTaiSuiList.forEach(taisui => {
      if (taisui.zodiac && !goodZodiacMap.has(taisui.zodiac.name)) {
        goodZodiacMap.set(taisui.zodiac.name, taisui.zodiac);
        goodTaiSuiZodiacs.push(taisui.zodiac);
      }
    });

    // 获取犯凶星信息
    const evilStarInfo = EvilStarUtils.getEvilStarsByYear(year);
    
    // 过滤出凶星（大凶和小凶）
    const evilStars = evilStarInfo.list.filter(item => 
      item.evilStar.luckLevel === '大凶' || item.evilStar.luckLevel === '小凶'
    );

    resultInfo.value = {
      year,
      ganZhi,
      yearZodiac,
      taisuiList,
      badTaiSuiList,
      goodTaiSuiList,
      badTaiSuiZodiacs,
      goodTaiSuiZodiacs,
      hasBadTaiSui: badTaiSuiList.length > 0,
      badTaiSuiCount: badTaiSuiList.length,
      evilStarInfo,
      evilStars
    };
  } catch (err) {
    alert(`查询失败：${err.message}`);
    console.error('太岁查询异常：', err);
  }
};

const clearResult = () => {
  resultInfo.value = null;
  inputYear.value = '';
};

// 交互方法
const onCardHover = (index, isHovering) => {
  hoveredCardIndex.value = isHovering ? index : -1;
};

const onSuggestionHover = (index, isHovering) => {
  hoveredSuggestionIndex.value = isHovering ? index : -1;
};

// 组件挂载时初始化当前年份
onMounted(() => {
  inputYear.value = getCurrentYear();
});
</script>

<style scoped >

/* 全局样式 */
.taisui-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
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
  height: 300px;
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 60px 20px 40px;
  color: white;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.title {
  padding: 10px 0px;
  font-size: 3rem;
  color: white;
  margin: 0;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  margin: 0 0 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.header-decoration {
  width: 200px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
  margin: 0 auto;
  border-radius: 2px;
}

.taisui-list-container{
  display: flex;
  justify-content: space-around;
}

.taisui-item-zodiac{
  display: flex;
  justify-content: space-around;
}

.taisui-item-zodiac-icon{
  font-size: 23px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.taisui-item-zodiac-name{
  font-size: 18px;
  font-weight: bold;
}


/* 查询卡片 */
.query-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin: 0 20px 30px;
  box-shadow: 0 15px 35px rgba(139, 69, 19, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.query-card:hover {
  box-shadow: 0 20px 40px rgba(139, 69, 19, 0.2);
  transform: translateY(-15px);
}

.query-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 30px;
  color: #8b4513;
  padding-bottom: 15px;
  border-bottom: 2px solid #f5deb3;
}

.query-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.query-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-weight: 600;
  color: #8b4513;
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.year-input {
  width: 100%;
  padding: 16px 24px 16px 55px;
  border: 3px solid #d2b48c;
  border-radius: 15px;
  font-size: 1.1rem;
  color: #8b4513;
  background: linear-gradient(135deg, #faf0e6 0%, #fff8f0 100%);
  transition: all 0.3s ease;
  box-sizing: border-box;
  box-shadow: inset 0 2px 4px rgba(139, 69, 19, 0.1);
}

.year-input:focus {
  outline: none;
  border-color: #8b4513;
  background: white;
  box-shadow: 0 0 0 4px rgba(139, 69, 19, 0.15), inset 0 2px 4px rgba(139, 69, 19, 0.1);
  transform: translateY(-2px);
}

.year-range {
  color: #a0522d;
  font-size: 0.9rem;
  margin-top: 4px;
}

.year-presets {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.year-preset-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #f5deb3 0%, #deb887 100%);
  border: 2px solid #d2b48c;
  border-radius: 10px;
  font-size: 1rem;
  color: #8b4513;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.year-preset-btn:hover {
  background: linear-gradient(135deg, #deb887 0%, #8b4513 100%);
  color: white;
  border-color: #8b4513;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
}

.year-preset-btn.current {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border-color: #8b4513;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.query-btn {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  margin-top: 15px;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
}

.query-btn:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(139, 69, 19, 0.4);
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
}

.query-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #d2b48c;
  box-shadow: none;
}

.query-tips {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 25px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #faf0e6 0%, #fff8f0 100%);
  border-radius: 12px;
  color: #8b4513;
  font-size: 0.95rem;
  border: 2px solid #d2b48c;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.1);
}

/* 结果卡片 */
.result-card {
  background: white;
  border-radius: 25px;
  padding: 40px;
  margin: 0 20px 40px;
  box-shadow: 0 15px 40px rgba(139, 69, 19, 0.15);
  animation: slideIn 0.6s ease-out;
  border: 1px solid #d2b48c;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8b4513, #d2b48c, #8b4513);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
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
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 3px solid #f5deb3;
}

.result-title {
  color: #8b4513;
}

.result-title h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.result-ganzhi {
  font-size: 1.3rem;
  color: #a0522d;
  font-weight: 600;
  background: linear-gradient(135deg, #faf0e6 0%, #fff8f0 100%);
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid #d2b48c;
  font-family: 'SimSun', 'STKaiti', serif;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.1);
}

/* 简洁概览条 */
.summary-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 40px;
  padding: 20px;
  background: #faf0e6;
  border-radius: 20px;
  border: 2px solid #d2b48c;
  box-shadow: inset 0 2px 4px rgba(139, 69, 19, 0.05);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
  padding: 10px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.1);
}

.summary-item.warning {
  background: #fff0f0;
  border-left: 4px solid #dc143c;
}

.summary-label {
  font-size: 0.9rem;
  color: #8b4513;
  opacity: 0.8;
  margin-bottom: 6px;
}

.summary-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #5a3e2b;
}

/* 太岁详情 */
.taisui-detail-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  color: #8b4513;
  margin-bottom: 25px;
  font-weight: 600;
  padding-left: 15px;
  border-left: 6px solid #8b4513;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subsection-title {
  font-size: 1.3rem;
  color: #8b4513;
  margin-bottom: 20px;
  font-weight: 600;
  padding-left: 12px;
  border-left: 4px solid #d2b48c;
  display: flex;
  align-items: center;
  gap: 8px;
}


.taisui-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 3px solid;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.taisui-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: all 0.3s ease;
}

.taisui-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.taisui-item-header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.taisui-type {
  font-size: 1.2rem;
  font-weight: 700;
  color: #8b4513;
  text-align: center;
}

.taisui-desc {
  margin-top: 12px;
  line-height: 1.6;
}

.desc-item {
  margin-bottom: 8px;
  color: #666;
  font-size: 0.95rem;
  text-align: center;
}

.desc-item:last-child {
  margin-bottom: 0;
}

.taisui-item-body {
  display: flex;
  gap: 30px;
  align-items: center;
}

.taisui-zodiac-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.taisui-zodiac-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.taisui-zodiac-icon {
  font-size: 3rem;
  line-height: 1;
}

.taisui-zodiac-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #8b4513;
}

.taisui-zodiac-branch {
  font-size: 1rem;
  font-weight: 500;
  color: #a0522d;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid #d2b48c;
}

.taisui-desc {
  flex: 1;
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
}

.taisui-suggestion {
  font-size: 0.9rem;
  color: #8b4513;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 16px;
  border-radius: 8px;
  border-left: 4px solid #8b4513;
  font-style: italic;
  margin-top: 12px;
}

/* 犯太岁生肖 */
.bad-taisui-section {
  margin-top: 40px;
  padding-top: 35px;
  border-top: 3px solid #f5deb3;
}

.warning-tips {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  border-radius: 12px;
  color: #dc143c;
  font-size: 1rem;
  border: 2px solid #ffb6c1;
  box-shadow: 0 4px 12px rgba(220, 20, 60, 0.1);
  font-weight: 500;
}

/* 吉星高照 */
.good-taisui-section {
  margin-top: 40px;
  padding-top: 35px;
  border-top: 3px solid #f5deb3;
}

.good-tips {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0fff0 0%, #e0ffe0 100%);
  border-radius: 12px;
  color: #228b22;
  font-size: 1rem;
  border: 2px solid #90ee90;
  box-shadow: 0 4px 12px rgba(34, 139, 34, 0.1);
  font-weight: 500;
}

/* 化解建议 */
.suggestion-section {
  margin-top: 40px;
  padding-top: 35px;
  border-top: 3px solid #f5deb3;
}

.suggestion-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-top: 25px;
}

.suggestion-item {
  display: flex;
  gap: 20px;
  background: linear-gradient(135deg, #faf0e6 0%, #fff8f0 100%);
  border-radius: 16px;
  padding: 25px;
  border: 2px solid #d2b48c;
  transition: all 0.4s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.suggestion-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, #8b4513, #d2b48c);
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #fff8f0 0%, white 100%);
  border-color: #8b4513;
}

.suggestion-item:hover::before {
  width: 8px;
  background: linear-gradient(180deg, #d2b48c, #8b4513);
}

.suggestion-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.suggestion-item:hover .suggestion-icon {
  transform: scale(1.1) rotate(10deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.suggestion-content h4 {
  margin: 0 0 12px 0;
  color: #8b4513;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.suggestion-item:hover .suggestion-content h4 {
  color: #a0522d;
  transform: translateX(4px);
}

.suggestion-content p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.suggestion-item:hover .suggestion-content p {
  color: #555;
}

/* 操作区域 */
.action-section {
  margin-top: 40px;
  padding-top: 35px;
  border-top: 3px solid #f5deb3;
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.clear-btn,
.current-year-btn {
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.4s ease;
  border: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.clear-btn {
  background: linear-gradient(135deg, #f5deb3 0%, #deb887 100%);
  color: #8b4513;
  border: 2px solid #d2b48c;
}

.clear-btn:hover {
  background: linear-gradient(135deg, #deb887 0%, #8b4513 100%);
  color: white;
  border-color: #8b4513;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3);
}

.current-year-btn {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: 2px solid #8b4513;
}

.current-year-btn:hover {
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 20px;
  margin: 40px 20px;
  color: #d2b48c;
  border: 2px solid #d2b48c;
  box-shadow: 0 15px 40px rgba(139, 69, 19, 0.15);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
}

.empty-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8b4513, #d2b48c, #8b4513);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 30px;
  opacity: 0.8;
  animation: pulse 2s infinite;
}

.empty-state h3 {
  margin: 0 0 16px 0;
  color: #8b4513;
  font-size: 1.8rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 30px 0;
  font-size: 1.1rem;
  color: #a0522d;
  line-height: 1.5;
}

.empty-btn {
  margin: 0 auto;
  padding: 16px 40px;
  font-size: 1.1rem;
}

.empty-decoration {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05), rgba(139, 69, 19, 0.1));
  border-radius: 50%;
  z-index: 0;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 40px 20px;
  color: #a0522d;
  font-size: 1rem;
  border-top: 2px solid #d2b48c;
  margin-top: 60px;
  background: rgba(255, 255, 255, 0.8);
  position: relative;
  backdrop-filter: blur(10px);
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
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d2b48c, transparent);
}

.footer p {
  margin: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer p::before,
.footer p::after {
  content: '🧧';
  font-size: 1rem;
  opacity: 0.6;
}

/* 犯凶星样式 */
.evil-star-section {
  margin-top: 40px;
  padding-top: 35px;
  border-top: 3px solid #f5deb3;
}

.evil-star-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 25px;
}

.evil-star-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  padding: 10px;
  text-align: center;
  transition: all 0.3s ease;
  border: 3px solid;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.evil-star-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

.evil-star-card.big-evil {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  border-color: #8b0000;
  color: white;
}

.evil-star-card.small-evil {
  background: linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%);
  border-color: #dc143c;
  color: white;
}

.evil-star-card.neutral {
  background: linear-gradient(135deg, #666666 0%, #808080 100%);
  border-color: #666666;
  color: white;
}

.evil-star-card.good {
  background: linear-gradient(135deg, #228b22 0%, #32cd32 100%);
  border-color: #228b22;
  color: white;
}

.evil-star-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
}

.evil-star-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.evil-star-type {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.evil-star-desc {
  font-size: 0.9rem;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* 图标样式 */
.icon-year::before {
  content: "📅";
  font-size: 1.5rem;
}

.icon-calendar::before {
  content: "📅";
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0522d;
  font-size: 1.2rem;
}

.icon-search::before {
  content: "🔍";
  font-size: 1.2rem;
}

.icon-info::before {
  content: "💡";
  font-size: 1.2rem;
}

.icon-result::before {
  content: "🧧";
  font-size: 1.5rem;
}

.icon-refresh::before {
  content: "🔄";
  font-size: 1.2rem;
}

.icon-clock::before {
  content: "⏰";
  font-size: 1.2rem;
}

.icon-warning::before {
  content: "🚩";
  font-size: 1.2rem;
}

.icon-good::before {
  content: "✨";
  font-size: 1.2rem;
}

.icon-evil-star::before {
  content: "🌟";
  font-size: 1.2rem;
}

</style>
