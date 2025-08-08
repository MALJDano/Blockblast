const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const blockContainer = document.getElementById("block-container");

const boardSize = 10;
let score = 0;
let grid = [];
let cellColors = []; // store colors of placed blocks
let shapesInPlay = [];
let currentPreview = [];

const SHAPES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1]],
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]]
];

const COLORS = ['#ff5722', '#4caf50', '#9c27b0', '#ffc107', '#00bcd4', '#e91e63'];

function createBoard() {
  grid = [];
  cellColors = [];
  board.innerHTML = '';
  for (let y = 0; y < boardSize; y++) {
    grid[y] = [];
    cellColors[y] = [];
    for (let x = 0; x < boardSize; x++) {
      grid[y][x] = 0;
      cellColors[y][x] = null;

      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = y;
      cell.dataset.col = x;
      board.appendChild(cell);
    }
  }
}

function updateBoardUI() {
  document.querySelectorAll("#game-board .cell").forEach(cell => {
    const y = parseInt(cell.dataset.row);
    const x = parseInt(cell.dataset.col);
    if (grid[y][x] === 1) {
      cell.classList.add("filled");
      cell.style.backgroundColor = cellColors[y][x];
    } else {
      cell.classList.remove("filled");
      cell.style.backgroundColor = '';
    }
  });
}

function generateBlocks() {
  blockContainer.innerHTML = '';
  shapesInPlay = [];

  while (shapesInPlay.length < 3) {
    const randShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    shapesInPlay.push({ shape: randShape, color });
  }

  shapesInPlay.forEach(({ shape, color }) => {
    const block = document.createElement("div");
    block.classList.add("block");
    block.style.gridTemplateColumns = `repeat(${shape[0].length}, 30px)`;
    block.style.gridTemplateRows = `repeat(${shape.length}, 30px)`;

    shape.forEach(row => {
      row.forEach(val => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        if (val === 1) {
          cell.style.backgroundColor = color;
        }
        block.appendChild(cell);
      });
    });

    block.draggable = true;
    block.dataset.shape = JSON.stringify(shape);
    block.dataset.color = color;

    block.addEventListener("dragstart", e => {
      e.dataTransfer.setData("shape", block.dataset.shape);
      e.dataTransfer.setData("color", block.dataset.color);
    });

    blockContainer.appendChild(block);
  });
}

function canPlaceShape(shape, startX, startY) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (shape[y][x] === 1) {
        const boardY = startY + y;
        const boardX = startX + x;
        if (
          boardY >= boardSize ||
          boardX >= boardSize ||
          grid[boardY][boardX] === 1
        ) return false;
      }
    }
  }
  return true;
}

function placeShape(shape, startX, startY, color) {
  let placedCount = 0;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (shape[y][x] === 1) {
        const gx = startX + x;
        const gy = startY + y;
        grid[gy][gx] = 1;
        cellColors[gy][gx] = color;
        placedCount++;
      }
    }
  }

  score += placedCount;
  checkLines();
  updateBoardUI();
  scoreDisplay.textContent = score;

  const blocks = Array.from(blockContainer.children);
  const used = blocks.find(b => b.dataset.shape === JSON.stringify(shape));
  if (used) used.remove();

  if (blockContainer.children.length === 0) {
    generateBlocks();
  }
}

function checkLines() {
  let linesCleared = 0;
  const popCells = [];

  for (let y = 0; y < boardSize; y++) {
    if (grid[y].every(cell => cell === 1)) {
      linesCleared++;
      for (let x = 0; x < boardSize; x++) {
        grid[y][x] = 0;
        cellColors[y][x] = null;
        popCells.push(`[data-row="${y}"][data-col="${x}"]`);
      }
    }
  }

  for (let x = 0; x < boardSize; x++) {
    let full = true;
    for (let y = 0; y < boardSize; y++) {
      if (grid[y][x] === 0) {
        full = false;
        break;
      }
    }
    if (full) {
      linesCleared++;
      for (let y = 0; y < boardSize; y++) {
        grid[y][x] = 0;
        cellColors[y][x] = null;
        popCells.push(`[data-row="${y}"][data-col="${x}"]`);
      }
    }
  }

  popCells.forEach(selector => {
    const cell = document.querySelector(`#game-board .cell${selector}`);
    if (cell) {
      cell.classList.add("popping");
      setTimeout(() => cell.classList.remove("popping"), 300);
    }
  });

  score += linesCleared * 10;
  scoreDisplay.textContent = score;
}

// Preview logic
board.addEventListener("dragover", e => {
  e.preventDefault();
  clearPreview();

  const shape = JSON.parse(e.dataTransfer.getData("shape"));
  const rect = board.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / 42);
  const y = Math.floor((e.clientY - rect.top) / 42);

  if (canPlaceShape(shape, x, y)) {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          const cell = document.querySelector(
            `.cell[data-row="${y + i}"][data-col="${x + j}"]`
          );
          if (cell) {
            cell.classList.add("preview");
            currentPreview.push(cell);
          }
        }
      }
    }
  }
});

function clearPreview() {
  currentPreview.forEach(cell => cell.classList.remove("preview"));
  currentPreview = [];
}

board.addEventListener("dragleave", clearPreview);
board.addEventListener("drop", e => {
  e.preventDefault();
  clearPreview();

  const shape = JSON.parse(e.dataTransfer.getData("shape"));
  const color = e.dataTransfer.getData("color");

  const rect = board.getBoundingClientRect();
  const offsetX = Math.floor((e.clientX - rect.left) / 42);
  const offsetY = Math.floor((e.clientY - rect.top) / 42);

  if (canPlaceShape(shape, offsetX, offsetY)) {
    placeShape(shape, offsetX, offsetY, color);
  }
});

function resetGame() {
  createBoard();
  generateBlocks();
  score = 0;
  scoreDisplay.textContent = score;
}

createBoard();
generateBlocks();
