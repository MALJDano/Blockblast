const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
let score = 0;
const boardSize = 10;
let grid = [];

// Initialize board
function createBoard() {
    grid = [];
    board.innerHTML = '';
    for (let y = 0; y < boardSize; y++) {
        let row = [];
        for (let x = 0; x < boardSize; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = y;
            cell.dataset.col = x;
            board.appendChild(cell);
            row.push(0);
        }
        grid.push(row);
    }
}

// Create sample blocks
function generateBlocks() {
    const container = document.getElementById("block-container");
    container.innerHTML = '';

    const shapes = [
        [[1]],
        [[1, 1]],
        [[1], [1]],
        [[1, 1, 1]],
        [[1, 1], [1, 1]],
        [[1, 0], [1, 1]]
    ];

    for (let shape of shapes) {
        const block = document.createElement("div");
        block.classList.add("block");
        block.style.gridTemplateColumns = `repeat(${shape[0].length}, 40px)`;
        block.style.gridTemplateRows = `repeat(${shape.length}, 40px)`;

        for (let row of shape) {
            for (let cellVal of row) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                if (cellVal === 1) {
                    cell.classList.add("filled");
                }
                block.appendChild(cell);
            }
        }

        block.draggable = true;
        block.ondragstart = e => {
            e.dataTransfer.setData("text/plain", JSON.stringify(shape));
        };

        container.appendChild(block);
    }
}

// Allow drop on grid
board.ondragover = e => e.preventDefault();
board.ondrop = e => {
    const shape = JSON.parse(e.dataTransfer.getData("text/plain"));
    const rect = board.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 42); // 40px cell + 2px gap
    const y = Math.floor((e.clientY - rect.top) / 42);

    if (canPlaceShape(shape, x, y)) {
        placeShape(shape, x, y);
        checkLines();
        updateBoardUI();
        generateBlocks();
    }
};

// Can shape fit?
function canPlaceShape(shape, startX, startY) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
                let x = startX + j;
                let y = startY + i;
                if (x >= boardSize || y >= boardSize || grid[y][x] === 1) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Place the shape on the grid
function placeShape(shape, startX, startY) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
                let x = startX + j;
                let y = startY + i;
                grid[y][x] = 1;
            }
        }
    }
    score += shape.flat().filter(x => x === 1).length;
    scoreDisplay.textContent = score;
}

// Clear full lines
function checkLines() {
    for (let i = 0; i < boardSize; i++) {
        if (grid[i].every(cell => cell === 1)) {
            grid[i] = Array(boardSize).fill(0);
            score += 10;
        }
    }

    for (let col = 0; col < boardSize; col++) {
        let full = true;
        for (let row = 0; row < boardSize; row++) {
            if (grid[row][col] === 0) {
                full = false;
                break;
            }
        }
        if (full) {
            for (let row = 0; row < boardSize; row++) {
                grid[row][col] = 0;
            }
            score += 10;
        }
    }
    scoreDisplay.textContent = score;
}

// Update the visual board
function updateBoardUI() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        const x = parseInt(cell.dataset.col);
        const y = parseInt(cell.dataset.row);
        if (grid[y][x] === 1) {
            cell.classList.add("filled");
        }
    });
}

createBoard();
generateBlocks();
