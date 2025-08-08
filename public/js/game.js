const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const blockContainer = document.getElementById("block-container");

const boardSize = 10;
let score = 0;
let grid = [];
let shapesInPlay = [];

// Define shape options
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

// Create the game board
function createBoard() {
  grid = [];
  board.innerHTML = '';
  for (let y = 0; y < boardSize; y++) {
    grid[y] = [];
    for (let x = 0; x < boardSize; x++) {
      grid[y][x] = 0;
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = y;
      cell.dataset.col = x;
      board.appendChild(cell);
    }
  }
}

// Update UI board
function updateBoardUI() {
  document.querySelectorAll("#game-board .cell").forEach(cell => {
    const y = parseInt(cell.dataset.row);
    const x = parseInt(cell.dataset.col);
    if (grid[y][x] === 1) {
      cell.classList.add("filled");
    } else {
      cell.classList.remove("filled");
    }
  });
}

// Generate 3 new blocks
function generateBlocks() {
  blockContainer.innerHTML = '';
  shapesInPlay = [];

  while (shapesInPlay.length < 3) {
    const rand = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    shapesInPlay.push(rand);
  }

  shapesInPlay.forEach(shape => {
    const block = document.createElement("div");
    block.classList.add("block");
    block.style.gridTemplateColumns = `repeat(${shape[0].length}, 30px)`;
    block.style.gridTemplateRows = `repeat(${shape.length}, 30px)`;

    shape.forEach(row => {
      row.forEach(val => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        if (val === 1) cell.classList.add("filled");
        block.appendChild(cell);
      });
    });

    block.draggable = true;
    block.dataset.shape = JSON.stringify(shape);
    block.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", JSON.stringify(shape));
    });

    blockContainer.appendChild(block);
  });
}

// Can we place this shape at this location?
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

// Place shape, update score, then check lines
function placeShape(shape, startX, startY) {
  let placedCount = 0;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (shape[y][x] === 1) {
        const gx = startX + x;
        const gy = startY + y;
        grid[gy][gx] = 1;
        placedCount++;
      }
    }
  }

  score += placedCount; // +1 per cell
  checkLines();
  updateBoardUI();
  scoreDisplay.textContent = score;

  // Remove used block from container
  const blocks = Array.from(blockContainer.children);
  const used = blocks.find(b => b.dataset.shape === JSON.stringify(shape));
  if (used) used.remove();

  // If all 3 used, regenerate
  if (blockContainer.children.length === 0) {
    generateBlocks();
  }
}

// Clear full rows or columns
function checkLines() {
  // Rows
  for (let y = 0; y < boardSize; y++) {
    if (grid[y].every(cell => cell === 1)) {
      grid[y] = new Array(boardSize).fill(0);
      score += 10;
    }
  }

  // Columns
  for (let x = 0; x < boardSize; x++) {
    let full = true;
    for (let y = 0; y < boardSize; y++) {
      if (grid[y][x] === 0) {
        full = false;
        break;
      }
    }
    if (full) {
      for (let y = 0; y < boardSize; y++) {
        grid[y][x] = 0;
      }
      score += 10;
    }
  }
}

// Drop logic
board.addEventListener("dragover", e => e.preventDefault());

board.addEventListener("drop", e => {
  e.preventDefault();
  const shape = JSON.parse(e.dataTransfer.getData("text/plain"));
  const rect = board.getBoundingClientRect();
  const offsetX = Math.floor((e.clientX - rect.left) / 42);
  const offsetY = Math.floor((e.clientY - rect.top) / 42);

  if (canPlaceShape(shape, offsetX, offsetY)) {
    placeShape(shape, offsetX, offsetY);
  }
});

// Reset game
function resetGame() {
  createBoard();
  generateBlocks();
  score = 0;
  scoreDisplay.textContent = score;
}

// Init
createBoard();
generateBlocks();
