import {defineConfig} from 'vitepress'


const itemsLength = 64;

const GUA_64=[{"name":"乾","num":" 1","symbol":"䷀"},{"name":"坤","num":" 2","symbol":"䷁"},{"name":"屯","num":" 3","symbol":"䷂"},{"name":"蒙","num":" 4","symbol":"䷃"},{"name":"需","num":" 5","symbol":"䷄"},{"name":"讼","num":" 6","symbol":"䷅"},{"name":"师","num":" 7","symbol":"䷆"},{"name":"比","num":" 8","symbol":"䷇"},{"name":"小畜","num":" 9","symbol":"䷈"},{"name":"履","num":"10","symbol":"䷉"},{"name":"泰","num":"11","symbol":"䷊"},{"name":"否","num":"12","symbol":"䷋"},{"name":"同人","num":"13","symbol":"䷌"},{"name":"大有","num":"14","symbol":"䷍"},{"name":"谦","num":"15","symbol":"䷎"},{"name":"豫","num":"16","symbol":"䷏"},{"name":"随","num":"17","symbol":"䷐"},{"name":"蛊","num":"18","symbol":"䷑"},{"name":"临","num":"19","symbol":"䷒"},{"name":"观","num":"20","symbol":"䷓"},{"name":"噬嗑","num":"21","symbol":"䷔"},{"name":"贲","num":"22","symbol":"䷕"},{"name":"剥","num":"23","symbol":"䷖"},{"name":"复","num":"24","symbol":"䷗"},{"name":"无妄","num":"25","symbol":"䷘"},{"name":"大畜","num":"26","symbol":"䷙"},{"name":"颐","num":"27","symbol":"䷚"},{"name":"大过","num":"28","symbol":"䷛"},{"name":"坎","num":"29","symbol":"䷜"},{"name":"离","num":"30","symbol":"䷝"},{"name":"咸","num":"31","symbol":"䷞"},{"name":"恒","num":"32","symbol":"䷟"},{"name":"遁","num":"33","symbol":"䷠"},{"name":"大壮","num":"34","symbol":"䷡"},{"name":"晋","num":"35","symbol":"䷢"},{"name":"明夷","num":"36","symbol":"䷣"},{"name":"家人","num":"37","symbol":"䷤"},{"name":"睽","num":"38","symbol":"䷥"},{"name":"蹇","num":"39","symbol":"䷦"},{"name":"解","num":"40","symbol":"䷧"},{"name":"损","num":"41","symbol":"䷨"},{"name":"益","num":"42","symbol":"䷩"},{"name":"夬","num":"43","symbol":"䷪"},{"name":"姤","num":"44","symbol":"䷫"},{"name":"萃","num":"45","symbol":"䷬"},{"name":"升","num":"46","symbol":"䷭"},{"name":"困","num":"47","symbol":"䷮"},{"name":"井","num":"48","symbol":"䷯"},{"name":"革","num":"49","symbol":"䷰"},{"name":"鼎","num":"50","symbol":"䷱"},{"name":"震","num":"51","symbol":"䷲"},{"name":"艮","num":"52","symbol":"䷳"},{"name":"渐","num":"53","symbol":"䷴"},{"name":"归妹","num":"54","symbol":"䷵"},{"name":"丰","num":"55","symbol":"䷶"},{"name":"旅","num":"56","symbol":"䷷"},{"name":"巽","num":"57","symbol":"䷸"},{"name":"兑","num":"58","symbol":"䷹"},{"name":"涣","num":"59","symbol":"䷺"},{"name":"节","num":"60","symbol":"䷻"},{"name":"中孚","num":"61","symbol":"䷼"},{"name":"小过","num":"62","symbol":"䷽"},{"name":"既济","num":"63","symbol":"䷾"},{"name":"未济","num":"64","symbol":"䷿"}]

function getZhouYiSidebar() {
    let items: {}[] = [{
        text: '《周易》是什么？',
        link: '/divination/zhouyi/what.md'
    }]
    for (let i = 0; i < GUA_64.length; i++) {
        let gua=GUA_64[i];
        items.push({text: `第${gua.num}卦 ${gua.symbol} ${gua.name}`, link: `/divination/zhouyi/zhouyi_${i+1}`})
    }
    return items
}

function getHuangDiSidebar(len=24) {
    let items: {}[] = [{
        text: '《黄帝内经》是什么？',
        link: '/tcm/huangdi/what.md'
    }]
    for (let i = 1; i <= len; i++) {
        items.push({text: `素问·卷${numberToChinese(i)}`, link: `/tcm/huangdi/huangdi_${i}`})
    }
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
    titleTemplate: 'rstyro',
    description: "中医相关文档",
    assetsDir: 'assets',
    base: '/tcm-doc/',
    head: [['link', {rel: 'icon', href: 'logo.png'}]],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/logo.png',
        nav: [
            {text: '首页', link: '/'},
            {
                text: '山', link: '/shan/start',
            },
            {
                text: '医',
                items: [
                    {text: '介绍', link: '/tcm/introduce'},
                    {text: '黄帝内经', link: '/tcm/huangdi/what'},
                    {text: '倪注伤寒论', link: '/tcm/shanghanlun/start'},

                ]
            },
            {
                text: '命',
                items: [
                    {text: '命理师', link: '/fate/what'},
                    {text: '八字', link: '/fate/bazi'},
                    {text: '五行', link: '/fate/wuxing'},
                ]
            },
            {
                text: '相', link: '/face/start',
            },
            {
                text: '卜',
                items: [
                    {text: '五术之卜', link: '/divination/start'},
                    {text: '周易', link: '/divination/zhouyi/what'},
                ]

            },
        ],

        sidebar: {
            '/tcm/': [
                {
                    text: '中医', collapsed: true,
                    items: [
                        {text: '介绍', link: '/tcm/introduce'},
                    ]
                },
                {
                    text: '黄帝内经', collapsed: false,
                    items: getHuangDiSidebar()
                },
                {
                    text: '倪注伤寒论', collapsed: false,
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
                        {text: '古代中药重量单位换算', link: '/tcm/shanghanlun/unit'},
                    ]
                }
            ],
            '/fate/': [
                {
                    text: '命', collapsed: false,
                    items: [
                        {text: '命理师', link: '/fate/what'},
                        {text: '八字', link: '/fate/bazi'},
                        {text: '五行', link: '/fate/wuxing'},
                    ]
                }
            ],
            '/divination/': [
                {text: '五术之卜', link: '/divination/start'},
                {
                    text: '周易',
                    collapsed: false,
                    items: getZhouYiSidebar()
                }
                ]

        },
        socialLinks: [
            {icon: 'github', link: 'https://github.com/rstyro'},
        ],
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-<a href="https://github.com/rstyro">rstyro</a>'
        },
        search: {
            provider: 'local'
        },
        outline: 'deep'
    }
})
