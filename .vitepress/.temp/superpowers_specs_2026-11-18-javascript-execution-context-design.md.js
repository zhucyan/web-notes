import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.DjkACiAr.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
// docs/superpowers/specs/2026-11-18-javascript-execution-context-design.md
var __pageData = JSON.parse("{\"title\":\"JavaScript 执行上下文、作用域与闭包文章设计\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"superpowers/specs/2026-11-18-javascript-execution-context-design.md\",\"filePath\":\"superpowers/specs/2026-11-18-javascript-execution-context-design.md\"}");
var _sfc_main = { name: "superpowers/specs/2026-11-18-javascript-execution-context-design.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="javascript-执行上下文、作用域与闭包文章设计" tabindex="-1">JavaScript 执行上下文、作用域与闭包文章设计 <a class="header-anchor" href="#javascript-执行上下文、作用域与闭包文章设计" aria-label="Permalink to “JavaScript 执行上下文、作用域与闭包文章设计”">​</a></h1><h2 id="目标" tabindex="-1">目标 <a class="header-anchor" href="#目标" aria-label="Permalink to “目标”">​</a></h2><p>在个人博客的 JavaScript 分类下发布首篇技术文章，以由浅入深的方式解释执行上下文、词法作用域、作用域链和闭包的工作原理，帮助初学者建立正确心智模型，也让已有基础的读者理解其运行时联系。</p><h2 id="读者与写作原则" tabindex="-1">读者与写作原则 <a class="header-anchor" href="#读者与写作原则" aria-label="Permalink to “读者与写作原则”">​</a></h2><ul><li>读者是了解变量、函数和基本调用方式的初学者，同时兼顾希望复习底层原理的前端开发者。</li><li>每个术语先给出通俗定义，再补充与 ECMAScript 规范一致但不过度展开的解释。</li><li>以一组逐步扩展的可运行代码贯穿全文；代码之后紧跟逐行或逐阶段的执行推演。</li><li>明确区分词法作用域（代码书写时确定）与作用域链查找（运行时按词法环境链接进行）。</li></ul><h2 id="文章结构" tabindex="-1">文章结构 <a class="header-anchor" href="#文章结构" aria-label="Permalink to “文章结构”">​</a></h2><ol><li>开篇用一个闭包计数器示例展示四个概念如何协作，并给出关系总览。</li><li>解释执行上下文：全局、函数与模块上下文；说明函数调用时创建上下文，并以“准备阶段/执行阶段”帮助理解变量与函数声明的可用性。避免将该简化模型误称为完整规范流程。</li><li>解释词法作用域：作用域由函数声明位置决定，不由调用位置决定；使用同一函数在不同调用位置运行的反例说明。</li><li>解释作用域链：标识符从当前词法环境开始逐级向外解析，直到全局环境；强调查找的是定义处关联的外层环境。</li><li>解释闭包：函数连同其可访问的外层词法环境；展示计数器私有状态、多个闭包实例相互独立，以及闭包不等同于“内层函数”。</li><li>给出常见陷阱与实践：<code>var</code> 循环回调、<code>let</code> 的块级绑定、避免不必要地长期持有大型对象、模块封装的应用。</li><li>以概念关系图（文本形式）、速查表和练习题收束，帮助读者复盘。</li></ol><h2 id="文章文件与边界" tabindex="-1">文章文件与边界 <a class="header-anchor" href="#文章文件与边界" aria-label="Permalink to “文章文件与边界”">​</a></h2><ul><li>新建：<code>docs/javascripts/execution-context-scope-closure.md</code></li><li>文章只新增 Markdown 内容，不修改站点配置、首页导航或其他现有文章。</li><li>使用 VitePress 支持的标准 Markdown、JavaScript 代码块和内置容器，不引入外部依赖。</li></ul><h2 id="验证" tabindex="-1">验证 <a class="header-anchor" href="#验证" aria-label="Permalink to “验证”">​</a></h2><ul><li>检查 Markdown 标题层级、代码块语言标识与内部锚点目录是否正确。</li><li>运行 <code>npm run docs:build</code>，确认 VitePress 可成功构建站点。</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("superpowers/specs/2026-11-18-javascript-execution-context-design.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _2026_11_18_javascript_execution_context_design_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export { __pageData, _2026_11_18_javascript_execution_context_design_default as default };
