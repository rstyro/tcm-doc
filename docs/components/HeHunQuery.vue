<template>
  <div class="hehun-container">
    <!-- 头部 -->
    <div class="header">
      <h1 class="title">八字合婚参考</h1>
      <p class="subtitle">输入双方出生信息，按传统合婚项目逐条比对，了解其取舍逻辑</p>
    </div>

    <!-- 免责声明 -->
    <div class="disclaimer">
      <i class="icon-warn"></i>
      <div>
        <strong>重要说明：</strong>本工具整理的是传统术数中的「合婚」判据，属<strong>传统文化知识</strong>，
        <strong>不是科学结论，也不构成婚恋建议</strong>。各流派在取用与权重上分歧很大，同一对八字常得出不同说法。
        请勿以此作为现实决策依据——真正的关系靠了解、沟通与相处。
      </div>
    </div>

    <!-- 默认示例提示 -->
    <div class="demo-notice">
      <i class="icon-warn"></i>
      <div>
        当前两方的日期是一对<strong>示例生辰</strong>（1994-12-13 / 1998-05-01，时辰未填），
        按本工具的传统判据恰好较为相合，仅用于让页面一进来就有结果可看，
        <strong>请改成你们双方的真实生日</strong>后再读结论。
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-card">
      <div class="input-grid">
        <!-- 男方 -->
        <div class="person-block male">
          <div class="person-header">
            <span class="person-icon">♂</span>
            <h2>第一方</h2>
            <span class="person-hint">出生信息</span>
          </div>
          <div class="form-group">
            <label class="form-label">出生日期（公历）</label>
            <input type="date" v-model="a.date" class="date-input" @change="onInput"/>
          </div>
          <div class="form-group">
            <label class="form-label">出生时间</label>
            <input type="time" v-model="a.time" class="time-input" step="3600"
                   @change="a.timeProvided = true"/>
            <div class="quick-times">
              <button v-for="t in quickTimes" :key="'a'+t.v"
                      @click="setTime(a,t.v)" class="quick-btn">{{ t.l }}</button>
            </div>
            <div class="hint-line">不知具体时辰可先取「午时」，时柱仅供参照</div>
          </div>
        </div>

        <!-- 女方 -->
        <div class="person-block female">
          <div class="person-header">
            <span class="person-icon">♀</span>
            <h2>第二方</h2>
            <span class="person-hint">出生信息</span>
          </div>
          <div class="form-group">
            <label class="form-label">出生日期（公历）</label>
            <input type="date" v-model="b.date" class="date-input" @change="onInput"/>
          </div>
          <div class="form-group">
            <label class="form-label">出生时间</label>
            <input type="time" v-model="b.time" class="time-input" step="3600"
                   @change="b.timeProvided = true"/>
            <div class="quick-times">
              <button v-for="t in quickTimes" :key="'b'+t.v"
                      @click="setTime(b,t.v)" class="quick-btn">{{ t.l }}</button>
            </div>
            <div class="hint-line">不知具体时辰可先取「午时」，时柱仅供参照</div>
          </div>
        </div>
      </div>

      <div class="action-row">
        <button @click="analyze" class="analyze-btn" :disabled="!canAnalyze">
          <i class="icon-search"></i>
          开始比对
        </button>
        <button @click="reset" class="reset-btn">
          <i class="icon-refresh"></i>
          重置
        </button>
      </div>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    </div>

    <!-- 结果区 -->
    <div v-if="result" class="result-wrap">
      <!-- 双人盘面对照 -->
      <div class="result-card">
        <h3 class="section-title">双方四柱对照</h3>
        <div class="pillars-grid">
          <div class="pillar-side">
            <div class="side-label male-label">第一方</div>
            <div class="pillars">
              <div v-for="(p,i) in result.a.pillars" :key="'ap'+i" class="pillar">
                <div class="pillar-name">{{ p.name }}</div>
                <div class="pillar-gz">
                  <span class="gz-gan">{{ p.gan }}</span>
                  <span class="gz-zhi">{{ p.zhi }}</span>
                </div>
                <div class="pillar-gods">
                  <span class="god-tag">{{ p.god }}</span>
                </div>
              </div>
            </div>
            <div class="side-meta">
              <span class="meta-item">{{ result.a.zodiac }}年</span>
              <span class="meta-item">{{ result.a.zodiacIcon }}</span>
              <span class="meta-item">日主 {{ result.a.dayMaster }}（{{ result.a.dayMasterEl }}）</span>
            </div>
          </div>

          <div class="pillar-side">
            <div class="side-label female-label">第二方</div>
            <div class="pillars">
              <div v-for="(p,i) in result.b.pillars" :key="'bp'+i" class="pillar">
                <div class="pillar-name">{{ p.name }}</div>
                <div class="pillar-gz">
                  <span class="gz-gan">{{ p.gan }}</span>
                  <span class="gz-zhi">{{ p.zhi }}</span>
                </div>
                <div class="pillar-gods">
                  <span class="god-tag">{{ p.god }}</span>
                </div>
              </div>
            </div>
            <div class="side-meta">
              <span class="meta-item">{{ result.b.zodiac }}年</span>
              <span class="meta-item">{{ result.b.zodiacIcon }}</span>
              <span class="meta-item">日主 {{ result.b.dayMaster }}（{{ result.b.dayMasterEl }}）</span>
            </div>
          </div>
        </div>

        <div v-if="result.hourInfo.level !== 'ok'" class="hour-warn">
          <span class="hour-warn-icon">!</span>
          <span>{{ result.hourInfo.text }}</span>
        </div>
      </div>

      <!-- 逐项比对 -->
      <div class="result-card">
        <h3 class="section-title">传统合婚项目逐条比对</h3>

        <div class="item-list">
          <div v-for="(item,i) in result.items" :key="'it'+i"
               class="rel-item" :class="'tone-'+item.tone">
            <div class="rel-head">
              <span class="rel-index">{{ i+1 }}</span>
              <span class="rel-name">{{ item.name }}</span>
              <span class="rel-tag" :class="'tag-'+item.tone">{{ item.tagLabel }}</span>
            </div>
            <div class="rel-detail">{{ item.detail }}</div>
            <div v-if="item.relations && item.relations.length" class="rel-relations">
              <span v-for="(r,j) in item.relations" :key="'r'+j"
                    class="rel-chip" :class="'chip-'+r.tone">{{ r.desc }}</span>
            </div>
            <div v-if="item.note" class="rel-note">{{ item.note }}</div>
          </div>
        </div>
      </div>

      <!-- 三合 / 三会成局 -->
      <div class="result-card">
        <h3 class="section-title">三合 / 三会成局</h3>
        <div v-if="result.sanHuiFormation.length || result.sanHeFormation.length" class="formation-list">
          <div v-for="(f,i) in result.sanHuiFormation" :key="'sh'+i" class="formation-item hui">
            <span class="fm-tag">三会</span>
            <span class="fm-body">{{ f.desc }}</span>
          </div>
          <div v-for="(f,i) in result.sanHeFormation" :key="'sh2'+i" class="formation-item he">
            <span class="fm-tag">三合</span>
            <span class="fm-body">{{ f.desc }}</span>
          </div>
        </div>
        <div v-else class="formation-empty">
          双方八支合看，未能凑齐完整的三合局或三会方。传统认为这不代表不好——只是缺了「合局」这一层的助力，
          仍须以日柱互动与五行互补为主。
        </div>
        <div class="couple-note">
          传统论合婚，要把两人的地支放在一起看：单看两支只是「半合」，若双方能凑齐三字则<strong>成局</strong>，
          力量显著大于半合；三会取时令旺势，力量又大于三合。这是合婚中分量较重的一项。
        </div>
      </div>

      <!-- 日柱全盘互照 -->
      <div class="result-card">
        <h3 class="section-title">日柱对另一方全盘的互照</h3>
        <div v-if="result.crossRelation.list.length" class="cross-list">
          <div v-for="(r,i) in result.crossRelation.list" :key="'cr'+i"
               class="cross-item" :class="'tone-'+r.tone">
            <span class="cross-dot" :class="'dot-'+r.tone"></span>
            <span class="cross-text">{{ r.desc }}</span>
          </div>
        </div>
        <div v-else class="cross-empty">两方日柱与对方全盘未见明显合冲关系。</div>
        <div class="couple-note">
          传统论夫妻宫，不只看两人「日支对日支」这一个字，而是看一方<strong>日支（及日干）</strong>与另一方
          <strong>全盘四柱</strong>的互动。例如对方年支冲我日支，传统也视为「冲夫妻宫」，
          此项是仅比两个日支所不能覆盖的。
        </div>
      </div>

      <!-- 民俗口诀 -->
      <div class="result-card folk-card">
        <h3 class="section-title">民间生肖婚配口诀（民俗）</h3>
        <div class="folk-body">
          <div class="folk-zodiac">
            <span class="folk-z">{{ result.a.zodiacIcon }} {{ result.a.zodiac }}</span>
            <span class="folk-x">×</span>
            <span class="folk-z">{{ result.b.zodiacIcon }} {{ result.b.zodiac }}</span>
          </div>
          <div v-if="result.folk.rhyme" class="folk-hit">
            命中民间俗谚：<strong>「{{ result.folk.rhyme.text }}」</strong>
            <span class="folk-note-tag">（{{ result.folk.rhyme.note }}）</span>
          </div>
          <div v-else-if="result.folk.grade" class="folk-hit folk-ok">
            未见相忌俗谚；依民间说法为<strong>{{ result.folk.grade.grade }}</strong>——{{ result.folk.grade.desc }}
          </div>
          <div v-else class="folk-hit muted">未见相关民间俗谚。</div>
        </div>
        <div class="folk-warn">
          <strong>请留意：</strong>此类口诀（如「白马怕青牛」「蛇虎如刀错」「猪猴不到头」）出自通俗命书与民间传说，
          与八字命理<strong>主流论法不同层</strong>——它只取年支一个字，忽略月日时三柱与全局，
          本站只作民俗收录，不主张据此论婚配。参见《[纳音](/fate/nayin)》页的相关说明。
        </div>
      </div>

      <!-- 五行分布 -->
      <div class="result-card">
        <h3 class="section-title">五行分布与互补</h3>
        <div class="element-grid">
          <div class="element-side">
            <div class="side-label male-label">第一方五行</div>
            <div class="element-bars">
              <div v-for="el in result.elements.a" :key="'ea'+el.name" class="el-row">
                <span class="el-name" :class="'el-'+el.name">{{ el.name }}</span>
                <div class="el-track">
                  <div class="el-fill" :class="'el-'+el.name"
                       :style="{width: el.pct + '%'}"></div>
                </div>
                <span class="el-count">{{ el.count }}</span>
              </div>
            </div>
            <div class="bal-summary">
              <div v-if="result.elements.balA.missing.length" class="bal-line">
                <span class="bal-key">缺</span>{{ result.elements.balA.missing.join('、') }}
              </div>
              <div v-if="result.elements.balA.weak.length" class="bal-line">
                <span class="bal-key">偏弱</span>{{ result.elements.balA.weak.join('、') }}
              </div>
              <div v-if="result.elements.balA.strong.length" class="bal-line">
                <span class="bal-key">偏旺</span>{{ result.elements.balA.strong.join('、') }}
              </div>
            </div>
          </div>

          <div class="element-side">
            <div class="side-label female-label">第二方五行</div>
            <div class="element-bars">
              <div v-for="el in result.elements.b" :key="'eb'+el.name" class="el-row">
                <span class="el-name" :class="'el-'+el.name">{{ el.name }}</span>
                <div class="el-track">
                  <div class="el-fill" :class="'el-'+el.name"
                       :style="{width: el.pct + '%'}"></div>
                </div>
                <span class="el-count">{{ el.count }}</span>
              </div>
            </div>
            <div class="bal-summary">
              <div v-if="result.elements.balB.missing.length" class="bal-line">
                <span class="bal-key">缺</span>{{ result.elements.balB.missing.join('、') }}
              </div>
              <div v-if="result.elements.balB.weak.length" class="bal-line">
                <span class="bal-key">偏弱</span>{{ result.elements.balB.weak.join('、') }}
              </div>
              <div v-if="result.elements.balB.strong.length" class="bal-line">
                <span class="bal-key">偏旺</span>{{ result.elements.balB.strong.join('、') }}
              </div>
            </div>
          </div>
        </div>

        <div class="complement-box">
          <div class="complement-title">互补情况（传统视角）</div>
          <div v-if="result.elements.aFilled.length || result.elements.bFilled.length"
               class="complement-body">
            <div v-if="result.elements.aFilled.length" class="comp-line">
              第一方所缺/弱者（{{ result.elements.aNeeds.join('、') }}）中，
              第二方有力可补：<strong>{{ result.elements.aFilled.join('、') }}</strong>
            </div>
            <div v-if="result.elements.bFilled.length" class="comp-line">
              第二方所缺/弱者（{{ result.elements.bNeeds.join('、') }}）中，
              第一方有力可补：<strong>{{ result.elements.bFilled.join('、') }}</strong>
            </div>
          </div>
          <div v-else class="complement-body muted">
            双方所缺所弱未见明显互相补益。传统认为五行互补是「相济」的一面，但非合婚的必要条件。
          </div>
          <div v-if="result.elements.bothMissing.length" class="comp-line muted">
            双方共同缺少：{{ result.elements.bothMissing.join('、') }}（传统视为双方共弱之处，多不深论）
          </div>
        </div>
      </div>

      <!-- 日柱与夫妻宫 -->
      <div class="result-card">
        <h3 class="section-title">日柱与夫妻宫</h3>
        <div class="couple-detail">
          <div class="detail-row">
            <span class="dr-key">双方日主</span>
            <span class="dr-val">
              {{ result.a.dayMaster }}（{{ result.a.dayMasterEl }}·{{ result.a.dayMasterYY }}）
              &nbsp;↔&nbsp;
              {{ result.b.dayMaster }}（{{ result.b.dayMasterEl }}·{{ result.b.dayMasterYY }}）
            </span>
          </div>
          <div class="detail-row">
            <span class="dr-key">日干关系</span>
            <span class="dr-val">{{ result.stemRelation.detail }}</span>
          </div>
          <div class="detail-row">
            <span class="dr-key">夫妻宫（日支）</span>
            <span class="dr-val">
              {{ result.a.dayZhi }} ↔ {{ result.b.dayZhi }}
            </span>
          </div>
          <div class="detail-row">
            <span class="dr-key">宫位关系</span>
            <span class="dr-val">{{ result.dayZhiRelation.detail }}</span>
          </div>
          <div v-if="result.dayZhiRelation.relations.length" class="detail-row">
            <span class="dr-key">关系细目</span>
            <span class="dr-val">
              <span v-for="(r,j) in result.dayZhiRelation.relations" :key="'dz'+j"
                    class="rel-chip" :class="'chip-'+r.tone">{{ r.desc }}</span>
            </span>
          </div>
        </div>
        <div class="couple-note">
          传统以<strong>日支</strong>为「夫妻宫」，视为配偶之位的象征。日支相合、相生者多称和美；
          相冲、相刑、相害者称需磨合。另需说明，这一说法属传统类比，各家解读并不一致。
        </div>
      </div>

      <!-- 纳音 -->
      <div class="result-card">
        <h3 class="section-title">纳音五行</h3>
        <div class="nayin-grid">
          <div class="nayin-side">
            <div class="side-label male-label">第一方年柱纳音</div>
            <div class="nayin-value">
              <span class="nayin-gz">{{ result.a.yearGanZhi }}</span>
              <span class="nayin-name">{{ result.a.naYin }}</span>
              <span class="nayin-el" :class="'el-'+result.a.naYinEl">{{ result.a.naYinEl }}</span>
            </div>
          </div>
          <div class="nayin-vs">
            <div class="vs-tag" :class="'tag-'+result.nayinRelation.tone">
              {{ result.nayinRelation.type }}
            </div>
            <div class="vs-desc">{{ result.nayinRelation.desc }}</div>
          </div>
          <div class="nayin-side">
            <div class="side-label female-label">第二方年柱纳音</div>
            <div class="nayin-value">
              <span class="nayin-gz">{{ result.b.yearGanZhi }}</span>
              <span class="nayin-name">{{ result.b.naYin }}</span>
              <span class="nayin-el" :class="'el-'+result.b.naYinEl">{{ result.b.naYinEl }}</span>
            </div>
          </div>
        </div>
        <div class="couple-note">
          纳音合婚是传统一路做法（民间「处对象先看纳音」之说即源于此），以年柱纳音五行的
          生克比和为断。今人多认为此法过简，与八字整体论命并不同层，此处仅作收录。
        </div>
      </div>

      <!-- 倾向汇总 -->
      <div class="result-card summary-card">
        <h3 class="section-title">传统倾向汇总</h3>
        <div class="summary-row">
          <div class="summary-stat he">
            <div class="stat-num">{{ result.summary.heCount }}</div>
            <div class="stat-label">合、生类项目</div>
          </div>
          <div class="summary-stat chong">
            <div class="stat-num">{{ result.summary.chongCount }}</div>
            <div class="stat-label">冲、刑、害类项目</div>
          </div>
          <div class="summary-stat neutral">
            <div class="stat-num">{{ result.summary.neutralCount }}</div>
            <div class="stat-label">中性项目</div>
          </div>
        </div>
        <div class="summary-text">{{ result.summary.text }}</div>
        <div class="summary-warn">
          以上仅为把传统用语折算成可读的倾向标记，<strong>不是评分、不是结论</strong>。
          传统合婚各派取舍差异极大，同一对八字换个流派可能得出相反描述，请仅作文化了解。
        </div>
      </div>

      <!-- 支持与反对 -->
      <div class="result-card">
        <h3 class="section-title">传统合婚的两面说法</h3>
        <div class="debate-grid">
          <div class="debate-col pro">
            <div class="debate-head">较重视此说的理由</div>
            <ul>
              <li>合婚是传统婚俗的组成部分，承载了古人对婚姻「求稳求合」的心理需求</li>
              <li>所列项目（生肖宜忌、日柱相配）在旧时媒妁制度中确有实际影响</li>
              <li>作为文献与文化现象研读，可帮助理解传统典籍中的相关论述</li>
            </ul>
          </div>
          <div class="debate-col con">
            <div class="debate-head">主张谨慎的理由</div>
            <ul>
              <li>无现代可验证依据，且流派之间结论常相互矛盾</li>
              <li>以生肖或纳音断人终身，忽略了个体差异与后天因素</li>
              <li>旧时合婚常与「属相相克」的宿命论捆绑，易造成无谓焦虑</li>
              <li>婚姻质量取决于了解、沟通与共同经营，非命盘可定</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 操作 -->
      <div class="action-section">
        <button @click="backToTop" class="current-time-btn">
          <i class="icon-clock"></i>
          回到顶部修改
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">💞</div>
      <h3>请输入双方的出生信息</h3>
      <p>填写日期后可点击「开始比对」，查看传统合婚各项判据的比对结果</p>
      <button @click="useDemo" class="demo-btn">
        <i class="icon-result"></i>
        载入示例数据看看
      </button>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p>八字合婚参考 · 传统文化知识整理 · 不作预测承诺</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import SolarTerm from '../utils/SolarTerm.js';
import HeHun from '../utils/hehunUtils.js';

const solarTerm = new SolarTerm();

// 双方输入。timeProvided 记录用户是否真的填过时辰（用于时柱可靠性判断）
// 注意：`<input type="date">` 的 value 必须是 `YYYY-MM-DD`（斜杠格式不会被识别，会显示成空）。
//
// 默认值是一对**传统判据下较合拍**的示例日期（从 1990 年起逐日穷举、按本工具的项目权重选出）：
//   甲戌 丙子 癸酉 戊午（狗）× 戊寅 丙辰 戊申 戊午（虎）
//   年支三合、日支三会、日干天干五合、月支三合，且双方能凑成 3 组完整局，
//   全程无冲、无天克地冲，民俗亦为「狗虎三合·上等婚」。
// 目的只是让页面一进来就有个说得通的结果可看，**不是**说这两组生辰本身有什么特别。
const DEFAULT_A = '1994-12-13';
const DEFAULT_B = '1998-05-01';

const a = reactive({ date: DEFAULT_A, time: '12:00', timeProvided: false });
const b = reactive({ date: DEFAULT_B, time: '12:00', timeProvided: false });

const result = ref(null);
const errorMsg = ref('');

const quickTimes = [
  { l: '子时', v: '00:00' },
  { l: '卯时', v: '06:00' },
  { l: '午时', v: '12:00' },
  { l: '酉时', v: '18:00' }
];

const zodiacEmoji = {
  '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
  '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐏',
  '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷'
};

const PILLAR_NAMES = ['年柱', '月柱', '日柱', '时柱'];

// 五行展示顺序直接取自工具层（单一来源），不再本地再抄一份
const ALL_ELEMENTS_ORDER = HeHun.ALL_ELEMENTS;

// ============ 计算属性 ============
const canAnalyze = computed(() => !!(a.date && b.date));

// ============ 方法 ============

/**
 * 由出生信息取四柱与相关字段
 */
const buildPerson = (person, label) => {
  const dateTimeStr = `${person.date} ${person.time || '12:00'}:00`;
  let raw;
  try {
    raw = solarTerm.getGanZhiByGregorian(dateTimeStr);
  } catch (e) {
    throw new Error(`${label}的出生信息无法解析，请检查日期`);
  }
  if (!raw || !raw.yearGanZhi) {
    throw new Error(`${label}的出生信息解析失败`);
  }

  const gzList = [raw.yearGanZhi, raw.monthGanZhi, raw.dayGanZhi, raw.hourGanZhi];
  const tgGods = [raw.yearGod, raw.monthGod, raw.dayGod, raw.hourGod];
  const dzGods = [raw.yearDiZhiGod, raw.monthDiZhiGod, raw.dayDiZhiGod, raw.hourDiZhiGod];

  const pillars = gzList.map((gz, i) => ({
    name: PILLAR_NAMES[i],
    gan: gz.charAt(0),
    zhi: gz.charAt(1),
    god: tgGods[i] || ''
  }));

  const dayGanZhi = raw.dayGanZhi || '';
  const dayMaster = dayGanZhi.charAt(0);
  const dayZhi = dayGanZhi.charAt(1);

  let zodiac = raw.zodiac || '';
  // 兜底：由年支推生肖
  if (!zodiac) zodiac = HeHun.getZodiacByGanZhi(raw.yearGanZhi);

  return {
    label,
    date: person.date,
    time: person.time,
    ganZhi: raw.yearGanZhi + ' ' + raw.monthGanZhi + ' ' + raw.dayGanZhi + ' ' + raw.hourGanZhi,
    gzList,
    pillars,
    dizhiList: [raw.yearGanZhi.charAt(1), raw.monthGanZhi.charAt(1),
                raw.dayGanZhi.charAt(1), raw.hourGanZhi.charAt(1)],
    yearGanZhi: raw.yearGanZhi,
    dayGanZhi,
    dayMaster,
    dayMasterEl: HeHun.TG_TO_ELEMENT[dayMaster] || '',
    dayMasterYY: HeHun.TG_YIN_YANG[dayMaster] || '',
    dayZhi,
    zodiac,
    zodiacIcon: zodiacEmoji[zodiac] || '',
    naYin: HeHun.getNaYin(raw.yearGanZhi),
    naYinEl: HeHun.getNaYinElement(raw.yearGanZhi),
    dzGods
  };
};

const analyze = () => {
  errorMsg.value = '';
  if (!canAnalyze.value) {
    errorMsg.value = '请先填写双方的出生日期';
    return;
  }
  try {
    const A = buildPerson(a, '第一方');
    const B = buildPerson(b, '第二方');

    // 时辰可靠性（时柱是默认值时须降权说明）
    const hourInfo = HeHun.assessHourReliability(
      !!a.timeProvided, !!b.timeProvided
    );

    // ---- 逐项比对 ----
    const items = [];

    // 1. 年支（生肖）关系
    const yearRels = HeHun.getBranchRelation(A.gzList[0].charAt(1), B.gzList[0].charAt(1));
    items.push(buildItem('年支（生肖）关系',
      `第一方属${A.zodiac}（${A.gzList[0].charAt(1)}），第二方属${B.zodiac}（${B.gzList[0].charAt(1)}）`,
      yearRels,
      '民间「属相合不合」的说法即由此而来。传统认为六合、三合为吉，冲、刑、害、破需注意。'));

    // 2. 日支（夫妻宫）关系
    const dayRels = HeHun.getBranchRelation(A.dayZhi, B.dayZhi);
    items.push(buildItem('日支（夫妻宫）关系',
      `第一方日支${A.dayZhi}，第二方日支${B.dayZhi}`,
      dayRels,
      '日支为夫妻宫，此项在八字合婚中比年支（生肖）更被看重。'));

    // 3. 日干（日主）关系
    const stemRels = HeHun.getStemRelation(A.dayMaster, B.dayMaster);
    items.push(buildItem('日干（日主）关系',
      `第一方日主${A.dayMaster}，第二方日主${B.dayMaster}`,
      stemRels,
      '日主代表本人。天干五合被视为「有情」之象，相生为顺，相克需看喜忌。'));

    // 4. 月支关系（辅助）
    const monthRels = HeHun.getBranchRelation(A.gzList[1].charAt(1), B.gzList[1].charAt(1));
    items.push(buildItem('月支关系（参照）',
      `第一方月支${A.gzList[1].charAt(1)}，第二方月支${B.gzList[1].charAt(1)}`,
      monthRels,
      '月支代表父母与成长环境，传统合婚中作为辅助参考，权重低于日支。'));

    // 5. 纳音五行
    const nayinRel = HeHun.getNaYinRelation(A.yearGanZhi, B.yearGanZhi);
    items.push({
      name: '纳音五行',
      tagLabel: nayinRel ? nayinRel.type : '—',
      tone: nayinRel ? nayinRel.tone : 'neutral',
      detail: `第一方年柱${A.yearGanZhi}（${A.naYin}·${A.naYinEl}），第二方年柱${B.yearGanZhi}（${B.naYin}·${B.naYinEl}）`,
      relations: nayinRel ? [{ desc: nayinRel.desc, tone: nayinRel.tone }] : [],
      note: '纳音合婚是民间流传较广的一路，以年柱纳音五行生克比和为断，今多认为过简。'
    });

    // 6. 天克地冲检查（年柱、日柱）
    const tianKeDiChong = [];
    const checkTkdc = (gzA, gzB, name) => {
      const tgChong = HeHun.TG_CHONG[gzA.charAt(0)] === gzB.charAt(0);
      const dzChong = HeHun.LIU_CHONG[gzA.charAt(1)] === gzB.charAt(1);
      if (tgChong && dzChong) tianKeDiChong.push(`${name}：${gzA} vs ${gzB}`);
    };
    checkTkdc(A.gzList[0], B.gzList[0], '年柱');
    checkTkdc(A.gzList[2], B.gzList[2], '日柱');
    checkTkdc(A.gzList[1], B.gzList[1], '月柱');
    checkTkdc(A.gzList[3], B.gzList[3], '时柱');
    items.push({
      name: '天克地冲检查',
      tagLabel: tianKeDiChong.length ? '有' : '无',
      tone: tianKeDiChong.length ? 'chong' : 'he',
      detail: tianKeDiChong.length
        ? `检出：${tianKeDiChong.join('；')}`
        : '四柱未检出天干相克与地支相冲同时出现的组合',
      relations: [],
      note: '天克地冲指天干相克、地支相冲并见，传统视为变动较激烈的组合。此为传统取象，非必然之凶。'
    });

    // 7. 三合 / 三会成局（跨两人全盘）
    const dzA = A.dizhiList, dzB = B.dizhiList;
    const sanHeF = HeHun.findSanHeFormation(dzA, dzB);
    const sanHuiF = HeHun.findSanHuiFormation(dzA, dzB);
    const formationRels = [
      ...sanHuiF.map(f => ({ desc: f.desc, tone: 'he' })),
      ...sanHeF.map(f => ({ desc: f.desc, tone: 'he' }))
    ];
    items.push({
      name: '三合 / 三会成局（双方四支合看）',
      tagLabel: formationRels.length ? `成局 ${formationRels.length}` : '未成局',
      tone: formationRels.length ? 'he' : 'neutral',
      detail: formationRels.length
        ? `双方八支合看，凑成 ${formationRels.length} 组完整局`
        : '双方八支合看，未能凑齐任何完整三合局或三会方',
      relations: formationRels,
      note: '传统论合婚须把两人地支放在一起看：单看两支只是「半合」，若双方能凑齐三字则成局，力量显著大于半合。'
        + '三会取时令旺势，力量又大于三合。此为合婚中分量较重的一项。'
    });

    // 8. 日柱对全盘的影响（夫妻宫互照）
    const aDayVsB = HeHun.getBranchVsAll(A.dayZhi, dzB, '第二方');
    const bDayVsA = HeHun.getBranchVsAll(B.dayZhi, dzA, '第一方');
    const aStemVsB = HeHun.getStemVsAll(A.dayMaster, B.gzList.map(g => g.charAt(0)), '第二方');
    const bStemVsA = HeHun.getStemVsAll(B.dayMaster, A.gzList.map(g => g.charAt(0)), '第一方');

    // 说明：`getBranchVsAll` 已剔掉「同支」中性项，`getStemVsAll` 只保留天干五合/相冲，
    // 所以这里直接把 relations 摊平即可，无需再做筛选。
    const crossRels = [];
    for (const x of aDayVsB) {
      for (const r of x.relations) {
        crossRels.push({ desc: `第一方日支${x.pair.slice(0,1)} 对 第二方${x.targetPos}（${x.pair}）：${r.desc}`, tone: r.tone });
      }
    }
    for (const x of bDayVsA) {
      for (const r of x.relations) {
        crossRels.push({ desc: `第二方日支${x.pair.slice(0,1)} 对 第一方${x.targetPos}（${x.pair}）：${r.desc}`, tone: r.tone });
      }
    }
    for (const x of aStemVsB) {
      for (const r of x.relations) {
        crossRels.push({ desc: `第一方日干 对 第二方${x.targetPos}（${x.pair}）：${r.desc}`, tone: r.tone });
      }
    }
    for (const x of bStemVsA) {
      for (const r of x.relations) {
        crossRels.push({ desc: `第二方日干 对 第一方${x.targetPos}（${x.pair}）：${r.desc}`, tone: r.tone });
      }
    }

    const crossHe = crossRels.filter(r => r.tone === 'he').length;
    const crossChong = crossRels.filter(r => r.tone === 'chong').length;
    items.push({
      name: '日柱对另一方全盘的互照',
      tagLabel: crossRels.length ? `${crossHe} 合 / ${crossChong} 冲` : '无明显互照',
      tone: (crossHe && crossChong) ? 'mixed' : (crossChong ? 'chong' : (crossHe ? 'he' : 'neutral')),
      detail: '传统论夫妻宫，不只看两人「日支对日支」这一个字，而是看一方日支（及日干）与另一方全盘四柱的互动。',
      relations: crossRels,
      note: '例如：第二方年支冲第一方日支，传统也视为「冲夫妻宫」，与两人日支直接相冲同等看重。此项是仅比两个日支所不能覆盖的。'
    });

    // 9. 民俗婚配口诀（独立成卡，见下方「民间生肖婚配口诀」）
    //    此处不放入通用项目列表，避免与命理主流判据混列。

    // ---- 五行统计 ----
    const countA = HeHun.countElements(A.gzList);
    const countB = HeHun.countElements(B.gzList);
    const comp = HeHun.getElementComplement(countA, countB);
    const elements = {
      a: ALL_ELEMENTS_ORDER.map(el => ({
        name: el, count: countA[el],
        pct: Math.round((countA[el] / 8) * 100)
      })),
      b: ALL_ELEMENTS_ORDER.map(el => ({
        name: el, count: countB[el],
        pct: Math.round((countB[el] / 8) * 100)
      })),
      balA: comp.balA, balB: comp.balB,
      aNeeds: comp.aNeeds, bNeeds: comp.bNeeds,
      aFilled: comp.aFilled, bFilled: comp.bFilled,
      bothMissing: comp.bothMissing
    };

    // ---- 倾向汇总 ----
    let heCount = 0, chongCount = 0, neutralCount = 0;
    const allRelsForScore = [...yearRels, ...dayRels, ...stemRels, ...monthRels];
    for (const r of allRelsForScore) {
      if (r.tone === 'he') heCount++;
      else if (r.tone === 'chong') chongCount++;
      else neutralCount++;
    }
    if (nayinRel) {
      if (nayinRel.tone === 'he') heCount++;
      else if (nayinRel.tone === 'chong') chongCount++;
      else neutralCount++;
    }
    if (tianKeDiChong.length) chongCount++;
    // 成局计入（三合/三会成局在传统中分量较重，每组按 2 计）
    heCount += formationRels.length * 2;
    // 夫妻宫互照
    heCount += crossHe;
    chongCount += crossChong;

    let summaryText;
    if (heCount > chongCount) {
      summaryText = '传统项目显示，合、生类关系多于冲、刑、害类，通常被描述为「较相合」的一面。'
        + '但传统也强调：合多亦未必全美（如合而不化、贪合忘克），仍须结合用神喜忌。';
    } else if (chongCount > heCount) {
      summaryText = '传统项目显示，冲、刑、害类关系多于合、生类，通常被描述为「需磨合」的一面。'
        + '但传统亦有一说：冲不必然为凶，冲忌神反为吉，冲开墓库亦可为用，不能只看冲字就下断。';
    } else {
      summaryText = '合、生类与冲、刑、害类项目大体相当，传统会描述为「有合有冲，吉凶互见」，'
        + '须结合作具体命局的喜忌来判断，不能仅凭项目数量定优劣。';
    }

    result.value = {
      a: A, b: B,
      hourInfo,
      items,
      stemRelation: {
        detail: stemRels.length ? stemRels.map(r => r.desc).join('；') : '日干之间无明显合冲'
      },
      dayZhiRelation: {
        detail: dayRels.length ? dayRels.map(r => r.desc).join('；') : '日支之间无明显关系',
        relations: dayRels
      },
      sanHeFormation: sanHeF,
      sanHuiFormation: sanHuiF,
      crossRelation: { list: crossRels, he: crossHe, chong: crossChong },
      folk: {
        rhyme: HeHun.checkFolkRhyme(A.zodiac, B.zodiac),
        grade: HeHun.getFolkZodiacGrade(A.zodiac, B.zodiac)
      },
      elements,
      nayinRelation: nayinRel || { type: '—', tone: 'neutral', desc: '纳音信息不足' },
      summary: { heCount, chongCount, neutralCount, text: summaryText }
    };
  } catch (err) {
    errorMsg.value = err.message || '比对失败，请检查输入';
    result.value = null;
  }
};

/**
 * 把一组关系整理成 list item
 */
const buildItem = (name, detail, rels, note) => {
  let tone = 'neutral';
  let tagLabel = '无明显关系';
  const heN = rels.filter(r => r.tone === 'he').length;
  const chN = rels.filter(r => r.tone === 'chong').length;
  if (heN && !chN) { tone = 'he'; tagLabel = rels.filter(r=>r.tone==='he').map(r=>r.type).join('/'); }
  else if (chN && !heN) { tone = 'chong'; tagLabel = rels.filter(r=>r.tone==='chong').map(r=>r.type).join('/'); }
  else if (heN && chN) { tone = 'mixed'; tagLabel = '合冲并见'; }
  return { name, detail, relations: rels, note, tone, tagLabel };
};

const setTime = (person, v) => { person.time = v; person.timeProvided = true; };
const onInput = () => { errorMsg.value = ''; };

const reset = () => {
  a.date = DEFAULT_A; a.time = '12:00'; a.timeProvided = false;
  b.date = DEFAULT_B; b.time = '12:00'; b.timeProvided = false;
  result.value = null;
  errorMsg.value = '';
  // 还原成示例后立刻重算，避免留下空白结果区
  if (canAnalyze.value) analyze();
};

// 「示例」按钮：回填默认的这对示例日期，并带上时辰（示例日期本身没有时辰含义）
const useDemo = () => {
  a.date = DEFAULT_A; a.time = '10:00'; a.timeProvided = true;
  b.date = DEFAULT_B; b.time = '14:00'; b.timeProvided = true;
  analyze();
};

const backToTop = () => {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * 进页面即用默认日期跑一次，省得用户先看到空白。
 * 默认日期只是**占位示例**，页面上有提示请用户改成自己的生日。
 * 放在 onMounted 里（而非 setup 顶层）是避免 SSR 阶段就执行排盘。
 */
onMounted(() => {
  if (canAnalyze.value) analyze();
});
</script>

<style scoped>
.hehun-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #fdf6f7 0%, #eef1f8 100%);
  min-height: 100vh;
}

/* 头部 */
.header { text-align: center; margin-bottom: 24px; padding: 16px 0; }
.title {
  font-size: 2.2rem; color: #2c3e50; margin-bottom: 8px; font-weight: 600;
}
.subtitle { color: #7f8c8d; font-size: 1rem; margin: 0; }

/* 免责 */
.disclaimer {
  display: flex; gap: 12px; align-items: flex-start;
  background: #fff8e6; border: 1px solid #f5d99b; border-left: 4px solid #e8a33d;
  border-radius: 10px; padding: 14px 18px; margin-bottom: 22px;
  color: #7a5a1e; font-size: 0.9rem; line-height: 1.7;
}
.disclaimer strong { color: #b8720b; }
.icon-warn::before { content: "⚠️"; font-size: 1.1rem; }

/* 默认示例提示（与免责声明区分：蓝色系，提示「这是占位数据」） */
.demo-notice {
  display: flex; gap: 12px; align-items: flex-start;
  background: #eef4ff; border: 1px solid #cddefb; border-left: 4px solid #5b8ff9;
  border-radius: 10px; padding: 14px 18px; margin-bottom: 22px;
  color: #3a5f9e; font-size: 0.9rem; line-height: 1.7;
}
.demo-notice strong { color: #1d4ed8; }
.demo-notice .icon-warn::before { content: "ℹ️"; }

/* 输入卡片 */
.input-card {
  background: white; border-radius: 18px; padding: 26px;
  box-shadow: 0 8px 26px rgba(0,0,0,0.07); margin-bottom: 26px;
}
.input-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 22px;
}
.person-block {
  padding: 18px; border-radius: 14px; border: 1px solid #e6ebf2; background: #fafbfe;
}
.person-block.male { border-top: 4px solid #5b8ff9; }
.person-block.female { border-top: 4px solid #e8688a; }
.person-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
}
.person-icon { font-size: 1.3rem; }
.person-block.male .person-icon { color: #5b8ff9; }
.person-block.female .person-icon { color: #e8688a; }
.person-header h2 { margin: 0; font-size: 1.15rem; color: #2c3e50; }
.person-hint { font-size: 0.78rem; color: #9aa5b1; margin-left: auto; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-label { font-size: 0.88rem; color: #2c3e50; font-weight: 500; }
.date-input, .time-input {
  width: 100%; padding: 11px 14px; border: 2px solid #e0e6ed; border-radius: 10px;
  font-size: 0.95rem; color: #2c3e50; background: #fff; box-sizing: border-box;
  transition: all .25s ease;
}
.date-input:focus, .time-input:focus {
  outline: none; border-color: #5b8ff9;
  box-shadow: 0 0 0 3px rgba(91,143,249,0.12);
}
.quick-times { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.quick-btn {
  padding: 4px 10px; font-size: 0.78rem; border-radius: 6px;
  border: 1px solid #dce1e8; background: #f4f6fa; color: #5a6675;
  cursor: pointer; transition: all .2s ease;
}
.quick-btn:hover { background: #5b8ff9; color: #fff; border-color: #5b8ff9; }
.hint-line { font-size: 0.75rem; color: #9aa5b1; margin-top: 6px; }

.action-row {
  display: flex; gap: 12px; justify-content: center; margin-top: 22px;
}
.analyze-btn {
  background: linear-gradient(135deg, #7a8ff9 0%, #5b6df9 100%);
  color: #fff; border: none; padding: 14px 40px; border-radius: 11px;
  font-size: 1.05rem; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 9px; transition: all .25s ease;
}
.analyze-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(91,109,249,.3); }
.analyze-btn:disabled { opacity: .5; cursor: not-allowed; }
.reset-btn {
  background: #eef1f6; color: #5a6675; border: none; padding: 14px 26px;
  border-radius: 11px; font-size: 1rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px; transition: all .25s ease;
}
.reset-btn:hover { background: #dfe4ec; }
.error-msg {
  margin-top: 14px; padding: 10px 16px; border-radius: 8px;
  background: #fdecec; color: #c0392b; font-size: 0.9rem; text-align: center;
}

/* 时辰提醒 */
.hour-warn {
  display: flex; gap: 9px; align-items: flex-start; margin-top: 18px;
  padding: 11px 15px; background: #fff8e6; border: 1px solid #f5d99b;
  border-left: 3px solid #e8a33d; border-radius: 9px;
  font-size: 0.83rem; color: #7a5a1e; line-height: 1.7;
}
.hour-warn-icon {
  flex-shrink: 0; width: 17px; height: 17px; border-radius: 50%;
  background: #e8a33d; color: #fff; font-size: 0.72rem; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center; margin-top: 1px;
}

/* 成局 */
.formation-list { display: flex; flex-direction: column; gap: 10px; }
.formation-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 15px; border-radius: 10px; font-size: 0.89rem; line-height: 1.7;
}
.formation-item.hui { background: #f0fbf6; border: 1px solid #cdeadb; }
.formation-item.he { background: #f5fbf7; border: 1px solid #d8ecdf; }
.fm-tag {
  flex-shrink: 0; font-size: 0.73rem; padding: 2px 9px; border-radius: 9px;
  background: #2f8c5f; color: #fff; margin-top: 2px;
}
.fm-body { color: #2c3e50; }
.formation-empty {
  padding: 16px; background: #f7f9fc; border-radius: 10px;
  font-size: 0.88rem; color: #7a8592; line-height: 1.8;
}

/* 互照 */
.cross-list { display: flex; flex-direction: column; gap: 7px; }
.cross-item {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 9px 13px; border-radius: 8px; font-size: 0.86rem;
  background: #fafbfe; border: 1px solid #eef1f6; line-height: 1.65;
}
.cross-item.tone-he { background: #f5fcf8; border-color: #d8ecdf; }
.cross-item.tone-chong { background: #fef7f7; border-color: #f5dcdc; }
.cross-dot {
  flex-shrink: 0; width: 7px; height: 7px; border-radius: 50%; margin-top: 7px;
  background: #c8d0dc;
}
.dot-he { background: #48b37e; }
.dot-chong { background: #e08484; }
.cross-text { color: #2c3e50; }
.cross-empty { padding: 14px; background: #f7f9fc; border-radius: 10px; font-size: 0.88rem; color: #7a8592; }

/* 民俗卡 */
.folk-card { border: 1px dashed #e8d9b8; }
.folk-body { margin-bottom: 14px; }
.folk-zodiac { display: flex; align-items: center; gap: 12px; font-size: 1.05rem; margin-bottom: 12px; }
.folk-z { font-weight: 600; color: #2c3e50; font-family: 'SimSun','STKaiti',serif; }
.folk-x { color: #c8b89a; font-size: 0.9rem; }
.folk-hit { font-size: 0.9rem; color: #5a6675; line-height: 1.75; }
.folk-hit strong { color: #b8720b; }
.folk-hit.folk-ok strong { color: #2f8c5f; }
.folk-hit.muted { color: #96a0ad; }
.folk-note-tag { color: #96a0ad; font-size: 0.82rem; }
.folk-warn {
  padding: 13px 16px; background: #fffaf0; border-radius: 10px;
  font-size: 0.82rem; color: #7a6a4e; line-height: 1.8;
}
.folk-warn strong { color: #b8720b; }

/* 结果卡片 */
.result-wrap { animation: fadeUp .45s ease-out; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.result-card {
  background: white; border-radius: 18px; padding: 26px;
  box-shadow: 0 8px 26px rgba(0,0,0,0.07); margin-bottom: 22px;
}
.section-title {
  font-size: 1.12rem; color: #2c3e50; margin: 0 0 18px 0; font-weight: 600;
  padding-left: 10px; border-left: 4px solid #7a8ff9;
}

/* 四柱对照 */
.pillars-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.pillars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.pillar {
  background: #f7f9fc; border-radius: 10px; padding: 10px 6px; text-align: center;
  border: 1px solid #e8edf5;
}
.pillar-name { font-size: 0.75rem; color: #8b96a5; margin-bottom: 6px; }
.pillar-gz { display: flex; flex-direction: column; gap: 2px; }
.gz-gan { font-size: 1.25rem; font-weight: 700; color: #2c3e50; font-family: 'SimSun','STKaiti',serif; }
.gz-zhi { font-size: 1.25rem; font-weight: 700; color: #5b6df9; font-family: 'SimSun','STKaiti',serif; }
.pillar-gods { margin-top: 6px; }
.god-tag {
  display: inline-block; font-size: 0.7rem; padding: 2px 7px; border-radius: 10px;
  background: #eef1fb; color: #5b6df9;
}
.side-label { font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; }
.male-label { color: #5b8ff9; }
.female-label { color: #e8688a; }
.side-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.meta-item {
  font-size: 0.78rem; padding: 3px 9px; border-radius: 8px;
  background: #f0f3f9; color: #5a6675;
}

/* 比对条目 */
.item-list { display: flex; flex-direction: column; gap: 12px; }
.rel-item {
  border: 1px solid #e8edf5; border-left: 4px solid #c8d0dc;
  border-radius: 10px; padding: 14px 16px; background: #fafbfe;
}
.rel-item.tone-he { border-left-color: #48b37e; background: #f5fcf8; }
.rel-item.tone-chong { border-left-color: #e08484; background: #fef7f7; }
.rel-item.tone-mixed { border-left-color: #e8a33d; background: #fffaf2; }
.rel-head { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
.rel-index {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%; background: #eef1f8;
  color: #5b6df9; font-size: 0.78rem; font-weight: 700; flex-shrink: 0;
}
.rel-name { font-weight: 600; color: #2c3e50; font-size: 0.96rem; }
.rel-tag {
  margin-left: auto; font-size: 0.75rem; padding: 3px 10px; border-radius: 10px;
  background: #eef1f8; color: #5a6675;
}
.tag-he { background: #e2f6ec; color: #2f8c5f; }
.tag-chong { background: #fdeaea; color: #c05252; }
.tag-mixed { background: #fdf2e0; color: #b8720b; }
.rel-detail { font-size: 0.9rem; color: #5a6675; line-height: 1.7; }
.rel-relations { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
.rel-chip {
  font-size: 0.76rem; padding: 3px 10px; border-radius: 12px;
  background: #eef1f8; color: #5a6675;
}
.chip-he { background: #e2f6ec; color: #2f8c5f; }
.chip-chong { background: #fdeaea; color: #c05252; }
.rel-note {
  margin-top: 9px; font-size: 0.8rem; color: #96a0ad; line-height: 1.65;
  padding-top: 8px; border-top: 1px dashed #e8edf5;
}

/* 五行 */
.element-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.element-bars { display: flex; flex-direction: column; gap: 8px; }
.el-row { display: flex; align-items: center; gap: 8px; }
.el-name {
  font-size: 0.82rem; width: 20px; text-align: center; font-weight: 600;
  font-family: 'SimSun','STKaiti',serif;
}
.el-track { flex: 1; height: 12px; background: #f0f3f9; border-radius: 6px; overflow: hidden; }
.el-fill { height: 100%; border-radius: 6px; transition: width .5s ease; }
.el-count { font-size: 0.8rem; color: #8b96a5; width: 18px; text-align: right; }

.el-木 { background: #7bc98f; color: #2f8c5f; }
.el-火 { background: #ee8f7e; color: #c05252; }
.el-土 { background: #d9b06a; color: #a87f28; }
.el-金 { background: #c9ced6; color: #6b7480; }
.el-水 { background: #7fb2e5; color: #3a72a8; }
.el-name.el-木, .el-name.el-火, .el-name.el-土, .el-name.el-金, .el-name.el-水 {
  background: transparent;
}

.bal-summary { margin-top: 12px; display: flex; flex-direction: column; gap: 5px; }
.bal-line { font-size: 0.82rem; color: #5a6675; }
.bal-key {
  display: inline-block; min-width: 34px; font-size: 0.72rem; padding: 1px 6px;
  border-radius: 6px; background: #f0f3f9; color: #7a8592; margin-right: 7px;
}

.complement-box {
  margin-top: 20px; padding: 15px 18px; background: #f7f9fc;
  border-radius: 12px; border: 1px solid #e8edf5;
}
.complement-title { font-size: 0.9rem; font-weight: 600; color: #2c3e50; margin-bottom: 9px; }
.complement-body { font-size: 0.86rem; color: #5a6675; line-height: 1.8; }
.complement-body.muted { color: #96a0ad; }
.comp-line { margin-bottom: 5px; }
.comp-line strong { color: #2f8c5f; }

/* 日柱详情 */
.couple-detail { display: flex; flex-direction: column; gap: 11px; }
.detail-row { display: flex; gap: 12px; font-size: 0.9rem; align-items: flex-start; }
.dr-key { color: #8b96a5; min-width: 88px; flex-shrink: 0; }
.dr-val { color: #2c3e50; line-height: 1.7; }
.couple-note {
  margin-top: 16px; padding-top: 13px; border-top: 1px dashed #e8edf5;
  font-size: 0.82rem; color: #96a0ad; line-height: 1.75;
}

/* 纳音 */
.nayin-grid {
  display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: center;
}
.nayin-side { text-align: center; }
.nayin-value {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 14px; background: #f7f9fc; border-radius: 12px; border: 1px solid #e8edf5;
}
.nayin-gz { font-size: 1.05rem; font-weight: 700; font-family: 'SimSun','STKaiti',serif; color: #2c3e50; }
.nayin-name { font-size: 0.86rem; color: #5a6675; }
.nayin-el {
  font-size: 0.76rem; padding: 2px 10px; border-radius: 10px; color: #fff;
}
.nayin-vs { text-align: center; display: flex; flex-direction: column; gap: 7px; }
.vs-tag {
  font-size: 0.85rem; font-weight: 600; padding: 5px 14px; border-radius: 12px;
  background: #eef1f8; color: #5a6675; white-space: nowrap;
}
.vs-desc { font-size: 0.76rem; color: #96a0ad; }

/* 汇总 */
.summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
.summary-stat {
  text-align: center; padding: 16px 10px; border-radius: 12px; background: #f7f9fc;
  border: 1px solid #e8edf5;
}
.summary-stat.he { border-top: 3px solid #48b37e; }
.summary-stat.chong { border-top: 3px solid #e08484; }
.summary-stat.neutral { border-top: 3px solid #c8d0dc; }
.stat-num { font-size: 1.7rem; font-weight: 700; color: #2c3e50; }
.stat-label { font-size: 0.78rem; color: #8b96a5; margin-top: 4px; }
.summary-text {
  font-size: 0.9rem; color: #5a6675; line-height: 1.85;
  padding: 14px 16px; background: #f7f9fc; border-radius: 10px;
}
.summary-warn {
  margin-top: 13px; font-size: 0.8rem; color: #96a0ad; line-height: 1.7;
}
.summary-warn strong { color: #b8720b; }

/* 两面说法 */
.debate-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.debate-col { padding: 16px 18px; border-radius: 12px; }
.debate-col.pro { background: #f5fcf8; border: 1px solid #d4eddf; }
.debate-col.con { background: #fef7f7; border: 1px solid #f5dcdc; }
.debate-head { font-size: 0.9rem; font-weight: 600; margin-bottom: 10px; }
.debate-col.pro .debate-head { color: #2f8c5f; }
.debate-col.con .debate-head { color: #c05252; }
.debate-col ul { margin: 0; padding-left: 18px; }
.debate-col li { font-size: 0.84rem; color: #5a6675; line-height: 1.8; }

/* 操作 */
.action-section { display: flex; justify-content: center; margin: 26px 0; }
.current-time-btn {
  background: #00b894; color: #fff; border: none; padding: 12px 30px;
  border-radius: 9px; font-size: 0.95rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px; transition: all .25s ease;
}
.current-time-btn:hover { background: #00a085; transform: translateY(-1px); }

/* 空状态 */
.empty-state {
  text-align: center; padding: 56px 20px; background: #fff;
  border-radius: 18px; margin-bottom: 26px; color: #b2bec3;
}
.empty-icon { font-size: 3rem; margin-bottom: 18px; opacity: .6; }
.empty-state h3 { margin: 0 0 10px; color: #7f8c8d; font-size: 1.35rem; }
.empty-state p { margin: 0 0 22px; font-size: 0.95rem; }
.demo-btn {
  background: #eef1f8; color: #5b6df9; border: none; padding: 11px 26px;
  border-radius: 9px; font-size: 0.92rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px; transition: all .25s ease;
}
.demo-btn:hover { background: #e0e5f5; }

.footer {
  text-align: center; padding: 20px; color: #9aa5b1; font-size: 0.85rem;
  border-top: 1px solid #e8edf5; margin-top: 20px;
}

.icon-search::before { content: "🔍"; }
.icon-refresh::before { content: "🔄"; }
.icon-clock::before { content: "⏰"; }
.icon-result::before { content: "📊"; }

/* 响应式 */
@media (max-width: 768px) {
  .hehun-container { padding: 14px; }
  .title { font-size: 1.7rem; }
  .input-grid, .pillars-grid, .element-grid, .debate-grid { grid-template-columns: 1fr; }
  .nayin-grid { grid-template-columns: 1fr; }
  .result-card, .input-card { padding: 18px; }
  .action-row { flex-direction: column; }
  .analyze-btn, .reset-btn { justify-content: center; }
}
</style>
