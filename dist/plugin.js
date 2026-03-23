const __pluginConfig =  {
  "name": "windy-plugin-ofp",
  "version": "0.1.3",
  "icon": "✈️",
  "title": "OFP Route",
  "description": "OFPのGPXルートをWindy上に表示し、各ウェイポイントの気象データを取得します。",
  "author": "Takayuki Matsumoto",
  "repository": "https://github.com/Matt7x7-9/windy-ofp-plugin",
  "desktopUI": "rhpane",
  "mobileUI": "fullscreen",
  "routerPath": "/ofp-route",
  "private": true,
  "built": 1774263569722,
  "builtReadable": "2026-03-23T10:59:29.722Z",
  "screenshot": "screenshot.jpg"
};

// transformCode: import bcast from '@windy/broadcast';
const bcast = W.broadcast;

// transformCode: import { map } from '@windy/map';
const { map } = W.map;

// transformCode: import { getLatLonInterpolator } from '@windy/interpolator';
const { getLatLonInterpolator } = W.interpolator;


/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function set_input_value(input, value) {
	input.value = value == null ? '' : value;
}

/**
 * @returns {void} */
function set_style(node, key, value, important) {
	if (value == null) {
		node.style.removeProperty(key);
	} else {
		node.style.setProperty(key, value, '');
	}
}

/**
 * @returns {void} */
function select_option(select, value, mounting) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
	if (!mounting || value !== undefined) {
		select.selectedIndex = -1; // no option should be selected
	}
}

function select_value(select) {
	const selected_option = select.querySelector(':checked');
	return selected_option && selected_option.__value;
}

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	// The `!!` is required because an `undefined` flag means flipping the current state.
	element.classList.toggle(name, !!toggle);
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs/svelte#ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

const config = {
    title: 'OFP Route'};

/* src/plugin.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-1ychhp6", ".ofp-section.svelte-1ychhp6.svelte-1ychhp6{padding:8px 12px;border-bottom:1px solid rgba(255, 255, 255, 0.08)}.ofp-label.svelte-1ychhp6.svelte-1ychhp6{display:block;font-size:11px;color:#aaa;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px}.ofp-fl-row.svelte-1ychhp6.svelte-1ychhp6{display:flex;align-items:center;gap:8px}.ofp-fl-select.svelte-1ychhp6.svelte-1ychhp6{background:rgba(255, 255, 255, 0.1);border:1px solid rgba(255, 255, 255, 0.2);border-radius:4px;color:#fff;font-size:13px;padding:2px 6px;cursor:pointer}.ofp-file-input.svelte-1ychhp6.svelte-1ychhp6{width:100%;font-size:12px;color:#ddd}.ofp-route-name.svelte-1ychhp6.svelte-1ychhp6{font-size:13px;font-weight:bold;color:#fff;margin-bottom:2px}.ofp-stat.svelte-1ychhp6.svelte-1ychhp6{font-size:11px;color:#aaa}.ofp-btn.svelte-1ychhp6.svelte-1ychhp6{margin:8px 12px;padding:4px 12px;background:rgba(255, 100, 100, 0.2);border:1px solid rgba(255, 100, 100, 0.4);border-radius:4px;color:#ff8888;font-size:12px;cursor:pointer}.ofp-btn.svelte-1ychhp6.svelte-1ychhp6:hover{background:rgba(255, 100, 100, 0.35)}.ofp-hint.svelte-1ychhp6.svelte-1ychhp6{padding:16px 12px;font-size:12px;color:#888;text-align:center;line-height:1.6}.ofp-wx-box.svelte-1ychhp6.svelte-1ychhp6{background:rgba(0, 170, 255, 0.08)}.ofp-wpt-name.svelte-1ychhp6.svelte-1ychhp6{font-size:13px;font-weight:bold;color:#00aaff;margin-bottom:4px}.ofp-overlay-grid.svelte-1ychhp6.svelte-1ychhp6{display:grid;grid-template-columns:repeat(4, 1fr);gap:4px;margin-top:4px}.ofp-ov-btn.svelte-1ychhp6.svelte-1ychhp6{background:rgba(255, 255, 255, 0.07);border:1px solid rgba(255, 255, 255, 0.12);border-radius:4px;color:#bbb;font-size:11px;padding:5px 2px;cursor:pointer;text-align:center;white-space:nowrap}.ofp-ov-btn.svelte-1ychhp6.svelte-1ychhp6:hover{background:rgba(255, 255, 255, 0.15)}.ofp-ov-active.svelte-1ychhp6.svelte-1ychhp6{background:rgba(0, 170, 255, 0.25);border-color:rgba(0, 170, 255, 0.6);color:#fff}.ofp-wind-table.svelte-1ychhp6.svelte-1ychhp6{width:100%;border-collapse:collapse;margin-top:4px}.ofp-th.svelte-1ychhp6.svelte-1ychhp6{font-size:10px;color:#666;padding:2px 4px;border-bottom:1px solid rgba(255, 255, 255, 0.08)}.ofp-td-level.svelte-1ychhp6.svelte-1ychhp6{font-size:11px;color:#999;padding:3px 4px}.ofp-td-num.svelte-1ychhp6.svelte-1ychhp6{font-size:12px;color:#ccc;padding:3px 4px;text-align:right}.ofp-current-level.svelte-1ychhp6 td.svelte-1ychhp6{color:#fff;background:rgba(0, 170, 255, 0.15)}.ofp-current-level.svelte-1ychhp6 .ofp-td-level.svelte-1ychhp6{color:#7df;font-weight:bold}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[26] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[26] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[31] = list[i];
	return child_ctx;
}

// (26:12) {#each OVERLAY_OPTIONS as ov}
function create_each_block_2(ctx) {
	let button;
	let mounted;
	let dispose;

	function click_handler_1() {
		return /*click_handler_1*/ ctx[15](/*ov*/ ctx[31]);
	}

	return {
		c() {
			button = element("button");
			button.textContent = `${/*ov*/ ctx[31].icon} ${/*ov*/ ctx[31].label}`;
			attr(button, "class", "ofp-ov-btn svelte-1ychhp6");
			toggle_class(button, "ofp-ov-active", /*currentOverlay*/ ctx[0] === /*ov*/ ctx[31].key);
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_1);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*currentOverlay, OVERLAY_OPTIONS*/ 129) {
				toggle_class(button, "ofp-ov-active", /*currentOverlay*/ ctx[0] === /*ov*/ ctx[31].key);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (37:4) {#if currentOverlayHasLevel}
function create_if_block_5(ctx) {
	let div;
	let label;
	let t1;
	let select;
	let mounted;
	let dispose;
	let each_value_1 = ensure_array_like(/*LEVEL_OPTIONS*/ ctx[9]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			div = element("div");
			label = element("label");
			label.textContent = "CRZ";
			t1 = space();
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(label, "class", "ofp-label svelte-1ychhp6");
			set_style(label, "margin-bottom", "0");
			attr(select, "class", "ofp-fl-select svelte-1ychhp6");
			if (/*selectedLevel*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[16].call(select));
			attr(div, "class", "ofp-section ofp-fl-row svelte-1ychhp6");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, label);
			append(div, t1);
			append(div, select);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*selectedLevel*/ ctx[1], true);

			if (!mounted) {
				dispose = [
					listen(select, "change", /*select_change_handler*/ ctx[16]),
					listen(select, "change", /*onFlChange*/ ctx[10])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*LEVEL_OPTIONS*/ 512) {
				each_value_1 = ensure_array_like(/*LEVEL_OPTIONS*/ ctx[9]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if (dirty[0] & /*selectedLevel, LEVEL_OPTIONS*/ 514) {
				select_option(select, /*selectedLevel*/ ctx[1]);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (41:12) {#each LEVEL_OPTIONS as lv}
function create_each_block_1(ctx) {
	let option;
	let t0_value = /*lv*/ ctx[26].label + "";
	let t0;
	let t1;
	let t2_value = /*lv*/ ctx[26].fl + "";
	let t2;

	return {
		c() {
			option = element("option");
			t0 = text(t0_value);
			t1 = text(" ≈ FL");
			t2 = text(t2_value);
			option.__value = /*lv*/ ctx[26].level;
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t0);
			append(option, t1);
			append(option, t2);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(option);
			}
		}
	};
}

// (55:4) {:else}
function create_else_block_1(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.innerHTML = `OFP解析で生成したGPXファイルを<br/>選択してください`;
			attr(div, "class", "ofp-hint svelte-1ychhp6");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (49:4) {#if routeName}
function create_if_block_4(ctx) {
	let div2;
	let div0;
	let t0;
	let t1;
	let t2;
	let div1;
	let t3;
	let t4;
	let t5;
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			div2 = element("div");
			div0 = element("div");
			t0 = text("✈️ ");
			t1 = text(/*routeName*/ ctx[2]);
			t2 = space();
			div1 = element("div");
			t3 = text(/*waypointCount*/ ctx[3]);
			t4 = text(" ウェイポイント");
			t5 = space();
			button = element("button");
			button.textContent = "クリア";
			attr(div0, "class", "ofp-route-name svelte-1ychhp6");
			attr(div1, "class", "ofp-stat svelte-1ychhp6");
			attr(div2, "class", "ofp-section svelte-1ychhp6");
			attr(button, "class", "ofp-btn svelte-1ychhp6");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);
			append(div0, t0);
			append(div0, t1);
			append(div2, t2);
			append(div2, div1);
			append(div1, t3);
			append(div1, t4);
			insert(target, t5, anchor);
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*clearRoute*/ ctx[12]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*routeName*/ 4) set_data(t1, /*routeName*/ ctx[2]);
			if (dirty[0] & /*waypointCount*/ 8) set_data(t3, /*waypointCount*/ ctx[3]);
		},
		d(detaching) {
			if (detaching) {
				detach(div2);
				detach(t5);
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (60:4) {#if selectedWpt}
function create_if_block(ctx) {
	let div1;
	let div0;
	let t0;
	let t1_value = /*selectedWpt*/ ctx[4].name + "";
	let t1;
	let t2;
	let if_block = /*selectedWpt*/ ctx[4].levels && create_if_block_1(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text("📍 ");
			t1 = text(t1_value);
			t2 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "ofp-wpt-name svelte-1ychhp6");
			attr(div1, "class", "ofp-section ofp-wx-box svelte-1ychhp6");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div0, t1);
			append(div1, t2);
			if (if_block) if_block.m(div1, null);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedWpt*/ 16 && t1_value !== (t1_value = /*selectedWpt*/ ctx[4].name + "")) set_data(t1, t1_value);

			if (/*selectedWpt*/ ctx[4].levels) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					if_block.m(div1, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			if (if_block) if_block.d();
		}
	};
}

// (63:12) {#if selectedWpt.levels}
function create_if_block_1(ctx) {
	let table;
	let thead;
	let t5;
	let tbody;
	let each_value = ensure_array_like(/*selectedWpt*/ ctx[4].levels);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			table = element("table");
			thead = element("thead");
			thead.innerHTML = `<tr><th class="ofp-th svelte-1ychhp6">高度</th> <th class="ofp-th svelte-1ychhp6" style="text-align:right">風向</th> <th class="ofp-th svelte-1ychhp6" style="text-align:right">風速</th></tr>`;
			t5 = space();
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(table, "class", "ofp-wind-table svelte-1ychhp6");
		},
		m(target, anchor) {
			insert(target, table, anchor);
			append(table, thead);
			append(table, t5);
			append(table, tbody);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(tbody, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedWpt, selectedLevel*/ 18) {
				each_value = ensure_array_like(/*selectedWpt*/ ctx[4].levels);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(table);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (80:32) {:else}
function create_else_block(ctx) {
	let td0;
	let t0_value = /*lv*/ ctx[26].windDir + "";
	let t0;
	let t1;
	let t2;
	let td1;
	let t3_value = /*lv*/ ctx[26].windSpd + "";
	let t3;
	let t4;

	return {
		c() {
			td0 = element("td");
			t0 = text(t0_value);
			t1 = text("°");
			t2 = space();
			td1 = element("td");
			t3 = text(t3_value);
			t4 = text("kt");
			attr(td0, "class", "ofp-td-num svelte-1ychhp6");
			attr(td1, "class", "ofp-td-num svelte-1ychhp6");
		},
		m(target, anchor) {
			insert(target, td0, anchor);
			append(td0, t0);
			append(td0, t1);
			insert(target, t2, anchor);
			insert(target, td1, anchor);
			append(td1, t3);
			append(td1, t4);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedWpt*/ 16 && t0_value !== (t0_value = /*lv*/ ctx[26].windDir + "")) set_data(t0, t0_value);
			if (dirty[0] & /*selectedWpt*/ 16 && t3_value !== (t3_value = /*lv*/ ctx[26].windSpd + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) {
				detach(td0);
				detach(t2);
				detach(td1);
			}
		}
	};
}

// (78:51) 
function create_if_block_3(ctx) {
	let td;

	return {
		c() {
			td = element("td");
			td.textContent = "—";
			attr(td, "class", "ofp-td-num svelte-1ychhp6");
			attr(td, "colspan", "2");
			set_style(td, "color", "#f88");
		},
		m(target, anchor) {
			insert(target, td, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(td);
			}
		}
	};
}

// (76:32) {#if lv.loading}
function create_if_block_2(ctx) {
	let td;

	return {
		c() {
			td = element("td");
			td.textContent = "…";
			attr(td, "class", "ofp-td-num svelte-1ychhp6");
			attr(td, "colspan", "2");
			set_style(td, "color", "#555");
		},
		m(target, anchor) {
			insert(target, td, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(td);
			}
		}
	};
}

// (73:24) {#each selectedWpt.levels as lv}
function create_each_block(ctx) {
	let tr;
	let td;
	let t0_value = /*lv*/ ctx[26].label + "";
	let t0;
	let t1;
	let t2;

	function select_block_type_1(ctx, dirty) {
		if (/*lv*/ ctx[26].loading) return create_if_block_2;
		if (/*lv*/ ctx[26].error) return create_if_block_3;
		return create_else_block;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			tr = element("tr");
			td = element("td");
			t0 = text(t0_value);
			t1 = space();
			if_block.c();
			t2 = space();
			attr(td, "class", "ofp-td-level svelte-1ychhp6");
			attr(tr, "class", "svelte-1ychhp6");
			toggle_class(tr, "ofp-current-level", /*lv*/ ctx[26].level === /*selectedLevel*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, tr, anchor);
			append(tr, td);
			append(td, t0);
			append(tr, t1);
			if_block.m(tr, null);
			append(tr, t2);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedWpt*/ 16 && t0_value !== (t0_value = /*lv*/ ctx[26].label + "")) set_data(t0, t0_value);

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(tr, t2);
				}
			}

			if (dirty[0] & /*selectedWpt, selectedLevel*/ 18) {
				toggle_class(tr, "ofp-current-level", /*lv*/ ctx[26].level === /*selectedLevel*/ ctx[1]);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(tr);
			}

			if_block.d();
		}
	};
}

function create_fragment(ctx) {
	let div0;
	let t1;
	let section;
	let div1;
	let t3;
	let div2;
	let label0;
	let t5;
	let input;
	let t6;
	let div4;
	let label1;
	let t8;
	let div3;
	let t9;
	let t10;
	let t11;
	let mounted;
	let dispose;
	let each_value_2 = ensure_array_like(/*OVERLAY_OPTIONS*/ ctx[7]);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	let if_block0 = /*currentOverlayHasLevel*/ ctx[5] && create_if_block_5(ctx);

	function select_block_type(ctx, dirty) {
		if (/*routeName*/ ctx[2]) return create_if_block_4;
		return create_else_block_1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = /*selectedWpt*/ ctx[4] && create_if_block(ctx);

	return {
		c() {
			div0 = element("div");
			div0.textContent = `${/*title*/ ctx[6]}`;
			t1 = space();
			section = element("section");
			div1 = element("div");
			div1.textContent = `${/*title*/ ctx[6]}`;
			t3 = space();
			div2 = element("div");
			label0 = element("label");
			label0.textContent = "GPXファイルを選択";
			t5 = space();
			input = element("input");
			t6 = space();
			div4 = element("div");
			label1 = element("label");
			label1.textContent = "レイヤー";
			t8 = space();
			div3 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t9 = space();
			if (if_block0) if_block0.c();
			t10 = space();
			if_block1.c();
			t11 = space();
			if (if_block2) if_block2.c();
			attr(div0, "class", "plugin__mobile-header");
			attr(div1, "class", "plugin__title plugin__title--chevron-back");
			attr(label0, "class", "ofp-label svelte-1ychhp6");
			attr(input, "type", "file");
			attr(input, "accept", ".gpx,application/gpx+xml,text/xml,application/xml");
			attr(input, "class", "ofp-file-input svelte-1ychhp6");
			attr(div2, "class", "ofp-section svelte-1ychhp6");
			attr(label1, "class", "ofp-label svelte-1ychhp6");
			attr(div3, "class", "ofp-overlay-grid svelte-1ychhp6");
			attr(div4, "class", "ofp-section svelte-1ychhp6");
			attr(section, "class", "plugin__content");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			insert(target, t1, anchor);
			insert(target, section, anchor);
			append(section, div1);
			append(section, t3);
			append(section, div2);
			append(div2, label0);
			append(div2, t5);
			append(div2, input);
			append(section, t6);
			append(section, div4);
			append(div4, label1);
			append(div4, t8);
			append(div4, div3);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div3, null);
				}
			}

			append(section, t9);
			if (if_block0) if_block0.m(section, null);
			append(section, t10);
			if_block1.m(section, null);
			append(section, t11);
			if (if_block2) if_block2.m(section, null);

			if (!mounted) {
				dispose = [
					listen(div1, "click", /*click_handler*/ ctx[14]),
					listen(input, "click", clearFileInput),
					listen(input, "change", /*loadGpx*/ ctx[11])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*currentOverlay, OVERLAY_OPTIONS, setOverlay*/ 385) {
				each_value_2 = ensure_array_like(/*OVERLAY_OPTIONS*/ ctx[7]);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div3, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}

			if (/*currentOverlayHasLevel*/ ctx[5]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_5(ctx);
					if_block0.c();
					if_block0.m(section, t10);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(section, t11);
				}
			}

			if (/*selectedWpt*/ ctx[4]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block(ctx);
					if_block2.c();
					if_block2.m(section, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div0);
				detach(t1);
				detach(section);
			}

			destroy_each(each_blocks, detaching);
			if (if_block0) if_block0.d();
			if_block1.d();
			if (if_block2) if_block2.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function parseGpx(text) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(text, 'application/xml');
	const nameEl = doc.querySelector('rte > name');
	const name = nameEl?.textContent || 'Route';
	const rtepts = Array.from(doc.querySelectorAll('rtept'));

	const points = rtepts.map(pt => ({
		lat: parseFloat(pt.getAttribute('lat') || '0'),
		lon: parseFloat(pt.getAttribute('lon') || '0'),
		name: pt.querySelector('name')?.textContent || ''
	}));

	return { name, points };
}

function clearFileInput(e) {
	e.target.value = '';
}

function instance($$self, $$props, $$invalidate) {
	let currentOverlayHasLevel;
	const L = window.L;
	const store = window.W.store;
	const { title } = config;

	const OVERLAY_OPTIONS = [
		{
			key: 'wind',
			icon: '💨',
			label: 'Wind',
			hasLevel: true
		},
		{
			key: 'turbulence',
			icon: '〰️',
			label: 'Turb',
			hasLevel: true
		},
		{
			key: 'radar',
			icon: '🌧',
			label: 'Radar',
			hasLevel: false
		},
		{
			key: 'satellite',
			icon: '🛰',
			label: 'Satellite',
			hasLevel: false
		},
		{
			key: 'thunder',
			icon: '⛈',
			label: 'Thunder',
			hasLevel: false
		},
		{
			key: 'clouds',
			icon: '☁️',
			label: 'Clouds',
			hasLevel: false
		},
		{
			key: 'icing',
			icon: '🧊',
			label: 'Icing',
			hasLevel: false
		},
		{
			key: 'cape',
			icon: '🌩',
			label: 'CAPE',
			hasLevel: false
		},
		{
			key: 'hurricane',
			icon: '🌀',
			label: 'Hurricane',
			hasLevel: false
		}
	];

	let currentOverlay = 'wind';

	function setOverlay(key) {
		$$invalidate(0, currentOverlay = key);
		store.set('overlay', key);
		if (currentOverlayHasLevel) store.set('level', selectedLevel);
	}

	const LEVEL_OPTIONS = [
		{ level: '150h', label: '150hPa', fl: 450 },
		{ level: '200h', label: '200hPa', fl: 390 },
		{ level: '250h', label: '250hPa', fl: 340 },
		{ level: '300h', label: '300hPa', fl: 300 },
		{ level: '400h', label: '400hPa', fl: 240 },
		{ level: '500h', label: '500hPa', fl: 180 }
	];

	let selectedLevel = '200h';

	function onFlChange() {
		store.set('overlay', currentOverlay);
		store.set('level', selectedLevel);
	}

	let routeName = '';
	let waypointCount = 0;
	let selectedWpt = null;
	let fetchId = 0;
	let routeLayer = null;
	let markers = [];

	function loadGpx(event) {
		const input = event.target;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();

		reader.onload = e => {
			const text = e.target?.result;
			const { name, points } = parseGpx(text);
			drawRoute(name, points);
			onFlChange();
		};

		reader.readAsText(file);
	}

	function drawRoute(name, points) {
		clearRoute();
		$$invalidate(2, routeName = name);
		$$invalidate(3, waypointCount = points.length);

		if (!map.getPane('ofpLinePane')) {
			const pane = map.createPane('ofpLinePane');
			pane.style.zIndex = '650';
			pane.style.pointerEvents = 'none';
		}

		if (!map.getPane('ofpMarkerPane')) {
			const pane = map.createPane('ofpMarkerPane');
			pane.style.zIndex = '651';
		}

		const latlngs = points.map(p => [p.lat, p.lon]);

		routeLayer = L.polyline(latlngs, {
			color: '#00aaff',
			weight: 3,
			opacity: 0.85,
			pane: 'ofpLinePane'
		}).addTo(map);

		markers = [];
		const step = Math.max(1, Math.floor(points.length / 30));

		points.forEach((p, i) => {
			if (i % step !== 0 && i !== points.length - 1) return;
			const isFirst = i === 0;
			const isLast = i === points.length - 1;
			const color = isFirst ? '#00cc44' : isLast ? '#ff4444' : '#00aaff';
			const size = isFirst || isLast ? 12 : 8;

			const icon = L.divIcon({
				className: '',
				html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-sizing:border-box;cursor:pointer"></div>`,
				iconSize: [size, size],
				iconAnchor: [size / 2, size / 2]
			});

			const marker = L.marker([p.lat, p.lon], { icon, pane: 'ofpMarkerPane' }).addTo(map);
			marker.bindTooltip(p.name, { direction: 'top', opacity: 0.9 });
			marker.on('click', () => fetchWxAtPoint(p));
			markers.push(marker);
		});

		map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
	}

	async function fetchWxAtPoint(p) {
		if (currentOverlay !== 'wind') {
			$$invalidate(4, selectedWpt = { name: p.name });
			return;
		}

		const myId = ++fetchId;
		const originalLevel = selectedLevel;

		$$invalidate(4, selectedWpt = {
			name: p.name,
			levels: LEVEL_OPTIONS.map(lv => ({
				...lv,
				windDir: '—',
				windSpd: '—',
				loading: true,
				error: false
			}))
		});

		for (let i = 0; i < LEVEL_OPTIONS.length; i++) {
			if (fetchId !== myId) return;
			const lv = LEVEL_OPTIONS[i];
			store.set('overlay', 'wind');
			store.set('level', lv.level);

			try {
				await new Promise(resolve => {
						const timeout = setTimeout(resolve, 3000);

						bcast.once('redrawFinished', () => {
							clearTimeout(timeout);
							resolve();
						});
					});

				if (fetchId !== myId) return;
				const interpFn = await getLatLonInterpolator();

				if (!interpFn) {
					updateLevel(myId, i, { loading: false, error: true });
					continue;
				}

				const result = await interpFn({ lat: p.lat, lon: p.lon });

				if (Array.isArray(result)) {
					const [u, v] = result;
					const spd = Math.round(Math.sqrt(u * u + v * v) * 1.944);
					const dir = Math.round((270 - Math.atan2(v, u) * 180 / Math.PI + 360) % 360);

					updateLevel(myId, i, {
						windDir: String(dir),
						windSpd: String(spd),
						loading: false,
						error: false
					});
				} else {
					updateLevel(myId, i, { loading: false, error: true });
				}
			} catch {
				updateLevel(myId, i, { loading: false, error: true });
			}
		}

		if (fetchId === myId) {
			$$invalidate(1, selectedLevel = originalLevel);
			store.set('level', originalLevel);
		}
	}

	function updateLevel(myId, index, update) {
		if (fetchId !== myId || !selectedWpt) return;
		const levels = [...selectedWpt.levels];
		levels[index] = { ...levels[index], ...update };
		$$invalidate(4, selectedWpt = { ...selectedWpt, levels });
	}

	function clearRoute() {
		routeLayer?.remove();
		markers.forEach(m => m.remove());
		routeLayer = null;
		markers = [];
		$$invalidate(2, routeName = '');
		$$invalidate(3, waypointCount = 0);
		$$invalidate(4, selectedWpt = null);
	}

	const onopen = _params => {
		
	};

	onMount(() => {
		
	});

	onDestroy(() => {
		clearRoute();
	});

	const click_handler = () => bcast.emit('rqstOpen', 'menu');
	const click_handler_1 = ov => setOverlay(ov.key);

	function select_change_handler() {
		selectedLevel = select_value(this);
		$$invalidate(1, selectedLevel);
		$$invalidate(9, LEVEL_OPTIONS);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*currentOverlay*/ 1) {
			$$invalidate(5, currentOverlayHasLevel = OVERLAY_OPTIONS.find(o => o.key === currentOverlay)?.hasLevel ?? false);
		}

		if ($$self.$$.dirty[0] & /*selectedLevel*/ 2) {
			LEVEL_OPTIONS.find(l => l.level === selectedLevel);
		}
	};

	return [
		currentOverlay,
		selectedLevel,
		routeName,
		waypointCount,
		selectedWpt,
		currentOverlayHasLevel,
		title,
		OVERLAY_OPTIONS,
		setOverlay,
		LEVEL_OPTIONS,
		onFlChange,
		loadGpx,
		clearRoute,
		onopen,
		click_handler,
		click_handler_1,
		select_change_handler
	];
}

class Plugin extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 13 }, add_css, [-1, -1]);
	}

	get onopen() {
		return this.$$.ctx[13];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, Plugin as default };
//# sourceMappingURL=plugin.js.map
