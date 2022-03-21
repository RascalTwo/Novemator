const MINIMUM_NUMBER = -10
const MAXIMUM_NUMBER = 10;

const OPERATIONS = {
	'+': (a, b) => a + b,
	'/': (a, b) => a / b,
	'-': (a, b) => a - b,
	'x': (a, b) => a * b
}

const operatorLabels = {
	'+': 'Add',
	'/': 'Divide',
	'-': 'Subtract',
	'x': 'Multiply'
}


const currentElement = document.querySelector('#current');
const targetElement = document.querySelector('#target');
const hintElement = document.querySelector('#hint');
const titleElement = document.querySelector('h1');
const gamePad = document.querySelector('#keypad')
const difficultyPad = document.querySelector('#difficulty')
difficultyPad.querySelectorAll('button').forEach((button, i) => button.addEventListener('click', startGame.bind(null, i + 1)));

const [buttons, buttonPool, clearButton, shuffleButton] = (() => {
	const keypadButtons = Array.from(document.querySelectorAll('#keypad button'))
	return [keypadButtons, keypadButtons.slice(0, -2), keypadButtons.at(-2), keypadButtons.at(-1)]
})();

function generateRandomizer(seed) {
	function sfc32(a, b, c, d) {
		return function () {
			a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
			var t = (a + b) | 0;
			a = b ^ b >>> 9;
			b = c + (c << 3) | 0;
			c = (c << 21 | c >>> 11);
			d = d + 1 | 0;
			t = t + d | 0;
			c = c + t | 0;
			return (t >>> 0) / 4294967296;
		}
	}
	return sfc32(seed, seed, seed, seed)
}

function fisherYates(array) {
	let currentIndex = array.length
	let randomIndex;

	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}


function ordinalSuffix(number) {
	switch (Math.abs(number)) {
		case 0:
			return 'th';
		case 1:
			return 'st'
		case 2:
			return 'nd'
		case 3:
			return 'rd'
		default:
			return 'th'
	}
}

const generateRandomOperatorAndNumber = random => [
	['+', 'x', '/', '-'][Math.floor(random() * 4)],
	Math.floor((random() * (MAXIMUM_NUMBER - MINIMUM_NUMBER + 1)) + MINIMUM_NUMBER)
];


function startGame(difficulty) {
	difficultyPad.classList.add('hidden');
	gamePad.classList.remove('hidden');

	const today = Math.trunc(Date.now() / 86400000) * 86400000;
	const random = generateRandomizer(today);

	let worker;
	let nth = 0;
	let started = 0;
	let target = [0, []];
	let pressed = [];

	function renderButton(button) {
		button.children[0].textContent = button.dataset.operator
		button.children[0].setAttribute('aria-label', operatorLabels[button.dataset.operator])
		button.children[1].textContent = button.dataset.number
		button.removeAttribute('disabled')
		button.classList.toggle('fade-operator', pressed.length === 0)
	}

	function endGame(won) {
		if (won) {
			hint(`You won in ${((Date.now() - started) / 1000).toFixed(2)}s, with ${pressed.length} presses!\n\n${generatePressedText(pressed)}`)
		} else {
			hint(`You could not calculate the number in ${pressed.length} presses...`)
		}

		buttonPool.forEach(button => button.disabled = 'true');
	}

	function shuffle() {
		hint(``);
		pressed = []
		nth++;
		started = Date.now();
		titleElement.textContent = `${new Date(today).toLocaleDateString()}: Difficulty ${difficulty}, ${nth}${ordinalSuffix(nth)} Variation`

		currentElement.textContent = '';
		let buttonValues = [];
		while (true) {
			buttonValues = new Array(9).fill().map(() => generateRandomOperatorAndNumber(random))
			if (new Set(buttonValues.map(pair => pair.join(' '))).size === 9 && buttonValues.every(([_, number]) => number)) break
		}
		buttonPool.forEach(button => {
			[button.dataset.operator, button.dataset.number] = buttonValues.pop();
			button.setAttribute('aria-label', button.dataset.number)
		});
		buttonPool.forEach(renderButton);
		const animOffsets = fisherYates(new Array(9).fill().map((_, i) => i));
		buttonPool.forEach((button) => button.style.setProperty('--anim-delay', animOffsets.pop() * 100))
		buttons.forEach(button => button.disabled = 'true');
		targetElement.textContent = 'Calculating...'
		worker = new Worker('js/worker.js');
		worker.postMessage({
			difficulty,
			values: buttonPool.map(button => [button.dataset.operator, +button.dataset.number])
		})
		worker.addEventListener('message', ({ data: { value, options, reshuffle } }) => {
			if (reshuffle) return shuffle();
			target = [value, options]
			console.log({ value, options })
			targetElement.textContent = target[0];
			hint('Choose the number to start off your calculations with!')
			buttons.forEach(button => button.removeAttribute('disabled'));
		})
	}
	shuffle();
	shuffleButton.addEventListener('click', shuffle);

	function hint(message) {
		hintElement.innerHTML = message ?? 'Choose an operator and number combination to get your value to the target!';
	}

	function handlePress({ currentTarget }) {
		hint();
		currentTarget.disabled = 'true';
		pressed.push(currentTarget);
		if (pressed.length === 1) {
			buttonPool.forEach(button => {
				button.classList.remove('fade-operator');
				button.setAttribute('aria-label', `${operatorLabels[button.dataset.operator]} ${button.dataset.number}`);
			});
			currentElement.textContent = currentTarget.dataset.number;
		} else {
			const { operator, number } = currentTarget.dataset;
			const newValue = OPERATIONS[operator](+currentElement.textContent, +number)
			if (!Number.isInteger(newValue)) {
				pressed.pop();
				currentTarget.removeAttribute('disabled');
				return hint('This state-of-the-art calculator does not support floating point numbers...')
			}
			currentElement.textContent = newValue
		}
		if (pressed.length === difficulty) endGame(false)
		if (currentElement.textContent == targetElement.textContent) return endGame(true)
		if (pressed.length === 9) return hint('You can press the Clear button at any time to reset')
	}
	buttonPool.forEach(button => button.addEventListener('click', handlePress));

	clearButton.addEventListener('click', () => {
		hint('Choose the number to start off your calculations with!');
		currentElement.textContent = '';
		pressed = [];
		buttonPool.forEach(renderButton);
	});
}

function generatePressedText(pressed) {
	const digits = {
		'0': '1️⃣',
		'1': '2️⃣',
		'2': '3️⃣',
		'3': '4️⃣',
		'4': '5️⃣',
		'5': '6️⃣',
		'6': '7️⃣',
		'7': '8️⃣',
		'8': '9️⃣'
	}
	const c = new Array(9).fill().map((_, i) => digits[pressed.indexOf(buttonPool[i])] ?? '⬛').reverse()

	return `
<br/>
<div id="emoji-results">
	${c.pop()}${c.pop()}${c.pop()}
	<br/>
	${c.pop()}${c.pop()}${c.pop()}
	<br/>
	${c.pop()}${c.pop()}${c.pop()}
</div>
	`.trim()
}