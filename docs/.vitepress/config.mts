import {defineConfig} from 'vitepress'


const itemsLength = 64;

function getZhouYiSidebar() {
    let items: {}[] = [{
        text: '《周易》是什么？',
        link: '/divination/zhouyi/what.md'
    }]
    for (let i = 1; i <= itemsLength; i++) {
        items.push({text: `第${numberToChinese(i)}卦`, link: `/divination/zhouyi/zhouyi_${i}`})
    }
    return items
}

function getHuangDiSidebar(len=24) {
    let items: {}[] = [{
        text: '《黄帝内经》是什么？',
        link: '/tcm/huangdi/what.md'
    }]
    for (let i = 1; i <= len; i++) {
        items.push({text: `卷${numberToChinese(i)}`, link: `/tcm/huangdi/huangdi_${i}`})
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
