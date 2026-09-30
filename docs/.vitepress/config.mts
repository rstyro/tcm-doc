import {defineConfig} from 'vitepress'

// 站点部署基路径（与下方 base 保持一致），用于拼接静态资源绝对路径
const BASE = '/tcm-doc/';
const withBase = (path) => (path.startsWith(BASE) ? path : `${BASE}${path.replace(/^\//, '')}`);


const itemsLength = 64;

const GUA_64 = [{"name": "乾", "num": " 1", "symbol": "䷀"}, {"name": "坤", "num": " 2", "symbol": "䷁"}, {
    "name": "屯",
    "num": " 3",
    "symbol": "䷂"
}, {"name": "蒙", "num": " 4", "symbol": "䷃"}, {"name": "需", "num": " 5", "symbol": "䷄"}, {
    "name": "讼",
    "num": " 6",
    "symbol": "䷅"
}, {"name": "师", "num": " 7", "symbol": "䷆"}, {"name": "比", "num": " 8", "symbol": "䷇"}, {
    "name": "小畜",
    "num": " 9",
    "symbol": "䷈"
}, {"name": "履", "num": "10", "symbol": "䷉"}, {"name": "泰", "num": "11", "symbol": "䷊"}, {
    "name": "否",
    "num": "12",
    "symbol": "䷋"
}, {"name": "同人", "num": "13", "symbol": "䷌"}, {"name": "大有", "num": "14", "symbol": "䷍"}, {
    "name": "谦",
    "num": "15",
    "symbol": "䷎"
}, {"name": "豫", "num": "16", "symbol": "䷏"}, {"name": "随", "num": "17", "symbol": "䷐"}, {
    "name": "蛊",
    "num": "18",
    "symbol": "䷑"
}, {"name": "临", "num": "19", "symbol": "䷒"}, {"name": "观", "num": "20", "symbol": "䷓"}, {
    "name": "噬嗑",
    "num": "21",
    "symbol": "䷔"
}, {"name": "贲", "num": "22", "symbol": "䷕"}, {"name": "剥", "num": "23", "symbol": "䷖"}, {
    "name": "复",
    "num": "24",
    "symbol": "䷗"
}, {"name": "无妄", "num": "25", "symbol": "䷘"}, {"name": "大畜", "num": "26", "symbol": "䷙"}, {
    "name": "颐",
    "num": "27",
    "symbol": "䷚"
}, {"name": "大过", "num": "28", "symbol": "䷛"}, {"name": "坎", "num": "29", "symbol": "䷜"}, {
    "name": "离",
    "num": "30",
    "symbol": "䷝"
}, {"name": "咸", "num": "31", "symbol": "䷞"}, {"name": "恒", "num": "32", "symbol": "䷟"}, {
    "name": "遁",
    "num": "33",
    "symbol": "䷠"
}, {"name": "大壮", "num": "34", "symbol": "䷡"}, {"name": "晋", "num": "35", "symbol": "䷢"}, {
    "name": "明夷",
    "num": "36",
    "symbol": "䷣"
}, {"name": "家人", "num": "37", "symbol": "䷤"}, {"name": "睽", "num": "38", "symbol": "䷥"}, {
    "name": "蹇",
    "num": "39",
    "symbol": "䷦"
}, {"name": "解", "num": "40", "symbol": "䷧"}, {"name": "损", "num": "41", "symbol": "䷨"}, {
    "name": "益",
    "num": "42",
    "symbol": "䷩"
}, {"name": "夬", "num": "43", "symbol": "䷪"}, {"name": "姤", "num": "44", "symbol": "䷫"}, {
    "name": "萃",
    "num": "45",
    "symbol": "䷬"
}, {"name": "升", "num": "46", "symbol": "䷭"}, {"name": "困", "num": "47", "symbol": "䷮"}, {
    "name": "井",
    "num": "48",
    "symbol": "䷯"
}, {"name": "革", "num": "49", "symbol": "䷰"}, {"name": "鼎", "num": "50", "symbol": "䷱"}, {
    "name": "震",
    "num": "51",
    "symbol": "䷲"
}, {"name": "艮", "num": "52", "symbol": "䷳"}, {"name": "渐", "num": "53", "symbol": "䷴"}, {
    "name": "归妹",
    "num": "54",
    "symbol": "䷵"
}, {"name": "丰", "num": "55", "symbol": "䷶"}, {"name": "旅", "num": "56", "symbol": "䷷"}, {
    "name": "巽",
    "num": "57",
    "symbol": "䷸"
}, {"name": "兑", "num": "58", "symbol": "䷹"}, {"name": "涣", "num": "59", "symbol": "䷺"}, {
    "name": "节",
    "num": "60",
    "symbol": "䷻"
}, {"name": "中孚", "num": "61", "symbol": "䷼"}, {"name": "小过", "num": "62", "symbol": "䷽"}, {
    "name": "既济",
    "num": "63",
    "symbol": "䷾"
}, {"name": "未济", "num": "64", "symbol": "䷿"}]

// 六十四卦侧栏项：卦号 from..to（皆含，1 起）。上经 1–30、下经 31–64。
function guaItems(from: number, to: number) {
    let items: {}[] = []
    for (let i = from - 1; i < to; i++) {
        let gua = GUA_64[i];
        items.push({
            text: `第${String(gua.num).trim()}卦 ${gua.symbol} ${gua.name}`,
            link: `/divination/zhouyi/zhouyi_${i + 1}`
        })
    }
    return items
}


function getSuWenSidebar(len = 24) {
    let items: {}[] = []
    for (let i = 1; i <= len; i++) {
        items.push({text: `素问·卷${numberToChinese(i)}`, link: `/tcm/huangdi/suwen/suwen${i}`})
    }
    return items
}

const JINGUI_CHAPTERS = [
    '脏腑经络先后病脉证',
    '痉湿暍病脉证',
    '百合狐惑阴阳毒病脉证',
    '疟病脉证并治',
    '中风历节病脉证并治',
    '血痹虚劳病脉证并治',
    '肺痿肺痈咳嗽上气病脉证治',
    '奔豚气病脉证治',
    '胸痹心痛短气病脉证治',
    '腹满寒疝宿食病脉证治',
    '五脏风寒积聚病脉证并治',
    '痰饮咳嗽病脉证并治',
    '消渴小便不利淋病脉证并治',
    '水气病脉证并治',
    '黄疸病脉证并治',
    '惊悸吐衄下血胸满瘀血病脉证治',
    '呕吐哕下利病脉证治',
    '疮痈肠痈浸淫病脉证并治',
    '趺蹶手指臂肿转筋阴狐疝蛔虫病脉证治',
    '妇人妊娠病脉证并治',
    '妇人产后病脉证治',
    '妇人杂病脉证并治',
    '杂疗方',
    '禽兽鱼虫禁忌并治',
    '果实菜谷禁忌并治',
]

function getJingGuiSidebar() {
    let items: {}[] = [{
        text: '导言与篇目',
        link: '/tcm/jingui/what.md'
    }]
    for (let i = 0; i < JINGUI_CHAPTERS.length; i++) {
        items.push({text: `第${i + 1}篇 · ${JINGUI_CHAPTERS[i]}`, link: `/tcm/jingui/jingui${i + 1}`})
    }
    return items
}

const LINGSHU_CHAPTERS = [
    '九针十二原',
    '本输',
    '小针解',
    '邪气藏府病形',
    '根结',
    '寿夭刚柔',
    '官针',
    '本神',
    '终始',
    '经脉',
    '经别',
    '经水',
    '经筋',
    '骨度',
    '五十营',
    '营气',
    '脉度',
    '营卫生会',
    '四时气',
    '五邪',
    '寒热病',
    '癫狂',
    '热病',
    '厥病',
    '病本',
    '杂病',
    '周痹',
    '口问',
    '师传',
    '决气',
    '肠胃',
    '平人绝谷',
    '海论',
    '五乱',
    '胀论',
    '五癃津液别',
    '五阅五使',
    '逆顺肥瘦',
    '血络论',
    '阴阳清浊',
    '阴阳系日月',
    '病传',
    '淫邪发梦',
    '顺气一日分为四时',
    '外揣',
    '五变',
    '本藏',
    '禁服',
    '五色',
    '论勇',
    '背腧',
    '卫气',
    '论痛',
    '天年',
    '逆顺',
    '五味',
    '水胀',
    '贼风',
    '卫气失常',
    '玉版',
    '五禁',
    '动输',
    '五味论',
    '阴阳二十五人',
    '五音五味',
    '百病始生',
    '行针',
    '上膈',
    '忧恚无言',
    '寒热',
    '邪客',
    '通天',
    '官能',
    '论疾诊尺',
    '刺节真邪',
    '卫气行',
    '九宫八风',
    '九针论',
    '岁露论',
    '大惑论',
    '痈疽',
]

function getLingShuSidebar() {
    let items: {}[] = []
    for (let i = 0; i < LINGSHU_CHAPTERS.length; i++) {
        items.push({text: `第${i + 1}篇 · ${LINGSHU_CHAPTERS[i]}`, link: `/tcm/huangdi/lingshu/lingshu${i + 1}`})
    }
    return items
}


// 《道德经》八十一章（章序, 章题）
const DAODEJING_CHAPTERS: [number, string][] = [
    [1, '天地之始'], [2, '美之为美'], [3, '圣人之治'], [4, '象帝之先'], [5, '天地不仁'], [6, '玄牝之门'],
    [7, '天长地久'], [8, '不争无尤'], [9, '功遂身退'], [10, '长而不宰'], [11, '无之为用'], [12, '圣人为腹'],
    [13, '宠辱两忘'], [14, '无状之状'], [15, '善为士者'], [16, '殁身不殆'], [17, '功成事遂'], [18, '道亡有义'],
    [19, '绝圣弃智'], [20, '独异于人'], [21, '惟道是从'], [22, '圣人抱一'], [23, '道亦乐得'], [24, '自是不彰'],
    [25, '道法自然'], [26, '静为躁君'], [27, '善行无痕'], [28, '知雄守雌'], [29, '圣人无为'], [30, '以道佐主'],
    [31, '兵者不祥'], [32, '知止不殆'], [33, '知人者智'], [34, '不自为大'], [35, '执道乐往'], [36, '欲歙固张'],
    [37, '道恒无为'], [38, '上德不德'], [39, '下为高基'], [40, '无中生有'], [41, '大器晚成'], [42, '物损而益'],
    [43, '不言之教'], [44, '知足不辱'], [45, '大成若缺'], [46, '知足常足'], [47, '不行而知'], [48, '为道日损'],
    [49, '善者吾善'], [50, '出生入死'], [51, '道生德畜'], [52, '天下有始'], [53, '盗竽非道'], [54, '善抱不脱'],
    [55, '含德之厚'], [56, '知者不言'], [57, '以正治国'], [58, '福祸相倚'], [59, '治人尚啬'], [60, '以道治国'],
    [61, '大者宜下'], [62, '万物之奥'], [63, '能成其大'], [64, '无为无败'], [65, '善为道者'], [66, '莫能与争'],
    [67, '我有之宝'], [68, '不争之德'], [69, '哀者胜矣'], [70, '被褐怀玉'], [71, '知不知上'], [72, '自爱不贵'],
    [73, '天网恢恢'], [74, '民不畏死'], [75, '无以生为'], [76, '强大处下'], [77, '不欲见贤'], [78, '柔之胜刚'],
    [79, '道与善人'], [80, '小国寡民'], [81, '善者不辩'],
]

function ddjChapterItems(from: number, to: number) {
    return DAODEJING_CHAPTERS
        .filter(([n]) => n >= from && n <= to)
        .map(([n, t]) => ({text: `第${n}章 ${t}`, link: `/shan/daodejing/zhang${n}`}))
}

const DAODEJING_GROUP = {
    text: '道德经', collapsed: true,
    items: [
        {text: '导读', link: '/shan/daodejing/'},
        {text: '道经 · 一至三十七章', collapsed: true, items: ddjChapterItems(1, 37)},
        {text: '德经 · 三十八至八十一章', collapsed: true, items: ddjChapterItems(38, 81)},
        {text: '八十一章合订', link: '/shan/daodejing/full'},
    ]
}

// 《庄子》三十三篇（篇序, 篇名）
const ZHUANGZI_CHAPTERS: [number, string][] = [
    [1, '逍遥游'], [2, '齐物论'], [3, '养生主'], [4, '人间世'], [5, '德充符'], [6, '大宗师'],
    [7, '应帝王'], [8, '骈拇'], [9, '马蹄'], [10, '胠箧'], [11, '在宥'], [12, '天地'],
    [13, '天道'], [14, '天运'], [15, '刻意'], [16, '缮性'], [17, '秋水'], [18, '至乐'],
    [19, '达生'], [20, '山木'], [21, '田子方'], [22, '知北游'], [23, '庚桑楚'], [24, '徐无鬼'],
    [25, '则阳'], [26, '外物'], [27, '寓言'], [28, '让王'], [29, '盗跖'], [30, '说剑'],
    [31, '渔父'], [32, '列御寇'], [33, '天下'],
]

function zzChapterItems(from: number, to: number) {
    return ZHUANGZI_CHAPTERS
        .filter(([n]) => n >= from && n <= to)
        .map(([n, t]) => ({text: `第${n}篇 ${t}`, link: `/shan/zhuangzi/pian${n}`}))
}

const ZHUANGZI_GROUP = {
    text: '庄子', collapsed: true,
    items: [
        {text: '导读', link: '/shan/zhuangzi/'},
        {text: '内篇 · 一至七', collapsed: true, items: zzChapterItems(1, 7)},
        {text: '外篇 · 八至二十二', collapsed: true, items: zzChapterItems(8, 22)},
        {text: '杂篇 · 二十三至三十三', collapsed: true, items: zzChapterItems(23, 33)},
    ]
}

const BENCAO_SECTIONS: string[][] = [
    ['yuanxu', '原序'],
    ['xuli', '序例'],
    ['baibing-shang', '百病主治药上'],
    ['baibing-xia', '百病主治药下'],
    ['caobu1', '草部·山草类上'],
    ['caobu2', '草部·山草类下'],
    ['caobu3', '草部·芳草类'],
    ['caobu4', '草部·隰草类上'],
    ['caobu5', '草部·隰草类下'],
    ['caobu6', '草部·毒草类'],
    ['caobu7', '草部·蔓草类'],
    ['caobu8', '草部·水草类'],
    ['caobu9', '草部·石草类'],
    ['caobu10', '草部·苔类杂草'],
    ['mubu', '木部'],
    ['tubu', '土部'],
    ['huobu', '火部'],
    ['gubu', '谷部'],
    ['guobu', '果部'],
    ['linbu', '鳞部'],
    ['shoubu', '兽部'],
    ['qinbu', '禽部'],
    ['chongbu', '虫部'],
    ['jiebu', '介部'],
    ['caibu', '菜部'],
    ['shuibu', '水部'],
    ['renbu', '人部'],
    ['jinshibu', '金石部'],
    ['fuqibu', '服器部'],
]

function getBenCaoSidebar() {
    let items: {}[] = []
    for (let i = 0; i < BENCAO_SECTIONS.length; i++) {
        let section = BENCAO_SECTIONS[i]
        items.push({text: `《本草纲目》${section[1]}`, link: `/tcm/bencao/${section[0]}`})
    }
    return items
}

// 《中药学》（新世纪第四版·钟赣生主编）各论 第八~二十八章 + 附录
const ZHONGYAOXUE_SECTIONS: string[][] = [
    ['jiebiao', '第八章 解表药'],
    ['qingre', '第九章 清热药'],
    ['xiexia', '第十章 泻下药'],
    ['qufengshi', '第十一章 祛风湿药'],
    ['huashi', '第十二章 化湿药'],
    ['lishuishenshi', '第十三章 利水渗湿药'],
    ['wenli', '第十四章 温里药'],
    ['liqi', '第十五章 理气药'],
    ['xiaoshi', '第十六章 消食药'],
    ['quchong', '第十七章 驱虫药'],
    ['zhixue', '第十八章 止血药'],
    ['huoxuehuayu', '第十九章 活血化瘀药'],
    ['huatanzhikepingchuan', '第二十章 化痰止咳平喘药'],
    ['anshen', '第二十一章 安神药'],
    ['pingganxifeng', '第二十二章 平肝息风药'],
    ['kaiqiao', '第二十三章 开窍药'],
    ['buxu', '第二十四章 补虚药'],
    ['shouse', '第二十五章 收涩药'],
    ['yongtu', '第二十六章 涌吐药'],
    ['gongdushachongzhiyang', '第二十七章 攻毒杀虫止痒药'],
    ['baduhuafushengji', '第二十八章 拔毒化腐生肌药'],
    ['bingzheng-yongyao', '附录 临床常见百种病证用药简介'],
]

function getZhongYaoXueSidebar() {
    let items: {}[] = []
    for (let i = 0; i < ZHONGYAOXUE_SECTIONS.length; i++) {
        let section = ZHONGYAOXUE_SECTIONS[i]
        items.push({text: section[1], link: `/tcm/zhongyaoxue/${section[0]}`})
    }
    return items
}

// 《方剂学》上篇 总论（绪论 + 第一章~第六章 + 附）
const FANGJIXUE_ZONGLUN_SECTIONS: string[][] = [
    ['zonglun-xulun', '绪论'],
    ['zonglun-qiyuan', '第一章 方剂的起源与发展'],
    ['zonglun-zhifa', '第二章 方剂与治法'],
    ['zonglun-fenlei', '第三章 方剂的分类'],
    ['zonglun-jixing', '第四章 方剂的剂型'],
    ['zonglun-jianfu', '第五章 方剂的煎服法'],
    ['zonglun-zufang', '第六章 方剂的组方原则与变化'],
    ['zonglun-duliangheng', '附 古今用药度量衡简释'],
]

// 《方剂学》下篇 各论 第一章~第二十一章
const FANGJIXUE_SECTIONS: string[][] = [
    ['jiebiao', '第一章 解表剂'],
    ['xiexia', '第二章 泻下剂'],
    ['hejie', '第三章 和解剂'],
    ['qingre', '第四章 清热剂'],
    ['qushu', '第五章 祛暑剂'],
    ['wenli', '第六章 温里剂'],
    ['biaolishuangjie', '第七章 表里双解剂'],
    ['buyi', '第八章 补益剂'],
    ['guse', '第九章 固涩剂'],
    ['anshen', '第十章 安神剂'],
    ['kaiqiao', '第十一章 开窍剂'],
    ['liqi', '第十二章 理气剂'],
    ['lixue', '第十三章 理血剂'],
    ['zhifeng', '第十四章 治风剂'],
    ['zhizao', '第十五章 治燥剂'],
    ['qushi', '第十六章 祛湿剂'],
    ['qutan', '第十七章 祛痰剂'],
    ['xiaoshi', '第十八章 消食剂'],
    ['quchong', '第十九章 驱虫剂'],
    ['yongtu', '第二十章 涌吐剂'],
    ['yongyang', '第二十一章 治痈疡剂'],
]

function getFangJiXueSidebar() {
    let items: {}[] = []
    items.push({
        text: '上篇 总论', collapsed: false,
        items: FANGJIXUE_ZONGLUN_SECTIONS.map(section => (
            {text: section[1], link: `/tcm/fangjixue/${section[0]}`}
        ))
    })
    items.push({
        text: '下篇 各论', collapsed: false,
        items: FANGJIXUE_SECTIONS.map(section => (
            {text: section[1], link: `/tcm/fangjixue/${section[0]}`}
        ))
    })
    return items
}


function numberToChinese(number) {
    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const chineseUnits = ['', '十', '百', '千', '万', '亿'];

    // 将数字转换为字符串，以便于处理每一位
    const numStr = String(number);

    let result = '';
    let zeroFlag = false; // 用于标记是否需要加上“零”

    for (let i = 0; i < numStr.length; i++) {
        const digit = parseInt(numStr[i]); // 当前位的数字
        const unit = chineseUnits[numStr.length - i - 1]; // 当前位的单位

        if (digit !== 0) {
            if (zeroFlag) {
                result += chineseNumbers[0]; // 如果前一位是零，则在当前位加上“零”
                zeroFlag = false;
            }
            result += chineseNumbers[digit] == "一" && unit == "十" ? unit : chineseNumbers[digit] + unit; // 加上当前位的数字和单位
        } else {
            zeroFlag = true; // 如果当前位是零，则标记为需要加上“零”
        }
    }
    return result;
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "玄学",
    description: "山、医、命、相、卜 五术经典研读与资料整理：周易六十四卦、黄帝内经、倪注伤寒论、八字命理等典籍原文与学习笔记。",
    assetsDir: 'assets',
    base: '/tcm-doc/',
    head: [
        ['link', {rel: 'icon', href: withBase('/logo.png')}],
        ['meta', {property: 'og:type', content: 'website'}],
        ['meta', {property: 'og:site_name', content: '玄学'}],
        ['meta', {property: 'og:title', content: '玄学 · 山医命相卜五术经典'}],
        ['meta', {
            property: 'og:description',
            content: '山、医、命、相、卜 五术经典研读与资料整理：周易六十四卦、黄帝内经、倪注伤寒论、八字命理等典籍原文与学习笔记。'
        }],
        ['meta', {property: 'og:image', content: withBase('/logo.png')}],
        ['meta', {name: 'twitter:card', content: 'summary'}],
    ],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/logo.png',
        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'medium',
                timeStyle: 'short'
            }
        },
        nav: [
            {text: '首页', link: '/'},
            {
                text: '山',
                items: [
                    {text: '介绍', link: '/shan/start'},
                    {text: '功法导览', link: '/shan/gongfa'},
                    {text: '食饵', link: '/shan/shier'},
                    {text: '筑基', link: '/shan/zhuji/'},
                    {text: '玄典', link: '/shan/xuandian'},
                    {text: '拳法', link: '/shan/quanfa'},
                    {text: '符咒', link: '/shan/fuzhou'},
                ]
            },
            {
                text: '医',
                items: [
                    {
                        text: '总论与基础',
                        items: [
                            {text: '中医介绍', link: '/tcm/introduce'},
                            {text: '中医基础理论', link: '/tcm/jichu/'},
                        ]
                    },
                    {
                        text: '经典',
                        items: [
                            {text: '黄帝内经', link: '/tcm/huangdi/what'},
                            {text: '倪注·伤寒论', link: '/tcm/shanghanlun/start'},
                            {text: '金匮要略', link: '/tcm/jingui/what'},
                            {text: '本草纲目', link: '/tcm/bencao/yuanxu'},
                        ]
                    },
                    {
                        text: '学科',
                        items: [
                            {text: '中药学', link: '/tcm/zhongyaoxue/jiebiao'},
                            {text: '方剂学', link: '/tcm/fangjixue/zonglun-xulun'},
                        ]
                    },
                ]
            },
            {
                text: '命',
                items: [
                    {text: '命理师', link: '/fate/what'},
                    {text: '天干地支', link: '/fate/ganzhi'},
                    {text: '地支合冲刑害', link: '/fate/dizhi-relation'},
                    {text: '八字', link: '/fate/bazi'},
                    {text: '日主旺衰', link: '/fate/wangshuai'},
                    {text: '命盘实例', link: '/fate/shili'},
                    {text: '合婚', link: '/fate/hehun'},
                    {text: '紫微斗数', link: '/fate/ziwei'},
                ]
            },
            {
                text: '相',
                items: [
                    {
                        text: '相术总论',
                        items: [
                            {text: '五术之相', link: '/face/start'},
                            {text: '相术源流与流派', link: '/face/history'},
                            {text: '相术原典导读', link: '/face/classics'},
                        ]
                    },
                    {
                        text: '人相',
                        items: [
                            {text: '面相', link: '/face/mianxiang'},
                            {text: '手相', link: '/face/shouxiang'},
                        ]
                    },
                    {
                        text: '印相与名相',
                        items: [
                            {text: '印相', link: '/face/yinxiang'},
                            {text: '名相', link: '/face/mingxiang'},
                        ]
                    },
                    {
                        text: '家相·墓相（风水）',
                        items: [
                            {text: '风水概说', link: '/face/fengshui'},
                            {text: '八宅与玄空', link: '/face/fengshui-bazhai'},
                            {text: '罗盘与形法', link: '/face/fengshui-luopan'},
                        ]
                    },
                ]
            },
            {
                text: '卜',
                items: [
                    {
                        text: '卜学总论',
                        items: [
                            {text: '五术之卜', link: '/divination/start'},
                            {text: '八卦基础', link: '/divination/zhouyi/bagua'},
                        ]
                    },
                    {
                        text: '周易',
                        items: [
                            {text: '《周易》是什么？', link: '/divination/zhouyi/what'},
                            {text: '六十四卦合订', link: '/divination/zhouyi/zhouyi'},
                        ]
                    },
                    {text: '十翼', link: '/divination/shiyi/what'},
                    {
                        text: '易占流派',
                        items: [
                            {text: '六爻', link: '/divination/liuyao'},
                            {text: '梅花易数', link: '/divination/meihua'},
                        ]
                    },
                ]
            },
            {
                text: '查询工具', items: [
                    {text: '八字查询工具', link: '/fate/query/baziQuery'},
                    {text: '节气查询工具', link: '/fate/query/jieqiQuery'},
                    {text: '太岁查询工具', link: '/fate/query/taisuiQuery'},
                    {text: '八字合婚查询', link: '/fate/query/hehunQuery'},
                ]
            }
        ],

        sidebar: {
            '/shan/': [
                {
                    text: '山术入门', collapsed: false,
                    items: [
                        {text: '介绍', link: '/shan/start'},
                        {text: '功法导览', link: '/shan/gongfa'},
                    ]
                },
                {text: '食饵', link: '/shan/shier'},
                {
                    text: '筑基', collapsed: false,
                    items: [
                        {text: '筑基概说', link: '/shan/zhuji/'},
                        {text: '术语辨析', link: '/shan/zhuji/terms'},
                        {text: '静坐答疑', link: '/shan/zhuji/faq'},
                        {text: '静定传统对照', link: '/shan/zhuji/compare'},
                        {
                            text: '静定原典', collapsed: true,
                            items: [
                                {text: '原典导读', link: '/shan/zhuji/classics/'},
                                {text: '清静经', link: '/shan/zhuji/classics/qingjingjing'},
                                {text: '天隐子', link: '/shan/zhuji/classics/tianyinzi'},
                                {text: '坐忘论', link: '/shan/zhuji/classics/zuowanglun'},
                            ]
                        },
                    ]
                },
                {
                    text: '玄典', collapsed: false,
                    items: [
                        {text: '玄典概说', link: '/shan/xuandian'},
                        DAODEJING_GROUP,
                        ZHUANGZI_GROUP,
                    ]
                },
                {
                    text: '拳法', collapsed: false,
                    items: [
                        {text: '拳法导览', link: '/shan/quanfa'},
                        {text: '导引·八段锦', link: '/shan/baduanjin'},
                        {text: '导引·易筋经', link: '/shan/yijinjing'},
                        {text: '导引·五禽戏', link: '/shan/wuqinxi'},
                        {text: '吐纳·六字诀', link: '/shan/liuzijue'},
                    ]
                },
                {text: '符咒', link: '/shan/fuzhou'},
            ],
            '/face/': [
                {
                    text: '相术总论', collapsed: false,
                    items: [
                        {text: '五术之相', link: '/face/start'},
                        {text: '相术源流与流派', link: '/face/history'},
                        {text: '相术原典导读', link: '/face/classics'},
                    ]
                },
                {
                    text: '人相', collapsed: false,
                    items: [
                        {text: '面相', link: '/face/mianxiang'},
                        {text: '手相', link: '/face/shouxiang'},
                    ]
                },
                {
                    text: '印相与名相', collapsed: false,
                    items: [
                        {text: '印相', link: '/face/yinxiang'},
                        {text: '名相', link: '/face/mingxiang'},
                    ]
                },
                {
                    text: '家相·墓相（风水）', collapsed: false,
                    items: [
                        {text: '风水概说', link: '/face/fengshui'},
                        {text: '八宅与玄空', link: '/face/fengshui-bazhai'},
                        {text: '罗盘与形法', link: '/face/fengshui-luopan'},
                    ]
                },
            ],
            '/tcm/': [
                {
                    text: '中医总论', collapsed: false,
                    items: [
                        {text: '中医介绍', link: '/tcm/introduce'},
                        {text: '历代中药重量单位', link: '/tcm/unit'},
                    ]
                },
                {
                    text: '中医基础理论', collapsed: true,
                    items: [
                        {text: '导览', link: '/tcm/jichu/'},
                        {text: '阴阳学说', link: '/tcm/jichu/yinyang'},
                        {text: '五行学说', link: '/tcm/jichu/wuxing'},
                        {text: '精气血津液神', link: '/tcm/jichu/qixue'},
                        {text: '藏象学说', link: '/tcm/jichu/zangxiang'},
                        {text: '经络与腧穴', link: '/tcm/jichu/jingluo'},
                        {text: '病因与病机', link: '/tcm/jichu/bingyin'},
                        {text: '四诊', link: '/tcm/jichu/sizhen'},
                        {text: '辨证方法', link: '/tcm/jichu/bianzheng'},
                        {text: '治则与治法', link: '/tcm/jichu/zhize'},
                        {text: '体质学说', link: '/tcm/jichu/tizhi'},
                        {text: '五运六气', link: '/tcm/jichu/yunqi'},
                    ]
                },
                {
                    text: '黄帝内经', collapsed: true,
                    items: [
                        {text: '《黄帝内经》是什么？', link: '/tcm/huangdi/what.md'},
                        {
                            text: '素问', collapsed: true,
                            items: getSuWenSidebar()
                        },
                        {
                            text: '灵枢', collapsed: true,
                            items: getLingShuSidebar()
                        },
                    ]
                },
                {
                    text: '倪注·伤寒论', collapsed: true,
                    items: [
                        {text: '前言', link: '/tcm/shanghanlun/start'},
                        {text: '辨太阳病脉证并治法上篇', link: '/tcm/shanghanlun/taiyang1'},
                        {text: '辨太阳病脉证并治法中篇', link: '/tcm/shanghanlun/taiyang2'},
                        {text: '辨太阳病脉证并治法下篇', link: '/tcm/shanghanlun/taiyang3'},
                        {text: '辨阳明病脉证并治法', link: '/tcm/shanghanlun/yangming'},
                        {text: '辨少阳病脉证并治法', link: '/tcm/shanghanlun/shaoyang'},
                        {text: '辨太阴病脉证并治法', link: '/tcm/shanghanlun/taiyin'},
                        {text: '辨少阴病脉证并治法', link: '/tcm/shanghanlun/shaoyin'},
                        {text: '辨厥阴病脉证并治法', link: '/tcm/shanghanlun/jueyin'},
                    ]
                },
                {
                    text: '金匮要略', collapsed: true,
                    items: getJingGuiSidebar()
                },
                {
                    text: '本草纲目', collapsed: true,
                    items: getBenCaoSidebar()
                },
                {
                    text: '中药学', collapsed: true,
                    items: getZhongYaoXueSidebar()
                },
                {
                    text: '方剂学', collapsed: true,
                    items: getFangJiXueSidebar()
                }
            ],
            '/fate/': [
                {text: '命理师', link: '/fate/what'},
                {
                    text: '基础概念', collapsed: false,
                    items: [
                        {text: '天干地支', link: '/fate/ganzhi'},
                        {text: '地支合冲刑害', link: '/fate/dizhi-relation'},
                        {text: '纳音', link: '/fate/nayin'},
                        {text: '神煞', link: '/fate/shensha'},
                    ]
                },
                {text: '五行', link: '/fate/wuxing'},
                {
                    text: '八字', collapsed: false,
                    items: [
                        {text: '八字基础', link: '/fate/bazi'},
                        {text: '十神', link: '/fate/shishen'},
                        {text: '十二长生', link: '/fate/changsheng'},
                        {text: '大运与流年', link: '/fate/dayun'},
                        {text: '日主旺衰', link: '/fate/wangshuai'},
                        {text: '格局', link: '/fate/geju'},
                        {text: '用神', link: '/fate/yongshen'},
                        {text: '八字怎么批', link: '/fate/piming'},
                    ]
                },
                {text: '合婚', link: '/fate/hehun'},
                {
                    text: '命盘实例', collapsed: false,
                    items: [
                        {text: '导览', link: '/fate/shili'},
                        {text: '实例一：辛金生申月（偏强）', link: '/fate/shili/example1'},
                        {text: '实例二：辛金生卯月（偏弱）', link: '/fate/shili/example2'},
                    ]
                },
                {text: '太岁', link: '/fate/taisui'},
                {
                    text: '紫微斗数', collapsed: true,
                    items: [
                        {text: '导览', link: '/fate/ziwei'},
                        {text: '源流与文献', link: '/fate/ziwei/origin'},
                        {text: '十二宫与身宫', link: '/fate/ziwei/palaces'},
                        {text: '十四主星', link: '/fate/ziwei/stars-main'},
                        {text: '辅佐煞杂曜', link: '/fate/ziwei/stars-minor'},
                        {text: '四化', link: '/fate/ziwei/sihua'},
                        {text: '排盘方法', link: '/fate/ziwei/paipan'},
                        {text: '格局与看盘', link: '/fate/ziwei/geju'},
                    ]
                },
                {
                    text: '查询工具', items: [
                        {text: '八字查询工具', link: '/fate/query/baziQuery'},
                        {text: '节气查询工具', link: '/fate/query/jieqiQuery'},
                        {text: '太岁查询工具', link: '/fate/query/taisuiQuery'},
                        {text: '八字合婚查询', link: '/fate/query/hehunQuery'},
                    ]
                },
            ],
            '/divination/': [
                {
                    text: '卜学总论', collapsed: false,
                    items: [
                        {text: '五术之卜', link: '/divination/start'},
                        {text: '八卦基础', link: '/divination/zhouyi/bagua'},
                    ]
                },
                {
                    text: '周易', collapsed: false,
                    items: [
                        {text: '《周易》是什么？', link: '/divination/zhouyi/what'},
                        {text: '六十四卦合订（全览）', link: '/divination/zhouyi/zhouyi'},
                        {text: '上经（第 1–30 卦）', collapsed: true, items: guaItems(1, 30)},
                        {text: '下经（第 31–64 卦）', collapsed: true, items: guaItems(31, 64)},
                    ]
                },
                {
                    text: '十翼', collapsed: false,
                    items: [
                        {text: '前言', link: '/divination/shiyi/what'},
                        {text: '彖传(上)', link: '/divination/shiyi/shiyi_1'},
                        {text: '彖传(下)', link: '/divination/shiyi/shiyi_2'},
                        {text: '象传(上)', link: '/divination/shiyi/shiyi_3'},
                        {text: '象传(下)', link: '/divination/shiyi/shiyi_4'},
                        {text: '文言传', link: '/divination/shiyi/shiyi_5'},
                        {text: '系辞(上)', link: '/divination/shiyi/shiyi_6'},
                        {text: '系辞(下)', link: '/divination/shiyi/shiyi_7'},
                        {text: '说卦传', link: '/divination/shiyi/shiyi_8'},
                        {text: '序卦传', link: '/divination/shiyi/shiyi_9'},
                        {text: '杂卦传', link: '/divination/shiyi/shiyi_10'},
                    ]
                },
                {
                    text: '易占流派', collapsed: false,
                    items: [
                        {text: '六爻', link: '/divination/liuyao'},
                        {text: '梅花易数', link: '/divination/meihua'},
                    ]
                },
            ]

        },
        socialLinks: [
            {icon: 'github', link: 'https://github.com/rstyro'},
        ],
        footer: {
            message: 'Released under the MIT License.',
            copyright: `Copyright © ${new Date().getFullYear()}-<a href="https://github.com/rstyro">rstyro</a>`
        },
        // 文档页脚导航
        docFooter: {
            prev: '上一页',
            next: '下一页'
        },
        search: {
            provider: 'local',
            options: {
                translations: {
                    button: {
                        buttonText: '搜索',
                        buttonAriaLabel: '搜索文档'
                    },
                    modal: {
                        noResultsText: '未找到相关结果',
                        resetButtonTitle: '清除查询',
                        footer: {
                            selectText: '选择',
                            navigateText: '切换',
                            closeText: '关闭'
                        }
                    }
                }
            }
        },
        outline: 'deep'
    }
})
