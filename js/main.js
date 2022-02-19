const OPS = {
  '+': (a, b) => a + b,
  '÷': (a, b) => a / b,
  '-': (a, b) => a - b,
  '%': (a, b) => a % b,
  '×': (a, b) => a * b
}
let total = 0



const buttons = Array.from(document.querySelectorAll('button'));
const result = document.querySelector('#result');

const buttonPool = buttons.slice(0, -2);
const clearButton = buttons.at(-2);
const shuffleButton = buttons.at(-1);

const generateRandomButton = () => ['÷', '+', '×', '-', '%'][Math.floor(Math.random() * 5)] + ' ' + ((Math.random() * 20) - 10).toFixed(0);


function shuffle(){
  buttonPool.forEach(b => b.textContent = generateRandomButton());
}
shuffle();
shuffleButton.addEventListener('click', shuffle);


function handleChange({ currentTarget }){
  const [symbol, change] = currentTarget.textContent.split(' ')
  result.textContent = OPS[symbol](Number(result.textContent), Number(change)).toFixed(4)
}
buttonPool.forEach(b => b.addEventListener('click', handleChange));
clearButton.addEventListener('click', () => result.textContent = '0');
