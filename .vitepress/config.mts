import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  base: "/web-notes/",

  title: "web-notes",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "javascrpt", link: "/javascript/01-var-let-const-and-data-types" },
    ],

    sidebar: [
      {
        text: "javascrpt",
        items: [
          { text: "var/let/const和数据类型", link: "/javascript/01-var-let-const-and-data-types" },
          { text: "作用域与闭包原理", link: "/javascript/02-execution-context-scope-closure" },
          { text: "原型链与构造函数", link: "/javascript/03-prototype-chain" },
          { text: "call、apply 与 bind", link: "/javascript/04-call-apply-bind" },
          { text: "Event Loop、宏任务与微任务", link: "/javascript/05-event-loop-macrotask-microtask" },
          { text: "promise对象", link: "/javascript/06-promise" },
          { text: "async函数", link: "/javascript/07-async" },
          { text: "垃圾回收、可达性分析与内存泄漏定位", link: "/javascript/08-garbage-collection-reachability-and-memory-leaks" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/vuejs/vitepress" }],
  },
});
