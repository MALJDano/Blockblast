// DOM
const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const blockContainer = document.getElementById("block-container");

// Game state
const boardSize = 10;
let score = 0;
let grid = [];        // 0/1 occupancy
let cellColors = [];  // color per cell when occupied
let shapesInPlay = []; // [{shape, color}, ...] (length 3)
let currentPreview = []; // cells highlighted during preview
let isGameOver = false;

// Shapes & colors
const SHAPES = [
  [[1]],
  [[1,1]],
  [[1],[1]],
  [[1,1],[1,1]],
  [[1,1,1]],
  [[1,0],[1,1]],
  [[0,1],[1,1]],
  [[1],[1],[1]],
  [[1,1,1,1]]
];
const COLORS = ['#ff5722','#4caf50','#9c27b0','#ffc107','#00bcd4','#e91e63','#26c6da','#ab47bc'];

// ---------- Init & UI ----------
function createBoard() {
  grid = []; cellColors = []; board.innerHTML = '';
  for (let y=0; y<boardSize; y++){
    grid[y] = []; cellColors[y] = [];
    for (let x=0; x<boardSize; x++){
      grid[y][x] = 0; cellColors[y][x] = null;
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = y; cell.dataset.col = x;
      board.appendChild(cell);
    }
  }
  updateBoardUI();
}

function updateBoardUI() {
  document.querySelectorAll("#game-board .cell").forEach(cell => {
    const y = +cell.dataset.row, x = +cell.dataset.col;
    if (grid[y][x] === 1) {
      cell.classList.add("filled");
      cell.style.backgroundColor = cellColors[y][x];
    } else {
      cell.classList.remove("filled");
      cell.style.backgroundColor = "#3a3a3a";
    }
  });
}

// ---------- Blocks sidebar (3 at a time) ----------
function generateBlocks() {
  blockContainer.innerHTML = ''; shapesInPlay = [];
  while (shapesInPlay.length < 3) {
    const shape = SHAPES[Math.floor(Math.random()*SHAPES.length)];
    const color = COLORS[Math.floor(Math.random()*COLORS.length)];
    shapesInPlay.push({shape, color});
  }

  shapesInPlay.forEach(({shape,color})=>{
    const block = document.createElement("div");
    block.className = "block";
    block.style.gridTemplateColumns = `repeat(${shape[0].length}, 30px)`;
    block.style.gridTemplateRows = `repeat(${shape.length}, 30px)`;
    // tiles
    shape.forEach(r=>r.forEach(v=>{
      const c = document.createElement("div");
      c.className = "cell";
      if (v === 1) c.style.background = color;
      block.appendChild(c);
    }));
    // dnd
    block.draggable = true;
    block.dataset.shape = JSON.stringify(shape);
    block.dataset.color = color;
    block.addEventListener("dragstart", e=>{
      if (isGameOver) { e.preventDefault(); return; }
      e.dataTransfer.setData("shape", block.dataset.shape);
      e.dataTransfer.setData("color", block.dataset.color);
    });
    blockContainer.appendChild(block);
  });

  // If immediately no moves, end game
  checkGameOver();
}

// ---------- Placement helpers ----------
function canPlaceShape(shape, startX, startY) {
  for (let y=0; y<shape.length; y++){
    for (let x=0; x<shape[0].length; x++){
      if (shape[y][x] !== 1) continue;
      const gx = startX + x, gy = startY + y;
      if (gx < 0 || gy < 0 || gx >= boardSize || gy >= boardSize) return false;
      if (grid[gy][gx] === 1) return false;
    }
  }
  return true;
}

// Place + score + line clearing + check game over
function placeShape(shape, startX, startY, color) {
  if (isGameOver) return;

  // write cells
  let placedCount = 0;
  for (let y=0; y<shape.length; y++){
    for (let x=0; x<shape[0].length; x++){
      if (shape[y][x] === 1) {
        const gx = startX + x, gy = startY + y;
        grid[gy][gx] = 1; cellColors[gy][gx] = color; placedCount++;
      }
    }
  }
  score += placedCount;

  // clear lines simultaneously
  const {linesCleared} = clearFullLinesSimultaneously();

  // refresh UI & score
  updateBoardUI();
  score += linesCleared * 10;
  scoreDisplay.textContent = score;

  // remove used block (match by shape+color to avoid duplicates)
  const blocks = Array.from(blockContainer.children);
  const idx = blocks.findIndex(b => b.dataset.shape === JSON.stringify(shape) && b.dataset.color === color);
  if (idx !== -1) blocks[idx].remove();

  // if no blocks left, refill
  if (blockContainer.children.length === 0) generateBlocks();

  // check game over right after a move too (important!)
  checkGameOver();
}

// Collect full rows+cols, then clear together in one pass
function clearFullLinesSimultaneously() {
  const fullRows = [];
  const fullCols = [];
  // rows
  for (let y=0; y<boardSize; y++){
    if (grid[y].every(v=>v===1)) fullRows.push(y);
  }
  // cols
  for (let x=0; x<boardSize; x++){
    let full = true;
    for (let y=0; y<boardSize; y++){ if (grid[y][x] === 0) { full=false; break; } }
    if (full) fullCols.push(x);
  }

  if (fullRows.length === 0 && fullCols.length === 0) return {linesCleared: 0};

  // mark all cells to clear (avoid double work) & animate pop together
  const toClear = Array.from({length: boardSize}, ()=>Array(boardSize).fill(false));
  fullRows.forEach(y => { for (let x=0; x<boardSize; x++) toClear[y][x] = true; });
  fullCols.forEach(x => { for (let y=0; y<boardSize; y++) toClear[y][x] = true; });

  // animate pop
  for (let y=0; y<boardSize; y++){
    for (let x=0; x<boardSize; x++){
      if (!toClear[y][x]) continue;
      const el = document.querySelector(`.cell[data-row="${y}"][data-col="${x}"]`);
      if (el) { el.classList.add('pop'); setTimeout(()=>el.classList.remove('pop'), 280); }
    }
  }

  // actually clear after a tick (so animation starts)
  setTimeout(()=>{
    for (let y=0; y<boardSize; y++){
      for (let x=0; x<boardSize; x++){
        if (!toClear[y][x]) continue;
        grid[y][x] = 0; cellColors[y][x] = null;
      }
    }
    updateBoardUI();
  }, 120);

  return {linesCleared: fullRows.length + fullCols.length};
}

// ---------- Game Over & Leaderboard ----------
function hasValidMoves() {
  // Try every (shape, position) pair
  return shapesInPlay.some(({shape})=>{
    for (let y=0; y<boardSize; y++){
      for (let x=0; x<boardSize; x++){
        if (canPlaceShape(shape, x, y)) return true;
      }
    }
    return false;
  });
}

function checkGameOver() {
  if (isGameOver) return;
  // If no blocks in play yet, it's not game over
  if (shapesInPlay.length === 0) return;

  if (!hasValidMoves()) {
    isGameOver = true;
    // disable dragging any remaining blocks
    Array.from(blockContainer.children).forEach(b => b.draggable = false);
    // show modal
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-modal').classList.remove('hidden');
  }
}

function submitScore() {
  const name = (document.getElementById('player-name').value || "Anonymous").trim();
  const entry = { name, score, ts: Date.now() };

  const scores = JSON.parse(localStorage.getItem('blockblast_scores') || '[]');
  scores.push(entry);
  scores.sort((a,b)=> b.score - a.score || a.ts - b.ts);
  localStorage.setItem('blockblast_scores', JSON.stringify(scores.slice(0, 10)));

  openLeaderboard();
  document.getElementById('game-over-modal').classList.add('hidden');
}

function openLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  const scores = JSON.parse(localStorage.getItem('blockblast_scores') || '[]');
  scores.forEach(s=>{
    const li = document.createElement('li');
    li.textContent = `${s.name} — ${s.score}`;
    list.appendChild(li);
  });
  document.getElementById('leaderboard').classList.remove('hidden');
}
function closeLeaderboard(){ document.getElementById('leaderboard').classList.add('hidden'); }

function restartGame() { document.getElementById('game-over-modal').classList.add('hidden'); resetGame(); }
function resetGame() {
  isGameOver = false;
  score = 0; scoreDisplay.textContent = score;
  createBoard(); generateBlocks();
}

// ---------- Drag Preview & Drop ----------
board.addEventListener('dragover', (e)=>{
  if (isGameOver) return;
  e.preventDefault(); clearPreview();

  const shapeStr = e.dataTransfer.getData("shape");
  if (!shapeStr) return;
  const shape = JSON.parse(shapeStr);

  const rect = board.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / 42); // 40px + 2px gap
  const y = Math.floor((e.clientY - rect.top) / 42);

  if (!canPlaceShape(shape, x, y)) return;

  for (let i=0; i<shape.length; i++){
    for (let j=0; j<shape[i].length; j++){
      if (shape[i][j] !== 1) continue;
      const cell = document.querySelector(`.cell[data-row="${y+i}"][data-col="${x+j}"]`);
      if (cell) { cell.classList.add('preview'); currentPreview.push(cell); }
    }
  }
});

board.addEventListener('dragleave', clearPreview);
function clearPreview(){ currentPreview.forEach(c=>c.classList.remove('preview')); currentPreview = []; }

board.addEventListener('drop', (e)=>{
  if (isGameOver) return;
  e.preventDefault(); clearPreview();

  const shapeStr = e.dataTransfer.getData("shape");
  const color = e.dataTransfer.getData("color");
  if (!shapeStr) return;

  const shape = JSON.parse(shapeStr);
  const rect = board.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / 42);
  const y = Math.floor((e.clientY - rect.top) / 42);
  if (canPlaceShape(shape, x, y)) placeShape(shape, x, y, color);
});

// ---------- Boot ----------
createBoard();
generateBlocks();
scoreDisplay.textContent = score;

// expose for buttons
window.resetGame = resetGame;
window.restartGame = restartGame;
window.submitScore = submitScore;
window.openLeaderboard = openLeaderboard;
window.closeLeaderboard = closeLeaderboard;
