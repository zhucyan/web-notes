import { $ as onMounted, A as isRelativeBase, B as createBaseVNode, C as useWindowScroll, Ct as unref, D as isActive, E as inBrowser, Et as toDisplayString, G as createTextVNode, H as createCommentVNode, I as vShow, J as h, K as createVNode, L as withModifiers, M as treatAsHtml, O as isExternal, P as Transition, Q as onBeforeUnmount, R as Fragment, S as useNavigatorLanguage, St as toValue, T as EXTERNAL_URL_RE, Tt as normalizeStyle, U as createElementBlock, V as createBlock, X as mergeProps, Y as inject, Z as nextTick, _t as reactive, at as renderSlot, b as useEventListener, bt as shallowReadonly, ct as useId, d as onContentUpdated, dt as watch, et as onUnmounted, ft as watchEffect, gt as onScopeDispose, ht as withDirectives, it as renderList, j as normalize, k as isObject, l as useRoute, lt as useSlots, m as withBase, mt as withCtx, nt as openBlock, ot as resolveComponent, p as runtimeBase, pt as watchPostEffect, rt as provide, st as resolveDynamicComponent, t as _plugin_vue_export_helper_default, tt as onUpdated, u as useIcon, ut as useTemplateRef, v as useData$1, vt as readonly, w as whenever, wt as normalizeClass, x as useMediaQuery, xt as shallowRef, y as onKeyStroke, yt as ref, z as computed } from "./framework.Dd75qlbc.js";
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/data.js
var useData = useData$1;
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/support/utils.js
function throttleAndDebounce(fn, delay) {
	let timeoutId;
	let called = false;
	return () => {
		if (timeoutId) clearTimeout(timeoutId);
		if (!called) {
			fn();
			(called = true) && window.setTimeout(() => called = false, delay);
		} else timeoutId = window.setTimeout(fn, delay);
	};
}
function ensureStartingSlash(path) {
	return path.startsWith("/") ? path : `/${path}`;
}
function isLinkExternal(href, target, external) {
	if (external !== void 0) return external;
	return !!href && isExternal(href) || target === "_blank";
}
function normalizeLink$1(url) {
	const { pathname, search, hash, protocol } = new URL(url, "http://a.com");
	if (isExternal(url) || url.startsWith("#") || !protocol.startsWith("http") || !treatAsHtml(pathname)) return url;
	const { site } = useData();
	let normalizedPath = pathname.endsWith("/") || pathname.endsWith(".html") ? url : url.replace(/(?:(^\.+)\/)?.*$/, `$1${pathname.replace(/(\.md)?$/, site.value.cleanUrls ? "" : ".html")}${search}${hash}`);
	if (isRelativeBase(site.value.base) && !site.value.cleanUrls) {
		const pathPart = normalizedPath.replace(/[?#].*$/, "");
		if (pathPart.endsWith("/")) normalizedPath = pathPart + "index.html" + normalizedPath.slice(pathPart.length);
	}
	return withBase(normalizedPath);
}
function uniqBy(array, keyFn) {
	const seen = /* @__PURE__ */ new Set();
	return array.filter((item) => {
		const k = keyFn(item);
		return seen.has(k) ? false : seen.add(k);
	});
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/support/sidebar.js
/**
* Get the `Sidebar` from sidebar option. This method will ensure to get correct
* sidebar config from `MultiSideBarConfig` with various path combinations such
* as matching `guide/` and `/guide/`. If no matching config was found, it will
* return empty array.
*/
function getSidebar(_sidebar, path) {
	if (Array.isArray(_sidebar)) return addBase(_sidebar);
	if (_sidebar == null) return [];
	path = ensureStartingSlash(path);
	const dir = Object.keys(_sidebar).sort((a, b) => {
		return b.split("/").length - a.split("/").length;
	}).find((dir) => {
		return path.startsWith(ensureStartingSlash(dir));
	});
	const sidebar = dir ? _sidebar[dir] ?? [] : [];
	return Array.isArray(sidebar) ? addBase(sidebar) : addBase(sidebar.items, sidebar.base);
}
/**
* Get or generate sidebar group from the given sidebar items.
*/
function getSidebarGroups(sidebar) {
	const groups = [];
	let lastGroupIndex = 0;
	for (const item of sidebar) {
		if (item.items) {
			lastGroupIndex = groups.push(item);
			continue;
		}
		let group = groups[lastGroupIndex];
		if (!group) {
			group = { items: [] };
			groups.push(group);
		}
		group.items?.push(item);
	}
	return groups;
}
function getFlatSideBarLinks(sidebar) {
	const links = [];
	function recursivelyExtractLinks(items) {
		for (const item of items) {
			if (item.text && item.link) links.push({
				text: item.text,
				link: item.link,
				docFooterText: item.docFooterText,
				rel: item.rel,
				target: item.target
			});
			if (item.items) recursivelyExtractLinks(item.items);
		}
	}
	recursivelyExtractLinks(sidebar);
	return links;
}
/**
* Check if the given sidebar item contains any active link.
*/
function hasActiveLink(path, hash, items, skipHashCheck = false) {
	if (Array.isArray(items)) return items.some((item) => hasActiveLink(path, hash, item, skipHashCheck));
	if (items.link && isActive(path, hash, items.link, false, skipHashCheck)) return true;
	if (items.items) return hasActiveLink(path, hash, items.items, skipHashCheck);
	return false;
}
function addBase(items, _base) {
	return [...items].map((_item) => {
		const item = { ..._item };
		const base = item.base || _base;
		if (base && item.link && !isExternal(item.link)) item.link = base + item.link.replace(/^\//, base.endsWith("/") ? "" : "/");
		if (item.items) item.items = addBase(item.items, base);
		return item;
	});
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/outline.js
var ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/;
var resolvedHeaders = [];
function resolveTitle(theme) {
	return typeof theme.outline === "object" && !Array.isArray(theme.outline) && theme.outline.label || "On this page";
}
function getHeaders(range) {
	return resolveHeaders([...document.querySelectorAll(".VPDoc h1, .VPDoc h2, .VPDoc h3, .VPDoc h4, .VPDoc h5, .VPDoc h6")].filter((el) => el.id && el.hasChildNodes()).map((el) => {
		const level = Number(el.tagName[1]);
		return {
			element: el,
			title: serializeHeader(el),
			link: "#" + el.id,
			level
		};
	}), range);
}
function serializeHeader(h) {
	let ret = "";
	for (const node of h.childNodes) if (node.nodeType === 1) {
		if (ignoreRE.test(node.className)) continue;
		ret += node.textContent;
	} else if (node.nodeType === 3) ret += node.textContent;
	return ret.trim();
}
function resolveHeaders(headers, range) {
	if (range === false) return [];
	const levelsRange = (typeof range === "object" && !Array.isArray(range) ? range.level : range) || 2;
	const [high, low] = typeof levelsRange === "number" ? [levelsRange, levelsRange] : levelsRange === "deep" ? [2, 6] : levelsRange;
	return buildTree(headers, high, low);
}
function useActiveAnchor(container, marker) {
	const isAsideVisible = useMediaQuery("(min-width: 80rem)");
	const onScroll = throttleAndDebounce(setActiveLink, 100);
	let prevActiveLink = null;
	let ignoreScrollOnce = false;
	onMounted(() => {
		requestAnimationFrame(setActiveLink);
		window.addEventListener("scroll", onScroll);
		container.value?.addEventListener("click", onClick);
	});
	onUpdated(() => {
		activateLink(location.hash);
	});
	onUnmounted(() => {
		window.removeEventListener("scroll", onScroll);
	});
	function onClick(e) {
		if (!isAsideVisible.value) return;
		const hash = e.target instanceof Element ? e.target.closest("a")?.hash : null;
		if (hash) {
			ignoreScrollOnce = true;
			activateLink(hash);
		}
	}
	function setActiveLink() {
		if (!isAsideVisible.value) return;
		if (ignoreScrollOnce) {
			ignoreScrollOnce = false;
			return;
		}
		const scrollY = window.scrollY;
		const innerHeight = window.innerHeight;
		const offsetHeight = document.body.offsetHeight;
		const isBottom = scrollY + innerHeight - offsetHeight >= 0;
		const headers = resolvedHeaders.map(({ element, link }) => ({
			link,
			top: getAbsoluteTop(element),
			scrollMarginTop: Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0
		})).filter(({ top }) => !Number.isNaN(top)).sort((a, b) => a.top - b.top);
		if (!headers.length) {
			activateLink(null);
			return;
		}
		if (scrollY < 1) {
			activateLink(null);
			return;
		}
		if (isBottom) {
			activateLink(headers.at(-1)?.link ?? null);
			return;
		}
		let activeLink = null;
		for (const { link, top, scrollMarginTop } of headers) {
			if (top > scrollY + scrollMarginTop + 4) break;
			activeLink = link;
		}
		activateLink(activeLink);
	}
	function activateLink(hash) {
		const activeLink = hash != null ? container.value?.querySelector(`a[href$="${decodeURIComponent(hash)}"]`) ?? null : null;
		if (activeLink === prevActiveLink) return;
		prevActiveLink?.classList.remove("active");
		prevActiveLink = activeLink;
		if (activeLink) {
			activeLink.classList.add("active");
			if (marker.value) {
				marker.value.style.top = activeLink.offsetTop + (activeLink.offsetParent?.offsetTop ?? 0) + (activeLink.offsetHeight - marker.value.offsetHeight) / 2 + "px";
				marker.value.style.opacity = "1";
			}
			activeLink.scrollIntoView({
				block: "nearest",
				behavior: "smooth"
			});
		} else if (marker.value) {
			marker.value.style.top = "";
			marker.value.style.opacity = "0";
		}
	}
}
function getAbsoluteTop(element) {
	let offsetTop = 0;
	while (element !== document.body) {
		if (element === null) return NaN;
		offsetTop += element.offsetTop;
		element = element.offsetParent;
	}
	return offsetTop;
}
function buildTree(data, min, max) {
	resolvedHeaders.length = 0;
	const result = [];
	const stack = [];
	data.forEach((item) => {
		const node = {
			...item,
			children: []
		};
		let parent = stack[stack.length - 1];
		while (parent && parent.level >= node.level) {
			stack.pop();
			parent = stack[stack.length - 1];
		}
		if (node.element.classList.contains("ignore-header") || parent && "shouldIgnore" in parent) {
			stack.push({
				level: node.level,
				shouldIgnore: true
			});
			return;
		}
		if (node.level > max || node.level < min) return;
		resolvedHeaders.push({
			element: node.element,
			link: node.link
		});
		if (parent) parent.children.push(node);
		else result.push(node);
		stack.push(node);
	});
	return result;
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/sidebar.js
var isOpen = ref(false);
/**
* a11y: cache the element that opened the Sidebar (the menu button) then
* focus that button again when Menu is closed with Escape key.
*/
function useCloseSidebarOnEscape(close) {
	let triggerElement;
	watchEffect(() => {
		triggerElement = isOpen.value ? document.activeElement : void 0;
	});
	onMounted(() => {
		window.addEventListener("keyup", onEscape);
	});
	onUnmounted(() => {
		window.removeEventListener("keyup", onEscape);
	});
	function onEscape(e) {
		if (e.key === "Escape" && isOpen.value) {
			close();
			triggerElement?.focus();
		}
	}
}
function useSidebarControl() {
	function open() {
		isOpen.value = true;
	}
	function close() {
		isOpen.value = false;
	}
	function toggle() {
		isOpen.value ? close() : open();
	}
	return {
		isOpen,
		open,
		close,
		toggle
	};
}
function useSidebarItemControl(item) {
	const route = useRoute();
	const collapsed = ref(false);
	const collapsible = computed(() => {
		return item.value.collapsed != null;
	});
	const isLink = computed(() => {
		return !!item.value.link;
	});
	const isActiveLink = ref(false);
	const hasActiveLink$1 = ref(false);
	function updateActiveLink(skipHashCheck = false) {
		if (item.value.link) isActiveLink.value = isActive(route.data.relativePath, route.hash, item.value.link, false, skipHashCheck);
		else isActiveLink.value = false;
		if (isActiveLink.value) {
			hasActiveLink$1.value = true;
			nextTick(() => collapsed.value = false);
			return;
		}
		if (!item.value.items) {
			hasActiveLink$1.value = false;
			return;
		}
		hasActiveLink$1.value = hasActiveLink(route.data.relativePath, route.hash, item.value.items, skipHashCheck);
		if (hasActiveLink$1.value) nextTick(() => collapsed.value = false);
	}
	updateActiveLink(true);
	watch([item, route], () => updateActiveLink());
	onMounted(() => updateActiveLink());
	const isCurrentLink = computed(() => {
		return item.value.link ? isActive(route.data.relativePath, route.hash, item.value.link) : false;
	});
	const hasChildren = computed(() => {
		return !!(item.value.items && item.value.items.length);
	});
	watchEffect(() => {
		collapsed.value = !!(collapsible.value && item.value.collapsed);
	});
	function toggle() {
		if (collapsible.value) collapsed.value = !collapsed.value;
	}
	return {
		collapsed,
		collapsible,
		isLink,
		isActiveLink,
		isCurrentLink,
		hasActiveLink: hasActiveLink$1,
		hasChildren,
		toggle
	};
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/layout.js
var headers = shallowRef([]);
var sidebar = shallowRef([]);
var isDesktop = useMediaQuery("(min-width: 60rem)");
function useLayout() {
	const { frontmatter, theme } = useData();
	const isHome = computed(() => {
		return !!(frontmatter.value.isHome ?? frontmatter.value.layout === "home");
	});
	const hasSidebar = computed(() => {
		return frontmatter.value.sidebar !== false && sidebar.value.length > 0 && !isHome.value;
	});
	const isSidebarEnabled = computed(() => hasSidebar.value && isDesktop.value);
	const sidebarGroups = computed(() => {
		return hasSidebar.value ? getSidebarGroups(sidebar.value) : [];
	});
	const hasAside = computed(() => {
		if (isHome.value) return false;
		if (frontmatter.value.aside != null) return !!frontmatter.value.aside;
		return theme.value.aside !== false;
	});
	const leftAside = computed(() => {
		if (!hasAside.value) return false;
		return frontmatter.value.aside == null ? theme.value.aside === "left" : frontmatter.value.aside === "left";
	});
	const hasLocalNav = computed(() => {
		return headers.value.length > 0;
	});
	return {
		isHome,
		sidebar: shallowReadonly(sidebar),
		sidebarGroups,
		hasSidebar,
		isSidebarEnabled,
		hasAside,
		leftAside,
		headers: shallowReadonly(headers),
		hasLocalNav
	};
}
function registerWatchers({ closeSidebar }) {
	const { theme, page, frontmatter } = useData();
	watch(() => [page.value.relativePath, theme.value.sidebar], ([relativePath, sidebarConfig]) => {
		const newSidebar = sidebarConfig ? getSidebar(sidebarConfig, relativePath) : [];
		if (JSON.stringify(newSidebar) !== JSON.stringify(sidebar.value)) sidebar.value = newSidebar;
	}, {
		immediate: true,
		deep: true,
		flush: "sync"
	});
	onContentUpdated(() => {
		headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline);
	});
	const route = useRoute();
	watch(() => route.path, closeSidebar);
	watch(isDesktop, closeSidebar);
	useCloseSidebarOnEscape(closeSidebar);
}
var layoutInfoInjectionKey = Symbol("layout-info");
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue
var _sfc_main$53 = {
	__name: "VPBadge",
	props: {
		text: {
			type: String,
			required: false
		},
		type: {
			type: String,
			required: false,
			default: "tip"
		}
	},
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("span", {
				class: normalizeClass(["VPBadge", __props.type]),
				dir: "auto"
			}, [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(__props.text), 1)])], 2);
		};
	}
};
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue
var _hoisted_1$42 = {
	key: 0,
	class: "VPBackdrop"
};
var VPBackdrop_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPBackdrop",
	props: { show: {
		type: Boolean,
		required: true
	} },
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Transition, { name: "fade" }, {
				default: withCtx(() => [__props.show ? (openBlock(), createElementBlock("div", _hoisted_1$42)) : createCommentVNode("", true)]),
				_: 1
			});
		};
	}
}, [["__scopeId", "data-v-d8d7b8e0"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/langs.js
function useLangs({ linkToCorrespondingPage = false } = {}) {
	const data = useData();
	const route = useRoute();
	const { site, localeIndex } = data;
	const currentLang = computed(() => ({
		label: site.value.locales[localeIndex.value]?.label,
		link: site.value.locales[localeIndex.value]?.link || (localeIndex.value === "root" ? "/" : `/${localeIndex.value}/`)
	}));
	return {
		currentLang,
		localeLinks: computed(() => Object.entries(site.value.locales).flatMap(([key, value]) => currentLang.value.label === value.label ? [] : {
			text: value.label,
			link: resolveLocaleLink(data, route, {
				targetLocale: key,
				targetLocaleLink: value.link || (key === "root" ? "/" : `/${key}/`),
				currentLocaleLink: currentLang.value.link,
				linkToCorrespondingPage
			}),
			lang: value.lang,
			dir: value.dir
		}))
	};
}
/**
* Resolves the link used for switching from the current page to
* `targetLocale`. Without `linkToCorrespondingPage`, this is simply the home
* of the target locale. With it, the current page's path is rewritten into
* the target locale (honoring `cleanUrls`) — unless
* `themeConfig.i18nRouting` is `false` (the locale home is used instead) or
* a function (which then fully controls the resolution).
*
* The current query and hash are carried over, except when a custom
* `i18nRouting` function is used.
*/
function resolveLocaleLink(data, route, { targetLocale, targetLocaleLink, currentLocaleLink, linkToCorrespondingPage }) {
	const { site, theme } = data;
	const i18nRouting = theme.value.i18nRouting;
	if (linkToCorrespondingPage && typeof i18nRouting === "function") return i18nRouting(data, route, targetLocale);
	return normalizeLink(targetLocaleLink, i18nRouting !== false && linkToCorrespondingPage, route.data.relativePath.slice(currentLocaleLink.length - 1), !site.value.cleanUrls) + route.query + route.hash;
}
function normalizeLink(localeLink, appendPagePath, pagePath, addHtmlExt) {
	return appendPagePath ? localeLink.replace(/\/$/, "") + ensureStartingSlash(pagePath.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, addHtmlExt ? ".html" : "")) : localeLink;
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/NotFound.vue
var _hoisted_1$41 = { class: "NotFound" };
var _hoisted_2$23 = { class: "code" };
var _hoisted_3$16 = { class: "title" };
var _hoisted_4$12 = { class: "quote" };
var _hoisted_5$9 = { class: "action" };
var _hoisted_6$5 = ["href", "aria-label"];
var NotFound_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "NotFound",
	setup(__props) {
		const { theme } = useData();
		const { currentLang } = useLangs();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$41, [
				createBaseVNode("p", _hoisted_2$23, toDisplayString(unref(theme).notFound?.code ?? "404"), 1),
				createBaseVNode("h1", _hoisted_3$16, [createBaseVNode("bdi", null, toDisplayString(unref(theme).notFound?.title ?? "PAGE NOT FOUND"), 1)]),
				_cache[0] || (_cache[0] = createBaseVNode("div", { class: "divider" }, null, -1)),
				createBaseVNode("blockquote", _hoisted_4$12, [createBaseVNode("bdi", null, toDisplayString(unref(theme).notFound?.quote ?? "But if you don't change your direction, and if you keep looking, you may end up where you are heading."), 1)]),
				createBaseVNode("div", _hoisted_5$9, [createBaseVNode("a", {
					class: "link",
					href: unref(withBase)(unref(theme).notFound?.link ?? unref(currentLang).link),
					"aria-label": unref(theme).notFound?.linkLabel ?? "go to home"
				}, [createBaseVNode("bdi", null, toDisplayString(unref(theme).notFound?.linkText ?? "Take me home"), 1)], 8, _hoisted_6$5)])
			]);
		};
	}
}, [["__scopeId", "data-v-7de88340"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue
var _hoisted_1$40 = { class: "VPDocAsideCarbonAds" };
var _sfc_main$50 = {
	__name: "VPDocAsideCarbonAds",
	props: { carbonAds: {
		type: Object,
		required: true
	} },
	setup(__props) {
		const VPCarbonAds = () => null;
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$40, [createVNode(unref(VPCarbonAds), { "carbon-ads": __props.carbonAds }, null, 8, ["carbon-ads"])]);
		};
	}
};
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue
var _hoisted_1$39 = ["href", "title"];
var VPDocOutlineItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPDocOutlineItem",
	props: {
		headers: {
			type: Array,
			required: true
		},
		root: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		return (_ctx, _cache) => {
			const _component_VPDocOutlineItem = resolveComponent("VPDocOutlineItem", true);
			return openBlock(), createElementBlock("ul", { class: normalizeClass(["VPDocOutlineItem", __props.root ? "root" : "nested"]) }, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.headers, ({ children, link, title }) => {
				return openBlock(), createElementBlock("li", null, [createBaseVNode("a", {
					class: "outline-link",
					href: link,
					title
				}, [createBaseVNode("bdi", null, toDisplayString(title), 1)], 8, _hoisted_1$39), children?.length ? (openBlock(), createBlock(_component_VPDocOutlineItem, {
					key: 0,
					headers: children
				}, null, 8, ["headers"])) : createCommentVNode("", true)]);
			}), 256))], 2);
		};
	}
}, [["__scopeId", "data-v-a4c30b85"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue
var _hoisted_1$38 = { class: "content" };
var _hoisted_2$22 = {
	"aria-level": "2",
	class: "outline-title",
	id: "doc-outline-aria-label",
	role: "heading"
};
var VPDocAsideOutline_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPDocAsideOutline",
	setup(__props) {
		const { theme } = useData();
		const container = useTemplateRef("container");
		const marker = useTemplateRef("marker");
		const { headers, hasLocalNav } = useLayout();
		useActiveAnchor(container, marker);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("nav", {
				"aria-labelledby": "doc-outline-aria-label",
				class: normalizeClass(["VPDocAsideOutline", { "has-outline": unref(hasLocalNav) }]),
				ref_key: "container",
				ref: container
			}, [createBaseVNode("div", _hoisted_1$38, [
				createBaseVNode("div", {
					class: "outline-marker",
					ref_key: "marker",
					ref: marker
				}, null, 512),
				createBaseVNode("div", _hoisted_2$22, toDisplayString(unref(resolveTitle)(unref(theme))), 1),
				createVNode(VPDocOutlineItem_default, {
					headers: unref(headers),
					root: true
				}, null, 8, ["headers"])
			])], 2);
		};
	}
}, [["__scopeId", "data-v-b24eb636"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue
var _hoisted_1$37 = { class: "VPDocAside" };
var VPDocAside_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPDocAside",
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$37, [
				renderSlot(_ctx.$slots, "aside-top", {}, void 0, true),
				renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true),
				createVNode(VPDocAsideOutline_default),
				renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true),
				_cache[0] || (_cache[0] = createBaseVNode("div", { class: "spacer" }, null, -1)),
				renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true),
				unref(theme).carbonAds ? (openBlock(), createBlock(_sfc_main$50, {
					key: 0,
					"carbon-ads": unref(theme).carbonAds
				}, null, 8, ["carbon-ads"])) : createCommentVNode("", true),
				renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true),
				renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)
			]);
		};
	}
}, [["__scopeId", "data-v-425786ba"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/edit-link.js
function useEditLink() {
	const { theme, page } = useData();
	return computed(() => {
		const { text = "Edit this page", pattern = "" } = theme.value.editLink || {};
		let url;
		if (typeof pattern === "function") url = pattern(page.value);
		else url = pattern.replace(/:path/g, page.value.filePath);
		return {
			url,
			text
		};
	});
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/prev-next.js
function usePrevNext() {
	const { theme, page, frontmatter } = useData();
	return computed(() => {
		const candidates = uniqBy(getFlatSideBarLinks(getSidebar(theme.value.sidebar, page.value.relativePath)), (link) => normalize(link.link));
		const index = candidates.findIndex((link) => {
			return isActive(page.value.relativePath, "", link.link, false, true);
		});
		const hidePrev = theme.value.docFooter?.prev === false && !frontmatter.value.prev || frontmatter.value.prev === false;
		const hideNext = theme.value.docFooter?.next === false && !frontmatter.value.next || frontmatter.value.next === false;
		return {
			prev: hidePrev ? void 0 : {
				text: (typeof frontmatter.value.prev === "string" ? frontmatter.value.prev : typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.text : void 0) ?? candidates[index - 1]?.docFooterText ?? candidates[index - 1]?.text,
				link: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.link : void 0) ?? candidates[index - 1]?.link,
				target: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.target : void 0) ?? candidates[index - 1]?.target,
				rel: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.rel : void 0) ?? candidates[index - 1]?.rel
			},
			next: hideNext ? void 0 : {
				text: (typeof frontmatter.value.next === "string" ? frontmatter.value.next : typeof frontmatter.value.next === "object" ? frontmatter.value.next.text : void 0) ?? candidates[index + 1]?.docFooterText ?? candidates[index + 1]?.text,
				link: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.link : void 0) ?? candidates[index + 1]?.link,
				target: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.target : void 0) ?? candidates[index + 1]?.target,
				rel: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.rel : void 0) ?? candidates[index + 1]?.rel
			}
		};
	});
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue
var _hoisted_1$36 = { class: "VPLastUpdated" };
var _hoisted_2$21 = ["datetime"];
var VPDocFooterLastUpdated_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPDocFooterLastUpdated",
	setup(__props) {
		const { theme, page, lang: pageLang } = useData();
		const { language: browserLang } = useNavigatorLanguage();
		const timeRef = useTemplateRef("timeRef");
		const date = computed(() => new Date(page.value.lastUpdated));
		const isoDatetime = computed(() => date.value.toISOString());
		const datetime = shallowRef("");
		onMounted(() => {
			watchEffect(() => {
				const lang = theme.value.lastUpdated?.formatOptions?.forceLocale ? pageLang.value : browserLang.value;
				datetime.value = new Intl.DateTimeFormat(lang, theme.value.lastUpdated?.formatOptions ?? {
					dateStyle: "medium",
					timeStyle: "medium"
				}).format(date.value);
				if (lang && pageLang.value !== lang) timeRef.value?.setAttribute("lang", lang);
				else timeRef.value?.removeAttribute("lang");
			});
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("p", _hoisted_1$36, [createBaseVNode("bdi", null, toDisplayString(unref(theme).lastUpdated?.text || "Last updated") + ":", 1), createBaseVNode("time", {
				ref_key: "timeRef",
				ref: timeRef,
				dir: "auto",
				datetime: isoDatetime.value
			}, toDisplayString(datetime.value), 9, _hoisted_2$21)]);
		};
	}
}, [["__scopeId", "data-v-8fd396ea"]]);
var VPLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPLink",
	props: {
		tag: {
			type: String,
			required: false
		},
		href: {
			type: String,
			required: false
		},
		noIcon: {
			type: Boolean,
			required: false
		},
		external: {
			type: Boolean,
			required: false,
			default: void 0
		},
		target: {
			type: String,
			required: false
		},
		rel: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const tag = computed(() => props.tag ?? (props.href ? "a" : "span"));
		const isExternal = computed(() => isLinkExternal(props.href, props.target, props.external));
		return (_ctx, _cache) => {
			return openBlock(), createBlock(resolveDynamicComponent(tag.value), {
				class: normalizeClass(["VPLink", {
					link: __props.href,
					"vp-external-link-icon": isExternal.value,
					"no-icon": __props.noIcon
				}]),
				href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
				target: __props.target ?? (isExternal.value ? "_blank" : void 0),
				rel: __props.rel ?? (isExternal.value ? "noreferrer" : void 0)
			}, {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default", {}, void 0, true)]),
				_: 3
			}, 8, [
				"class",
				"href",
				"target",
				"rel"
			]);
		};
	}
}, [["__scopeId", "data-v-6e7c3ce8"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue
var _hoisted_1$35 = {
	key: 0,
	class: "VPDocFooter"
};
var _hoisted_2$20 = {
	key: 0,
	class: "edit-info"
};
var _hoisted_3$15 = {
	key: 0,
	class: "edit-link"
};
var _hoisted_4$11 = {
	key: 1,
	class: "last-updated"
};
var _hoisted_5$8 = {
	key: 1,
	class: "prev-next",
	"aria-labelledby": "doc-footer-aria-label"
};
var _hoisted_6$4 = { class: "pager" };
var _hoisted_7$2 = ["innerHTML"];
var _hoisted_8$2 = { class: "title" };
var _hoisted_9$2 = ["innerHTML"];
var _hoisted_10$2 = { class: "pager" };
var _hoisted_11$1 = ["innerHTML"];
var _hoisted_12 = { class: "title" };
var _hoisted_13 = ["innerHTML"];
var VPDocFooter_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPDocFooter",
	setup(__props) {
		const { theme, page, frontmatter } = useData();
		const editLink = useEditLink();
		const control = usePrevNext();
		const hasEditLink = computed(() => theme.value.editLink && frontmatter.value.editLink !== false);
		const hasLastUpdated = computed(() => page.value.lastUpdated);
		const showFooter = computed(() => hasEditLink.value || hasLastUpdated.value || control.value.prev || control.value.next);
		return (_ctx, _cache) => {
			return showFooter.value ? (openBlock(), createElementBlock("footer", _hoisted_1$35, [
				renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true),
				hasEditLink.value || hasLastUpdated.value ? (openBlock(), createElementBlock("div", _hoisted_2$20, [hasEditLink.value ? (openBlock(), createElementBlock("div", _hoisted_3$15, [createVNode(VPLink_default, {
					class: "edit-link-button",
					href: unref(editLink).url,
					"no-icon": true
				}, {
					default: withCtx(() => [_cache[0] || (_cache[0] = createBaseVNode("span", { class: "vpi-square-pen edit-link-icon" }, null, -1)), createTextVNode(" " + toDisplayString(unref(editLink).text), 1)]),
					_: 1
				}, 8, ["href"])])) : createCommentVNode("", true), hasLastUpdated.value ? (openBlock(), createElementBlock("div", _hoisted_4$11, [createVNode(VPDocFooterLastUpdated_default)])) : createCommentVNode("", true)])) : createCommentVNode("", true),
				unref(control).prev?.link || unref(control).next?.link ? (openBlock(), createElementBlock("nav", _hoisted_5$8, [
					_cache[1] || (_cache[1] = createBaseVNode("span", {
						class: "visually-hidden",
						id: "doc-footer-aria-label"
					}, "Pager", -1)),
					createBaseVNode("div", _hoisted_6$4, [unref(control).prev?.link ? (openBlock(), createBlock(VPLink_default, {
						key: 0,
						class: "pager-link prev",
						href: unref(control).prev.link,
						target: unref(control).prev.target,
						rel: unref(control).prev.rel
					}, {
						default: withCtx(() => [createBaseVNode("span", {
							class: "desc",
							innerHTML: unref(theme).docFooter?.prev || "Previous page"
						}, null, 8, _hoisted_7$2), createBaseVNode("span", _hoisted_8$2, [createBaseVNode("bdi", { innerHTML: unref(control).prev.text }, null, 8, _hoisted_9$2)])]),
						_: 1
					}, 8, [
						"href",
						"target",
						"rel"
					])) : createCommentVNode("", true)]),
					createBaseVNode("div", _hoisted_10$2, [unref(control).next?.link ? (openBlock(), createBlock(VPLink_default, {
						key: 0,
						class: "pager-link next",
						href: unref(control).next.link,
						target: unref(control).next.target,
						rel: unref(control).next.rel
					}, {
						default: withCtx(() => [createBaseVNode("span", {
							class: "desc",
							innerHTML: unref(theme).docFooter?.next || "Next page"
						}, null, 8, _hoisted_11$1), createBaseVNode("span", _hoisted_12, [createBaseVNode("bdi", { innerHTML: unref(control).next.text }, null, 8, _hoisted_13)])]),
						_: 1
					}, 8, [
						"href",
						"target",
						"rel"
					])) : createCommentVNode("", true)])
				])) : createCommentVNode("", true)
			])) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-168113a8"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue
var _hoisted_1$34 = { class: "container" };
var _hoisted_2$19 = { class: "aside-container" };
var _hoisted_3$14 = { class: "aside-content" };
var _hoisted_4$10 = { class: "content" };
var _hoisted_5$7 = { class: "content-container" };
var _hoisted_6$3 = { class: "main" };
var VPDoc_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPDoc",
	setup(__props) {
		const { theme, site } = useData();
		const route = useRoute();
		const { hasSidebar, hasAside, leftAside } = useLayout();
		const pageName = computed(() => {
			return (isRelativeBase(site.value.base) ? "/" + route.path.slice(runtimeBase().length) : route.path).replace(/[./]+/g, "_").replace(/_html$/, "");
		});
		return (_ctx, _cache) => {
			const _component_Content = resolveComponent("Content");
			return openBlock(), createElementBlock("div", { class: normalizeClass(["VPDoc", {
				"has-sidebar": unref(hasSidebar),
				"has-aside": unref(hasAside)
			}]) }, [
				renderSlot(_ctx.$slots, "doc-top", {}, void 0, true),
				createBaseVNode("div", _hoisted_1$34, [unref(hasAside) ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: normalizeClass(["aside", { "left-aside": unref(leftAside) }])
				}, [_cache[0] || (_cache[0] = createBaseVNode("div", { class: "aside-curtain" }, null, -1)), createBaseVNode("div", _hoisted_2$19, [createBaseVNode("div", _hoisted_3$14, [createVNode(VPDocAside_default, null, {
					"aside-top": withCtx(() => [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)]),
					"aside-bottom": withCtx(() => [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)]),
					"aside-outline-before": withCtx(() => [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)]),
					"aside-outline-after": withCtx(() => [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)]),
					"aside-ads-before": withCtx(() => [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)]),
					"aside-ads-after": withCtx(() => [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)]),
					_: 3
				})])])], 2)) : createCommentVNode("", true), createBaseVNode("div", _hoisted_4$10, [createBaseVNode("div", _hoisted_5$7, [
					renderSlot(_ctx.$slots, "doc-before", {}, void 0, true),
					createBaseVNode("main", _hoisted_6$3, [createVNode(_component_Content, { class: normalizeClass(["vp-doc", [pageName.value, unref(theme).externalLinkIcon && "external-link-icon-enabled"]]) }, null, 8, ["class"])]),
					createVNode(VPDocFooter_default, null, {
						"doc-footer-before": withCtx(() => [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)]),
						_: 3
					}),
					renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)
				])])]),
				renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)
			], 2);
		};
	}
}, [["__scopeId", "data-v-bcd51d05"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue
var _sfc_main$42 = {};
var _hoisted_1$33 = { class: "VPHomeContent vp-doc container" };
function _sfc_render$3(_ctx, _cache) {
	return openBlock(), createElementBlock("div", _hoisted_1$33, [renderSlot(_ctx.$slots, "default", {}, void 0, true)]);
}
var VPHomeContent_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$42, [["render", _sfc_render$3], ["__scopeId", "data-v-3580f9f4"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPImage.vue
var _hoisted_1$32 = ["src", "alt"];
var VPImage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
	__name: "VPImage",
	props: {
		image: {
			type: [String, Object],
			required: true
		},
		alt: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		return (_ctx, _cache) => {
			const _component_VPImage = resolveComponent("VPImage", true);
			return __props.image ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [typeof __props.image === "string" || "src" in __props.image ? (openBlock(), createElementBlock("img", mergeProps({
				key: 0,
				class: "VPImage"
			}, typeof __props.image === "string" ? _ctx.$attrs : {
				...__props.image,
				..._ctx.$attrs
			}, {
				src: unref(withBase)(typeof __props.image === "string" ? __props.image : __props.image.src),
				alt: __props.alt ?? (typeof __props.image === "string" ? "" : __props.image.alt || "")
			}), null, 16, _hoisted_1$32)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(_component_VPImage, mergeProps({
				class: "dark",
				image: __props.image.dark,
				alt: __props.alt ?? __props.image.alt
			}, _ctx.$attrs), null, 16, ["image", "alt"]), createVNode(_component_VPImage, mergeProps({
				class: "light",
				image: __props.image.light,
				alt: __props.alt ?? __props.image.alt
			}, _ctx.$attrs), null, 16, ["image", "alt"])], 64))], 64)) : createCommentVNode("", true);
		};
	}
}), [["__scopeId", "data-v-baf162a5"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue
var _hoisted_1$31 = { class: "box" };
var _hoisted_2$18 = {
	key: 0,
	class: "icon"
};
var _hoisted_3$13 = ["innerHTML"];
var _hoisted_4$9 = { class: "title" };
var _hoisted_5$6 = ["innerHTML"];
var _hoisted_6$2 = {
	key: 3,
	class: "details"
};
var _hoisted_7$1 = ["innerHTML"];
var _hoisted_8$1 = {
	key: 4,
	class: "details"
};
var _hoisted_9$1 = ["innerHTML"];
var _hoisted_10$1 = {
	key: 5,
	class: "link-text"
};
var _hoisted_11 = { class: "link-text-value" };
var VPFeature_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPFeature",
	props: {
		icon: {
			type: [String, Object],
			required: false
		},
		title: {
			type: String,
			required: true
		},
		details: {
			type: String,
			required: false
		},
		link: {
			type: String,
			required: false
		},
		linkText: {
			type: String,
			required: false
		},
		rel: {
			type: String,
			required: false
		},
		target: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createBlock(VPLink_default, {
				class: "VPFeature",
				href: __props.link,
				rel: __props.rel,
				target: __props.target,
				"no-icon": true,
				tag: __props.link ? "a" : "div"
			}, {
				default: withCtx(() => [createBaseVNode("article", _hoisted_1$31, [
					typeof __props.icon === "object" && __props.icon.wrap ? (openBlock(), createElementBlock("div", _hoisted_2$18, [createVNode(VPImage_default, {
						image: __props.icon,
						alt: __props.icon.alt,
						height: __props.icon.height || 48,
						width: __props.icon.width || 48
					}, null, 8, [
						"image",
						"alt",
						"height",
						"width"
					])])) : typeof __props.icon === "object" ? (openBlock(), createBlock(VPImage_default, {
						key: 1,
						image: __props.icon,
						alt: __props.icon.alt,
						height: __props.icon.height || 48,
						width: __props.icon.width || 48
					}, null, 8, [
						"image",
						"alt",
						"height",
						"width"
					])) : __props.icon ? (openBlock(), createElementBlock("div", {
						key: 2,
						class: "icon",
						innerHTML: __props.icon
					}, null, 8, _hoisted_3$13)) : createCommentVNode("", true),
					createBaseVNode("h2", _hoisted_4$9, [createBaseVNode("bdi", { innerHTML: __props.title }, null, 8, _hoisted_5$6)]),
					Array.isArray(__props.details) ? (openBlock(), createElementBlock("ul", _hoisted_6$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.details, (item) => {
						return openBlock(), createElementBlock("li", { key: item }, [createBaseVNode("bdi", { innerHTML: item }, null, 8, _hoisted_7$1)]);
					}), 128))])) : __props.details ? (openBlock(), createElementBlock("p", _hoisted_8$1, [createBaseVNode("bdi", { innerHTML: __props.details }, null, 8, _hoisted_9$1)])) : createCommentVNode("", true),
					__props.linkText ? (openBlock(), createElementBlock("div", _hoisted_10$1, [createBaseVNode("p", _hoisted_11, [
						createBaseVNode("bdi", null, toDisplayString(__props.linkText), 1),
						_cache[0] || (_cache[0] = createTextVNode()),
						_cache[1] || (_cache[1] = createBaseVNode("span", { class: "vpi-arrow-right link-text-icon" }, null, -1))
					])])) : createCommentVNode("", true)
				])]),
				_: 1
			}, 8, [
				"href",
				"rel",
				"target",
				"tag"
			]);
		};
	}
}, [["__scopeId", "data-v-4e150f2b"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue
var _hoisted_1$30 = {
	key: 0,
	class: "VPFeatures"
};
var _hoisted_2$17 = { class: "container" };
var _hoisted_3$12 = { class: "items" };
var VPFeatures_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPFeatures",
	props: { features: {
		type: Array,
		required: true
	} },
	setup(__props) {
		const props = __props;
		const grid = computed(() => {
			const length = props.features.length;
			if (!length) return;
			else if (length === 2) return "grid-2";
			else if (length === 3) return "grid-3";
			else if (length % 3 === 0) return "grid-6";
			else if (length > 3) return "grid-4";
		});
		return (_ctx, _cache) => {
			return __props.features ? (openBlock(), createElementBlock("div", _hoisted_1$30, [createBaseVNode("div", _hoisted_2$17, [createBaseVNode("ul", _hoisted_3$12, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.features, (feature) => {
				return openBlock(), createElementBlock("li", {
					key: feature.title,
					class: normalizeClass(["item", [grid.value]])
				}, [createVNode(VPFeature_default, {
					icon: feature.icon,
					title: feature.title,
					details: feature.details,
					link: feature.link,
					"link-text": feature.linkText,
					rel: feature.rel,
					target: feature.target
				}, null, 8, [
					"icon",
					"title",
					"details",
					"link",
					"link-text",
					"rel",
					"target"
				])], 2);
			}), 128))])])])) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-683421c7"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue
var _sfc_main$38 = {
	__name: "VPHomeFeatures",
	setup(__props) {
		const { frontmatter: fm } = useData();
		return (_ctx, _cache) => {
			return unref(fm).features ? (openBlock(), createBlock(VPFeatures_default, {
				key: 0,
				class: "VPHomeFeatures",
				features: unref(fm).features
			}, null, 8, ["features"])) : createCommentVNode("", true);
		};
	}
};
var VPButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPButton",
	props: {
		tag: {
			type: String,
			required: false
		},
		size: {
			type: String,
			required: false,
			default: "medium"
		},
		theme: {
			type: String,
			required: false,
			default: "brand"
		},
		text: {
			type: String,
			required: false
		},
		href: {
			type: String,
			required: false
		},
		target: {
			type: String,
			required: false
		},
		rel: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const isExternal = computed(() => props.href && EXTERNAL_URL_RE.test(props.href));
		const component = computed(() => {
			return props.tag || (props.href ? "a" : "button");
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(resolveDynamicComponent(component.value), {
				class: normalizeClass(["VPButton no-icon", [__props.size, __props.theme]]),
				href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
				target: props.target ?? (isExternal.value ? "_blank" : void 0),
				rel: props.rel ?? (isExternal.value ? "noreferrer" : void 0)
			}, {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(__props.text), 1)], true)]),
				_: 3
			}, 8, [
				"class",
				"href",
				"target",
				"rel"
			]);
		};
	}
}, [["__scopeId", "data-v-5a8c6e63"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPHero.vue
var _hoisted_1$29 = { class: "container" };
var _hoisted_2$16 = { class: "main" };
var _hoisted_3$11 = { class: "heading" };
var _hoisted_4$8 = ["innerHTML"];
var _hoisted_5$5 = ["innerHTML"];
var _hoisted_6$1 = {
	key: 0,
	class: "tagline"
};
var _hoisted_7 = ["innerHTML"];
var _hoisted_8 = {
	key: 0,
	class: "actions"
};
var _hoisted_9 = {
	key: 0,
	class: "image"
};
var _hoisted_10 = { class: "image-container" };
var VPHero_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPHero",
	props: {
		name: {
			type: String,
			required: false
		},
		text: {
			type: String,
			required: false
		},
		tagline: {
			type: String,
			required: false
		},
		image: {
			type: [String, Object],
			required: false
		},
		actions: {
			type: Array,
			required: false
		}
	},
	setup(__props) {
		const { heroImageSlotExists } = inject(layoutInfoInjectionKey, { heroImageSlotExists: computed(() => false) });
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["VPHero", { "has-image": __props.image || unref(heroImageSlotExists) }]) }, [createBaseVNode("div", _hoisted_1$29, [createBaseVNode("div", _hoisted_2$16, [
				renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true),
				renderSlot(_ctx.$slots, "home-hero-info", {}, () => [createBaseVNode("h1", _hoisted_3$11, [__props.name ? (openBlock(), createElementBlock("span", {
					key: 0,
					dir: "auto",
					innerHTML: __props.name,
					class: "name clip"
				}, null, 8, _hoisted_4$8)) : createCommentVNode("", true), __props.text ? (openBlock(), createElementBlock("span", {
					key: 1,
					dir: "auto",
					innerHTML: __props.text,
					class: "text"
				}, null, 8, _hoisted_5$5)) : createCommentVNode("", true)]), __props.tagline ? (openBlock(), createElementBlock("p", _hoisted_6$1, [createBaseVNode("bdi", { innerHTML: __props.tagline }, null, 8, _hoisted_7)])) : createCommentVNode("", true)], true),
				renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true),
				__props.actions ? (openBlock(), createElementBlock("div", _hoisted_8, [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true), (openBlock(true), createElementBlock(Fragment, null, renderList(__props.actions, (action) => {
					return openBlock(), createElementBlock("div", {
						key: action.link,
						class: "action"
					}, [createVNode(VPButton_default, {
						tag: "a",
						size: "medium",
						theme: action.theme,
						text: action.text,
						href: action.link,
						target: action.target,
						rel: action.rel
					}, null, 8, [
						"theme",
						"text",
						"href",
						"target",
						"rel"
					])]);
				}), 128))])) : createCommentVNode("", true),
				renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)
			]), __props.image || unref(heroImageSlotExists) ? (openBlock(), createElementBlock("div", _hoisted_9, [createBaseVNode("div", _hoisted_10, [_cache[0] || (_cache[0] = createBaseVNode("div", { class: "image-bg" }, null, -1)), renderSlot(_ctx.$slots, "home-hero-image", {}, () => [__props.image ? (openBlock(), createBlock(VPImage_default, {
				key: 0,
				class: "image-src",
				image: __props.image
			}, null, 8, ["image"])) : createCommentVNode("", true)], true)])])) : createCommentVNode("", true)])], 2);
		};
	}
}, [["__scopeId", "data-v-b4540944"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue
var _sfc_main$35 = {
	__name: "VPHomeHero",
	setup(__props) {
		const { frontmatter: fm } = useData();
		return (_ctx, _cache) => {
			return unref(fm).hero ? (openBlock(), createBlock(VPHero_default, {
				key: 0,
				class: "VPHomeHero",
				name: unref(fm).hero.name,
				text: unref(fm).hero.text,
				tagline: unref(fm).hero.tagline,
				image: unref(fm).hero.image,
				actions: unref(fm).hero.actions
			}, {
				"home-hero-info-before": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info-before")]),
				"home-hero-info": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info")]),
				"home-hero-info-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info-after")]),
				"home-hero-actions-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-actions-after")]),
				"home-hero-actions-before-actions": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-actions-before-actions")]),
				"home-hero-image": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-image")]),
				_: 3
			}, 8, [
				"name",
				"text",
				"tagline",
				"image",
				"actions"
			])) : createCommentVNode("", true);
		};
	}
};
var VPHome_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPHome",
	setup(__props) {
		const { frontmatter, theme } = useData();
		return (_ctx, _cache) => {
			const _component_Content = resolveComponent("Content");
			return openBlock(), createElementBlock("div", { class: normalizeClass(["VPHome", { "external-link-icon-enabled": unref(theme).externalLinkIcon }]) }, [
				renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true),
				createVNode(_sfc_main$35, null, {
					"home-hero-info-before": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)]),
					"home-hero-info": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)]),
					"home-hero-info-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)]),
					"home-hero-actions-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)]),
					"home-hero-actions-before-actions": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)]),
					"home-hero-image": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)]),
					_: 3
				}),
				renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true),
				renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true),
				createVNode(_sfc_main$38),
				renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true),
				unref(frontmatter).markdownStyles !== false ? (openBlock(), createBlock(VPHomeContent_default, { key: 0 }, {
					default: withCtx(() => [createVNode(_component_Content)]),
					_: 1
				})) : (openBlock(), createBlock(_component_Content, { key: 1 }))
			], 2);
		};
	}
}, [["__scopeId", "data-v-2ee5fb77"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPPage.vue
var _sfc_main$33 = {};
var _hoisted_1$28 = { class: "VPPage" };
function _sfc_render$2(_ctx, _cache) {
	const _component_Content = resolveComponent("Content");
	return openBlock(), createElementBlock("div", _hoisted_1$28, [
		renderSlot(_ctx.$slots, "page-top"),
		createVNode(_component_Content),
		renderSlot(_ctx.$slots, "page-bottom")
	]);
}
var VPPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$33, [["render", _sfc_render$2]]);
var VPContent_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPContent",
	setup(__props) {
		const { page, frontmatter } = useData();
		const { isHome, hasSidebar } = useLayout();
		function isRegistered(component) {
			return typeof resolveDynamicComponent(component) !== "string";
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				class: normalizeClass(["VPContent", {
					"has-sidebar": unref(hasSidebar),
					"is-home": unref(isHome)
				}]),
				id: "VPContent"
			}, [unref(page).isNotFound ? renderSlot(_ctx.$slots, "not-found", {}, () => [createVNode(NotFound_default)], true, 0) : unref(frontmatter).layout === "page" && !isRegistered("page") ? (openBlock(), createBlock(VPPage_default, { key: 1 }, {
				"page-top": withCtx(() => [renderSlot(_ctx.$slots, "page-top", {}, void 0, true)]),
				"page-bottom": withCtx(() => [renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)]),
				_: 3
			})) : unref(frontmatter).layout === "home" && !isRegistered("home") ? (openBlock(), createBlock(VPHome_default, { key: 2 }, {
				"home-hero-before": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)]),
				"home-hero-info-before": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)]),
				"home-hero-info": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)]),
				"home-hero-info-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)]),
				"home-hero-actions-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)]),
				"home-hero-actions-before-actions": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)]),
				"home-hero-image": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)]),
				"home-hero-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)]),
				"home-features-before": withCtx(() => [renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)]),
				"home-features-after": withCtx(() => [renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)]),
				_: 3
			})) : (!unref(frontmatter).layout || unref(frontmatter).layout === "doc") && !isRegistered("doc") ? (openBlock(), createBlock(VPDoc_default, { key: 3 }, {
				"doc-top": withCtx(() => [renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)]),
				"doc-bottom": withCtx(() => [renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)]),
				"doc-footer-before": withCtx(() => [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)]),
				"doc-before": withCtx(() => [renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)]),
				"doc-after": withCtx(() => [renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)]),
				"aside-top": withCtx(() => [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)]),
				"aside-outline-before": withCtx(() => [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)]),
				"aside-outline-after": withCtx(() => [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)]),
				"aside-ads-before": withCtx(() => [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)]),
				"aside-ads-after": withCtx(() => [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)]),
				"aside-bottom": withCtx(() => [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)]),
				_: 3
			})) : (openBlock(), createBlock(resolveDynamicComponent(unref(frontmatter).layout || "doc"), { key: 4 }))], 2);
		};
	}
}, [["__scopeId", "data-v-2b8d4b3a"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue
var _hoisted_1$27 = { class: "container" };
var _hoisted_2$15 = {
	key: 0,
	class: "message"
};
var _hoisted_3$10 = ["innerHTML"];
var _hoisted_4$7 = {
	key: 1,
	class: "copyright"
};
var _hoisted_5$4 = ["innerHTML"];
var VPFooter_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPFooter",
	setup(__props) {
		const { theme, frontmatter } = useData();
		const { hasSidebar } = useLayout();
		return (_ctx, _cache) => {
			return unref(theme).footer && unref(frontmatter).footer !== false ? (openBlock(), createElementBlock("footer", {
				key: 0,
				class: normalizeClass(["VPFooter", { "has-sidebar": unref(hasSidebar) }])
			}, [createBaseVNode("div", _hoisted_1$27, [unref(theme).footer.message ? (openBlock(), createElementBlock("p", _hoisted_2$15, [createBaseVNode("bdi", { innerHTML: unref(theme).footer.message }, null, 8, _hoisted_3$10)])) : createCommentVNode("", true), unref(theme).footer.copyright ? (openBlock(), createElementBlock("p", _hoisted_4$7, [createBaseVNode("bdi", { innerHTML: unref(theme).footer.copyright }, null, 8, _hoisted_5$4)])) : createCommentVNode("", true)])], 2)) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-09f23c68"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/scroll-lock.js
var isIOS = inBrowser && (/iP(?:ad|hone|od)/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
var scrollKeys = /* @__PURE__ */ new Set([
	" ",
	"PageUp",
	"PageDown",
	"Home",
	"End",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
var listenerOptions = {
	capture: true,
	passive: false
};
function isScrollable(target) {
	let el = target instanceof Element ? target : null;
	while (el && el !== document.body) {
		const { overflowX, overflowY } = getComputedStyle(el);
		if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight || (overflowX === "auto" || overflowX === "scroll") && el.scrollWidth > el.clientWidth) return true;
		el = el.parentElement;
	}
	return false;
}
function blockScroll(e) {
	if ("touches" in e && e.touches.length > 1) return;
	if (!isScrollable(e.target)) e.preventDefault();
}
function blockScrollKeys(e) {
	if (e.metaKey || e.ctrlKey || e.altKey || !scrollKeys.has(e.key)) return;
	const el = e.target;
	if (el instanceof HTMLElement && (el.isContentEditable || el.matches("input, textarea, select"))) return;
	blockScroll(e);
}
var overflowLockCount = 0;
var eventLockCount = 0;
var initialOverflow;
var initialGutter;
function lockOverflow(reserveGutter) {
	if (++overflowLockCount > 1) return;
	const html = document.documentElement;
	if (reserveGutter && !getComputedStyle(html).scrollbarGutter.includes("stable")) {
		initialGutter = html.style.scrollbarGutter;
		html.style.scrollbarGutter = "stable";
	}
	initialOverflow = document.body.style.overflow;
	document.body.style.overflow = "hidden";
	if (isIOS) document.addEventListener("touchmove", blockScroll, listenerOptions);
}
function unlockOverflow() {
	if (--overflowLockCount > 0) return;
	if (isIOS) document.removeEventListener("touchmove", blockScroll, listenerOptions);
	document.body.style.overflow = initialOverflow ?? "";
	if (initialGutter !== void 0) document.documentElement.style.scrollbarGutter = initialGutter;
	initialOverflow = initialGutter = void 0;
}
function lockEvents() {
	if (++eventLockCount > 1) return;
	document.addEventListener("wheel", blockScroll, listenerOptions);
	document.addEventListener("touchmove", blockScroll, listenerOptions);
	document.addEventListener("keydown", blockScrollKeys, listenerOptions);
}
function unlockEvents() {
	if (--eventLockCount > 0) return;
	document.removeEventListener("wheel", blockScroll, listenerOptions);
	document.removeEventListener("touchmove", blockScroll, listenerOptions);
	document.removeEventListener("keydown", blockScrollKeys, listenerOptions);
}
function useBodyScrollLock() {
	const isLocked = shallowRef(false);
	let useEvents = false;
	function lock() {
		if (isLocked.value) return;
		const scrollbarTakesSpace = window.innerWidth > document.documentElement.clientWidth;
		useEvents = scrollbarTakesSpace && !CSS.supports("scrollbar-gutter", "stable");
		useEvents ? lockEvents() : lockOverflow(scrollbarTakesSpace);
		isLocked.value = true;
	}
	function unlock() {
		if (!isLocked.value) return;
		useEvents ? unlockEvents() : unlockOverflow();
		isLocked.value = false;
	}
	onScopeDispose(unlock);
	return computed({
		get: () => isLocked.value,
		set: (value) => value ? lock() : unlock()
	});
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue
var _hoisted_1$26 = ["aria-expanded", "aria-controls"];
var _hoisted_2$14 = { class: "menu-text" };
var _hoisted_3$9 = ["id"];
var _hoisted_4$6 = { class: "header" };
var _hoisted_5$3 = { class: "outline" };
var VPLocalNavOutlineDropdown_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPLocalNavOutlineDropdown",
	props: {
		headers: {
			type: Array,
			required: true
		},
		navHeight: {
			type: Number,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const open = ref(false);
		const vh = ref(0);
		const main = useTemplateRef("main");
		const items = useTemplateRef("items");
		const itemsId = useId();
		const isLocked = useBodyScrollLock();
		function closeOnClickOutside(e) {
			if (!main.value?.contains(e.target)) open.value = false;
		}
		watch(open, (value) => {
			isLocked.value = value;
			if (value) {
				document.addEventListener("click", closeOnClickOutside);
				return;
			}
			document.removeEventListener("click", closeOnClickOutside);
		});
		onKeyStroke("Escape", () => {
			open.value = false;
		});
		onContentUpdated(() => {
			open.value = false;
		});
		function toggle() {
			open.value = !open.value;
			vh.value = window.innerHeight + Math.min(window.scrollY - props.navHeight, 0);
		}
		function onItemClick(e) {
			if (e.target.classList.contains("outline-link")) {
				if (items.value) items.value.style.transition = "none";
				nextTick(() => {
					open.value = false;
				});
			}
		}
		function scrollToTop() {
			open.value = false;
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: "smooth"
			});
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				ref_key: "main",
				ref: main,
				class: "VPLocalNavOutlineDropdown",
				style: normalizeStyle({ "--vp-vh": vh.value + "px" }),
				"data-allow-mismatch": "style"
			}, [__props.headers.length > 0 ? (openBlock(), createElementBlock("button", {
				key: 0,
				type: "button",
				"aria-expanded": open.value,
				"aria-controls": unref(itemsId),
				class: normalizeClass({ open: open.value }),
				onClick: toggle
			}, [createBaseVNode("span", _hoisted_2$14, toDisplayString(unref(resolveTitle)(unref(theme))), 1), _cache[0] || (_cache[0] = createBaseVNode("span", {
				class: "vpi-chevron-right icon",
				"aria-hidden": "true"
			}, null, -1))], 10, _hoisted_1$26)) : (openBlock(), createElementBlock("button", {
				key: 1,
				type: "button",
				onClick: scrollToTop
			}, toDisplayString(unref(theme).returnToTopLabel || "Return to top"), 1)), createVNode(Transition, { name: "flyout" }, {
				default: withCtx(() => [open.value ? (openBlock(), createElementBlock("div", {
					key: 0,
					ref_key: "items",
					ref: items,
					id: unref(itemsId),
					class: "items",
					onClick: onItemClick
				}, [createBaseVNode("div", _hoisted_4$6, [createBaseVNode("a", {
					class: "top-link",
					href: "#",
					onClick: scrollToTop
				}, toDisplayString(unref(theme).returnToTopLabel || "Return to top"), 1)]), createBaseVNode("div", _hoisted_5$3, [createVNode(VPDocOutlineItem_default, { headers: __props.headers }, null, 8, ["headers"])])], 8, _hoisted_3$9)) : createCommentVNode("", true)]),
				_: 1
			})], 4);
		};
	}
}, [["__scopeId", "data-v-0f7d490f"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue
var _hoisted_1$25 = { class: "container" };
var _hoisted_2$13 = ["aria-expanded"];
var _hoisted_3$8 = { class: "menu-text" };
var VPLocalNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPLocalNav",
	props: { open: {
		type: Boolean,
		required: true
	} },
	emits: ["open-menu"],
	setup(__props) {
		const { theme } = useData();
		const { isHome, hasSidebar, headers, hasLocalNav } = useLayout();
		const { y } = useWindowScroll();
		const navHeight = ref(0);
		onMounted(() => {
			const probe = document.createElement("div");
			probe.style.cssText = "position: absolute; visibility: hidden; height: var(--vp-nav-height)";
			document.body.appendChild(probe);
			navHeight.value = probe.offsetHeight;
			probe.remove();
		});
		const isScrolled = computed(() => y.value >= navHeight.value);
		return (_ctx, _cache) => {
			return !unref(isHome) && (unref(hasLocalNav) || unref(hasSidebar) || isScrolled.value) ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: normalizeClass(["VPLocalNav", {
					"has-sidebar": unref(hasSidebar),
					"empty": !unref(hasLocalNav),
					"fixed": !unref(hasLocalNav) && !unref(hasSidebar)
				}])
			}, [createBaseVNode("div", _hoisted_1$25, [unref(hasSidebar) ? (openBlock(), createElementBlock("button", {
				key: 0,
				type: "button",
				class: "menu",
				"aria-expanded": __props.open,
				"aria-controls": "VPSidebarNav",
				onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("open-menu"))
			}, [_cache[1] || (_cache[1] = createBaseVNode("span", {
				class: "vpi-text-align-start menu-icon",
				"aria-hidden": "true"
			}, null, -1)), createBaseVNode("span", _hoisted_3$8, toDisplayString(unref(theme).sidebarMenuLabel || "Menu"), 1)], 8, _hoisted_2$13)) : createCommentVNode("", true), createVNode(VPLocalNavOutlineDropdown_default, {
				headers: unref(headers),
				navHeight: navHeight.value
			}, null, 8, ["headers", "navHeight"])])], 2)) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-7008a52e"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/nav.js
var isScreenOpen = ref(false);
var screenTriggerEl = shallowRef(null);
function openScreen() {
	isScreenOpen.value = true;
}
function closeScreen() {
	isScreenOpen.value = false;
}
function toggleScreen() {
	isScreenOpen.value ? closeScreen() : openScreen();
}
var watchersRegistered = false;
function useNav() {
	if (inBrowser && !watchersRegistered) {
		watchersRegistered = true;
		const isTablet = useMediaQuery("(min-width: 48rem)");
		whenever(isTablet, closeScreen);
		const route = useRoute();
		watch(() => route.path, closeScreen);
	}
	return {
		isScreenOpen,
		screenTriggerEl,
		openScreen,
		closeScreen,
		toggleScreen
	};
}
function useAppearanceSwitch() {
	const { site } = useData();
	return computed(() => !!site.value.appearance && site.value.appearance !== "force-dark" && site.value.appearance !== "force-auto");
}
function useNavItemLink(item) {
	const route = useRoute();
	const href = computed(() => {
		const { link } = toValue(item);
		return typeof link === "function" ? link(route.data) : link;
	});
	return {
		href,
		isActiveLink: computed(() => {
			const { activeMatch } = toValue(item);
			return isActive(route.data.relativePath, route.hash, activeMatch || href.value, !!activeMatch);
		}),
		isCurrentLink: computed(() => {
			return isActive(route.data.relativePath, route.hash, href.value);
		})
	};
}
var navInjectionKey = Symbol("nav");
var navScreenInjectionKey = Symbol("nav-screen");
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/nav-overflow.js
/**
* Priority+ overflow for the navbar (#1271, #2842).
*
* Collapse order under space pressure: social links → appearance switch →
* translations → menu items right-to-left. Collapsed units move into the
* `⋯` flyout (VPNavBarExtra) instead of being clipped, so nothing ever
* becomes unreachable.
*
* Collapsed units stay mounted but hidden (visibility: hidden + absolute,
* which also removes them from the a11y tree and tab order), so their
* natural widths remain measurable and observed — re-expanding never works
* from stale data.
*/
var navClusterUnits = [
	"translations",
	"appearance",
	"socialLinks"
];
var allVisible = {
	visibleItemCount: Infinity,
	translations: true,
	appearance: true,
	socialLinks: true
};
function computeNavFit(input) {
	const { itemWidths, available, extraWidth } = input;
	const itemsTotal = itemWidths.reduce((sum, w) => sum + w, 0);
	if (itemsTotal + ((input.translations ?? 0) + (input.appearance ?? 0) + (input.socialLinks ?? 0)) <= available) return allVisible;
	const budget = available - extraWidth;
	if (itemsTotal > budget) {
		let used = 0;
		let visibleItemCount = 0;
		for (const width of itemWidths) {
			if (used + width > budget) break;
			used += width;
			visibleItemCount++;
		}
		return {
			visibleItemCount,
			translations: input.translations == null,
			appearance: input.appearance == null,
			socialLinks: input.socialLinks == null
		};
	}
	const result = { ...allVisible };
	let used = itemsTotal;
	let dropRest = false;
	for (const unit of navClusterUnits) {
		const width = input[unit];
		if (width == null) continue;
		if (dropRest || used + width > budget) {
			dropRest = true;
			result[unit] = false;
		} else used += width;
	}
	return result;
}
/** headroom against sub-pixel rounding and the inter-unit dividers */
var SLACK = 24;
/** used until the real `⋯` button has been measured once */
var EXTRA_WIDTH_ESTIMATE = 48;
var navOverflowKey = Symbol("nav-overflow");
function useNavOverflow() {
	return inject(navOverflowKey, null);
}
function provideNavOverflow(options) {
	const state = reactive({ ...allVisible });
	const itemEls = /* @__PURE__ */ new Map();
	const clusterEls = /* @__PURE__ */ new Map();
	let containerEl = null;
	let menuEl = null;
	let extraEl = null;
	let extraWidth = EXTRA_WIDTH_ESTIMATE;
	let observer = null;
	const observed = /* @__PURE__ */ new Set();
	let scheduled = false;
	function observe(el) {
		if (!inBrowser || !(el instanceof Element) || observed.has(el)) return;
		observed.add(el);
		(observer ??= new ResizeObserver(schedule)).observe(el);
	}
	function schedule() {
		if (!inBrowser || scheduled) return;
		scheduled = true;
		requestAnimationFrame(() => {
			scheduled = false;
			recompute();
		});
	}
	const controller = {
		state,
		hasCollapsed: () => state.visibleItemCount !== Infinity || !state.translations || !state.appearance || !state.socialLinks,
		setContainerEl(el) {
			containerEl = el;
			observe(el);
			schedule();
		},
		setMenuEl(el) {
			menuEl = el;
			observe(el);
			schedule();
		},
		setExtraEl(el) {
			extraEl = el;
			observe(el);
			schedule();
		},
		setItemEl(index, el) {
			el ? itemEls.set(index, el) : itemEls.delete(index);
			observe(el);
			schedule();
		},
		setClusterEl(unit, el) {
			el ? clusterEls.set(unit, el) : clusterEls.delete(unit);
			observe(el);
			schedule();
		}
	};
	provide(navOverflowKey, controller);
	if (!inBrowser) return controller;
	const isEngineActive = useMediaQuery("(min-width: 48rem)");
	function measureUnit(el) {
		return Math.max(el.offsetWidth, el.scrollWidth);
	}
	function recompute() {
		if (!isEngineActive.value) return applyResult(allVisible);
		if (!containerEl) return;
		if (extraEl && extraEl.offsetWidth > 0) extraWidth = extraEl.offsetWidth;
		let fixed = 0;
		for (const child of Array.from(containerEl.children)) {
			if (!(child instanceof HTMLElement)) continue;
			if (child === menuEl || child === extraEl) continue;
			let isCluster = false;
			for (const el of clusterEls.values()) if (el === child) {
				isCluster = true;
				break;
			}
			if (isCluster) continue;
			fixed += child.offsetWidth;
		}
		const itemWidths = [];
		for (let i = 0; i < itemEls.size; i++) {
			const el = itemEls.get(i);
			if (!el) return;
			itemWidths.push(measureUnit(el));
		}
		const clusterWidth = (unit) => {
			const el = clusterEls.get(unit);
			return el ? measureUnit(el) : null;
		};
		applyResult(computeNavFit({
			itemWidths,
			translations: clusterWidth("translations"),
			appearance: clusterWidth("appearance"),
			socialLinks: clusterWidth("socialLinks"),
			available: containerEl.clientWidth - fixed - SLACK,
			extraWidth
		}));
	}
	function applyResult(result) {
		if (state.visibleItemCount !== result.visibleItemCount) state.visibleItemCount = result.visibleItemCount;
		for (const unit of navClusterUnits) if (state[unit] !== result[unit]) state[unit] = result[unit];
	}
	watch(isEngineActive, schedule);
	watch(() => toValue(options.itemsKey), schedule);
	if (document.fonts?.ready) document.fonts.ready.then(schedule).catch(() => {});
	onScopeDispose(() => {
		observer?.disconnect();
		observer = null;
		observed.clear();
	});
	return controller;
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPSwitch.vue
var _sfc_main$28 = {};
var _hoisted_1$24 = {
	class: "VPSwitch",
	type: "button",
	role: "switch"
};
var _hoisted_2$12 = { class: "check" };
var _hoisted_3$7 = {
	key: 0,
	class: "icon"
};
function _sfc_render$1(_ctx, _cache) {
	return openBlock(), createElementBlock("button", _hoisted_1$24, [createBaseVNode("span", _hoisted_2$12, [_ctx.$slots.default ? (openBlock(), createElementBlock("span", _hoisted_3$7, [renderSlot(_ctx.$slots, "default", {}, void 0, true)])) : createCommentVNode("", true)])]);
}
var VPSwitch_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$28, [["render", _sfc_render$1], ["__scopeId", "data-v-22b9c20d"]]);
var VPSwitchAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPSwitchAppearance",
	setup(__props) {
		const { isDark, theme } = useData();
		const toggleAppearance = inject("toggle-appearance", () => {
			isDark.value = !isDark.value;
		});
		const switchTitle = ref("");
		watchPostEffect(() => {
			switchTitle.value = isDark.value ? theme.value.lightModeSwitchTitle || "Switch to light theme" : theme.value.darkModeSwitchTitle || "Switch to dark theme";
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(VPSwitch_default, {
				title: switchTitle.value,
				class: "VPSwitchAppearance",
				"aria-label": unref(theme).darkModeSwitchLabel || "Appearance",
				"aria-checked": unref(isDark),
				onClick: unref(toggleAppearance)
			}, {
				default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("span", {
					class: "vpi-sun sun",
					"aria-hidden": "true"
				}, null, -1), createBaseVNode("span", {
					class: "vpi-moon moon",
					"aria-hidden": "true"
				}, null, -1)])]),
				_: 1
			}, 8, [
				"title",
				"aria-label",
				"aria-checked",
				"onClick"
			]);
		};
	}
}, [["__scopeId", "data-v-302c9835"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavAppearance.vue
var _hoisted_1$23 = ["id"];
var VPNavAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavAppearance",
	props: {
		row: {
			type: Boolean,
			required: false
		},
		screen: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const show = useAppearanceSwitch();
		const overflow = props.row ? null : useNavOverflow();
		const isCollapsed = computed(() => !!overflow && !overflow.state.appearance);
		const labelId = useId();
		return (_ctx, _cache) => {
			return unref(show) ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: normalizeClass(["VPNavAppearance", [__props.row ? __props.screen ? "VPNavScreenAppearance" : "menu-appearance" : "VPNavBarAppearance", { collapsed: isCollapsed.value }]]),
				ref: (el) => unref(overflow)?.setClusterEl("appearance", el)
			}, [__props.row ? (openBlock(), createElementBlock("p", {
				key: 0,
				id: unref(labelId),
				class: "text"
			}, toDisplayString(unref(theme).darkModeSwitchLabel || "Appearance"), 9, _hoisted_1$23)) : createCommentVNode("", true), createVNode(VPSwitchAppearance_default, { "aria-labelledby": __props.row ? unref(labelId) : void 0 }, null, 8, ["aria-labelledby"])], 2)) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-3a6de1e6"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/composables/flyout.js
var focusedElement = ref();
var active = false;
var listeners = 0;
function useFlyout(options) {
	const focus = ref(false);
	if (inBrowser) {
		!active && activateFocusTracking();
		listeners++;
		const unwatch = watch(focusedElement, (el) => {
			if (el === options.el.value || options.el.value?.contains(el)) {
				focus.value = true;
				options.onFocus?.();
			} else {
				focus.value = false;
				options.onBlur?.();
			}
		});
		onUnmounted(() => {
			unwatch();
			listeners--;
			if (!listeners) deactivateFocusTracking();
		});
	}
	return readonly(focus);
}
function activateFocusTracking() {
	document.addEventListener("focusin", handleFocusIn);
	active = true;
	focusedElement.value = document.activeElement;
}
function deactivateFocusTracking() {
	document.removeEventListener("focusin", handleFocusIn);
	active = false;
}
function handleFocusIn() {
	focusedElement.value = document.activeElement;
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue
var _hoisted_1$22 = { class: "VPMenuLink" };
var _hoisted_2$11 = ["innerHTML"];
var VPMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
	__name: "VPMenuLink",
	props: {
		item: {
			type: null,
			required: true
		},
		rel: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const { href, isActiveLink, isCurrentLink } = useNavItemLink(() => props.item);
		const screen = inject(navScreenInjectionKey, false);
		const nav = inject(navInjectionKey, null);
		function onClick() {
			if (screen) nav?.closeScreen();
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("li", _hoisted_1$22, [createVNode(VPLink_default, mergeProps(_ctx.$attrs, {
				class: {
					active: unref(isActiveLink),
					VPNavScreenMenuGroupLink: unref(screen)
				},
				"aria-current": unref(isCurrentLink) ? "page" : void 0,
				href: unref(href),
				target: __props.item.target,
				rel: props.rel ?? __props.item.rel,
				"no-icon": __props.item.noIcon,
				onClick
			}), {
				default: withCtx(() => [createBaseVNode("span", {
					dir: "auto",
					innerHTML: __props.item.text
				}, null, 8, _hoisted_2$11)]),
				_: 1
			}, 16, [
				"class",
				"aria-current",
				"href",
				"target",
				"rel",
				"no-icon"
			])]);
		};
	}
}), [["__scopeId", "data-v-22b3ce51"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue
var _hoisted_1$21 = {
	key: 0,
	class: "title"
};
var VPMenuGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPMenuGroup",
	props: {
		text: {
			type: String,
			required: false
		},
		items: {
			type: Array,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const screen = inject(navScreenInjectionKey, false);
		const hasSubGroups = computed(() => props.items.some((item) => !("link" in item) && !("component" in item)));
		return (_ctx, _cache) => {
			const _component_VPMenuGroup = resolveComponent("VPMenuGroup", true);
			return openBlock(), createElementBlock("li", { class: normalizeClass(["VPMenuGroup", { VPNavScreenMenuGroupSection: unref(screen) }]) }, [__props.text ? (openBlock(), createElementBlock("p", _hoisted_1$21, toDisplayString(__props.text), 1)) : createCommentVNode("", true), createBaseVNode("ul", { class: normalizeClass({ "sub-groups": hasSubGroups.value }) }, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.items, (item) => {
				return openBlock(), createElementBlock(Fragment, { key: JSON.stringify(item) }, ["link" in item ? (openBlock(), createBlock(VPMenuLink_default, {
					key: 0,
					item
				}, null, 8, ["item"])) : "component" in item ? (openBlock(), createBlock(resolveDynamicComponent(item.component), mergeProps({
					key: 1,
					ref_for: true
				}, item.props, {
					"screen-menu": unref(screen) || void 0,
					menu: !unref(screen) || void 0
				}), null, 16, ["screen-menu", "menu"])) : (openBlock(), createBlock(_component_VPMenuGroup, {
					key: 2,
					text: item.text,
					items: item.items
				}, null, 8, ["text", "items"]))], 64);
			}), 128))], 2)], 2);
		};
	}
}, [["__scopeId", "data-v-cd0417c8"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue
var _hoisted_1$20 = { class: "VPMenu" };
var _hoisted_2$10 = {
	key: 0,
	class: "items"
};
var VPMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPMenu",
	props: { items: {
		type: Array,
		required: false
	} },
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$20, [__props.items ? (openBlock(), createElementBlock("ul", _hoisted_2$10, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.items, (item) => {
				return openBlock(), createElementBlock(Fragment, { key: JSON.stringify(item) }, ["link" in item ? (openBlock(), createBlock(VPMenuLink_default, {
					key: 0,
					item
				}, null, 8, ["item"])) : "component" in item ? (openBlock(), createBlock(resolveDynamicComponent(item.component), mergeProps({
					key: 1,
					ref_for: true
				}, item.props, { menu: "" }), null, 16)) : (openBlock(), createBlock(VPMenuGroup_default, {
					key: 2,
					text: item.text,
					items: item.items
				}, null, 8, ["text", "items"]))], 64);
			}), 128))])) : createCommentVNode("", true), renderSlot(_ctx.$slots, "default", {}, void 0, true)]);
		};
	}
}, [["__scopeId", "data-v-64d4dfeb"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue
var _hoisted_1$19 = [
	"aria-expanded",
	"aria-controls",
	"aria-label"
];
var _hoisted_2$9 = {
	key: 0,
	class: "text"
};
var _hoisted_3$6 = ["innerHTML"];
var _hoisted_4$5 = {
	key: 1,
	class: "vpi-ellipsis icon",
	"aria-hidden": "true"
};
var _hoisted_5$2 = ["id"];
var VPFlyout_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPFlyout",
	props: {
		icon: {
			type: String,
			required: false
		},
		button: {
			type: String,
			required: false
		},
		label: {
			type: String,
			required: false
		},
		items: {
			type: Array,
			required: false
		}
	},
	setup(__props) {
		const open = ref(false);
		const el = useTemplateRef("el");
		const buttonEl = useTemplateRef("buttonEl");
		const menuEl = useTemplateRef("menuEl");
		const menuId = useId();
		useFlyout({
			el,
			onBlur: close
		});
		const route = useRoute();
		watch(() => route.path, close);
		let openedByHover = false;
		function onPointerEnter(e) {
			if (e.pointerType !== "mouse") return;
			if (!open.value) {
				open.value = true;
				openedByHover = true;
			}
		}
		function onPointerLeave(e) {
			if (e.pointerType !== "mouse") return;
			const to = e.relatedTarget;
			if (to && (buttonEl.value?.contains(to) || menuEl.value?.contains(to))) return;
			close();
		}
		function toggle() {
			if (open.value && openedByHover) {
				openedByHover = false;
				return;
			}
			openedByHover = false;
			open.value = !open.value;
		}
		function close() {
			open.value = false;
			openedByHover = false;
		}
		onKeyStroke("Escape", () => {
			if (!open.value) return;
			const restoreFocus = el.value?.contains(document.activeElement);
			close();
			if (restoreFocus) el.value?.querySelector("button")?.focus();
		});
		useEventListener("pointerdown", (e) => {
			if (open.value && el.value && !el.value.contains(e.target)) close();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				class: "VPFlyout",
				ref_key: "el",
				ref: el
			}, [createBaseVNode("button", {
				ref_key: "buttonEl",
				ref: buttonEl,
				type: "button",
				class: "button",
				"aria-expanded": open.value,
				"aria-controls": unref(menuId),
				"aria-label": __props.label,
				onPointerenter: onPointerEnter,
				onPointerleave: onPointerLeave,
				onClick: toggle
			}, [__props.button || __props.icon ? (openBlock(), createElementBlock("span", _hoisted_2$9, [
				__props.icon ? (openBlock(), createElementBlock("span", {
					key: 0,
					class: normalizeClass([__props.icon, "option-icon"]),
					"aria-hidden": "true"
				}, null, 2)) : createCommentVNode("", true),
				__props.button ? (openBlock(), createElementBlock("span", {
					key: 1,
					dir: "auto",
					innerHTML: __props.button
				}, null, 8, _hoisted_3$6)) : createCommentVNode("", true),
				_cache[0] || (_cache[0] = createBaseVNode("span", {
					class: "vpi-chevron-down text-icon",
					"aria-hidden": "true"
				}, null, -1))
			])) : (openBlock(), createElementBlock("span", _hoisted_4$5))], 40, _hoisted_1$19), createBaseVNode("div", {
				ref_key: "menuEl",
				ref: menuEl,
				class: "menu",
				id: unref(menuId),
				onPointerleave: onPointerLeave
			}, [createVNode(VPMenu_default, { items: __props.items }, {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default", {}, void 0, true)]),
				_: 3
			}, 8, ["items"])], 40, _hoisted_5$2)], 512);
		};
	}
}, [["__scopeId", "data-v-70e7bdb5"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavTranslations.vue
var _hoisted_1$18 = ["aria-expanded", "aria-controls"];
var _hoisted_2$8 = ["id"];
var _hoisted_3$5 = {
	key: 1,
	class: "VPNavTranslations group translations"
};
var _hoisted_4$4 = { class: "title" };
var _hoisted_5$1 = { class: "title" };
var _hoisted_6 = { class: "items" };
var VPNavTranslations_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavTranslations",
	props: {
		screen: {
			type: Boolean,
			required: false
		},
		menu: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const { localeLinks, currentLang } = useLangs({ linkToCorrespondingPage: true });
		const show = computed(() => !!(localeLinks.value.length && currentLang.value.label));
		const overflow = props.screen || props.menu ? null : useNavOverflow();
		const isCollapsed = computed(() => !!overflow && !overflow.state.translations);
		const isOpen = ref(false);
		const listId = useId();
		function toggle() {
			isOpen.value = !isOpen.value;
		}
		const localeProps = (locale) => ({
			lang: locale.lang,
			hreflang: locale.lang,
			rel: "alternate",
			dir: locale.dir,
			"data-allow-mismatch": "attribute"
		});
		return (_ctx, _cache) => {
			return __props.screen && show.value ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: normalizeClass(["VPNavTranslations VPNavScreenTranslations", { open: isOpen.value }])
			}, [createBaseVNode("button", {
				type: "button",
				class: "title",
				"aria-expanded": isOpen.value,
				"aria-controls": unref(listId),
				onClick: toggle
			}, [
				_cache[0] || (_cache[0] = createBaseVNode("span", {
					class: "vpi-languages icon lang",
					"aria-hidden": "true"
				}, null, -1)),
				createTextVNode(" " + toDisplayString(unref(currentLang).label) + " ", 1),
				_cache[1] || (_cache[1] = createBaseVNode("span", {
					class: "vpi-chevron-down icon chevron",
					"aria-hidden": "true"
				}, null, -1))
			], 8, _hoisted_1$18), withDirectives(createBaseVNode("ul", {
				id: unref(listId),
				class: "list"
			}, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
				return openBlock(), createElementBlock("li", {
					key: locale.link,
					class: "item"
				}, [createVNode(VPLink_default, mergeProps({
					class: "link",
					href: locale.link,
					external: false
				}, { ref_for: true }, localeProps(locale)), {
					default: withCtx(() => [createTextVNode(toDisplayString(locale.text), 1)]),
					_: 2
				}, 1040, ["href"])]);
			}), 128))], 8, _hoisted_2$8), [[vShow, isOpen.value]])], 2)) : __props.menu && show.value ? (openBlock(), createElementBlock("div", _hoisted_3$5, [createBaseVNode("p", _hoisted_4$4, toDisplayString(unref(currentLang).label), 1), createBaseVNode("ul", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
				return openBlock(), createBlock(VPMenuLink_default, mergeProps({
					key: locale.link,
					item: locale,
					external: false
				}, { ref_for: true }, localeProps(locale)), null, 16, ["item"]);
			}), 128))])])) : !__props.menu && show.value ? (openBlock(), createBlock(VPFlyout_default, {
				key: 2,
				class: normalizeClass(["VPNavTranslations VPNavBarTranslations", { collapsed: isCollapsed.value }]),
				icon: "vpi-languages",
				label: unref(theme).langMenuLabel || "Change language",
				ref: (inst) => unref(overflow)?.setClusterEl("translations", inst?.$el ?? null)
			}, {
				default: withCtx(() => [createBaseVNode("p", _hoisted_5$1, toDisplayString(unref(currentLang).label), 1), createBaseVNode("ul", _hoisted_6, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
					return openBlock(), createBlock(VPMenuLink_default, mergeProps({
						key: locale.link,
						item: locale,
						external: false
					}, { ref_for: true }, localeProps(locale)), null, 16, ["item"]);
				}), 128))])]),
				_: 1
			}, 8, ["class", "label"])) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-eed8f829"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPIcon.vue
var _hoisted_1$17 = ["innerHTML"];
var VPIcon_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPIcon",
	props: { icon: {
		type: [String, Object],
		required: true
	} },
	setup(__props) {
		const props = __props;
		const el = useTemplateRef("el");
		const iconClass = useIcon(() => props.icon, el);
		return (_ctx, _cache) => {
			return typeof __props.icon === "object" ? (openBlock(), createElementBlock("span", {
				key: 0,
				class: "VPIcon",
				innerHTML: __props.icon.svg
			}, null, 8, _hoisted_1$17)) : (openBlock(), createElementBlock("span", {
				key: 1,
				ref_key: "el",
				ref: el,
				class: normalizeClass(unref(iconClass))
			}, null, 2));
		};
	}
}, [["__scopeId", "data-v-3f4aa956"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue
var _hoisted_1$16 = [
	"href",
	"aria-label",
	"target",
	"rel"
];
var VPSocialLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPSocialLink",
	props: {
		icon: {
			type: [String, Object],
			required: true
		},
		link: {
			type: String,
			required: true
		},
		ariaLabel: {
			type: String,
			required: false
		},
		target: {
			type: String,
			required: false
		},
		me: {
			type: Boolean,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const qualifiedIcon = computed(() => typeof props.icon === "string" && !props.icon.includes(":") ? `simple-icons:${props.icon}` : props.icon);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("a", {
				class: "VPSocialLink no-icon",
				href: __props.link,
				"aria-label": __props.ariaLabel ?? (typeof __props.icon === "string" ? __props.icon : ""),
				target: __props.target ?? (unref(isExternal)(__props.link) ? "_blank" : void 0),
				rel: __props.me ? "me noopener" : "noopener"
			}, [createVNode(VPIcon_default, { icon: qualifiedIcon.value }, null, 8, ["icon"])], 8, _hoisted_1$16);
		};
	}
}, [["__scopeId", "data-v-0ec3ce8f"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue
var _hoisted_1$15 = { class: "VPSocialLinks" };
var VPSocialLinks_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPSocialLinks",
	props: {
		links: {
			type: Array,
			required: true
		},
		me: {
			type: Boolean,
			required: false,
			default: true
		}
	},
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("ul", _hoisted_1$15, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.links, ({ link, icon, ariaLabel, target }) => {
				return openBlock(), createElementBlock("li", { key: link }, [createVNode(VPSocialLink_default, {
					icon,
					link,
					ariaLabel,
					target,
					me: __props.me
				}, null, 8, [
					"icon",
					"link",
					"ariaLabel",
					"target",
					"me"
				])]);
			}), 128))]);
		};
	}
}, [["__scopeId", "data-v-7335f7d8"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue
var _hoisted_1$14 = {
	key: 0,
	class: "group overflow-items"
};
var _hoisted_2$7 = {
	key: 2,
	class: "group"
};
var _hoisted_3$4 = {
	key: 3,
	class: "group"
};
var _hoisted_4$3 = { class: "item social-links" };
var VPNavBarExtra_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavBarExtra",
	setup(__props) {
		const { theme } = useData();
		const { localeLinks, currentLang } = useLangs({ linkToCorrespondingPage: true });
		const hasAppearanceSwitch = useAppearanceSwitch();
		const overflow = useNavOverflow();
		const overflowItems = computed(() => {
			const count = overflow?.state.visibleItemCount ?? Infinity;
			if (count === Infinity || !theme.value.nav) return [];
			return theme.value.nav.slice(count);
		});
		const showTranslations = computed(() => !!(localeLinks.value.length && currentLang.value.label) && !(overflow?.state.translations ?? true));
		const showAppearance = computed(() => hasAppearanceSwitch.value && !(overflow?.state.appearance ?? true));
		const showSocialLinks = computed(() => !!theme.value.socialLinks && !(overflow?.state.socialLinks ?? true));
		const hasContent = computed(() => overflowItems.value.length > 0 || showTranslations.value || showAppearance.value || showSocialLinks.value);
		return (_ctx, _cache) => {
			return hasContent.value ? (openBlock(), createBlock(VPFlyout_default, {
				key: 0,
				class: "VPNavBarExtra",
				label: unref(theme).extraMenuLabel || "More options",
				ref: (inst) => unref(overflow)?.setExtraEl(inst?.$el ?? null)
			}, {
				default: withCtx(() => [
					overflowItems.value.length ? (openBlock(), createElementBlock("ul", _hoisted_1$14, [(openBlock(true), createElementBlock(Fragment, null, renderList(overflowItems.value, (item) => {
						return openBlock(), createElementBlock(Fragment, { key: JSON.stringify(item) }, ["link" in item ? (openBlock(), createBlock(VPMenuLink_default, {
							key: 0,
							item
						}, null, 8, ["item"])) : "component" in item ? (openBlock(), createBlock(resolveDynamicComponent(item.component), mergeProps({
							key: 1,
							ref_for: true
						}, item.props, { menu: "" }), null, 16)) : (openBlock(), createBlock(VPMenuGroup_default, {
							key: 2,
							text: item.text,
							items: item.items
						}, null, 8, ["text", "items"]))], 64);
					}), 128))])) : createCommentVNode("", true),
					showTranslations.value ? (openBlock(), createBlock(VPNavTranslations_default, {
						key: 1,
						menu: ""
					})) : createCommentVNode("", true),
					showAppearance.value ? (openBlock(), createElementBlock("div", _hoisted_2$7, [createVNode(VPNavAppearance_default, { row: "" })])) : createCommentVNode("", true),
					showSocialLinks.value ? (openBlock(), createElementBlock("div", _hoisted_3$4, [createBaseVNode("div", _hoisted_4$3, [createVNode(VPSocialLinks_default, {
						class: "social-links-list",
						links: unref(theme).socialLinks
					}, null, 8, ["links"])])])) : createCommentVNode("", true)
				]),
				_: 1
			}, 8, ["label"])) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-4a1c14fa"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue
var _hoisted_1$13 = ["aria-label", "aria-expanded"];
var VPNavBarHamburger_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavBarHamburger",
	props: { active: {
		type: Boolean,
		required: true
	} },
	emits: ["click"],
	setup(__props) {
		const { theme } = useData();
		const el = useTemplateRef("el");
		const { screenTriggerEl } = useNav();
		watchEffect(() => {
			screenTriggerEl.value = el.value;
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("button", {
				ref_key: "el",
				ref: el,
				type: "button",
				class: normalizeClass(["VPNavBarHamburger", { active: __props.active }]),
				"aria-label": unref(theme).mobileMenuLabel || "Menu",
				"aria-expanded": __props.active,
				onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click"))
			}, [..._cache[1] || (_cache[1] = [createBaseVNode("span", {
				class: "container",
				"aria-hidden": "true"
			}, [
				createBaseVNode("span", { class: "top" }),
				createBaseVNode("span", { class: "middle" }),
				createBaseVNode("span", { class: "bottom" })
			], -1)])], 10, _hoisted_1$13);
		};
	}
}, [["__scopeId", "data-v-851b2bc1"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/support/docsearch.js
/**
* Resolves the effective mode based on config and available features.
*
* - 'auto': infer hybrid vs sidePanel-only from provided config
* - 'sidePanel': force sidePanel-only even if keyword search is configured
* - 'hybrid': force hybrid (error if keyword search is not configured)
* - 'modal': force modal even if sidePanel is configured
*/
function resolveMode(options) {
	const mode = options.mode ?? "auto";
	const hasKeyword = hasKeywordSearch(options);
	const askAi = options.askAi;
	const hasSidePanelConfig = Boolean(askAi && typeof askAi === "object" && askAi.sidePanel);
	switch (mode) {
		case "sidePanel": return {
			mode,
			showKeywordSearch: false,
			useSidePanel: true
		};
		case "hybrid":
			if (!hasKeyword) console.error("[vitepress] mode: \"hybrid\" requires keyword search credentials (appId, apiKey, indexName).");
			return {
				mode,
				showKeywordSearch: hasKeyword,
				useSidePanel: true
			};
		case "modal": return {
			mode,
			showKeywordSearch: hasKeyword,
			useSidePanel: false
		};
		default: return {
			mode: "auto",
			showKeywordSearch: hasKeyword,
			useSidePanel: hasSidePanelConfig
		};
	}
}
function hasKeywordSearch(options) {
	return Boolean(options.appId && options.apiKey && options.indexName);
}
/**
* Removes existing `lang:` filters and appends `lang:${lang}`.
* Handles both flat arrays and nested arrays (for OR conditions).
*/
function mergeLangFacetFilters(rawFacetFilters, lang) {
	return [...(Array.isArray(rawFacetFilters) ? rawFacetFilters : rawFacetFilters ? [rawFacetFilters] : []).map((filter) => {
		if (Array.isArray(filter)) return filter.filter((f) => typeof f === "string" && !f.startsWith("lang:"));
		return filter;
	}).filter((filter) => {
		if (typeof filter === "string") return !filter.startsWith("lang:");
		return Array.isArray(filter) && filter.length > 0;
	}), `lang:${lang}`];
}
/**
* Builds Ask AI configuration from various input formats.
*/
function buildAskAiConfig(askAiProp, options, lang) {
	const isAskAiString = typeof askAiProp === "string";
	const askAiSearchParameters = !isAskAiString && askAiProp.searchParameters ? { ...askAiProp.searchParameters } : void 0;
	const isAgentStudio = !isAskAiString && askAiProp.agentStudio === true;
	const askAiFacetFilters = mergeLangFacetFilters(askAiSearchParameters?.facetFilters ?? options.searchParameters?.facetFilters, lang);
	const mergedAskAiSearchParameters = isAgentStudio ? askAiSearchParameters : {
		...askAiSearchParameters,
		facetFilters: askAiFacetFilters.length ? askAiFacetFilters : void 0
	};
	const result = {
		...isAskAiString ? {} : askAiProp,
		indexName: isAskAiString ? options.indexName : askAiProp.indexName,
		apiKey: isAskAiString ? options.apiKey : askAiProp.apiKey,
		appId: isAskAiString ? options.appId : askAiProp.appId,
		assistantId: isAskAiString ? askAiProp : askAiProp.assistantId
	};
	if (mergedAskAiSearchParameters && Object.values(mergedAskAiSearchParameters).some((v) => v != null)) result.searchParameters = mergedAskAiSearchParameters;
	return result;
}
/**
* Resolves Algolia search options for the given language,
* merging in locale-specific overrides and language facet filters.
*/
function resolveOptionsForLanguage(options, localeIndex, lang) {
	options = deepMerge(options, options.locales?.[localeIndex] || {});
	const facetFilters = mergeLangFacetFilters(options.searchParameters?.facetFilters, lang);
	const askAi = options.askAi ? buildAskAiConfig(options.askAi, options, lang) : void 0;
	return {
		...options,
		searchParameters: {
			...options.searchParameters,
			facetFilters
		},
		askAi
	};
}
function deepMerge(target, source) {
	const result = { ...target };
	for (const key in source) {
		const value = source[key];
		if (value === void 0) continue;
		if (key === "searchParameters") {
			result[key] = value;
			continue;
		}
		if (isObject(value) && isObject(result[key])) result[key] = deepMerge(result[key], value);
		else result[key] = value;
	}
	delete result.locales;
	return result;
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/support/reactivity.js
function smartComputed(getter, comparator = (newValue, oldValue) => JSON.stringify(newValue) === JSON.stringify(oldValue)) {
	return computed((oldValue) => {
		const newValue = getter();
		return oldValue === void 0 || !comparator(newValue, oldValue) ? newValue : oldValue;
	});
}
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAskAiButton.vue
var _sfc_main$15 = {};
var _hoisted_1$12 = {
	type: "button",
	class: "VPNavBarAskAiButton"
};
function _sfc_render(_ctx, _cache) {
	return openBlock(), createElementBlock("button", _hoisted_1$12, [..._cache[0] || (_cache[0] = [createBaseVNode("span", {
		class: "vpi-sparkles",
		"aria-hidden": "true"
	}, null, -1)])]);
}
var VPNavBarAskAiButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$15, [["render", _sfc_render], ["__scopeId", "data-v-3e81a3f3"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue
var _hoisted_1$11 = {
	type: "button",
	class: "VPNavBarSearchButton"
};
var _hoisted_2$6 = { class: "text" };
var VPNavBarSearchButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavBarSearchButton",
	props: { text: {
		type: String,
		required: true
	} },
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("button", _hoisted_1$11, [
				_cache[0] || (_cache[0] = createBaseVNode("span", {
					class: "vpi-search",
					"aria-hidden": "true"
				}, null, -1)),
				createBaseVNode("span", _hoisted_2$6, toDisplayString(__props.text), 1),
				_cache[1] || (_cache[1] = createBaseVNode("span", {
					class: "keys",
					"aria-hidden": "true"
				}, [createBaseVNode("kbd", { class: "key-mod" }), createBaseVNode("kbd", { class: "key-k" })], -1))
			]);
		};
	}
}, [["__scopeId", "data-v-2b114d79"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue
var _hoisted_1$10 = { class: "VPNavBarSearch" };
var VPNavBarSearch_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavBarSearch",
	setup(__props) {
		const VPLocalSearchBox = () => null;
		const VPAlgoliaSearchBox = () => null;
		const { theme, localeIndex, lang } = useData();
		const provider = "";
		const algoliaOptions = smartComputed(() => {
			return resolveOptionsForLanguage(theme.value.search?.options || {}, localeIndex.value, lang.value);
		});
		const resolvedMode = computed(() => resolveMode(algoliaOptions.value));
		const askAiSidePanelConfig = computed(() => {
			if (!resolvedMode.value.useSidePanel) return null;
			const askAi = algoliaOptions.value.askAi;
			if (!askAi || typeof askAi === "string") return null;
			if (!askAi.sidePanel) return null;
			return askAi.sidePanel === true ? {} : askAi.sidePanel;
		});
		const askAiShortcutEnabled = computed(() => {
			return askAiSidePanelConfig.value?.keyboardShortcuts?.["Ctrl/Cmd+I"] !== false;
		});
		const openRequest = ref(null);
		let openNonce = 0;
		const loaded = ref(false);
		const actuallyLoaded = ref(false);
		onMounted(() => {});
		function loadAndOpen(target) {
			if (!loaded.value) loaded.value = true;
			openRequest.value = {
				target,
				nonce: ++openNonce
			};
		}
		const showSearch = ref(false);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$10, [unref(provider) === "algolia" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
				resolvedMode.value.showKeywordSearch ? (openBlock(), createBlock(VPNavBarSearchButton_default, {
					key: 0,
					text: unref(algoliaOptions).translations?.button?.buttonText || "Search",
					"aria-label": unref(algoliaOptions).translations?.button?.buttonAriaLabel || "Search",
					"aria-keyshortcuts": "/ control+k meta+k",
					onClick: _cache[0] || (_cache[0] = ($event) => loadAndOpen("search"))
				}, null, 8, ["text", "aria-label"])) : createCommentVNode("", true),
				askAiSidePanelConfig.value ? (openBlock(), createBlock(VPNavBarAskAiButton_default, {
					key: 1,
					"aria-label": askAiSidePanelConfig.value.button?.translations?.buttonAriaLabel || "Ask AI",
					"aria-keyshortcuts": askAiShortcutEnabled.value ? "control+i meta+i" : void 0,
					onClick: _cache[1] || (_cache[1] = ($event) => actuallyLoaded.value ? loadAndOpen("toggleAskAi") : loadAndOpen("askAi"))
				}, null, 8, ["aria-label", "aria-keyshortcuts"])) : createCommentVNode("", true),
				loaded.value ? (openBlock(), createBlock(unref(VPAlgoliaSearchBox), {
					key: 2,
					"algolia-options": unref(algoliaOptions),
					"open-request": openRequest.value,
					onVnodeBeforeMount: _cache[2] || (_cache[2] = ($event) => actuallyLoaded.value = true)
				}, null, 8, ["algolia-options", "open-request"])) : createCommentVNode("", true)
			], 64)) : unref(provider) === "local" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(VPNavBarSearchButton_default, {
				text: unref(algoliaOptions).translations?.button?.buttonText || "Search",
				"aria-label": unref(algoliaOptions).translations?.button?.buttonAriaLabel || "Search",
				"aria-keyshortcuts": "/ control+k meta+k",
				onClick: _cache[3] || (_cache[3] = ($event) => showSearch.value = true)
			}, null, 8, ["text", "aria-label"]), showSearch.value ? (openBlock(), createBlock(unref(VPLocalSearchBox), {
				key: 0,
				onClose: _cache[4] || (_cache[4] = ($event) => showSearch.value = false)
			})) : createCommentVNode("", true)], 64)) : createCommentVNode("", true)]);
		};
	}
}, [["__scopeId", "data-v-27ac4513"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue
var _hoisted_1$9 = [
	"href",
	"rel",
	"target",
	"title"
];
var _hoisted_2$5 = ["innerHTML"];
var _hoisted_3$3 = { key: 2 };
var VPNavBarTitle_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavBarTitle",
	setup(__props) {
		const { site, theme } = useData();
		const { hasSidebar } = useLayout();
		const { currentLang } = useLangs();
		const link = computed(() => typeof theme.value.logoLink === "string" ? theme.value.logoLink : theme.value.logoLink?.link);
		const rel = computed(() => typeof theme.value.logoLink === "string" ? void 0 : theme.value.logoLink?.rel);
		const target = computed(() => typeof theme.value.logoLink === "string" ? void 0 : theme.value.logoLink?.target);
		const textTitle = computed(() => {
			if (theme.value.siteTitle === false) return void 0;
			return (theme.value.siteTitle ?? site.value.title).replace(/<[^>]+>/g, "").trim() || void 0;
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["VPNavBarTitle", { "has-sidebar": unref(hasSidebar) }]) }, [createBaseVNode("a", {
				class: "title",
				href: link.value ?? unref(normalizeLink$1)(unref(currentLang).link),
				rel: rel.value,
				target: target.value,
				title: textTitle.value
			}, [
				renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true),
				unref(theme).logo ? (openBlock(), createBlock(VPImage_default, {
					key: 0,
					class: "logo",
					image: unref(theme).logo
				}, null, 8, ["image"])) : createCommentVNode("", true),
				unref(theme).siteTitle ? (openBlock(), createElementBlock("span", {
					key: 1,
					dir: "auto",
					innerHTML: unref(theme).siteTitle
				}, null, 8, _hoisted_2$5)) : unref(theme).siteTitle === void 0 ? (openBlock(), createElementBlock("span", _hoisted_3$3, toDisplayString(unref(site).title), 1)) : createCommentVNode("", true),
				renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)
			], 8, _hoisted_1$9)], 2);
		};
	}
}, [["__scopeId", "data-v-8d8a9fc4"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavMenuGroup.vue
var _hoisted_1$8 = ["aria-expanded", "aria-controls"];
var _hoisted_2$4 = ["innerHTML"];
var _hoisted_3$2 = ["id"];
var _hoisted_4$2 = { key: 1 };
var VPNavMenuGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavMenuGroup",
	props: {
		item: {
			type: Object,
			required: true
		},
		screen: {
			type: Boolean,
			required: false
		},
		menu: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const route = useRoute();
		const isActiveGroup = computed(() => {
			if (props.item.activeMatch) return isActive(route.data.relativePath, route.hash, props.item.activeMatch, true);
			return isChildActive(props.item);
		});
		function isChildActive(navItem) {
			if ("component" in navItem) return false;
			if ("link" in navItem) {
				const href = typeof navItem.link === "function" ? navItem.link(route.data) : navItem.link;
				return isActive(route.data.relativePath, route.hash, navItem.activeMatch || href, !!navItem.activeMatch);
			}
			return navItem.items.some(isChildActive);
		}
		const isOpen = ref(false);
		const groupId = useId();
		function toggle() {
			isOpen.value = !isOpen.value;
		}
		return (_ctx, _cache) => {
			return __props.menu ? (openBlock(), createBlock(VPMenuGroup_default, {
				key: 0,
				class: "VPNavMenuGroup",
				text: __props.item.text,
				items: __props.item.items
			}, null, 8, ["text", "items"])) : !__props.screen ? (openBlock(), createBlock(VPFlyout_default, {
				key: 1,
				class: normalizeClass({
					VPNavMenuGroup: true,
					VPNavBarMenuGroup: true,
					active: isActiveGroup.value
				}),
				button: __props.item.text,
				items: __props.item.items
			}, null, 8, [
				"class",
				"button",
				"items"
			])) : (openBlock(), createElementBlock("div", {
				key: 2,
				class: normalizeClass(["VPNavMenuGroup VPNavScreenMenuGroup", {
					open: isOpen.value,
					active: isActiveGroup.value
				}])
			}, [createBaseVNode("button", {
				type: "button",
				class: "button",
				"aria-expanded": isOpen.value,
				"aria-controls": unref(groupId),
				onClick: toggle
			}, [createBaseVNode("span", {
				class: "button-text",
				dir: "auto",
				innerHTML: __props.item.text
			}, null, 8, _hoisted_2$4), _cache[0] || (_cache[0] = createBaseVNode("span", {
				class: "vpi-plus button-icon",
				"aria-hidden": "true"
			}, null, -1))], 8, _hoisted_1$8), withDirectives(createBaseVNode("ul", {
				id: unref(groupId),
				class: "items"
			}, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.item.items, (child) => {
				return openBlock(), createElementBlock(Fragment, { key: JSON.stringify(child) }, ["link" in child ? (openBlock(), createBlock(VPMenuLink_default, {
					key: 0,
					item: child
				}, null, 8, ["item"])) : "component" in child ? (openBlock(), createElementBlock("li", _hoisted_4$2, [(openBlock(), createBlock(resolveDynamicComponent(child.component), mergeProps({ ref_for: true }, child.props, { "screen-menu": "" }), null, 16))])) : (openBlock(), createBlock(VPMenuGroup_default, {
					key: 2,
					text: child.text,
					items: child.items
				}, null, 8, ["text", "items"]))], 64);
			}), 128))], 8, _hoisted_3$2), [[vShow, isOpen.value]])], 2));
		};
	}
}, [["__scopeId", "data-v-5f015b25"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavMenuLink.vue
var _hoisted_1$7 = ["innerHTML"];
var VPNavMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavMenuLink",
	props: {
		item: {
			type: Object,
			required: true
		},
		screen: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const { href, isActiveLink, isCurrentLink } = useNavItemLink(() => props.item);
		const nav = inject(navInjectionKey, null);
		function onClick() {
			if (props.screen) nav?.closeScreen();
		}
		return (_ctx, _cache) => {
			return openBlock(), createBlock(VPLink_default, {
				class: normalizeClass(["VPNavMenuLink", {
					VPNavBarMenuLink: !__props.screen,
					VPNavScreenMenuLink: __props.screen,
					active: unref(isActiveLink)
				}]),
				"aria-current": unref(isCurrentLink) ? "page" : void 0,
				href: unref(href),
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon,
				onClick
			}, {
				default: withCtx(() => [createBaseVNode("span", {
					dir: "auto",
					innerHTML: __props.item.text
				}, null, 8, _hoisted_1$7)]),
				_: 1
			}, 8, [
				"class",
				"aria-current",
				"href",
				"target",
				"rel",
				"no-icon"
			]);
		};
	}
}, [["__scopeId", "data-v-59ac5534"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavMenu.vue
var _hoisted_1$6 = ["aria-label"];
var _hoisted_2$3 = { class: "list" };
var VPNavMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavMenu",
	props: { screen: {
		type: Boolean,
		required: false
	} },
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const overflow = props.screen ? null : useNavOverflow();
		function isVisible(index) {
			return !overflow || index < overflow.state.visibleItemCount;
		}
		return (_ctx, _cache) => {
			return unref(theme).nav ? (openBlock(), createElementBlock("nav", {
				key: 0,
				"aria-label": unref(theme).navMenuLabel || "Main Navigation",
				class: normalizeClass(["VPNavMenu", __props.screen ? "VPNavScreenMenu" : "VPNavBarMenu"]),
				ref: (el) => unref(overflow)?.setMenuEl(el)
			}, [createBaseVNode("ul", _hoisted_2$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(theme).nav, (item, index) => {
				return openBlock(), createElementBlock("li", {
					key: JSON.stringify(item),
					class: normalizeClass({ collapsed: !isVisible(index) }),
					ref_for: true,
					ref: (el) => unref(overflow)?.setItemEl(index, el)
				}, ["link" in item ? (openBlock(), createBlock(VPNavMenuLink_default, {
					key: 0,
					item,
					screen: __props.screen
				}, null, 8, ["item", "screen"])) : "component" in item ? (openBlock(), createBlock(resolveDynamicComponent(item.component), mergeProps({
					key: 1,
					ref_for: true
				}, item.props, { "screen-menu": __props.screen || void 0 }), null, 16, ["screen-menu"])) : (openBlock(), createBlock(VPNavMenuGroup_default, {
					key: 2,
					item,
					screen: __props.screen
				}, null, 8, ["item", "screen"]))], 2);
			}), 128))])], 10, _hoisted_1$6)) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-b635b6d4"]]);
var VPNavSocialLinks_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavSocialLinks",
	props: { screen: {
		type: Boolean,
		required: false
	} },
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const overflow = props.screen ? null : useNavOverflow();
		const isCollapsed = computed(() => !!overflow && !overflow.state.socialLinks);
		return (_ctx, _cache) => {
			return unref(theme).socialLinks ? (openBlock(), createBlock(VPSocialLinks_default, {
				key: 0,
				class: normalizeClass(["VPNavSocialLinks", [__props.screen ? "VPNavScreenSocialLinks" : "VPNavBarSocialLinks", { collapsed: isCollapsed.value }]]),
				links: unref(theme).socialLinks,
				ref: (inst) => unref(overflow)?.setClusterEl("socialLinks", inst?.$el ?? null)
			}, null, 8, ["class", "links"])) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-f9a18892"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue
var _hoisted_1$5 = { class: "wrapper" };
var _hoisted_2$2 = { class: "container" };
var _hoisted_3$1 = { class: "title" };
var _hoisted_4$1 = { class: "content" };
var VPNavBar_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavBar",
	props: { isScreenOpen: {
		type: Boolean,
		required: true
	} },
	emits: ["toggle-screen"],
	setup(__props) {
		const { theme } = useData();
		const { isHome, hasSidebar, hasLocalNav } = useLayout();
		const { y } = useWindowScroll();
		const isTop = computed(() => y.value <= 0);
		const overflow = provideNavOverflow({ itemsKey: () => JSON.stringify(theme.value.nav ?? null) });
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["VPNavBar", {
				"has-sidebar": unref(hasSidebar),
				"has-local-nav": !unref(isHome) && unref(hasLocalNav),
				"home": unref(isHome),
				"top": isTop.value,
				"screen-open": __props.isScreenOpen
			}]) }, [createBaseVNode("div", _hoisted_1$5, [createBaseVNode("div", _hoisted_2$2, [createBaseVNode("div", _hoisted_3$1, [createVNode(VPNavBarTitle_default, null, {
				"nav-bar-title-before": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)]),
				"nav-bar-title-after": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)]),
				_: 3
			})]), createBaseVNode("div", _hoisted_4$1, [createBaseVNode("div", {
				class: "content-body",
				ref: (el) => unref(overflow).setContainerEl(el)
			}, [
				renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true),
				createVNode(VPNavBarSearch_default, { class: "search" }),
				createVNode(VPNavMenu_default, { class: "menu" }),
				createVNode(VPNavTranslations_default, { class: "translations" }),
				createVNode(VPNavAppearance_default, { class: "appearance" }),
				createVNode(VPNavSocialLinks_default, { class: "social-links" }),
				createVNode(VPNavBarExtra_default, { class: "extra" }),
				renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true),
				createVNode(VPNavBarHamburger_default, {
					class: "hamburger",
					active: __props.isScreenOpen,
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("toggle-screen"))
				}, null, 8, ["active"])
			], 512)])])]), _cache[1] || (_cache[1] = createBaseVNode("div", { class: "divider" }, [createBaseVNode("div", { class: "divider-line" })], -1))], 2);
		};
	}
}, [["__scopeId", "data-v-916ab66e"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue
var _hoisted_1$4 = {
	key: 0,
	class: "VPNavScreen",
	id: "VPNavScreen"
};
var _hoisted_2$1 = { class: "container" };
var VPNavScreen_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNavScreen",
	props: { open: {
		type: Boolean,
		required: true
	} },
	setup(__props) {
		const props = __props;
		const isLocked = useBodyScrollLock();
		provide(navScreenInjectionKey, true);
		const { closeScreen, screenTriggerEl } = useNav();
		onKeyStroke("Escape", () => {
			if (!props.open) return;
			closeScreen();
			screenTriggerEl.value?.focus();
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Transition, {
				name: "fade",
				onEnter: _cache[0] || (_cache[0] = ($event) => isLocked.value = true),
				onAfterLeave: _cache[1] || (_cache[1] = ($event) => isLocked.value = false)
			}, {
				default: withCtx(() => [__props.open ? (openBlock(), createElementBlock("div", _hoisted_1$4, [createBaseVNode("div", _hoisted_2$1, [
					renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true),
					createVNode(VPNavMenu_default, {
						screen: "",
						class: "menu"
					}),
					createVNode(VPNavTranslations_default, {
						screen: "",
						class: "translations"
					}),
					createVNode(VPNavAppearance_default, {
						row: "",
						screen: "",
						class: "appearance"
					}),
					createVNode(VPNavSocialLinks_default, {
						screen: "",
						class: "social-links"
					}),
					renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)
				])])) : createCommentVNode("", true)]),
				_: 3
			});
		};
	}
}, [["__scopeId", "data-v-715d3d4a"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPNav.vue
var _hoisted_1$3 = {
	key: 0,
	class: "VPNav"
};
var VPNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPNav",
	setup(__props) {
		const { isScreenOpen, closeScreen, toggleScreen } = useNav();
		const { frontmatter } = useData();
		const hasNavbar = computed(() => {
			return frontmatter.value.navbar !== false;
		});
		provide(navInjectionKey, { closeScreen });
		watchEffect(() => {
			if (inBrowser) document.documentElement.classList.toggle("hide-nav", !hasNavbar.value);
		});
		return (_ctx, _cache) => {
			return hasNavbar.value ? (openBlock(), createElementBlock("header", _hoisted_1$3, [createVNode(VPNavBar_default, {
				"is-screen-open": unref(isScreenOpen),
				onToggleScreen: unref(toggleScreen)
			}, {
				"nav-bar-title-before": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)]),
				"nav-bar-title-after": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)]),
				"nav-bar-content-before": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)]),
				"nav-bar-content-after": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)]),
				_: 3
			}, 8, ["is-screen-open", "onToggleScreen"]), createVNode(VPNavScreen_default, { open: unref(isScreenOpen) }, {
				"nav-screen-content-before": withCtx(() => [renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)]),
				"nav-screen-content-after": withCtx(() => [renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)]),
				_: 3
			}, 8, ["open"])])) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-7dea126c"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue
var _hoisted_1$2 = ["innerHTML"];
var _hoisted_2 = ["innerHTML"];
var _hoisted_3 = ["aria-expanded"];
var _hoisted_4 = {
	key: 1,
	class: "items"
};
var _hoisted_5 = { key: 0 };
var VPSidebarItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPSidebarItem",
	props: {
		item: {
			type: Object,
			required: true
		},
		depth: {
			type: Number,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const { collapsed, collapsible, isLink, isActiveLink, isCurrentLink, hasActiveLink, hasChildren, toggle } = useSidebarItemControl(computed(() => props.item));
		const linkTag = computed(() => isLink.value ? "a" : "div");
		const textTag = computed(() => hasChildren.value && props.depth < 5 ? `h${props.depth + 2}` : "p");
		const sectionTag = computed(() => props.item.text && textTag.value !== "p" ? "section" : "div");
		function onItemClick() {
			!props.item.link && toggle();
		}
		return (_ctx, _cache) => {
			const _component_VPSidebarItem = resolveComponent("VPSidebarItem", true);
			return openBlock(), createBlock(resolveDynamicComponent(sectionTag.value), { class: normalizeClass(["VPSidebarItem", [`level-${__props.depth}`, {
				collapsible: unref(collapsible),
				collapsed: unref(collapsed),
				"is-link": unref(isLink),
				"is-active": unref(isActiveLink),
				"has-active": unref(hasActiveLink)
			}]]) }, {
				default: withCtx(() => [__props.item.text ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: "item",
					onClick: onItemClick
				}, [
					_cache[2] || (_cache[2] = createBaseVNode("div", { class: "indicator" }, null, -1)),
					__props.item.link ? (openBlock(), createBlock(VPLink_default, {
						key: 0,
						tag: linkTag.value,
						class: "link",
						"aria-current": unref(isCurrentLink) ? "page" : void 0,
						href: __props.item.link,
						rel: __props.item.rel,
						target: __props.item.target
					}, {
						default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(textTag.value), { class: "text" }, {
							default: withCtx(() => [createBaseVNode("bdi", { innerHTML: __props.item.text }, null, 8, _hoisted_1$2)]),
							_: 1
						}))]),
						_: 1
					}, 8, [
						"tag",
						"aria-current",
						"href",
						"rel",
						"target"
					])) : (openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
						key: 1,
						class: "text"
					}, {
						default: withCtx(() => [createBaseVNode("bdi", { innerHTML: __props.item.text }, null, 8, _hoisted_2)]),
						_: 1
					})),
					__props.item.collapsed != null && __props.item.items && __props.item.items.length ? (openBlock(), createElementBlock("button", {
						key: 2,
						type: "button",
						class: "caret",
						"aria-label": "toggle section",
						"aria-expanded": !unref(collapsed),
						onClick: _cache[0] || (_cache[0] = withModifiers((...args) => unref(toggle) && unref(toggle)(...args), ["stop"]))
					}, [..._cache[1] || (_cache[1] = [createBaseVNode("span", { class: "vpi-chevron-right caret-icon" }, null, -1)])], 8, _hoisted_3)) : createCommentVNode("", true)
				])) : createCommentVNode("", true), __props.item.items && __props.item.items.length ? (openBlock(), createElementBlock("ul", _hoisted_4, [__props.depth < 5 ? (openBlock(), createElementBlock("li", _hoisted_5, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.item.items, (i) => {
					return openBlock(), createBlock(_component_VPSidebarItem, {
						key: i.text,
						item: i,
						depth: __props.depth + 1
					}, null, 8, ["item", "depth"]);
				}), 128))])) : createCommentVNode("", true)])) : createCommentVNode("", true)]),
				_: 1
			}, 8, ["class"]);
		};
	}
}, [["__scopeId", "data-v-82976d29"]]);
var VPSidebarGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPSidebarGroup",
	props: { items: {
		type: Array,
		required: true
	} },
	setup(__props) {
		const disableTransition = ref(true);
		let timer = null;
		onMounted(() => {
			timer = setTimeout(() => {
				timer = null;
				disableTransition.value = false;
			}, 300);
		});
		onBeforeUnmount(() => {
			if (timer != null) {
				clearTimeout(timer);
				timer = null;
			}
		});
		return (_ctx, _cache) => {
			return openBlock(true), createElementBlock(Fragment, null, renderList(__props.items, (item) => {
				return openBlock(), createElementBlock("div", {
					key: item.text,
					class: normalizeClass(["group", { "no-transition": disableTransition.value }])
				}, [createVNode(VPSidebarItem_default, {
					item,
					depth: 0
				}, null, 8, ["item"])], 2);
			}), 128);
		};
	}
}, [["__scopeId", "data-v-83612196"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue
var _hoisted_1$1 = {
	class: "nav",
	id: "VPSidebarNav",
	"aria-labelledby": "sidebar-aria-label",
	tabindex: "-1"
};
var VPSidebar_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPSidebar",
	props: { open: {
		type: Boolean,
		required: true
	} },
	setup(__props) {
		const { sidebarGroups, hasSidebar } = useLayout();
		const props = __props;
		const navEl = useTemplateRef("navEl");
		const isLocked = useBodyScrollLock();
		watch([() => props.open, navEl], () => {
			if (props.open) {
				isLocked.value = true;
				navEl.value?.focus();
			} else isLocked.value = false;
		}, {
			immediate: true,
			flush: "post"
		});
		const key = ref(0);
		watch(sidebarGroups, () => {
			key.value += 1;
		}, { deep: true });
		return (_ctx, _cache) => {
			return unref(hasSidebar) ? (openBlock(), createElementBlock("aside", {
				key: 0,
				class: normalizeClass(["VPSidebar", { open: __props.open }]),
				ref_key: "navEl",
				ref: navEl,
				onClick: _cache[0] || (_cache[0] = withModifiers(() => {}, ["stop"]))
			}, [_cache[2] || (_cache[2] = createBaseVNode("div", { class: "curtain" }, null, -1)), createBaseVNode("nav", _hoisted_1$1, [
				_cache[1] || (_cache[1] = createBaseVNode("span", {
					class: "visually-hidden",
					id: "sidebar-aria-label"
				}, " Sidebar Navigation ", -1)),
				renderSlot(_ctx.$slots, "sidebar-nav-before", {}, void 0, true),
				(openBlock(), createBlock(VPSidebarGroup_default, {
					items: unref(sidebarGroups),
					key: key.value
				}, null, 8, ["items"])),
				renderSlot(_ctx.$slots, "sidebar-nav-after", {}, void 0, true)
			])], 2)) : createCommentVNode("", true);
		};
	}
}, [["__scopeId", "data-v-e9958317"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue
var _hoisted_1 = ["inert"];
var VPSkipLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "VPSkipLink",
	props: { inert: {
		type: Boolean,
		required: false
	} },
	setup(__props) {
		const { theme } = useData();
		const route = useRoute();
		const backToTop = useTemplateRef("backToTop");
		watch(() => route.path, () => backToTop.value?.focus());
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock(Fragment, null, [createBaseVNode("span", {
				ref_key: "backToTop",
				ref: backToTop,
				tabindex: "-1"
			}, null, 512), createBaseVNode("a", {
				href: "#VPContent",
				class: "VPSkipLink visually-hidden",
				inert: __props.inert
			}, toDisplayString(unref(theme).skipToContentLabel || "Skip to content"), 9, _hoisted_1)], 64);
		};
	}
}, [["__scopeId", "data-v-d85f4f76"]]);
// node_modules/.pnpm/vitepress@2.0.0-alpha.21_postcss@8.5.33/node_modules/vitepress/dist/client/theme-default/without-fonts.js
var theme = {
	Layout: /* @__PURE__ */ _plugin_vue_export_helper_default({
		__name: "Layout",
		setup(__props) {
			const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebarControl();
			const { isScreenOpen } = useNav();
			registerWatchers({ closeSidebar });
			const { frontmatter, theme } = useData();
			const slots = useSlots();
			const heroImageSlotExists = computed(() => !!slots["home-hero-image"]);
			provide(layoutInfoInjectionKey, { heroImageSlotExists });
			return (_ctx, _cache) => {
				const _component_Content = resolveComponent("Content");
				return unref(frontmatter).layout !== false ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: normalizeClass(["Layout", [unref(frontmatter).pageClass, unref(theme).gradedContainers && "vp-graded-containers"]])
				}, [
					renderSlot(_ctx.$slots, "layout-top", {}, void 0, true),
					createVNode(VPSkipLink_default, { inert: unref(isScreenOpen) }, null, 8, ["inert"]),
					createVNode(VPBackdrop_default, {
						class: "backdrop",
						show: unref(isSidebarOpen),
						onClick: unref(closeSidebar)
					}, null, 8, ["show", "onClick"]),
					createVNode(VPNav_default, null, {
						"nav-bar-title-before": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)]),
						"nav-bar-title-after": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)]),
						"nav-bar-content-before": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)]),
						"nav-bar-content-after": withCtx(() => [renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)]),
						"nav-screen-content-before": withCtx(() => [renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)]),
						"nav-screen-content-after": withCtx(() => [renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)]),
						_: 3
					}),
					createVNode(VPLocalNav_default, {
						open: unref(isSidebarOpen),
						onOpenMenu: unref(openSidebar),
						inert: unref(isScreenOpen)
					}, null, 8, [
						"open",
						"onOpenMenu",
						"inert"
					]),
					createVNode(VPSidebar_default, {
						open: unref(isSidebarOpen),
						inert: unref(isScreenOpen)
					}, {
						"sidebar-nav-before": withCtx(() => [renderSlot(_ctx.$slots, "sidebar-nav-before", {}, void 0, true)]),
						"sidebar-nav-after": withCtx(() => [renderSlot(_ctx.$slots, "sidebar-nav-after", {}, void 0, true)]),
						_: 3
					}, 8, ["open", "inert"]),
					createVNode(VPContent_default, { inert: unref(isScreenOpen) }, {
						"page-top": withCtx(() => [renderSlot(_ctx.$slots, "page-top", {}, void 0, true)]),
						"page-bottom": withCtx(() => [renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)]),
						"not-found": withCtx(() => [renderSlot(_ctx.$slots, "not-found", {}, void 0, true)]),
						"home-hero-before": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)]),
						"home-hero-info-before": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)]),
						"home-hero-info": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)]),
						"home-hero-info-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)]),
						"home-hero-actions-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)]),
						"home-hero-actions-before-actions": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)]),
						"home-hero-image": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)]),
						"home-hero-after": withCtx(() => [renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)]),
						"home-features-before": withCtx(() => [renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)]),
						"home-features-after": withCtx(() => [renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)]),
						"doc-footer-before": withCtx(() => [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)]),
						"doc-before": withCtx(() => [renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)]),
						"doc-after": withCtx(() => [renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)]),
						"doc-top": withCtx(() => [renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)]),
						"doc-bottom": withCtx(() => [renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)]),
						"aside-top": withCtx(() => [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)]),
						"aside-bottom": withCtx(() => [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)]),
						"aside-outline-before": withCtx(() => [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)]),
						"aside-outline-after": withCtx(() => [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)]),
						"aside-ads-before": withCtx(() => [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)]),
						"aside-ads-after": withCtx(() => [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)]),
						_: 3
					}, 8, ["inert"]),
					createVNode(VPFooter_default, { inert: unref(isScreenOpen) }, null, 8, ["inert"]),
					renderSlot(_ctx.$slots, "layout-bottom", {}, void 0, true)
				], 2)) : (openBlock(), createBlock(_component_Content, { key: 1 }));
			};
		}
	}, [["__scopeId", "data-v-7e234f49"]]),
	enhanceApp: ({ app }) => {
		app.component("Badge", _sfc_main$53);
	}
};
// .vitepress/theme/index.ts
var theme_default = {
	extends: theme,
	Layout: () => {
		return h(theme.Layout, null, {});
	},
	enhanceApp({ app, router, siteData }) {}
};
export { theme_default as t };
