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
      { text: "javascrpt基础", link: "/javascript/01-var-let-const-and-data-types" },
    ],

    sidebar: [
      {
        text: "javascrpt基础",
        items: [
          { text: "var/let/const和数据类型", link: "/javascript/01-var-let-const-and-data-types" },
          { text: "作用域与闭包原理", link: "/javascript/02-execution-context-scope-closure" },
          { text: "原型链", link: "/javascript/03-prototype-chain" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/vuejs/vitepress" }],
  },
});
