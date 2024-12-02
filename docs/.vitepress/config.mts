import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "玄学",
    titleTemplate: 'rstyro',
    description: "中医相关文档",
    assetsDir: 'assets',
    base: '/tcm-doc/',
    head: [['link', { rel: 'icon', href: 'logo.png' }]],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/logo.png',
        nav: [
            {text: '首页', link: '/'},
            {
                text: '山',
                items: [
                    {text: '五术之山', link: '/shan/start'},
                ]
            },
            {
                text: '中医',
                items: [
                    {text: '介绍', link: '/tcm/introduce'},
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
                text: '相',
                items: [
                    {text: '五术之相', link: '/face/start'},
                ]
            },
            {
                text: '卜',
                items: [
                    {text: '五术之卜', link: '/divination/start'},
                ]
            },
        ],

        sidebar: {
            '/tcm/': [
                {
                    text: '中医', collapsed: false,
                    items: [
                        {text: '介绍', link: '/tcm/introduce'}
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
