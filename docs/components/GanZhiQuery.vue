<template>
  <div class="ganzhi-container">
    <!-- 头部标题区域 -->
    <div class="header">
      <h1 class="title">八字查询系统</h1>
      <p class="subtitle">输入公历日期和时间，查询干支纪年、月、日、时及十神信息</p>
    </div>

    <!-- 查询区域 -->
    <div class="query-card">
      <div class="query-header">
        <i class="icon-calendar"></i>
        <h2>日期时间查询</h2>
      </div>

      <div class="query-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="dateInput" class="form-label">选择日期：</label>
            <div class="input-wrapper">
              <input
                  type="date"
                  id="dateInput"
                  v-model="inputDate"
                  placeholder="请选择日期"
                  class="date-input"
                  @change="updateDateTime"
              />
              <i class="icon-date"></i>
            </div>
          </div>

          <div class="form-group">
            <label for="timeInput" class="form-label">选择时间：</label>
            <div class="input-wrapper">
              <input
                  type="time"
                  id="timeInput"
                  v-model="inputTime"
                  placeholder="请选择时间"
                  class="time-input"
                  step="3600"
                  @change="updateDateTime"
              />
              <i class="icon-time"></i>
            </div>
            <div class="time-presets">
              <button
                  v-for="preset in timePresets"
                  :key="preset.value"
                  @click="setPresetTime(preset.value)"
                  class="time-preset-btn"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="selected-time" v-if="selectedDateTime">
          <i class="icon-check"></i>
          <span>已选择：{{ formatDisplayDateTime(selectedDateTime) }}</span>
        </div>

        <button
            @click="queryGanZhi"
            class="query-btn"
            :class="{ 'disabled': !inputDate }"
            :disabled="!inputDate"
        >
          <i class="icon-search"></i>
          查询干支十神
        </button>
      </div>

      <div class="query-tips">
        <i class="icon-info"></i>
        <span>时柱以2小时为一个时辰，请准确选择时间以获取精确的时柱信息</span>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div v-if="resultInfo" class="result-card">
      <div class="result-header">
        <div class="result-title">
          <i class="icon-result"></i>
          <h2>查询结果</h2>
        </div>
        <div class="result-datetime">
          <div>{{ formatDate(inputDate) }}</div>
          <div class="result-time">{{ formatTime(inputTime) }}</div>
        </div>
      </div>

      <!-- 生肖和干支概览 -->
      <div class="overview-section">
        <div class="zodiac-badge">
          <span class="zodiac-icon">{{ zodiacEmoji[resultInfo.zodiac] || '🐲' }}</span>
          <span class="zodiac-text">{{ resultInfo.zodiacYear }}</span>
        </div>
        <div class="ganzhi-badge">
          <span class="ganzhi-text">{{ resultInfo.ganZhi }}</span>
        </div>
      </div>

      <!-- 四柱十神信息 -->
      <div class="detail-section">
        <h3 class="section-title">四柱十神</h3>

        <div class="info-grid">
          <div class="info-item" v-for="item in infoItems" :key="item.key">
            <div class="info-header">
              <div class="info-label">{{ item.label }}</div>
            </div>
            <div class="info-content">
              <div class="info-value">{{ getInfoValue(item) }}</div>
              <div class="info-gods">
                <div class="info-god-item" v-if="item.godKey && resultInfo[item.godKey]">
                  <span class="god-label">天干：</span>
                  <span class="god-badge god-ten">{{ resultInfo[item.godKey] }}</span>
                </div>
                <div class="info-god-item" v-if="item.dzGodKey && resultInfo[item.dzGodKey]">
                  <span class="god-label">地支：</span>
                  <span class="god-badge god-twelve">{{ resultInfo[item.dzGodKey] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 地支藏干 - 网格布局 -->
      <div v-if="hasHideDzGods" class="hide-gods-section">
        <h3 class="section-title">地支藏干</h3>
        <div class="hide-gods-grid">
          <!-- 年柱藏干 -->
          <div class="hide-gods-column" v-if="resultInfo.yearHideDzGods?.length">
            <div class="hide-gods-header">
              <div class="hide-gods-title">年支</div>
              <div class="hide-gods-ganzhi">{{ getGanZhiByType('year') }}</div>
            </div>
            <div class="hide-gods-list">
              <div
                  v-for="(cg, idx) in resultInfo.yearHideDzGods"
                  :key="`year-${idx}`"
                  class="hide-god-item"
                  :class="`qi-${cg.qiType}`"
              >
                <div class="hide-god-main">
                  <span class="hide-gan">{{ cg.gan }}</span>
                  <span class="hide-god">{{ cg.god }}</span>
                </div>
                <div class="hide-god-qi">{{ cg.qiType }}</div>
              </div>
            </div>
          </div>

          <!-- 月柱藏干 -->
          <div class="hide-gods-column" v-if="resultInfo.monthHideDzGods?.length">
            <div class="hide-gods-header">
              <div class="hide-gods-title">月支</div>
              <div class="hide-gods-ganzhi">{{ getGanZhiByType('month') }}</div>
            </div>
            <div class="hide-gods-list">
              <div
                  v-for="(cg, idx) in resultInfo.monthHideDzGods"
                  :key="`month-${idx}`"
                  class="hide-god-item"
                  :class="`qi-${cg.qiType}`"
              >
                <div class="hide-god-main">
                  <span class="hide-gan">{{ cg.gan }}</span>
                  <span class="hide-god">{{ cg.god }}</span>
                </div>
                <div class="hide-god-qi">{{ cg.qiType }}</div>
              </div>
            </div>
          </div>

          <!-- 日柱藏干 -->
          <div class="hide-gods-column" v-if="resultInfo.dayHideDzGods?.length">
            <div class="hide-gods-header">
              <div class="hide-gods-title">日支</div>
              <div class="hide-gods-ganzhi">{{ getGanZhiByType('day') }}</div>
            </div>
            <div class="hide-gods-list">
              <div
                  v-for="(cg, idx) in resultInfo.dayHideDzGods"
                  :key="`day-${idx}`"
                  class="hide-god-item"
                  :class="`qi-${cg.qiType}`"
              >
                <div class="hide-god-main">
                  <span class="hide-gan">{{ cg.gan }}</span>
                  <span class="hide-god">{{ cg.god }}</span>
                </div>
                <div class="hide-god-qi">{{ cg.qiType }}</div>
              </div>
            </div>
          </div>

          <!-- 时柱藏干 -->
          <div class="hide-gods-column" v-if="resultInfo.hourHideDzGods?.length">
            <div class="hide-gods-header">
              <div class="hide-gods-title">时支</div>
              <div class="hide-gods-ganzhi">{{ getGanZhiByType('hour') }}</div>
            </div>
            <div class="hide-gods-list">
              <div
                  v-for="(cg, idx) in resultInfo.hourHideDzGods"
                  :key="`hour-${idx}`"
                  class="hide-god-item"
                  :class="`qi-${cg.qiType}`"
              >
                <div class="hide-god-main">
                  <span class="hide-gan">{{ cg.gan }}</span>
                  <span class="hide-god">{{ cg.god }}</span>
                </div>
                <div class="hide-god-qi">{{ cg.qiType }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时辰对照表 -->
      <div class="time-table-section">
        <h3 class="section-title">时辰对照表</h3>
        <div class="time-table">
          <div
              v-for="timeSlot in timeSlots"
              :key="timeSlot.time"
              class="time-slot"
              :class="{ 'active': isCurrentTimeSlot(timeSlot) }"
          >
            <div class="time-range">{{ timeSlot.range }}</div>
            <div class="time-name">{{ timeSlot.name }}</div>
            <div class="time-hour">{{ timeSlot.time }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button @click="clearResult" class="clear-btn">
          <i class="icon-refresh"></i>
          重新查询
        </button>
        <button @click="setCurrentTime" class="current-time-btn">
          <i class="icon-clock"></i>
          当前时间
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">⏰</div>
      <h3>选择日期时间</h3>
      <p>请选择日期和时间，然后点击查询按钮查看结果</p>
      <button @click="setCurrentDateTime" class="current-time-btn empty-btn">
        <i class="icon-clock"></i>
        使用当前时间
      </button>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p>干支查询系统 &copy; 2024 传统文化工具</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SolarTerm from '../utils/SolarTerm.js';

// 响应式数据
const inputDate = ref('');
const inputTime = ref('12:00');
const selectedDateTime = ref(null);
const resultInfo = ref(null);
const solarTerm = new SolarTerm();

// 时辰对照表
const timeSlots = [
  { time: '子时', range: '23:00-00:59', name: '夜半' },
  { time: '丑时', range: '01:00-02:59', name: '鸡鸣' },
  { time: '寅时', range: '03:00-04:59', name: '平旦' },
  { time: '卯时', range: '05:00-06:59', name: '日出' },
  { time: '辰时', range: '07:00-08:59', name: '食时' },
  { time: '巳时', range: '09:00-10:59', name: '隅中' },
  { time: '午时', range: '11:00-12:59', name: '日中' },
  { time: '未时', range: '13:00-14:59', name: '日昳' },
  { time: '申时', range: '15:00-16:59', name: '晡时' },
  { time: '酉时', range: '17:00-18:59', name: '日入' },
  { time: '戌时', range: '19:00-20:59', name: '黄昏' },
  { time: '亥时', range: '21:00-22:59', name: '人定' }
];

// 时间预设
const timePresets = [
  { label: '子时(23-1)', value: '23:00' },
  { label: '卯时(5-7)', value: '05:00' },
  { label: '午时(11-13)', value: '11:00' },
  { label: '酉时(17-19)', value: '17:00' },
  { label: '现在', value: 'now' }
];

// 生肖对应的表情符号
const zodiacEmoji = {
  '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
  '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐏',
  '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷'
};

// 信息项配置
const infoItems = [
  { label: '年柱', key: 'yearGanZhi', godKey: 'yearGod', dzGodKey: 'yearDiZhiGod' },
  { label: '月柱', key: 'monthGanZhi', godKey: 'monthGod', dzGodKey: 'monthDiZhiGod' },
  { label: '日柱', key: 'dayGanZhi', godKey: 'dayGod', dzGodKey: 'dayDiZhiGod'},
  { label: '时柱', key: 'hourGanZhi', godKey: 'hourGod', dzGodKey: 'hourDiZhiGod' }
];

// 计算属性
const hasHideDzGods = computed(() => {
  return resultInfo.value?.yearHideDzGods?.length ||
      resultInfo.value?.monthHideDzGods?.length ||
      resultInfo.value?.dayHideDzGods?.length ||
      resultInfo.value?.hourHideDzGods?.length;
});

// 方法
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours.padStart(2, '0')}:${minutes}`;
};

const formatDisplayDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const getInfoValue = (item) => {
  if (!resultInfo.value) return '';
  return resultInfo.value[item.key] || '';
};

// 获取指定类型的干支
const getGanZhiByType = (type) => {
  if (!resultInfo.value) return '';
  const ganZhiMap = {
    'year': resultInfo.value.yearGanZhi,
    'month': resultInfo.value.monthGanZhi,
    'day': resultInfo.value.dayGanZhi,
    'hour': resultInfo.value.hourGanZhi
  };
  return ganZhiMap[type] || '';
};

const updateDateTime = () => {
  if (inputDate.value && inputTime.value) {
    selectedDateTime.value = `${inputDate.value}T${inputTime.value}:00`;
  }
};

const setPresetTime = (presetValue) => {
  if (presetValue === 'now') {
    setCurrentDateTime();
  } else {
    inputTime.value = presetValue;
    updateDateTime();
  }
};

const setCurrentDateTime = () => {
  const now = new Date();
  inputDate.value = now.toISOString().split('T')[0];
  inputTime.value = now.toTimeString().slice(0, 5);
  updateDateTime();
};

const setCurrentTime = () => {
  inputTime.value = getCurrentTime();
  updateDateTime();
};

const isCurrentTimeSlot = (timeSlot) => {
  if (!inputTime.value) return false;
  const [currentHour, currentMinute] = inputTime.value.split(':').map(Number);
  const [startHour] = timeSlot.range.split('-')[0].split(':').map(Number);
  const [endHour] = timeSlot.range.split('-')[1].split(':').map(Number);

  // 处理跨天的子时
  if (timeSlot.time === '子时') {
    return currentHour >= 23 || currentHour < 1;
  }

  return currentHour >= startHour && currentHour <= endHour;
};

const queryGanZhi = () => {
  if (!inputDate.value) {
    alert('请先选择查询日期！');
    return;
  }

  // 如果没有选择时间，使用默认时间
  const timeValue = inputTime.value || '12:00';
  const dateTimeStr = `${inputDate.value} ${timeValue}:00`;

  try {
    const ganZhiResult = solarTerm.getGanZhiByGregorian(dateTimeStr);
    console.log("ganZhiResult=",ganZhiResult);
    if (!ganZhiResult || typeof ganZhiResult !== 'object') {
      throw new Error('返回结果格式不正确');
    }

    // 补充农历信息
    const dateObj = new Date(selectedDateTime.value || `${inputDate.value}T${timeValue}`);
    const lunarObj = solarTerm.solarToLunar(dateObj);
    if (lunarObj) {
      ganZhiResult.zodiacYear = lunarObj.getZodiacYear();
      ganZhiResult.fullLunarDate = lunarObj.getFullLunarDate();
    }

    resultInfo.value = ganZhiResult;
  } catch (err) {
    alert(`查询失败：${err.message}`);
    console.error('干支查询异常：', err);
  }
};

const clearResult = () => {
  resultInfo.value = null;
  inputDate.value = '';
  inputTime.value = '12:00';
  selectedDateTime.value = null;
};

// 组件挂载时初始化当前时间
onMounted(() => {
  updateDateTime();
});
</script>

<style scoped>
/* 全局样式 */
.ganzhi-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e3e7f0 100%);
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
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

/* 查询卡片 */
.query-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.query-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  color: #3498db;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.date-input,
.time-input {
  width: 100%;
  padding: 14px 20px 14px 45px;
  border: 2px solid #e0e6ed;
  border-radius: 12px;
  font-size: 1rem;
  color: #2c3e50;
  background: #f8fafc;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.date-input:focus,
.time-input:focus {
  outline: none;
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.time-presets {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.time-preset-btn {
  padding: 6px 12px;
  background: #f1f2f6;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-preset-btn:hover {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.selected-time {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #e8f4fc;
  border-radius: 8px;
  color: #3498db;
  font-size: 0.95rem;
  font-weight: 500;
}

.query-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
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
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.query-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #95a5a6;
}

.query-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 16px;
  background: #e8f4fc;
  border-radius: 8px;
  color: #3498db;
  font-size: 0.9rem;
}

/* 结果卡片 */
.result-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.5s ease-out;
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
  border-bottom: 2px solid #f0f2f5;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
}

.result-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.result-datetime {
  text-align: right;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.result-time {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3498db;
  margin-top: 4px;
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
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  border-radius: 12px;
  color: #d63031;
  font-weight: 600;
  font-size: 1.1rem;
}

.zodiac-icon {
  font-size: 1.5rem;
}

.ganzhi-badge {
  padding: 12px 24px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.time-ganzhi-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f1f2f6;
  border-radius: 12px;
  color: #2c3e50;
  font-weight: 500;
}

.time-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.time-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e17055;
}

/* 详细信息表格 */
.detail-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
  padding-left: 10px;
  border-left: 4px solid #3498db;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.info-item {
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-color: #3498db;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e6ed;
}

.info-label {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
}

.info-value {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 4px;
  font-family: 'SimSun', 'STKaiti', serif;
  text-align: center;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-gods {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
}

.info-god-item {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.god-label {
  color: #7f8c8d;
  font-size: 0.85rem;
  min-width: 35px;
}

.god-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  flex-grow: 1;
  text-align: center;
}

.god-badge.god-ten {
  background: #a29bfe;
  color: white;
}

.god-badge.god-twelve {
  background: #55efc4;
  color: #2d3436;
}

/* 地支藏干 - 网格布局 */
.hide-gods-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f0f2f5;
}

.hide-gods-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.hide-gods-column {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e0e6ed;
  padding: 15px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.hide-gods-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-color: #3498db;
}

.hide-gods-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e6ed;
}

.hide-gods-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.hide-gods-ganzhi {
  font-size: 1rem;
  color: #3498db;
  font-family: 'SimSun', 'STKaiti', serif;
  font-weight: 600;
}

.hide-gods-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
  justify-content: center;
}

.hide-god-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.hide-god-item:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.hide-god-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.hide-gan {
  font-weight: 700;
  font-family: 'SimSun', 'STKaiti', serif;
  font-size: 1.1rem;
  color: #2c3e50;
}

.hide-god {
  font-size: 0.85rem;
  color: #636e72;
  font-weight: 500;
}

.hide-god-qi {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  text-align: center;
  min-width: 40px;
}

/* 藏干类型样式 */
.hide-god-item.qi-本气 {
  background: linear-gradient(135deg, rgba(255, 234, 167, 0.2) 0%, rgba(253, 203, 110, 0.2) 100%);
  border: 1px solid rgba(253, 203, 110, 0.3);
}

.hide-god-item.qi-本气 .hide-god-qi {
  background: rgba(253, 203, 110, 0.3);
  color: #e17055;
}

.hide-god-item.qi-中气 {
  background: linear-gradient(135deg, rgba(162, 155, 254, 0.2) 0%, rgba(108, 92, 231, 0.2) 100%);
  border: 1px solid rgba(108, 92, 231, 0.3);
}

.hide-god-item.qi-中气 .hide-god-qi {
  background: rgba(108, 92, 231, 0.3);
  color: #6c5ce7;
}

.hide-god-item.qi-余气 {
  background: linear-gradient(135deg, rgba(223, 230, 233, 0.2) 0%, rgba(178, 190, 195, 0.2) 100%);
  border: 1px solid rgba(178, 190, 195, 0.3);
}

.hide-god-item.qi-余气 .hide-god-qi {
  background: rgba(178, 190, 195, 0.3);
  color: #636e72;
}

/* 时辰对照表 */
.time-table-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f0f2f5;
}

.time-table {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.time-slot {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.time-slot.active {
  background: #ffeaa7;
  border-color: #fdcb6e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.time-range {
  font-size: 0.85rem;
  color: #636e72;
  margin-bottom: 4px;
}

.time-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.time-hour {
  font-size: 0.9rem;
  color: #0984e3;
  font-weight: 500;
  font-family: 'SimSun', 'STKaiti', serif;
}

/* 操作区域 */
.action-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f0f2f5;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.clear-btn,
.current-time-btn {
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
  background: #dfe6e9;
  color: #2c3e50;
}

.clear-btn:hover {
  background: #b2bec3;
  transform: translateY(-1px);
}

.current-time-btn {
  background: #00b894;
  color: white;
}

.current-time-btn:hover {
  background: #00a085;
  transform: translateY(-1px);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  margin-bottom: 30px;
  color: #b2bec3;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #7f8c8d;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.empty-btn {
  margin: 0 auto;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-size: 0.9rem;
  border-top: 1px solid #e0e6ed;
  margin-top: 20px;
}

/* 图标样式 */
.icon-calendar::before {
  content: "📅";
  font-size: 1.2rem;
}

.icon-date::before {
  content: "📅";
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.icon-time::before {
  content: "🕐";
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.icon-search::before {
  content: "🔍";
}

.icon-info::before {
  content: "💡";
}

.icon-check::before {
  content: "✅";
  color: #00b894;
}

.icon-result::before {
  content: "📊";
  font-size: 1.2rem;
}

.icon-refresh::before {
  content: "🔄";
}

.icon-clock::before {
  content: "⏰";
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ganzhi-container {
    padding: 15px;
  }

  .title {
    font-size: 2rem;
  }

  .query-card,
  .result-card {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .info-grid,
  .hide-gods-grid {
    grid-template-columns: 1fr;
  }

  .time-table {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .overview-section {
    flex-direction: column;
    align-items: stretch;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .action-section {
    flex-direction: column;
  }
}
</style>
