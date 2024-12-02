import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "文档名称",
  titleTemplate: 'rstyro',
  description: "文档的基本描述",
  outDir: '../public',
  assetsDir: 'assets',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
       { text: 'Demo', 
       items:[
        { text: 'Demo', link: '/demo' },
        { text: 'Demo1', link: '/demo/demo1' },
        { text: 'Demo2', 
          items:[
                 
                  { text: 'abc', link: '/demo/demo2' }
                 ]
         },
       ] 
       },

      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: {
      '/demo/': [
        {
          text: 'Demo',collapsed: false,
          items: [
            { text: 'demo', link: '/demo' },
            { text: 'demo1', link: '/demo/demo1' },
            { text: 'demo2', link: '/demo/demo2' }
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rstyro' },
      { icon: 'discord', link: 'https://github.com/rstyro' },
      { icon: 'facebook', link: 'https://github.com/rstyro' },
      { icon: 'instagram', link: 'https://github.com/rstyro' },
      { icon: 'mastodon', link: 'https://github.com/rstyro' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-<a href="https://github.com/rstyro">rstyro</a>'
    },
    search: {
      provider: 'local'
    }
  }
})
