
const OPERATIONS = {
	'+': (a, b) => a + b,
	'/': (a, b) => a / b,
	'-': (a, b) => a - b,
	'x': (a, b) => a * b
}
function buildPermutations(inputArr) {
	const result = [];

	function permute(arr, m = []) {
		if (arr.length === 0) {
			result.push(m);
		} else {
			for (let i = 0; i < arr.length; i++) {
				let curr = arr.slice();
				let next = curr.splice(i, 1);
				permute(curr.slice(), m.concat(next));
			}
		}
	}
	permute(inputArr);

	return result;
}

function trieToArrays(node) {
	const results = []
	for (const key of node.keys()) {
		const moreResults = trieToArrays(node.get(key))
		results.push(...(moreResults.length ? moreResults.map(mr => [key, ...mr]) : [[key]]))
	}
	return results
}

function addToMapTrie(node, [key, ...remaining]) {
	if (key === undefined) return;
	if (!node.has(key)) node.set(key, new Map())
	return addToMapTrie(node.get(key), remaining)
}

function calculateAllValues(values) {
	const resultMap = new Map()
	for (let permutation of buildPermutations(values)) {
		let stack = Array.from(permutation)
		let pressed = 1;
		let value = stack.shift()[1]
		const prevValues = []
		while (stack.length) {
			prevValues.push(value)
			let [operator, number] = stack[0]
			let oldValue = value;
			value = OPERATIONS[operator](value, number)
			if (value % 1) {
				prevValues.pop()
				value = oldValue;
				break;
			}
			stack.shift()
			pressed += 1
			if (!prevValues.includes(value)) {
				if (!resultMap.has(value)) resultMap.set(value, new Map())
				if (stack.length) {
					addToMapTrie(resultMap.get(value), permutation.slice(0, -stack.length))
				}
			}
		}
		if (!prevValues.includes(value)) {
			if (stack.length) {
				permutation = permutation.slice(0, -stack.length);
			}
			if (!resultMap.has(value)) resultMap.set(value, new Map())
			addToMapTrie(resultMap.get(value), permutation)
		}
	}
	return resultMap;
}

self.addEventListener('message', ({ data: { difficulty, values } }) => {
	const seenDifficulties = new Set();

	const allOptions = [];
	for (const [value, trie] of Array.from(calculateAllValues(values)
		.entries())) {
		for (const option of trieToArrays(trie)) {
			if (option.length === difficulty) allOptions.push({ value, option })
			seenDifficulties.add(option.length)
		}
	}
	if (seenDifficulties.size !== 9) return self.postMessage({ reshuffle: true });

	const counts = allOptions.reduce((counts, { value, option }) => ({ ...counts, [value]: [...(counts[value] ?? []), option] }), {})
	const [ value, options ] = Object.entries(counts).reduce((least, [value, options]) => {
		if (least[1].length < options.length) return least
		return [value, options]
	})
	self.postMessage({ value, options });
})