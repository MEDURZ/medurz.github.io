// Main game default values (these will be overridden on small screens)
let GRID_SIZE = 50;
let CELL_SIZE = 15;
const INTERVAL_TIME = 100;

// Background game constants
const BG_GRID_BASE_SIZE = 120; // Base for background grid cells count
const BG_CELL_BASE_SIZE = 20; // Base size for background cells in pixels
const BG_INTERVAL_TIME = 200;

const gridContainer = document.getElementById('grid-container');
const playPauseBtn = document.getElementById('playPauseBtn');
const clearBtn = document.getElementById('clearBtn');
const brushTool = document.getElementById('brushTool');
const eraserTool = document.getElementById('eraserTool');
const backgroundGridContainer = document.getElementById('background-grid-container');

let grid = []; // Main game grid
let isPlaying = false;
let gameInterval;
let isDrawing = false;
let currentTool = 'brush'; // 'brush' or 'eraser'

let bgGrid = []; // Background game grid
let bgGameInterval;
let bgCols, bgRows; // To store calculated background grid dimensions


// --- Helper to calculate optimal grid size for main game ---
function calculateMainGridDimensions() {
    const minCellSize = 12; // Minimum cell size on small screens
    const maxCellSize = 15; // Max cell size on larger screens
    const margin = 20; // Total horizontal margin on the page

    const availableWidth = window.innerWidth - margin;
    const availableHeight = window.innerHeight - (gridContainer.offsetTop * 2 + 100); // Rough estimate for controls/title height

    // Prioritize making the grid fit horizontally on small screens
    let newCellSize = Math.max(minCellSize, Math.floor(availableWidth / 30)); // Start with a decent cell count
    newCellSize = Math.min(newCellSize, maxCellSize); // Don't let cells get too big

    let newGridSize = Math.floor(availableWidth / newCellSize);
    newGridSize = Math.min(newGridSize, Math.floor(availableHeight / newCellSize)); // Also consider height
    newGridSize = Math.min(newGridSize, 70); // Max grid size to prevent performance issues
    newGridSize = Math.max(newGridSize, 37); // Min grid size

    CELL_SIZE = newCellSize;
    GRID_SIZE = newGridSize;

    console.log(`Main Grid: CELL_SIZE=${CELL_SIZE}, GRID_SIZE=${GRID_SIZE}`);
}


// --- Main Game of Life Functions ---

function initializeGrid() {
    // Clear existing cells if resizing
    gridContainer.innerHTML = '';
    // Re-calculate dimensions on init and resize
    calculateMainGridDimensions();

    gridContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`;
    // Using CSS for width/height with max-width/height is better for responsiveness
    // and let the grid-container fill its available space within max-width rules.
    // gridContainer.style.width = `${GRID_SIZE * CELL_SIZE + GRID_SIZE * 2}px`;
    // gridContainer.style.height = `${GRID_SIZE * CELL_SIZE + GRID_SIZE * 2}px`;

    grid = []; // Reset grid array
    for (let r = 0; r < GRID_SIZE; r++) {
        grid[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('mousedown', handleCellInteraction);
            cell.addEventListener('mouseover', handleCellInteraction);
            gridContainer.appendChild(cell);
            grid[r][c] = 0;
        }
    }
    updateGridDisplay(); // Ensure display is updated after initialization
}

function handleCellInteraction(event) {
    // Only allow drawing if not playing to prevent accidental changes
    if (isPlaying) return;

    if (event.type === 'mousedown') {
        isDrawing = true;
        toggleCell(event.target, grid, 'alive');
    } else if (event.type === 'mouseover' && isDrawing) {
        toggleCell(event.target, grid, 'alive');
    }
}

document.addEventListener('mouseup', () => {
    isDrawing = false;
});

function toggleCell(cellElement, targetGrid, aliveClass) {
    const r = parseInt(cellElement.dataset.row);
    const c = parseInt(cellElement.dataset.col);

    // Check if r or c are NaN, which can happen if cellElement is not a cell
    if (isNaN(r) || isNaN(c)) return;

    if (currentTool === 'brush') {
        if (targetGrid[r][c] === 0) {
            targetGrid[r][c] = 1;
            cellElement.classList.add(aliveClass);
        }
    } else { // eraser
        if (targetGrid[r][c] === 1) {
            targetGrid[r][c] = 0;
            cellElement.classList.remove(aliveClass);
        }
    }
}

function updateGridDisplay() {
    const cells = gridContainer.children;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const index = r * GRID_SIZE + c;
            if (cells[index]) { // Ensure cell exists before trying to update
                if (grid[r][c] === 1) {
                    cells[index].classList.add('alive');
                } else {
                    cells[index].classList.remove('alive');
                }
            }
        }
    }
}

function getNeighborCount(r, c, currentGrid, size) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const neighborR = r + i;
            const neighborC = c + j;

            if (neighborR >= 0 && neighborR < size &&
                neighborC >= 0 && neighborC < size &&
                currentGrid[neighborR][neighborC] === 1) {
                count++;
            }
        }
    }
    return count;
}

function nextGeneration(currentGrid, size) {
    const newGrid = Array.from({ length: size }, () => Array(size).fill(0));

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const neighbors = getNeighborCount(r, c, currentGrid, size);
            const currentState = currentGrid[r][c];

            if (currentState === 1) {
                if (neighbors === 2 || neighbors === 3) {
                    newGrid[r][c] = 1;
                }
            } else {
                if (neighbors === 3) {
                    newGrid[r][c] = 1;
                }
            }
        }
    }
    return newGrid;
}

function startGame() {
    if (isPlaying) return; // Prevent multiple intervals
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
    gameInterval = setInterval(() => {
        grid = nextGeneration(grid, GRID_SIZE);
        updateGridDisplay();
    }, INTERVAL_TIME);
}

function pauseGame() {
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
    clearInterval(gameInterval);
}


// --- Background Game of Life Functions ---

// --- Background Game of Life Functions ---

function initializeBackgroundGrid() {
    backgroundGridContainer.style.gridTemplateColumns = `repeat(${BG_GRID_BASE_SIZE}, ${BG_CELL_BASE_SIZE}px)`;
    backgroundGridContainer.style.gridTemplateRows = `repeat(${BG_GRID_BASE_SIZE}, ${BG_CELL_BASE_SIZE}px)`;

    // Calculate how many cells fit to cover the screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cols = Math.ceil(viewportWidth / BG_CELL_BASE_SIZE);
    const rows = Math.ceil(viewportHeight / BG_CELL_BASE_SIZE);

    // Adjust BG_GRID_BASE_SIZE dynamically if needed, or keep it fixed and let CSS handle overflow
    // For simplicity, we'll use the fixed BG_GRID_BASE_SIZE and let CSS handle visual overflow.

    for (let r = 0; r < BG_GRID_BASE_SIZE; r++) {
        bgGrid[r] = [];
        for (let c = 0; c < BG_GRID_BASE_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('bg-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            backgroundGridContainer.appendChild(cell);
            // Randomly set some cells to alive for the initial pattern
            bgGrid[r][c] = Math.random() > 0.7 ? 1 : 0;
        }
    }
    updateBackgroundGridDisplay();
    startBackgroundGame();
}

function updateBackgroundGridDisplay() {
    const cells = backgroundGridContainer.children;
    for (let r = 0; r < BG_GRID_BASE_SIZE; r++) {
        for (let c = 0; c < BG_GRID_BASE_SIZE; c++) {
            const index = r * BG_GRID_BASE_SIZE + c;
            if (bgGrid[r][c] === 1) {
                cells[index].classList.add('alive');
            } else {
                cells[index].classList.remove('alive');
            }
        }
    }
}

function startBackgroundGame() {
    bgGameInterval = setInterval(() => {
        bgGrid = nextGeneration(bgGrid, BG_GRID_BASE_SIZE);
        updateBackgroundGridDisplay();
    }, BG_INTERVAL_TIME);
}


// --- Event Listeners ---

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseGame();
    } else {
        startGame();
    }
});

clearBtn.addEventListener('click', () => {
    pauseGame();
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    updateGridDisplay();
});

brushTool.addEventListener('click', () => {
    currentTool = 'brush';
    brushTool.classList.add('active');
    eraserTool.classList.remove('active');
});

eraserTool.addEventListener('click', () => {
    currentTool = 'eraser';
    eraserTool.classList.add('active');
    brushTool.classList.remove('active');
});

// --- Handle Window Resizing ---
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        pauseGame(); // Pause main game on resize
        initializeGrid(); // Re-initialize main grid with new dimensions
        initializeBackgroundGrid(); // Re-initialize background grid
    }, 250); // Debounce resize events
});

// --- Initialization ---
initializeGrid();
initializeBackgroundGrid();