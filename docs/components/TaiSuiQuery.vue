<template>
  <div class="taisui-container">
    <!-- 头部标题区域 -->
    <div class="header">
      <h1 class="title">太岁查询系统</h1>
      <p class="subtitle">输入年份查询该年太岁、犯太岁生肖及化解建议</p>
    </div>

    <!-- 查询区域 -->
    <div class="query-card">
      <div class="query-header">
        <i class="icon-year"></i>
        <h2>年份查询</h2>
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
          <i class="icon-result"></i>
          <h2>查询结果 - {{ resultInfo.year }}年</h2>
        </div>
        <div class="result-ganzhi">
          {{ resultInfo.ganZhi }}
        </div>
      </div>

      <!-- 概览区域 -->
      <div class="overview-section">
        <div class="zodiac-badge">
          <span class="zodiac-icon">{{ resultInfo.yearZodiac?.icon || '🐲' }}</span>
          <span class="zodiac-text">{{ resultInfo.yearZodiac?.name }}年</span>
        </div>
        <div class="taisui-badge">
          <span class="taisui-icon">🧧</span>
          <span class="taisui-text">值年太岁</span>
        </div>
        <div class="warning-badge" v-if="resultInfo.hasBadTaiSui">
          <i class="icon-warning"></i>
          <span>有{{ resultInfo.badTaiSuiCount }}种犯太岁</span>
        </div>
      </div>

      <!-- 太岁详情 -->
      <div class="taisui-detail-section">
        <h3 class="section-title">太岁详情</h3>

        <!--  犯太岁生肖 -->
        <div class="taisui-grid">
          <div
              v-for="(taisui, index) in resultInfo.badTaiSuiList"
              :key="index"
              class="taisui-card"
              :class="getTaiSuiCardClass(taisui.type)"
          >
            <div class="taisui-card-header">
              <div class="taisui-type">{{ taisui.type.desc }}</div>
            </div>
            <div class="taisui-card-body">
              <div class="taisui-desc">{{ taisui.desc }}</div>
              <div class="taisui-suggestion" v-if="getTaiSuiSuggestion(taisui.type)">
                {{ getTaiSuiSuggestion(taisui.type) }}
              </div>
            </div>
            <div class="taisui-card-footer">
              <div class="taisui-branch" v-if="taisui.earthlyBranch">
                地支：{{ taisui.earthlyBranch.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- 三合六合关系 -->
        <div class="taisui-grid">
          <div
              v-for="(taisui, index) in resultInfo.goodTaiSuiList"
              :key="index"
              class="taisui-card"
              :class="getTaiSuiCardClass(taisui.type)"
          >
            <div class="taisui-card-header">
              <div class="taisui-type">{{ taisui.type.desc }}</div>
            </div>
            <div class="taisui-card-body">
              <div class="taisui-desc">{{ taisui.desc }}</div>
              <div class="taisui-suggestion" v-if="getTaiSuiSuggestion(taisui.type)">
                {{ getTaiSuiSuggestion(taisui.type) }}
              </div>
            </div>
            <div class="taisui-card-footer">
              <div class="taisui-branch" v-if="taisui.earthlyBranch">
                地支：{{ taisui.earthlyBranch.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 化解建议 -->
      <div class="suggestion-section">
        <h3 class="section-title">化解建议</h3>
        <div class="suggestion-list">
          <div class="suggestion-item" v-for="(item, index) in suggestions" :key="index">
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
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p>太岁查询系统 &copy; {{ getCurrentYear() }} 传统文化工具</p>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import TaiSuiUtils from '../utils/taiSuiUtils.js';

// 响应式数据
const inputYear = ref('');
const resultInfo = ref(null);

// 年份范围
const minYear = 1900;
const maxYear = 2100;


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

    /*
    * taisuiList= [{"type":{"desc":"本命年"},"earthlyBranch":{"name":"午"},"zodiac":{"name":"马","branch":{"name":"午"},"icon":"🐎"},"desc":"本命年：午(马🐎)"},{"type":{"desc":"冲太岁"},"earthlyBranch":{"name":"子"},"zodiac":{"name":"鼠","branch":{"name":"子"},"icon":"🐭"},"desc":"冲太岁：子(鼠🐭)"},{"type":{"desc":"害太岁"},"earthlyBranch":{"name":"丑"},"zodiac":{"name":"牛","branch":{"name":"丑"},"icon":"🐮"},"desc":"害太岁：丑(牛🐮)"},{"type":{"desc":"刑太岁"},"earthlyBranch":{"name":"午"},"zodiac":{"name":"马","branch":{"name":"午"},"icon":"🐎"},"desc":"刑太岁：午(马🐎)"},{"type":{"desc":"破太岁"},"earthlyBranch":{"name":"卯"},"zodiac":{"name":"兔","branch":{"name":"卯"},"icon":"🐰"},"desc":"破太岁：卯(兔🐰)"},{"type":{"desc":"六合太岁"},"earthlyBranch":{"name":"未"},"zodiac":{"name":"羊","branch":{"name":"未"},"icon":"🐑"},"desc":"六合太岁：未(羊🐑)"},{"type":{"desc":"三合太岁"},"earthlyBranch":{"name":"午"},"zodiac":{"name":"马","branch":{"name":"午"},"icon":"🐎"},"desc":"三合太岁：午(马) 合局: 寅(虎🐯)、戌(狗🐶)"}]
    * */
    console.log("taisuiList=",JSON.stringify(taisuiList));

    // 获取该年生肖
    const yearZodiac = TaiSuiUtils.getZodiacByYear(year);

    // 分离好坏太岁
    const badTaiSuiTypes = ['本命年', '冲太岁', '害太岁', '刑太岁', '破太岁'];
    const goodTaiSuiTypes = ['六合太岁', '三合太岁'];

    const badTaiSuiList = taisuiList.filter(item => badTaiSuiTypes.includes(item.type.desc));
    const goodTaiSuiList = taisuiList.filter(item => goodTaiSuiTypes.includes(item.type.desc));

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
      badTaiSuiCount: badTaiSuiList.length
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

const getTaiSuiCardClass = (type) => {
  const typeClassMap = {
    'ZHI_TAI_SUI': 'card-zhi',
    'CHONG_TAI_SUI': 'card-chong',
    'HAI_TAI_SUI': 'card-hai',
    'XING_TAI_SUI': 'card-xing',
    'PO_TAI_SUI': 'card-po',
    'HE_LIU_TAI_SUI': 'card-heliu',
    'HE_SAN_TAI_SUI': 'card-hesan'
  };
  return typeClassMap[type] || '';
};

const getTaiSuiTypeClass = (type) => {
  const typeClassMap = {
    'ZHI_TAI_SUI': 'badge-zhi',
    'CHONG_TAI_SUI': 'badge-chong',
    'HAI_TAI_SUI': 'badge-hai',
    'XING_TAI_SUI': 'badge-xing',
    'PO_TAI_SUI': 'badge-po',
    'HE_LIU_TAI_SUI': 'badge-heliu',
    'HE_SAN_TAI_SUI': 'badge-hesan'
  };
  return typeClassMap[type] || '';
};

const getShortTypeName = (type) => {
  const nameMap = {
    'ZHI_TAI_SUI': '值',
    'CHONG_TAI_SUI': '冲',
    'HAI_TAI_SUI': '害',
    'XING_TAI_SUI': '刑',
    'PO_TAI_SUI': '破',
    'HE_LIU_TAI_SUI': '六合',
    'HE_SAN_TAI_SUI': '三合'
  };
  return nameMap[type] || type;
};

const getTaiSuiSuggestion = (type) => {
  const suggestionMap = {
    'ZHI_TAI_SUI': '本命年，运势起伏较大，需特别谨慎',
    'CHONG_TAI_SUI': '冲太岁，易有变动、冲突，注意人际关系',
    'HAI_TAI_SUI': '害太岁，易遭陷害、中伤，注意小人',
    'XING_TAI_SUI': '刑太岁，易有官非、是非，注意法律问题',
    'PO_TAI_SUI': '破太岁，易有破财、破坏，注意财务安全',
    'HE_LIU_TAI_SUI': '六合太岁，有贵人相助，运势较佳',
    'HE_SAN_TAI_SUI': '三合太岁，合作顺利，事业有发展'
  };
  return suggestionMap[type];
};

const getZodiacTaiSuiTypes = (zodiac) => {
  if (!resultInfo.value) return [];
  return resultInfo.value.badTaiSuiList
      .filter(taisui => taisui.zodiac?.name === zodiac.name)
      .map(taisui => taisui.type);
};

const getZodiacGoodTaiSuiTypes = (zodiac) => {
  if (!resultInfo.value) return [];
  return resultInfo.value.goodTaiSuiList
      .filter(taisui => taisui.zodiac?.name === zodiac.name)
      .map(taisui => taisui.type);
};

// 组件挂载时初始化当前年份
onMounted(() => {
  inputYear.value = getCurrentYear();
});
</script>

<style scoped>
/* 全局样式 */
.taisui-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
  min-height: 100vh;
}

/* 头部样式 */
.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
}

.title {
  font-size: 2.5rem;
  color: #8b4513;
  margin-bottom: 10px;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: #a0522d;
  font-size: 1.1rem;
  margin: 0;
}

/* 查询卡片 */
.query-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(139, 69, 19, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.query-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  color: #8b4513;
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
  font-weight: 500;
  color: #8b4513;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.year-input {
  width: 100%;
  padding: 14px 20px 14px 45px;
  border: 2px solid #d2b48c;
  border-radius: 12px;
  font-size: 1rem;
  color: #8b4513;
  background: #faf0e6;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.year-input:focus {
  outline: none;
  border-color: #8b4513;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.year-range {
  color: #a0522d;
  font-size: 0.85rem;
  margin-top: 4px;
}

.year-presets {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.year-preset-btn {
  padding: 8px 16px;
  background: #f5deb3;
  border: 1px solid #d2b48c;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #8b4513;
  cursor: pointer;
  transition: all 0.2s ease;
}

.year-preset-btn:hover {
  background: #deb887;
  color: white;
  border-color: #8b4513;
}

.year-preset-btn.current {
  background: #8b4513;
  color: white;
  border-color: #8b4513;
}

.query-btn {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: none;
  padding: 16px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.query-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
}

.query-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #d2b48c;
}

.query-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 16px;
  background: #faf0e6;
  border-radius: 8px;
  color: #8b4513;
  font-size: 0.9rem;
  border: 1px solid #d2b48c;
}

/* 结果卡片 */
.result-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(139, 69, 19, 0.1);
  animation: slideIn 0.5s ease-out;
  border: 1px solid #d2b48c;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
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
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0e6d6;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8b4513;
}

.result-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.result-ganzhi {
  font-size: 1.2rem;
  color: #a0522d;
  font-weight: 600;
  background: #faf0e6;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d2b48c;
  font-family: 'SimSun', 'STKaiti', serif;
}

/* 概览区域 */
.overview-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
}

.zodiac-badge {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ffeaa7 0%, #f4a460 100%);
  border-radius: 12px;
  color: #8b4513;
  font-weight: 600;
  font-size: 1.1rem;
  border: 2px solid #deb887;
}

.zodiac-icon {
  font-size: 1.5rem;
  margin-right: 8px;
}

.taisui-badge {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #dc143c 0%, #b22222 100%);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.taisui-icon {
  font-size: 1.5rem;
  margin-right: 8px;
}

.warning-badge {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.warning-badge i {
  margin-right: 8px;
}

/* 太岁详情 */
.taisui-detail-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.2rem;
  color: #8b4513;
  margin-bottom: 20px;
  font-weight: 600;
  padding-left: 10px;
  border-left: 4px solid #8b4513;
}

.taisui-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.taisui-card {
  background: white;
  border-radius: 12px;
  padding: 10px;
  border: 2px solid;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.taisui-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.taisui-card.card-zhi {
  border-color: #dc143c;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
}

.taisui-card.card-chong {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
}

.taisui-card.card-hai {
  border-color: #ff8c00;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
}

.taisui-card.card-xing {
  border-color: #dc143c;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
}

.taisui-card.card-po {
  border-color: #ff6347;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
}

.taisui-card.card-heliu {
  border-color: #32cd32;
  background: linear-gradient(135deg, #f0fff0 0%, #e0ffe0 100%);
}

.taisui-card.card-hesan {
  border-color: #228b22;
  background: linear-gradient(135deg, #f0fff0 0%, #e0ffe0 100%);
}

.taisui-card-header {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.taisui-type {
  font-size: 1rem;
  font-weight: 600;
  color: #8b4513;
}

.taisui-zodiac {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #a0522d;
}

.zodiac-icon-small {
  font-size: 1rem;
}

.taisui-card-body {
  flex-grow: 1;
  margin-bottom: 12px;
}

.taisui-desc {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.taisui-suggestion {
  font-size: 0.85rem;
  color: #8b4513;
  background: rgba(255, 255, 255, 0.7);
  padding: 6px 10px;
  border-radius: 6px;
  border-left: 3px solid #8b4513;
  font-style: italic;
}

.taisui-card-footer {
  font-size: 0.85rem;
  color: #a0522d;
  margin-top: auto;
}

/* 犯太岁生肖 */
.bad-taisui-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f0e6d6;
}

.warning-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff5f5;
  border-radius: 8px;
  color: #dc143c;
  font-size: 0.95rem;
  border: 1px solid #ffb6c1;
}

.zodiac-grid {
  display: grid;
  //grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.zodiac-item {
  background: white;
  border-radius: 12px;
  padding: 20px 10px;
  text-align: center;
  border: 2px solid #d2b48c;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.zodiac-item.current-zodiac {
  border-color: #dc143c;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  transform: scale(1.05);
}

.zodiac-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.zodiac-icon-large {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.zodiac-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #8b4513;
  margin-bottom: 8px;
}

.zodiac-types {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.zodiac-type-badge {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  text-align: center;
}

.zodiac-type-badge.badge-zhi {
  background: #dc143c;
}

.zodiac-type-badge.badge-chong {
  background: #ff6b6b;
}

.zodiac-type-badge.badge-hai {
  background: #ff8c00;
}

.zodiac-type-badge.badge-xing {
  background: #dc143c;
}

.zodiac-type-badge.badge-po {
  background: #ff6347;
}

.zodiac-type-badge.badge-heliu {
  background: #32cd32;
  color: white;
}

.zodiac-type-badge.badge-hesan {
  background: #228b22;
  color: white;
}

.zodiac-type-badge.good-type {
  background: #32cd32;
  color: white;
}

/* 吉星高照 */
.good-taisui-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f0e6d6;
}

.good-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f0fff0;
  border-radius: 8px;
  color: #228b22;
  font-size: 0.95rem;
  border: 1px solid #90ee90;
}

.zodiac-item.good-zodiac {
  border-color: #32cd32;
  background: linear-gradient(135deg, #f0fff0 0%, #e0ffe0 100%);
}

/* 化解建议 */
.suggestion-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f0e6d6;
}

.suggestion-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.suggestion-item {
  display: flex;
  gap: 15px;
  background: #faf0e6;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #d2b48c;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background: white;
}

.suggestion-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.suggestion-content h4 {
  margin: 0 0 8px 0;
  color: #8b4513;
  font-size: 1.1rem;
  font-weight: 600;
}

.suggestion-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 操作区域 */
.action-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f0e6d6;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.clear-btn,
.current-year-btn {
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
}

.clear-btn {
  background: #f5deb3;
  color: #8b4513;
  border: 1px solid #d2b48c;
}

.clear-btn:hover {
  background: #deb887;
  transform: translateY(-1px);
}

.current-year-btn {
  background: #8b4513;
  color: white;
}

.current-year-btn:hover {
  background: #a0522d;
  transform: translateY(-1px);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  margin-bottom: 30px;
  color: #d2b48c;
  border: 1px solid #d2b48c;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #8b4513;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 1rem;
  color: #a0522d;
}

.empty-btn {
  margin: 0 auto;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 20px;
  color: #a0522d;
  font-size: 0.9rem;
  border-top: 1px solid #d2b48c;
  margin-top: 20px;
}

/* 图标样式 */
.icon-year::before {
  content: "📅";
  font-size: 1.2rem;
}

.icon-calendar::before {
  content: "📅";
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0522d;
}

.icon-search::before {
  content: "🔍";
}

.icon-info::before {
  content: "💡";
}

.icon-result::before {
  content: "🧧";
  font-size: 1.2rem;
}

.icon-refresh::before {
  content: "🔄";
}

.icon-clock::before {
  content: "⏰";
}

.icon-warning::before {
  content: "⚠️";
}

.icon-good::before {
  content: "✨";
}

/* 响应式设计 */
@media (max-width: 768px) {
  .taisui-container {
    padding: 15px;
  }

  .title {
    font-size: 2rem;
  }

  .query-card,
  .result-card {
    padding: 20px;
  }
  .zodiac-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .suggestion-list {
    grid-template-columns: 1fr;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .overview-section {
    flex-direction: column;
    align-items: stretch;
  }

  .action-section {
    flex-direction: column;
  }
}
</style>
