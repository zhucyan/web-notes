import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.DjkACiAr.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
// docs/index.md
var __pageData = JSON.parse("{\"title\":\"\",\"description\":\"\",\"frontmatter\":{\"layout\":\"home\",\"hero\":{\"name\":\"web-notes\",\"text\":\"前端知识聚合\",\"tagline\":\"My great project tagline\",\"actions\":[{\"theme\":\"brand\",\"text\":\"javascript基础\",\"link\":\"/markdown-examples\"}]},\"features\":[{\"title\":\"javascript\",\"details\":\"js、ts的基础知识\"},{\"title\":\"vue\",\"details\":\"vue2、vue3的核心支持\"},{\"title\":\"Vue Router、Pinia、状态管理\",\"details\":\"路由与状态管理\"},{\"title\":\"组件设计\",\"details\":\"组件设计\"},{\"title\":\"webpack/vite 工程化\",\"details\":\"供出啊\"},{\"title\":\"浏览器与性能优化\",\"details\":\"浏览器和性能优化\"},{\"title\":\"微前端多应用架构\",\"details\":\"微前端和多应用架构管理\"},{\"title\":\"网络、安全和部署\",\"details\":\"部署相关\"},{\"title\":\"低代码和动态渲染架构\",\"details\":\"动态生成页面\"}]},\"headers\":[],\"relativePath\":\"index.md\",\"filePath\":\"index.md\"}");
var _sfc_main = { name: "index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var docs_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export { __pageData, docs_default as default };
