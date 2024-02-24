import { DEV } from 'esm-env';
import { CLEAN, DERIVED, UNINITIALIZED, UNOWNED } from '../constants.js';
import { current_consumer, current_effect } from '../runtime.js';
import { default_equals, safe_equal } from './equality.js';

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('#client').Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	let flags = DERIVED | CLEAN;
	if (current_effect === null) flags |= UNOWNED;

	/** @type {import('#client').Derived<V>} */
	const signal = {
		consumers: null,
		deps: null,
		eq: default_equals,
		f: flags,
		fn: fn,
		// @ts-expect-error
		v: UNINITIALIZED,
		w: 0,
		parent: current_effect
	};

	if (DEV) {
		// @ts-expect-error
		signal.inspect = new Set();
	}

	if (current_consumer !== null) {
		const effect = /** @type {import('#client').Effect} */ (current_consumer);
		if (effect.r === null) {
			effect.r = [signal];
		} else {
			effect.r.push(signal);
		}
	}

	return signal;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('#client').Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.eq = safe_equal;
	return signal;
}
