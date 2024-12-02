import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "TCM",
    titleTemplate: 'rstyro',
    description: "中医相关文档",
    assetsDir: 'assets',
    base: '/tcm-doc/',
    head: [['link', { rel: 'icon', href: 'logo.png' }]],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/logo.png',
        nav: [
            {text: 'Home', link: '/'},
            {
                text: 'Demo',
                items: [
                    {text: 'Demo', link: '/demo'},
                    {text: 'Demo1', link: '/demo/demo1'},
                    {
                        text: 'Demo2',
                        items: [

                            {text: 'abc', link: '/demo/demo2'}
                        ]
                    },
                ]
            },
            {
                text: '中医',
                items: [
                    {text: '介绍', link: '/tcm/introduce'},
                ]
            }
        ],

        sidebar: {
            '/demo/': [
                {
                    text: 'Demo', collapsed: false,
                    items: [
                        {text: 'demo', link: '/demo'},
                        {text: 'demo1', link: '/demo/demo1'},
                        {text: 'demo2', link: '/demo/demo2'}
                    ]
                }
            ],
            '/tcm/': [
                {
                    text: '中医', collapsed: false,
                    items: [
                        {text: '介绍', link: '/tcm/introduce'}
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
