class GensynCrossword {
    constructor() {
        this.gridSize = { rows: 13, cols: 16 };
        this.currentCell = null;
        this.currentWord = null;
        this.answers = {
            1: 'GENSYN',      // down
            2: 'MODERATORS',  // across
            3: 'AI',          // across
            4: 'NODES',       // down
            5: 'MODS',        // across
            6: 'VERIFICATION', // across
            7: 'VALIDATOR'    // down
        };

        this.wordPositions = {
            1: { start: [1, 6], direction: 'down', length: 6 },      // GENSYN
            2: { start: [5, 0], direction: 'across', length: 10 },   // MODERATORS
            3: { start: [8, 6], direction: 'across', length: 2 },    // AI
            4: { start: [0, 3], direction: 'down', length: 5 },      // NODES
            5: { start: [4, 0], direction: 'across', length: 4 },    // MODS
            6: { start: [10, 0], direction: 'across', length: 12 },  // VERIFICATION
            7: { start: [0, 12], direction: 'down', length: 9 }      // VALIDATOR
        };

        this.grid = this.initializeGrid();
        this.createGrid();
        this.setupEventListeners();
    }

    initializeGrid() {
        const grid = Array(this.gridSize.rows).fill().map(() =>
            Array(this.gridSize.cols).fill(null)
        );

        // Mark cells that should contain letters
        for (const [wordNum, pos] of Object.entries(this.wordPositions)) {
            const { start, direction, length } = pos;
            const [row, col] = start;

            for (let i = 0; i < length; i++) {
                const currentRow = direction === 'down' ? row + i : row;
                const currentCol = direction === 'across' ? col + i : col;

                if (currentRow < this.gridSize.rows && currentCol < this.gridSize.cols) {
                    grid[currentRow][currentCol] = {
                        letter: '',
                        wordNumber: parseInt(wordNum),
                        position: i,
                        direction: direction
                    };
                }
            }
        }

        return grid;
    }

    createGrid() {
        const container = document.getElementById('crossword');
        container.style.gridTemplateRows = `repeat(${this.gridSize.rows}, 40px)`;
        container.style.gridTemplateColumns = `repeat(${this.gridSize.cols}, 40px)`;

        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (this.grid[row][col]) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.row = row;
                    input.dataset.col = col;
                    cell.appendChild(input);
                } else {
                    cell.classList.add('blocked');
                }

                container.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.selectCell(e.target);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.handleInput(e.target, e.target.value);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.handleKeydown(e);
            }
        });
    }

    selectCell(input) {
        // Remove previous active states
        document.querySelectorAll('.cell.active').forEach(cell => {
            cell.classList.remove('active');
        });

        // Add active state to current cell
        input.parentElement.classList.add('active');
        this.currentCell = input;

        // Highlight current word
        this.highlightCurrentWord(input);
    }

    highlightCurrentWord(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const cellData = this.grid[row][col];

        if (cellData) {
            // Find which word this cell belongs to
            for (const [wordNum, pos] of Object.entries(this.wordPositions)) {
                const { start, direction, length } = pos;
                const [startRow, startCol] = start;

                let inWord = false;
                if (direction === 'across') {
                    inWord = row === startRow && col >= startCol && col < startCol + length;
                } else {
                    inWord = col === startCol && row >= startRow && row < startRow + length;
                }

                if (inWord) {
                    this.currentWord = { number: parseInt(wordNum), ...pos };
                    break;
                }
            }
        }
    }

    handleInput(input, value) {
        if (value.match(/[a-zA-Z]/)) {
            input.value = value.toUpperCase();
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);

            if (this.grid[row][col]) {
                this.grid[row][col].letter = value.toUpperCase();
            }

            this.moveToNextCell(input);
            this.checkAnswers();
        } else {
            input.value = '';
        }
    }

    handleKeydown(e) {
        const input = e.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);

        switch (e.key) {
            case 'Backspace':
                if (input.value === '') {
                    this.moveToPrevCell(input);
                } else {
                    input.value = '';
                    if (this.grid[row][col]) {
                        this.grid[row][col].letter = '';
                    }
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.moveLeft(input);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.moveRight(input);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.moveUp(input);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.moveDown(input);
                break;
        }
    }

    moveToNextCell(input) {
        if (!this.currentWord) return;

        const { start, direction, length } = this.currentWord;
        const [startRow, startCol] = start;
        const currentRow = parseInt(input.dataset.row);
        const currentCol = parseInt(input.dataset.col);

        let nextRow, nextCol;
        if (direction === 'across') {
            nextCol = currentCol + 1;
            nextRow = currentRow;
        } else {
            nextRow = currentRow + 1;
            nextCol = currentCol;
        }

        const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextInput) {
            nextInput.focus();
            this.selectCell(nextInput);
        }
    }

    moveToPrevCell(input) {
        if (!this.currentWord) return;

        const currentRow = parseInt(input.dataset.row);
        const currentCol = parseInt(input.dataset.col);

        let prevRow, prevCol;
        if (this.currentWord.direction === 'across') {
            prevCol = currentCol - 1;
            prevRow = currentRow;
        } else {
            prevRow = currentRow - 1;
            prevCol = currentCol;
        }

        const prevInput = document.querySelector(`input[data-row="${prevRow}"][data-col="${prevCol}"]`);
        if (prevInput) {
            prevInput.focus();
            this.selectCell(prevInput);
        }
    }

    moveLeft(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const leftInput = document.querySelector(`input[data-row="${row}"][data-col="${col - 1}"]`);
        if (leftInput) {
            leftInput.focus();
            this.selectCell(leftInput);
        }
    }

    moveRight(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const rightInput = document.querySelector(`input[data-row="${row}"][data-col="${col + 1}"]`);
        if (rightInput) {
            rightInput.focus();
            this.selectCell(rightInput);
        }
    }

    moveUp(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const upInput = document.querySelector(`input[data-row="${row - 1}"][data-col="${col}"]`);
        if (upInput) {
            upInput.focus();
            this.selectCell(upInput);
        }
    }

    moveDown(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const downInput = document.querySelector(`input[data-row="${row + 1}"][data-col="${col}"]`);
        if (downInput) {
            downInput.focus();
            this.selectCell(downInput);
        }
    }

    checkAnswers() {
        let allCorrect = true;

        for (const [wordNum, answer] of Object.entries(this.answers)) {
            const pos = this.wordPositions[wordNum];
            const { start, direction, length } = pos;
            const [startRow, startCol] = start;

            let currentAnswer = '';
            let allFilled = true;

            for (let i = 0; i < length; i++) {
                const row = direction === 'down' ? startRow + i : startRow;
                const col = direction === 'across' ? startCol + i : startCol;

                const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
                if (input && input.value) {
                    currentAnswer += input.value;
                } else {
                    allFilled = false;
                }
            }

            // Color cells based on correctness
            for (let i = 0; i < length; i++) {
                const row = direction === 'down' ? startRow + i : startRow;
                const col = direction === 'across' ? startCol + i : startCol;

                const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
                if (input && input.parentElement) {
                    input.parentElement.classList.remove('filled', 'error');

                    if (input.value && allFilled) {
                        if (currentAnswer === answer) {
                            input.parentElement.classList.add('filled');
                        } else {
                            input.parentElement.classList.add('error');
                            allCorrect = false;
                        }
                    } else if (!allFilled) {
                        allCorrect = false;
                    }
                }
            }
        }

        // Check if crossword is completed
        if (allCorrect) {
            const allInputs = document.querySelectorAll('input');
            let totalFilled = 0;
            allInputs.forEach(input => {
                if (input.value) totalFilled++;
            });

            if (totalFilled === allInputs.length) {
                this.showCompletion();
            }
        }
    }

    showCompletion() {
        setTimeout(() => {
            alert('🎉 Поздравляем! Вы успешно решили кроссворд Gensyn!');
        }, 500);
    }
}

// Initialize the crossword when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GensynCrossword();
});