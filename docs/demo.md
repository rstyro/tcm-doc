---
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
title: Demo标题修改
---


# Demo demo

#### Demo的其他内容

<script setup>

    import { ref } from 'vue'
    import { useData } from 'vitepress'

	const { theme } = useData()
    const msg = ref('Hello VitePress')

</script>

<h1>{{  msg }}</h1>
<div v-for="item in 8">测试v-for指令{{ item }}</div>


![npx初始化图片](/assets/npx-init.png)

<div>
  <h1>{{ theme.footer.copyright }}</h1>
</div>