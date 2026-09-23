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

          <div class="form-group">
            <label class="form-label">性别：</label>
            <div class="gender-picker">
              <button
                  v-for="opt in genderOptions"
                  :key="opt.value"
                  @click="setGender(opt.value)"
                  class="gender-btn"
                  :class="{ active: gender === opt.value }"
                  type="button"
              >
                {{ opt.label }}
              </button>
            </div>
            <p class="field-hint">大运顺逆须看性别（阳年男顺、阴年男逆），故此项影响大运结果</p>
          </div>

          <div class="form-group">
            <label for="provinceSelect" class="form-label">出生地：</label>
            <div class="input-wrapper">
              <input
                  type="text"
                  class="date-input"
                  v-model="cityFilter"
                  placeholder="筛选：输入城市或省份，如「喀什」「四川」"
                  aria-label="筛选省份与城市"
              />
            </div>
            <div class="city-cascade">
              <div class="input-wrapper">
                <select
                    id="provinceSelect"
                    class="date-input select-input"
                    :value="provinceValue"
                    @change="setProvince($event.target.value)"
                >
                  <option value="">未指定（按钟表时间排盘）</option>
                  <option v-for="p in provinceOptions" :key="p" :value="p">{{ p }}</option>
                  <option value="__custom__">自定义经度…</option>
                </select>
              </div>
              <div class="input-wrapper">
                <select
                    id="citySelect"
                    class="date-input select-input"
                    :value="cityValue"
                    :disabled="!cityDetail"
                    @change="setCity($event.target.value)"
                >
                  <option value="">{{ cityPlaceholder }}</option>
                  <optgroup v-if="cityCenter" label="全市（市中心）">
                    <option :value="cityCenter">{{ cityCenter }}（东经 {{ cityLongitude[cityCenter] }}°）</option>
                  </optgroup>
                  <optgroup v-if="cityDistricts.length" label="按市辖区（更精确）">
                    <option v-for="c in cityDistricts" :key="c" :value="c">
                      {{ cityShortName(c) }}（东经 {{ cityLongitude[c] }}°）
                    </option>
                  </optgroup>
                  <option v-for="c in cityCities" :key="c" :value="c">
                    {{ c }}（东经 {{ cityLongitude[c] }}°）
                  </option>
                </select>
              </div>
            </div>
            <p class="field-hint" v-if="cityFilterMiss">
              没有匹配的城市。可直接选「自定义经度…」手填东经度数。
            </p>
            <div class="input-wrapper" v-if="cityValue === '__custom__'" style="margin-top: 8px;">
              <input
                  type="number"
                  class="date-input"
                  step="0.01"
                  min="70"
                  max="140"
                  v-model="customLongitude"
                  @change="onCustomLongitude"
                  placeholder="东经度数，如 116.41"
              />
            </div>
            <p class="field-hint">
              已收录 {{ cityCount }} 个出生地，按 {{ provinceCount }} 个省级单元级联选择：地级行政区全量，
              直辖市与香港另含市辖区。经度决定地方时——东八区中央经线为 120°E，偏西 1° 就慢 4 分钟，
              乌鲁木齐比钟表慢约 130 分钟，足以改变时柱。
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">时刻口径：</label>
            <div class="gender-picker">
              <button
                  v-for="opt in solarOptions"
                  :key="String(opt.value)"
                  @click="setTrueSolar(opt.value)"
                  class="gender-btn"
                  :class="{ active: useTrueSolar === opt.value }"
                  type="button"
              >
                {{ opt.label }}
              </button>
            </div>
            <p class="field-hint">
              真太阳时 ＝ 钟表时间 ＋ 经度差 ＋ 均时差（天文量，全年约 ±16 分钟）。
              选「钟表时间」则不作任何换算。
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">子时归属（23:00–23:59）：</label>
            <div class="gender-picker">
              <button
                  v-for="opt in ziConventions"
                  :key="opt.value"
                  @click="setZiConvention(opt.value)"
                  class="gender-btn"
                  :class="{ active: ziConvention === opt.value }"
                  type="button"
              >
                {{ opt.label }}
              </button>
            </div>
            <p class="field-hint">{{ ziConventionDetail }}</p>
          </div>
        </div>

        <div class="selected-time" v-if="selectedDateTime">
          <i class="icon-check"></i>
          <span>已选择：{{ formatDisplayDateTime(selectedDateTime) }}</span>
        </div>

        <div class="error-line" v-if="errorMsg">
          <i class="icon-error"></i>
          <span>{{ errorMsg }}</span>
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
        <span>时柱以 2 小时为一个时辰。若知道出生地，请在上方选择城市并启用真太阳时——钟表时间不等于当地时间，西部城市可能相差一个时辰以上。</span>
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

      <!-- 结果分栏：四柱 / 结构 / 时间 / 论断 / 推演 —— 共用同一次排盘结果 -->
      <div class="result-tabs">
        <button
            v-for="t in resultTabs"
            :key="t.key"
            class="result-tab"
            :class="{ active: activeTab === t.key }"
            @click="activeTab = t.key"
        >{{ t.label }}</button>
      </div>

      <div v-show="activeTab === 'pillar'">
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

      <!-- 日主与旺衰 -->
      <div class="analysis-section" v-if="analysis">
        <h3 class="section-title">日主与旺衰</h3>

        <div class="day-master-card">
          <div class="dm-badge">
            <span class="dm-gan">{{ analysis.dayGan }}</span>
            <span class="dm-meta">{{ analysis.wangShuai.dayYinYang }}{{ analysis.wangShuai.dayEl }}</span>
          </div>
          <div class="dm-center">
            <div class="dm-label">日主（日元）</div>
            <div class="dm-tip">日柱天干，代表本人。看八字先看日主与月令的关系。</div>
          </div>
          <div class="dm-verdict">
            <div class="dm-label">旺衰倾向</div>
            <div class="verdict-value" :class="'tone-' + analysis.wangShuai.tone">
              {{ analysis.wangShuai.verdict }}
            </div>
          </div>
        </div>

        <div class="judge-grid">
          <div class="judge-item" :class="analysis.wangShuai.deLing.deLing ? 'hit' : 'miss'">
            <div class="judge-head">
              <span class="judge-name">得令</span>
              <span class="judge-tag">{{ analysis.wangShuai.deLing.level }}</span>
            </div>
            <div class="judge-body">{{ analysis.wangShuai.deLing.why }}</div>
          </div>

          <div class="judge-item" :class="analysis.wangShuai.deDi.deDi ? 'hit' : 'miss'">
            <div class="judge-head">
              <span class="judge-name">得地</span>
              <span class="judge-tag">
                {{ analysis.wangShuai.deDi.deDi ? analysis.wangShuai.deDi.strongest + '根' : '无根' }}
              </span>
            </div>
            <div class="judge-body">
              <template v-if="analysis.wangShuai.deDi.selfRoots.length">
                通根于
                <span
                    v-for="(r, i) in analysis.wangShuai.deDi.selfRoots"
                    :key="'sr' + i"
                    class="root-chip"
                >{{ r.pos }}{{ r.zhi }}·{{ r.gan }}<em>{{ r.qiType }}</em></span>
              </template>
              <template v-else>四支藏干中不见日主之根</template>
            </div>
          </div>

          <div class="judge-item" :class="analysis.wangShuai.deShi.deShi ? 'hit' : 'miss'">
            <div class="judge-head">
              <span class="judge-name">得势</span>
              <span class="judge-tag">
                {{ analysis.wangShuai.deShi.deShi ? '生扶占优' : '克泄耗占优' }}
              </span>
            </div>
            <div class="judge-body">
              生扶
              <strong class="num-support">{{ analysis.wangShuai.deShi.supportScore }}</strong>
              （印·比劫） ／ 克泄耗
              <strong class="num-drain">{{ analysis.wangShuai.deShi.drainScore }}</strong>
              （官杀·财·食伤）
            </div>
          </div>
        </div>

        <div class="direction-line">
          <span class="direction-label">取用方向</span>
          <strong>{{ analysis.wangShuai.direction.label }}</strong>
          <span class="direction-detail">{{ analysis.wangShuai.direction.detail }}</span>
        </div>

        <p class="section-caveat">{{ analysis.wangShuai.caveat }}</p>
      </div>

      <!-- 时刻校核（第0层）-->
      <div class="analysis-section" v-if="moment">
        <h3 class="section-title">时刻校核</h3>

        <p class="birth-echo">出生地：<strong>{{ birthPlaceText }}</strong></p>

        <div class="moment-steps">
          <div class="moment-step" v-for="s in moment.steps" :key="s.key">
            <div class="step-label">{{ s.label }}</div>
            <div class="step-value">{{ s.value }}</div>
            <div class="step-note">{{ s.note }}</div>
          </div>
        </div>

        <div class="shift-box changed" v-if="shiftedInfo && (shiftedInfo.day || shiftedInfo.hour)">
          <div class="shift-title">校正改变了四柱</div>
          <div class="shift-line" v-if="shiftedInfo.day">
            日柱：<em>{{ shiftedInfo.day.from }}</em> → <strong>{{ shiftedInfo.day.to }}</strong>
          </div>
          <div class="shift-line" v-if="shiftedInfo.hour">
            时柱：<em>{{ shiftedInfo.hour.from }}</em> → <strong>{{ shiftedInfo.hour.to }}</strong>
          </div>
          <div class="shift-sub">直接按钟表时间排盘时四柱为 {{ shiftedInfo.baseFour }}</div>
        </div>

        <div class="shift-box" v-else-if="moment.effectiveStr !== moment.clockStr">
          校正后的四柱与「按钟表时间排盘」一致——本例中经度与均时差不足以改变任何一柱。
        </div>

        <div class="shift-box warn" v-if="boundaryWarn">
          出生时刻距时辰边界只剩约 {{ boundaryWarn.dist }} 分钟。经度取的是市中心近似值（±0.1°，约合 24 秒），
          均时差用 NOAA 级数（±30 秒），在此情形下都足以把时柱推到另一边，宜按相邻两柱并看。
        </div>

        <p class="section-caveat">
          时柱以 2 小时为一个时辰（子时 23:00–01:00、丑时 01:00–03:00 …），
          所以真太阳时校正在多数情况下只影响<strong>时柱</strong>，只有跨过 23:00 时才会连带改变日柱。
          传统命理以真太阳时（地方时）为准，亦有径用钟表时间者，各派不一；
          城市经度取市中心近似值，出生地在市辖区内偏东或偏西数十公里时，请改用<strong>自定义经度</strong>。
          另外，大运起运按出生瞬间到节气的实际天数折算（3 日折 1 岁），看的是物理时刻而非标注口径，
          故仍以钟表时间计算，不受此处选择影响。
        </p>
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

      <!-- 五行分布 -->
      <div class="analysis-section" v-if="analysis">
        <h3 class="section-title">五行分布</h3>
        <div class="element-chart">
          <div class="element-row" v-for="el in analysis.elements.list" :key="'el-' + el.name">
            <span class="el-name" :class="'el-' + el.name">{{ el.name }}</span>
            <div class="el-bar">
              <div
                  class="el-fill"
                  :class="'el-' + el.name"
                  :style="{ width: (el.count / 8 * 100) + '%' }"
              ></div>
            </div>
            <span class="el-count">{{ el.count }}<em>／8</em></span>
          </div>
        </div>
        <div class="element-tags">
          <span v-if="analysis.elements.balance.strong.length" class="tag tag-strong">
            偏多：{{ analysis.elements.balance.strong.join('、') }}
          </span>
          <span v-if="analysis.elements.balance.weak.length" class="tag tag-weak">
            偏少：{{ analysis.elements.balance.weak.join('、') }}
          </span>
          <span v-if="analysis.elements.balance.missing.length" class="tag tag-missing">
            缺：{{ analysis.elements.balance.missing.join('、') }}
          </span>
          <span
              v-if="!analysis.elements.balance.strong.length && !analysis.elements.balance.weak.length && !analysis.elements.balance.missing.length"
              class="tag"
          >五行分布均匀</span>
        </div>
        <p class="section-caveat">
          只按四柱的 8 个字计数（天干取本气、地支取其本气五行），<strong>不含地支藏干</strong>，
          也未计月令司权与刑冲合化。因此「缺某行」只说明八字明面上没有该字，
          不等于命局真的无用——藏干中有、或岁运补来，都可为用。
        </p>
      </div>

      <!-- 空亡 -->
      <div class="analysis-section" v-if="analysis && analysis.xunKong">
        <h3 class="section-title">空亡（旬空）</h3>
        <div class="kong-line">
          <span class="kong-xun">{{ analysis.xunKong.xunHead }}旬</span>
          <span class="kong-arrow">空</span>
          <span class="kong-branches">
            <span
                v-for="b in analysis.xunKong.branches"
                :key="'kb-' + b"
                class="kong-branch"
            >{{ b }}</span>
          </span>
        </div>
        <div class="kong-hits" v-if="analysis.xunKong.hits.length">
          <span class="kong-hit-label">四支中落空：</span>
          <span
              v-for="(h, i) in analysis.xunKong.hits"
              :key="'kh' + i"
              class="hit-badge"
          >{{ h.pos }}{{ h.zhi }}</span>
        </div>
        <div class="kong-hits" v-else>
          <span class="kong-hit-label">四支均不落空亡</span>
        </div>
        <p class="section-caveat">
          空亡以本旬所余之支为断，此处按<strong>日柱</strong>定旬（主流做法；亦有以年柱起者，各派不同）。
          传统多认为落空之支力量减弱、或主「有其象而难得其实」；但空亡逢冲、逢合可以填实，
          并非一见空亡就作废。
        </p>
      </div>

      <!-- 时辰对照表：属于「这张盘本身」的参考，故放在四柱栏内，
           而不是悬在四个 tab 之下 —— 否则切到结构/时间/论断栏还会看到它 -->
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
      </div><!-- /四柱 tab -->

      <!-- 结构 tab：全盘刑冲合害 · 透干 · 通根 -->
      <div v-show="activeTab === 'structure'">
        <BaziStructure :structure="analysis && analysis.structure" />
      </div>

      <!-- 时间 tab：大运 · 流年 · 流月 · 引动点 -->
      <div v-show="activeTab === 'time'">
        <BaziTimeline
            :result="resultInfo"
            :analysis="analysis"
            :birth-year="analysis ? analysis.birthYear : null"
        />
      </div>

      <!-- 论断 tab：格局取法 · 用神三法 —— 判断层，诸说并列，不给单一结论 -->
      <div v-show="activeTab === 'judgment'">
        <BaziJudgment :judgment="analysis && analysis.judgment" />
      </div>

      <!-- 推演 tab：格局成破 · 用神落点 · 十神引动 —— 争议最大的一层，只作对应不下吉凶 -->
      <div v-show="activeTab === 'inference'">
        <BaziInference
            :inference="analysis && analysis.inference"
            :analysis="analysis"
            :result="resultInfo"
            :birth-year="analysis ? analysis.birthYear : null"
        />
      </div>

      <!-- 导读 tab：把前五栏的结论翻成白话，归到财 / 婚 / 事业 / 健康四题（翻译层，不下结论） -->
      <div v-show="activeTab === 'guide'">
        <BaziGuide :guide="analysis && analysis.guide" />
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
        <button @click="copyShareLink" class="share-btn" :class="{ done: shareCopied }">
          <i class="icon-link"></i>
          {{ shareCopied ? '已复制链接' : '复制分享链接' }}
        </button>
      </div>
      <p class="share-hint">
        分享链接只记录<strong>出生信息与排盘口径</strong>（日期 / 时间 / 性别 / 出生地 / 真太阳时 / 子时约定），
        四柱由这些输入重算 —— 把口径一并带上，对方打开才会得到同一张盘。
      </p>
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
import Bazi from '../utils/baziUtils.js';
import {
  PROVINCE_LABELS, provinceOfCity, provinceList, cityGroupsOf, hasCityHit, cityShortName
} from '../utils/cityCascade.js';
import { analyzeStructure } from '../utils/baziStructure.js';
import { analyzeJudgment, daysAfterJieOf } from '../utils/baziJudgment.js';
import { analyzeInference } from '../utils/baziInference.js';
import { analyzeGuide } from '../utils/baziGuide.js';
import { buildShareQuery, parseShareQuery } from '../utils/baziShare.js';
// 结果区各区块各自独立成组件：主组件已近 2600 行，再往里塞逻辑会失控
import BaziStructure from './BaziStructure.vue';
import BaziTimeline from './BaziTimeline.vue';
import BaziJudgment from './BaziJudgment.vue';
import BaziInference from './BaziInference.vue';
import BaziGuide from './BaziGuide.vue';

/**
 * 默认查询日期。
 * 注意：`<input type="date">` 的 value 必须是 `YYYY-MM-DD`（斜杠格式不会被识别，会显示成空）。
 * 进页面即自动排一次盘，省得用户先看到空白。
 */
const DEFAULT_DATE = '1994-12-13';
const DEFAULT_TIME = '12:00';

// 响应式数据
const inputDate = ref(DEFAULT_DATE);
const inputTime = ref(DEFAULT_TIME);
// 大运顺逆须看性别（阳年男顺、阴年男逆……），故必须有此项
const gender = ref('male');
const selectedDateTime = ref(null);
const resultInfo = ref(null);
// 分析层：日主旺衰 / 五行 / 空亡 / 大运
const analysis = ref(null);
// 行内错误提示（原来用 alert()，会打断操作且无法随页面持久显示）
const errorMsg = ref('');
// 结果区分栏。六个 tab 共用同一次排盘结果，切换不会重新计算，也不会重置
const activeTab = ref('pillar');
const resultTabs = [
  { key: 'pillar', label: '四柱' },
  { key: 'structure', label: '结构' },
  { key: 'time', label: '时间' },
  { key: 'judgment', label: '论断' },
  { key: 'inference', label: '推演' },
  { key: 'guide', label: '导读' }
];
const solarTerm = new SolarTerm();

// ===== 第0层：时刻校准 =====
// 输入框拿到的是「行政区时间」（北京时间），八字用的是天体时刻，两者相差两项：
// 经度差（120°E 为准，偏西 1° 慢 4 分钟）与均时差（全年 ±16 分钟）。西部城市可达一个时辰以上。
const provinceValue = ref('');          // '' = 未指定；'__custom__' = 自定义经度；否则为省级单元名
const cityValue = ref('');              // '' = 未指定；'__custom__' = 自定义经度；否则为城市 / 市辖区名
const customLongitude = ref('116.41');
const useTrueSolar = ref(true);
const ziConvention = ref('nextDay');    // 23:00–23:59 的归属：'nextDay' 换日 / 'lateZi' 归当日
// resolveMoment 的结果（供「时刻校核」卡展示每一步折算）
const moment = ref(null);
// 校正是否真的改变了四柱（与「按钟表时间排盘」对比）
const shiftedInfo = ref(null);

const cityLongitude = Bazi.CITY_LONGITUDE;
const cityCount = Bazi.CITY_COUNT;
const provinceCount = PROVINCE_LABELS.length;
const ziConventions = Bazi.ZI_CONVENTIONS;

// 出生地近 500 项，平铺成一个下拉要滚很久 —— 改成「省 → 市 / 区」两级级联：
// 一级 34 项、二级最多 38 项（重庆）。筛选框保留，关键词同时缩小两级列表：
// 输「喀什」一级只剩新疆、二级只剩喀什地区；输「四川」则整省保留（省名命中）。
const cityFilter = ref('');

const provinceOptions = computed(() => provinceList(cityFilter.value, provinceValue.value));

const cityDetail = computed(() => {
  const p = provinceValue.value;
  if (!p || p === '__custom__') return null;   // 未指定 / 自定义经度：二级下拉停用
  return cityGroupsOf(p, cityFilter.value, cityValue.value);
});
const cityCenter = computed(() => (cityDetail.value ? cityDetail.value.center : ''));
const cityDistricts = computed(() => (cityDetail.value ? cityDetail.value.districts : []));
const cityCities = computed(() => (cityDetail.value ? cityDetail.value.cities : []));

const cityPlaceholder = computed(() => {
  if (!provinceValue.value) return '请先选择省份 / 直辖市';
  if (provinceValue.value === '__custom__') return '已选「自定义经度」';
  return '请选择城市 / 区（不选则不做经度校正）';
});

// 筛选无命中：全国都没有这个地名，或当前省内没有（后者只在「已选省份被兜住」时出现）
const cityFilterMiss = computed(() => {
  const q = cityFilter.value.trim();
  if (!q) return false;
  if (provinceList(q).length === 0) return true;
  return !!cityDetail.value && !hasCityHit(cityDetail.value);
});

const solarOptions = [
  { label: '真太阳时', value: true },
  { label: '钟表时间', value: false }
];

// 当前生效的经度：未指定 → null（不校正）
const longitude = computed(() => {
  if (cityValue.value === '__custom__') {
    const v = Number(customLongitude.value);
    return isFinite(v) && v > 0 && v < 180 ? v : null;
  }
  if (!cityValue.value) return null;
  const v = cityLongitude[cityValue.value];
  return typeof v === 'number' ? v : null;
});

// 「时刻校核」卡头部的出生地回显（级联后更要让人一眼确认到底按哪个点校正的）
const birthPlaceText = computed(() => {
  const v = cityValue.value;
  if (!v) return '未指定（按钟表时间排盘）';
  if (v === '__custom__') return `自定义经度（东经 ${customLongitude.value}°）`;
  const lng = cityLongitude[v];
  return `${v}（东经 ${lng}°）`;
});

const ziConventionDetail = computed(() => {
  const hit = ziConventions.find(z => z.value === ziConvention.value);
  return hit ? hit.detail : '';
});

/**
 * 距最近的时辰边界还剩几分钟。
 * 不足 5 分钟时，经度近似值（±0.1° ≈ 24 秒）或均时差（±30 秒）的误差就可能把时柱推到另一边。
 */
const boundaryWarn = computed(() => {
  const m = moment.value;
  if (!m) return null;
  const mins = m.effective.h * 60 + m.effective.mi;
  // 时辰边界都在奇数整点（01:00 / 03:00 / … / 23:00），即 60 + 120k 分钟处。
  const nextBoundary = 60 + 120 * Math.ceil((mins - 60) / 120);
  const prevBoundary = nextBoundary - 120;
  const dist = Math.min(mins - prevBoundary, nextBoundary - mins);
  return dist <= 5 ? { dist } : null;
});

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

// 性别（大运顺逆用）
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
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
/**
 * 取「本地」日期字符串 YYYY-MM-DD。
 * 不能用 `toISOString().split('T')[0]`——那是 UTC 日期，
 * 在 GMT+8 下早上 8 点之前会取到「昨天」，属静默错误。
 */
const toLocalDateStr = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const getCurrentDate = () => toLocalDateStr(new Date());

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
  inputDate.value = toLocalDateStr(now);
  inputTime.value = now.toTimeString().slice(0, 5);
  updateDateTime();
};

const setCurrentTime = () => {
  inputTime.value = getCurrentTime();
  updateDateTime();
};

// 切换性别后需重算（大运顺逆随性别变）
const setGender = (v) => {
  if (gender.value === v) return;
  gender.value = v;
  if (resultInfo.value) queryGanZhi();
};

// 切换出生地 / 时刻口径 / 子时约定后都要重排（都会改变时柱，子时约定还可能改变日柱）
// 一级：换省后原城市不再适用（城市名全表唯一，换省即换点），清掉等二级再选；
//       「未指定 / 自定义经度」不是真的省，直接落到 cityValue 上。
const setProvince = (v) => {
  provinceValue.value = v;
  if (v === '' || v === '__custom__') {
    cityValue.value = v;
  } else if (provinceOfCity(cityValue.value) !== v) {
    cityValue.value = '';
  }
  if (resultInfo.value) queryGanZhi();
};

// 二级：选完城市才清筛选 —— 否则输「喀什」选中新疆后，二级又变回整省 24 项
const setCity = (v) => {
  cityValue.value = v;
  if (v) cityFilter.value = '';
  if (resultInfo.value) queryGanZhi();
};

const onCustomLongitude = () => {
  if (resultInfo.value) queryGanZhi();
};

const setTrueSolar = (v) => {
  if (useTrueSolar.value === v) return;
  useTrueSolar.value = v;
  if (resultInfo.value) queryGanZhi();
};

const setZiConvention = (v) => {
  if (ziConvention.value === v) return;
  ziConvention.value = v;
  if (resultInfo.value) queryGanZhi();
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

/**
 * 收集覆盖出生年前后的节气时刻，供大运起运判定使用
 * （顺排要「下一个节」，逆排要「上一个节」，跨年故前后各取一年）。
 */
const collectTermDates = (y) => {
  const out = [];
  for (let yy = y - 1; yy <= y + 2; yy++) {
    try {
      const list = solarTerm.getSolarTermDate(yy);
      if (Array.isArray(list)) out.push(...list);
    } catch (err) {
      // 个别年份取不到节气不应让整页失败，仅在下方以「—」呈现
    }
  }
  return out;
};

/**
 * 分析层：旺衰 / 五行 / 空亡 / 结构 / 大运 / 判断 / 推演 / 导览。
 * 全部为纯函数（baziUtils / baziStructure / baziJudgment / baziInference / baziGuide），
 * 此处只负责把排盘结果喂进去。
 *
 * @param {number?} days 生月已过几日 —— 判断层的「司权取格」要用（人元用事分野）
 */
const buildAnalysis = (gz, y, m, d, h, mi, days = null) => {
  const gzList = [gz.yearGanZhi, gz.monthGanZhi, gz.dayGanZhi, gz.hourGanZhi];
  const ganList = gzList.map(x => x.charAt(0));
  const dzList = gzList.map(x => x.charAt(1));
  const dayGan = ganList[2];

  let daYun = null;
  try {
    daYun = Bazi.computeDaYun({
      birthDate: new Date(y, m - 1, d, h, mi, 0),
      gender: gender.value,
      yearGanZhi: gz.yearGanZhi,
      monthGanZhi: gz.monthGanZhi,
      dayGan,
      termDates: collectTermDates(y),
      steps: 10
    });
  } catch (err) {
    daYun = null;
  }

  const wangShuai = Bazi.assessWangShuai(dayGan, ganList, dzList);
  const elements = Bazi.analyzeElements(gzList);
  // 结构层 —— 导览层要用同一份，故先算一次再分发（重算两次容易口径不一）
  const structure = analyzeStructure(gzList);

  // 判断层：格局取法 / 用神三法（多派并列，不给单一结论）
  const judgment = analyzeJudgment({ gzList, wangShuai, elements, daysAfterJie: days });

  // 推演层的十神引动先按「大运十步」备一份；流年那一份要等用户选中某一步大运，
  // 由推演栏自己再调一次 analyzeTenGodActivation（同一个纯函数，口径必然一致）
  const daYunColumns = (daYun && Array.isArray(daYun.list) ? daYun.list : []).map((d) => ({
    label: '大运',
    heading: `${d.step}运`,
    sub: `${Math.floor(d.ageFrom)}–${Math.floor(d.ageTo)} 岁`,
    gan: d.gan,
    zhi: d.zhi,
    ganZhi: d.ganZhi
  }));

  return {
    gzList, ganList, dzList, dayGan,
    // 出生公历年 —— 时间轴把大运岁数映射到具体年份时需要
    birthYear: y,
    // 生月已过几日 —— 司权取格的输入（界面会标明它由交节时刻推出）
    daysAfterJie: days,
    // 原局结构：刑冲合害 / 成局 / 透干 / 通根（只列客观信息）
    structure,
    // 判断层：格局取法 / 用神三法（多派并列，不给单一结论）
    judgment,
    // 推演层：格局成破 / 用神落点 / 十神引动（争议最大，只作对应不下吉凶）
    inference: analyzeInference({ gzList, judgment, columns: daYunColumns }),
    // 导览层：把前几栏的结论翻成白话，归到财 / 婚 / 事业 / 健康四题（只翻译、不判断）
    guide: analyzeGuide({
      gzList, gender: gender.value, judgment, wangShuai, elements, structure
    }),
    wangShuai,
    elements,
    xunKong: Bazi.markXunKong(gz.dayGanZhi, dzList),
    daYun
  };
};

/**
 * 生月已过几日（供司权取格）。
 *
 * 判定规则本身在 `baziJudgment.daysAfterJieOf`（那边才好单测）；此处只负责把
 * 「出生年与上一年的二十四节气表」递过去 —— `getSolarTermDate(Y)` 覆盖的是
 * 立春(Y) 到大寒(Y+1)，一月份的出生要落到上一年那张表里。
 * 用「排盘用时刻」的日期（而非钟表日期）来算，与四柱口径保持一致。
 */
const birthDaysAfterJie = (t) => {
  try {
    return daysAfterJieOf([solarTerm.getSolarTermDate(t.y - 1), solarTerm.getSolarTermDate(t.y)], t.y, t.m, t.d, t.h, t.mi);
  } catch (err) {
    return null;
  }
};

const queryGanZhi = () => {
  if (!inputDate.value) {
    errorMsg.value = '请先选择查询日期';
    return;
  }
  errorMsg.value = '';

  // 如果没有选择时间，使用默认时间
  const timeValue = inputTime.value || '12:00';
  const [y, m, d] = inputDate.value.split('-').map(Number);
  const [h, mi] = timeValue.split(':').map(Number);

  try {
    // 第0层：先把「钟表时间」折算成「排盘用时刻」（真太阳时 → 子时约定）
    const resolved = Bazi.resolveMoment({
      y, m, d, h, mi,
      longitude: longitude.value,
      trueSolar: useTrueSolar.value,
      ziConvention: ziConvention.value
    });
    moment.value = resolved;

    const ganZhiResult = solarTerm.getGanZhiByGregorian(resolved.effectiveStr);
    if (!ganZhiResult || typeof ganZhiResult !== 'object') {
      throw new Error('返回结果格式不正确');
    }

    // 与「不做任何校正、直接按钟表时间排盘」对比，让用户看到校正到底改了什么
    let changed = null;
    if (resolved.effectiveStr !== resolved.clockStr) {
      try {
        const base = solarTerm.getGanZhiByGregorian(resolved.clockStr);
        changed = {
          day: base.dayGanZhi !== ganZhiResult.dayGanZhi
            ? { from: base.dayGanZhi, to: ganZhiResult.dayGanZhi } : null,
          hour: base.hourGanZhi !== ganZhiResult.hourGanZhi
            ? { from: base.hourGanZhi, to: ganZhiResult.hourGanZhi } : null,
          baseFour: `${base.yearGanZhi} ${base.monthGanZhi} ${base.dayGanZhi} ${base.hourGanZhi}`
        };
      } catch (err) {
        changed = null;
      }
    }
    shiftedInfo.value = changed;

    // 补充农历信息（按排盘用的真太阳时日期取，与四柱口径一致）
    const dateObj = new Date(resolved.effectiveStr.replace(' ', 'T'));
    try {
      const lunarObj = solarTerm.solarToLunar(dateObj);
      if (lunarObj) {
        ganZhiResult.zodiacYear = lunarObj.getZodiacYear();
        ganZhiResult.fullLunarDate = lunarObj.getFullLunarDate();
      }
    } catch (err) {
      // 农历信息为附加项，取不到不影响四柱主结果
    }

    resultInfo.value = ganZhiResult;
    // 大运起运按「出生瞬间到节气的实际天数」折算，看的是物理时刻，
    // 与真太阳时/子时换日这些**标注口径**无关，故此处仍传入钟表时间。
    // 司权取格则按「排盘用时刻」算，与四柱/月柱口径保持一致
    const ed = resolved.effective;
    analysis.value = buildAnalysis(ganZhiResult, y, m, d, h, mi, birthDaysAfterJie(ed));
    // 排盘成功后把「输入 + 口径」同步进地址栏，便于分享与回访复现同一张盘
    syncShareUrl();
  } catch (err) {
    resultInfo.value = null;
    analysis.value = null;
    moment.value = null;
    shiftedInfo.value = null;
    errorMsg.value = `查询失败：${err.message || err}`;
  }
};

// ===== 分享链接：把「输入 + 排盘口径」编进 query =====
// 只编码输入而不编码四柱 —— 四柱是产物，重算一次比存一份更可靠；
// 且经度、真太阳时、子时约定这些口径若丢了，同样的四柱也复现不出同一张盘。
const shareCopied = ref(false);
let shareTimer = null;

const currentShareState = () => ({
  date: inputDate.value,
  time: inputTime.value || DEFAULT_TIME,
  gender: gender.value,
  city: cityValue.value,
  longitude: longitude.value,
  trueSolar: useTrueSolar.value,
  ziConvention: ziConvention.value
});

/** 把当前输入写进地址栏（replaceState，不新增历史记录、不触发路由跳转） */
const syncShareUrl = () => {
  if (typeof window === 'undefined' || !window.history || !window.location) return;
  const q = buildShareQuery(currentShareState());
  const url = window.location.pathname + (q ? '?' + q : '');
  try {
    window.history.replaceState(null, '', url);
  } catch (err) {
    // 某些嵌入环境下 replaceState 受限；分享按钮仍会用当前 href 兜底
  }
};

const copyShareLink = () => {
  if (typeof window === 'undefined') return;
  syncShareUrl();
  const link = window.location.href;
  const fallback = () => {
    try { window.prompt('复制下面的分享链接：', link); } catch (err) { /* 忽略 */ }
  };
  const done = () => {
    shareCopied.value = true;
    if (shareTimer) clearTimeout(shareTimer);
    shareTimer = setTimeout(() => { shareCopied.value = false; }, 2000);
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(done).catch(fallback);
    } else {
      fallback();
      done();
    }
  } catch (err) {
    fallback();
  }
};

/** 从地址栏还原输入与口径；返回是否真的解出了参数 */
const applyShareParams = () => {
  if (typeof window === 'undefined' || !window.location) return false;
  const s = parseShareQuery(window.location.search);
  if (!s) return false;

  if (s.date) inputDate.value = s.date;
  if (s.time) inputTime.value = s.time;
  if (s.gender) gender.value = s.gender;
  if (s.city !== undefined) {
    // 城市键必须确实存在于经度表里，否则退回「未指定」，免得 longitude 变 null 却显示成选了城市
    cityValue.value = (s.city === '__custom__' || cityLongitude[s.city] !== undefined) ? s.city : '';
    // 一级状态由二级反推，级联才会显示成「新疆 + 喀什地区」而不是空着
    provinceValue.value = cityValue.value === '__custom__'
      ? '__custom__'
      : provinceOfCity(cityValue.value);
  }
  if (s.longitude !== undefined && (!cityValue.value || cityValue.value === '__custom__')) {
    customLongitude.value = String(s.longitude);
    if (!cityValue.value) {
      cityValue.value = '__custom__';
      provinceValue.value = '__custom__';
    }
  }
  if (s.trueSolar !== undefined) useTrueSolar.value = s.trueSolar;
  if (s.ziConvention) ziConvention.value = s.ziConvention;
  return true;
};

const clearResult = () => {
  // 还原为默认示例并立即重算，避免留下空白结果区
  inputDate.value = DEFAULT_DATE;
  inputTime.value = DEFAULT_TIME;
  updateDateTime();
  queryGanZhi();
};

// 组件挂载时：初始化时间，若地址栏带着分享参数则先还原，再用默认日期排一次盘
onMounted(() => {
  updateDateTime();
  applyShareParams();
  if (inputDate.value) queryGanZhi();
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

/* ===== 结果分栏 tab ===== */
.result-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 26px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
  flex-wrap: wrap;
}

.result-tab {
  padding: 9px 22px;
  border: 1px solid #e0e6ed;
  background: #f8fafc;
  border-radius: 10px;
  color: #7f8c8d;
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.result-tab:hover {
  border-color: #3498db;
  color: #3498db;
}

.result-tab.active {
  background: #3498db;
  border-color: #3498db;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.25);
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

/* ===== 表单新增：性别选择 / 字段说明 / 行内错误 ===== */
.gender-picker { display: flex; gap: 10px; }

.gender-btn {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid #e0e6ed;
  border-radius: 12px;
  background: #f8fafc;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gender-btn:hover { border-color: #3498db; }

.gender-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

.field-hint {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: #95a5a6;
  line-height: 1.5;
}

.error-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fdecea;
  border: 1px solid #f5b7b1;
  border-radius: 8px;
  color: #c0392b;
  font-size: 0.92rem;
}

.icon-error::before { content: "⚠️"; }

/* ===== 第0层：时刻校核 ===== */
.select-input {
  padding-left: 20px;
  appearance: none;
  cursor: pointer;
}

.select-input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* 出生地级联：省 + 市/区 并排；窄屏回落成上下两行。
   minmax(0, 1fr) 是必需的 —— 默认 min-width:auto 会被长选项撑破栅格。 */
.city-cascade {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 560px) {
  .city-cascade {
    grid-template-columns: minmax(0, 1fr);
  }
}

.birth-echo {
  margin: 0 0 12px;
  padding: 8px 12px;
  font-size: 0.86rem;
  color: #566573;
  background: #f8fafc;
  border: 1px dashed #d5dde5;
  border-radius: 8px;
}

.birth-echo strong {
  color: #2c3e50;
}

.moment-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.moment-step {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  border-left: 4px solid #b8c7d9;
}

.moment-step:last-child { border-left-color: #3498db; background: #f4f9fe; }

.step-label {
  font-size: 0.8rem;
  color: #95a5a6;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.step-value {
  margin: 6px 0 4px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'SimSun', 'STKaiti', serif;
  word-break: break-all;
}

.step-note {
  font-size: 0.76rem;
  color: #95a5a6;
  line-height: 1.6;
}

.shift-box {
  margin-top: 16px;
  padding: 14px 18px;
  border-radius: 10px;
  background: #f8f9fa;
  border: 1px solid #e0e6ed;
  color: #5d6d7e;
  font-size: 0.88rem;
  line-height: 1.8;
}

.shift-box.changed {
  background: #eef4ff;
  border: 1px solid #cddefb;
  border-left: 4px solid #5b8ff9;
  color: #3a5f9e;
}

.shift-box.warn {
  margin-top: 12px;
  background: #fff8e6;
  border: 1px solid #f5d99b;
  border-left: 4px solid #e0a800;
  color: #7a5a1e;
}

.shift-title { font-weight: 600; color: #1d4ed8; margin-bottom: 6px; }

.shift-line { font-size: 0.92rem; }

.shift-line em { font-style: normal; color: #95a5a6; text-decoration: line-through; }

.shift-line strong {
  font-family: 'SimSun', 'STKaiti', serif;
  font-size: 1.05rem;
  color: #1d4ed8;
}

.shift-sub { margin-top: 6px; font-size: 0.8rem; color: #7f8c8d; }

/* ===== 通用分析区块 ===== */
.analysis-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f0f2f5;
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

/* ===== 日主卡片 ===== */
.day-master-card {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 20px;
  background: linear-gradient(135deg, #eef4fc 0%, #e8f0fa 100%);
  border: 1px solid #d4e3f5;
  border-radius: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.dm-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  border-radius: 12px;
  color: white;
}

.dm-gan {
  font-family: 'SimSun', 'STKaiti', serif;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.1;
}

.dm-meta { font-size: 0.78rem; opacity: 0.92; margin-top: 4px; }

.dm-center { flex: 1; min-width: 200px; }

.dm-label {
  font-size: 0.82rem;
  color: #7f8c8d;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.dm-tip {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #5d6d7e;
  line-height: 1.6;
}

.dm-verdict { text-align: right; min-width: 130px; }

.verdict-value {
  margin-top: 6px;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.verdict-value.tone-strong { color: #c0392b; }
.verdict-value.tone-mid-strong { color: #d68910; }
.verdict-value.tone-mid-weak { color: #2e86c1; }
.verdict-value.tone-weak { color: #1a5276; }

/* ===== 三判据 ===== */
.judge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.judge-item {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e0e6ed;
  background: #f8fafc;
  border-left-width: 4px;
}

.judge-item.hit { border-left-color: #27ae60; background: #f2fbf6; }
.judge-item.miss { border-left-color: #bdc3c7; }

.judge-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.judge-name { font-size: 1rem; font-weight: 600; color: #2c3e50; }

.judge-tag {
  padding: 3px 10px;
  border-radius: 20px;
  background: #e8eef5;
  color: #5d6d7e;
  font-size: 0.76rem;
  font-weight: 600;
  white-space: nowrap;
}

.judge-body {
  font-size: 0.84rem;
  color: #5d6d7e;
  line-height: 1.7;
}

.num-support { color: #27ae60; }
.num-drain { color: #c0392b; }

.root-chip {
  display: inline-block;
  margin: 3px 4px 0 0;
  padding: 2px 8px;
  background: #eaf4fd;
  border: 1px solid #cfe3f7;
  border-radius: 6px;
  color: #2471a3;
  font-size: 0.78rem;
  white-space: nowrap;
}

.root-chip em { font-style: normal; color: #7f8c8d; margin-left: 2px; }

/* ===== 取用方向 ===== */
.direction-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding: 14px 18px;
  background: #fff8e6;
  border: 1px solid #f5d99b;
  border-radius: 10px;
  color: #7a5a1e;
  font-size: 0.9rem;
}

.direction-label {
  padding: 3px 10px;
  background: #f5d99b;
  border-radius: 20px;
  color: #7a5a1e;
  font-size: 0.78rem;
  font-weight: 600;
}

.direction-line strong { color: #b8720b; font-size: 1rem; }
.direction-detail { color: #8a6d3b; }

/* ===== 五行分布 ===== */
.element-chart { display: flex; flex-direction: column; gap: 10px; }

.element-row { display: flex; align-items: center; gap: 12px; }

.el-name {
  width: 30px;
  flex: none;
  text-align: center;
  font-family: 'SimSun', 'STKaiti', serif;
  font-size: 1.1rem;
  font-weight: 700;
}

.el-bar {
  flex: 1;
  height: 20px;
  background: #f0f2f5;
  border-radius: 10px;
  overflow: hidden;
}

.el-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
  min-width: 0;
}

.el-count {
  width: 60px;
  flex: none;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.el-count em { font-style: normal; font-size: 0.75rem; color: #b2bec3; }

/* 五行配色：木青 · 火赤 · 土黄 · 金白（取灰金）· 水黑（取靛蓝） */
.el-木 { color: #2e9e6b; }
.el-fill.el-木 { background: linear-gradient(90deg, #55c98d 0%, #2e9e6b 100%); }
.el-火 { color: #d64545; }
.el-fill.el-火 { background: linear-gradient(90deg, #f0736f 0%, #d64545 100%); }
.el-土 { color: #a97142; }
.el-fill.el-土 { background: linear-gradient(90deg, #c9976a 0%, #a97142 100%); }
.el-金 { color: #7f8c9b; }
.el-fill.el-金 { background: linear-gradient(90deg, #aab6c4 0%, #7f8c9b 100%); }
.el-水 { color: #3b7dd8; }
.el-fill.el-水 { background: linear-gradient(90deg, #6fa8e8 0%, #3b7dd8 100%); }

.element-tags { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }

.tag {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  background: #f1f2f6;
  color: #636e72;
}

.tag-strong { background: #fdecea; color: #c0392b; }
.tag-weak { background: #fef5e7; color: #b9770e; }
.tag-missing {
  background: #ebf5fb;
  color: #2471a3;
  border: 1px dashed #a9cce3;
}

/* ===== 空亡 ===== */
.kong-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 18px;
  background: #f8f9fa;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
}

.kong-xun {
  padding: 4px 12px;
  background: #34495e;
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.kong-arrow { color: #95a5a6; font-size: 0.88rem; }

.kong-branches { display: flex; gap: 8px; }

.kong-branch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: #ecf0f1;
  border: 1px dashed #bdc3c7;
  border-radius: 8px;
  color: #7f8c8d;
  font-family: 'SimSun', 'STKaiti', serif;
  font-size: 1.25rem;
  font-weight: 700;
}

.kong-hits {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.kong-hit-label { font-size: 0.86rem; color: #7f8c8d; }

.hit-badge {
  padding: 5px 12px;
  background: #fdecea;
  border: 1px solid #f5b7b1;
  border-radius: 8px;
  color: #c0392b;
  font-size: 0.85rem;
  font-weight: 600;
}

/* ===== 大运 ===== */
.dayun-head {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  font-size: 0.88rem;
}

.dayun-dir {
  padding: 4px 14px;
  background: #3498db;
  color: white;
  border-radius: 20px;
  font-weight: 600;
}

.dayun-reason { color: #7f8c8d; }

.dayun-start {
  padding: 4px 12px;
  background: #eafaf1;
  border: 1px solid #bfe8d2;
  border-radius: 20px;
  color: #1e8449;
  font-weight: 600;
}

.dayun-start.missing {
  background: #fdecea;
  border-color: #f5b7b1;
  color: #c0392b;
}

.dayun-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 10px;
}

.dayun-item {
  padding: 12px 8px;
  text-align: center;
  background: #f8fafc;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.dayun-item:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.dayun-age { font-size: 0.76rem; color: #95a5a6; margin-bottom: 6px; }

.dayun-gz {
  font-family: 'SimSun', 'STKaiti', serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.dayun-god { font-size: 0.78rem; color: #5d6d7e; }

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

/* 分享链接 */
.share-btn {
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
  background: #3498db;
  color: #fff;
}

.share-btn:hover {
  background: #2f89c5;
  transform: translateY(-1px);
}

.share-btn.done { background: #1e8449; }

.share-hint {
  margin: 14px auto 0;
  max-width: 720px;
  text-align: center;
  color: #95a5a6;
  font-size: 0.8rem;
  line-height: 1.75;
}

.share-hint strong { color: #7f8c8d; }

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

.icon-link::before {
  content: "🔗";
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
  .hide-gods-grid,
  .judge-grid {
    grid-template-columns: 1fr;
  }

  .day-master-card {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .dm-verdict { text-align: center; }

  .dayun-grid {
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
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
