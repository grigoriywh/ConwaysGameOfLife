/**
 * Основной скрипт для реализации игры «Жизнь»
 * 
 * Скрипт содержит реализацию игры «Жизнь» Джона Хортона Конуэя,
 * а также управление игровым процессом через HTML элементы.
 *
 * @version 1.0.0
 * @license MIT
 */

/**
 * Элемент canvas для отрисовки игры
 * 
 * @var {HTMLCanvasElement}
 */
const canvas = document.getElementById('gameCanvas');

/**
 * Контекст 2D для отрисовки на холсте
 * 
 * @var {CanvasRenderingContext2D}
 */
const ctx = canvas.getContext('2d');

/**
 * Кнопка для запуска игры
 * 
 * @var {HTMLButtonElement}
 */
const startButton = document.getElementById('startButton');

/**
 * Кнопка для остановки игры
 * 
 * @var {HTMLButtonElement}
 */
const stopButton = document.getElementById('stopButton');

/**
 * Ползунок для регулировки скорости игры
 * 
 * @var {HTMLInputElement}
 */
const speedRange = document.getElementById('speedRange');

/**
 * Количество колонок в сетке
 * 
 * @var {number}
 */
const cols = 50;

/**
 * Количество строк в сетке
 * 
 * @var {number}
 */
const rows = 50;

/**
 * Размер ячейки в пикселях
 * 
 * @var {number}
 */
const cellSize = canvas.width / cols;

/**
 * Сетка игры
 * 
 * @var {Array<Array<number>>}
 */
let grid = createGrid(cols, rows);

/**
 * Флаг, указывающий, идет ли игра
 * 
 * @var {boolean}
 */
let isRunning = false;

/**
 * Идентификатор кадров анимации
 * 
 * @var {number}
 */
let animationFrameId;

/**
 * Флаг, указывающий, нажата ли кнопка мыши
 * 
 * @var {boolean}
 */
let isMouseDown = false;

/**
 * Скорость игры в миллисекундах
 * 
 * @var {number}
 */
let speed = 200;

initializeGrid(grid);

startButton.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        gameLoop();
    }
});

stopButton.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
    }
});

speedRange.addEventListener('input', (event) => {
    speed = event.target.value;
});

canvas.addEventListener('mousedown', () => {
    isMouseDown = true;
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / cellSize);
        const y = Math.floor((event.clientY - rect.top) / cellSize);
        grid[x][y] = grid[x][y] ? 0 : 1;
        drawGrid(grid);
    }
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    grid[x][y] = grid[x][y] ? 0 : 1;
    drawGrid(grid);
});

/**
 * Создает пустую сетку для игры
 *
 * @param {number} cols - Количество колонок
 * @param {number} rows - Количество строк
 * @returns {Array<Array<number>>} Созданная сетка
 */
function createGrid(cols, rows) {
    return new Array(cols).fill(null).map(() => new Array(rows).fill(0));
}

/**
 * Инициализирует начальное состояние сетки
 *
 * @param {Array<Array<number>>} grid - Сетка игры
 */
function initializeGrid(grid) {
    // Установка интересной начальной конфигурации (например, "глайдер")
    grid[1][0] = 1;
    grid[2][1] = 1;
    grid[0][2] = 1;
    grid[1][2] = 1;
    grid[2][2] = 1;

    // Добавление "пульсара"
    let pulsarX = 12, pulsarY = 12;
    let pulsar = [
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    ];
    for (let i = 0; i < pulsar.length; i++) {
        for (let j = 0; j < pulsar[i].length; j++) {
            grid[pulsarX + i][pulsarY + j] = pulsar[i][j];
        }
    }
}

/**
 * Отрисовывает сетку на холсте
 *
 * @param {Array<Array<number>>} grid - Сетка игры
 */
function drawGrid(grid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            ctx.beginPath();
            ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[x][y] ? 'white' : 'black';
            ctx.fill();
            ctx.strokeStyle = 'gray';
            ctx.stroke();
        }
    }
}

/**
 * Обновляет состояние сетки
 *
 * @param {Array<Array<number>>} grid - Сетка игры
 * @returns {Array<Array<number>>} Обновленная сетка
 */
function updateGrid(grid) {
    const newGrid = grid.map(arr => [...arr]);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const state = grid[x][y];
            const neighbors = countNeighbors(grid, x, y);

            if (state === 0 && neighbors === 3) {
                newGrid[x][y] = 1;
            } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                newGrid[x][y] = 0;
            }
        }
    }
    return newGrid;
}

/**
 * Подсчитывает количество соседей у ячейки
 *
 * @param {Array<Array<number>>} grid - Сетка игры
 * @param {number} x - Координата X ячейки
 * @param {number} y - Координата Y ячейки
 * @returns {number} Количество соседей
 */
function countNeighbors(grid, x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            const col = (x + i + cols) % cols;
            const row = (y + j + rows) % rows;
            sum += grid[col][row];
        }
    }
    sum -= grid[x][y];
    return sum;
}

/**
 * Игровой цикл
 */
function gameLoop() {
    grid = updateGrid(grid);
    drawGrid(grid);
    setTimeout(() => {
        if (isRunning) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }, speed); // Используем переменную скорости
}

drawGrid(grid);
