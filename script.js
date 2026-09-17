const cells = document.querySelectorAll(".cell");

const turnText = document.getElementById("turnText");
const turnIcon = document.querySelector(".turnIcon");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

const modal = document.getElementById("modal");
const resultEmoji = document.getElementById("resultEmoji");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");

const difficultyBox = document.getElementById("difficultyBox");
const oLabel = document.getElementById("oLabel");

// GAME DATA

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;
let mode = "ai";
let difficulty = "easy";

let scores = {
    X: 0,
    O: 0,
    draw: 0
};

// WINNING COMBINATIONS

const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

// CELL CLICK

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        const index = Number(cell.dataset.index);

        if (board[index] !== "" || gameOver) {
            return;
        }

        if (mode === "ai" && currentPlayer === "O") {
            return;
        }

        makeMove(index, currentPlayer);
    });

});

// MAKE MOVE

function makeMove(index, player) {

    board[index] = player;

    updateBoard();

    const result = checkWinner(board);

    if (result) {
        finishGame(result);
        return;
    }

    currentPlayer =
        currentPlayer === "X" ? "O" : "X";

    updateTurn();

    // AI MOVE

    if (
        mode === "ai" &&
        currentPlayer === "O" &&
        !gameOver
    ) {

        setTimeout(aiMove, 450);
    }
}

// UPDATE BOARD

function updateBoard() {

    cells.forEach((cell, index) => {

        cell.textContent = board[index];

        cell.classList.remove(
            "x",
            "o",
            "filled"
        );

        if (board[index] === "X") {

            cell.classList.add(
                "x",
                "filled"
            );
        }

        if (board[index] === "O") {

            cell.classList.add(
                "o",
                "filled"
            );
        }

    });
}

// CHECK WINNER

function checkWinner(state) {

    for (const combo of winningCombos) {

        const [a, b, c] = combo;

        if (
            state[a] &&
            state[a] === state[b] &&
            state[a] === state[c]
        ) {

            return {
                winner: state[a],
                combo: combo
            };
        }
    }

    if (state.every(cell => cell !== "")) {

        return {
            winner: "draw",
            combo: []
        };
    }

    return null;
}

// FINISH GAME

function finishGame(result) {

    gameOver = true;

    if (result.winner === "draw") {

        scores.draw++;

        scoreDraw.textContent = scores.draw;

        showResult(
            "🤝",
            "It's a Draw!",
            "Great battle! Nobody gave up."
        );

        return;
    }

    // Highlight winning cells

    result.combo.forEach(index => {

        cells[index].classList.add("win");

    });

    scores[result.winner]++;

    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;

    if (
        mode === "ai" &&
        result.winner === "X"
    ) {

        showResult(
            "🎉",
            "You Win!",
            "Excellent! You defeated the AI."
        );

        createConfetti();

    }

    else if (
        mode === "ai" &&
        result.winner === "O"
    ) {

        showResult(
            "🤖",
            "AI Wins!",
            "Don't worry. Try another strategy!"
        );

    }

    else {

        showResult(
            "🏆",
            result.winner + " Wins!",
            "What a great move!"
        );

        createConfetti();
    }
}

// SHOW RESULT

function showResult(
    emoji,
    title,
    text
) {

    setTimeout(() => {

        resultEmoji.textContent = emoji;

        resultTitle.textContent = title;

        resultText.textContent = text;

        modal.classList.add("show");

    }, 500);
}

// AI

function aiMove() {

    if (gameOver) {
        return;
    }

    let index;

    // EASY

    if (difficulty === "easy") {

        index = randomMove();
    }

    // MEDIUM

    else if (difficulty === "medium") {

        index =
            Math.random() < 0.6
                ? smartMove()
                : randomMove();
    }

    // HARD

    else {

        index = bestMove();
    }

    if (index !== undefined) {

        makeMove(index, "O");
    }
}

// RANDOM MOVE

function randomMove() {

    const empty = [];

    board.forEach((value, index) => {

        if (value === "") {
            empty.push(index);
        }

    });

    if (empty.length === 0) {
        return undefined;
    }

    return empty[
        Math.floor(
            Math.random() * empty.length
        )
    ];
}

// SMART MOVE

function smartMove() {

    // Try winning move

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "O";

            if (checkWinner(board)?.winner === "O") {

                board[i] = "";

                return i;
            }

            board[i] = "";
        }
    }

    // Block player

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "X";

            if (checkWinner(board)?.winner === "X") {

                board[i] = "";

                return i;
            }

            board[i] = "";
        }
    }

    // Center

    if (board[4] === "") {
        return 4;
    }

    // Corners

    const corners =
        [0, 2, 6, 8]
        .filter(i => board[i] === "");

    if (corners.length) {

        return corners[
            Math.floor(
                Math.random() * corners.length
            )
        ];
    }

    return randomMove();
}

// MINIMAX AI

function bestMove() {

    let bestScore = -Infinity;

    let move;

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "O";

            const score =
                minimax(board, false);

            board[i] = "";

            if (score > bestScore) {

                bestScore = score;

                move = i;
            }
        }
    }

    return move;
}

// MINIMAX

function minimax(state, maximizing) {

    const result = checkWinner(state);

    if (result) {

        if (result.winner === "O") {
            return 10;
        }

        if (result.winner === "X") {
            return -10;
        }

        return 0;
    }

    if (maximizing) {

        let best = -Infinity;

        for (let i = 0; i < 9; i++) {

            if (state[i] === "") {

                state[i] = "O";

                best = Math.max(
                    best,
                    minimax(state, false)
                );

                state[i] = "";
            }
        }

        return best;

    } else {

        let best = Infinity;

        for (let i = 0; i < 9; i++) {

            if (state[i] === "") {

                state[i] = "X";

                best = Math.min(
                    best,
                    minimax(state, true)
                );

                state[i] = "";
            }
        }

        return best;
    }
}

// UPDATE TURN

function updateTurn() {

    if (mode === "ai") {

        if (currentPlayer === "X") {

            turnIcon.textContent = "✕";

            turnText.textContent =
                "Your Turn";

        } else {

            turnIcon.textContent = "○";

            turnText.textContent =
                "AI is thinking...";
        }

    } else {

        turnIcon.textContent =
            currentPlayer === "X"
                ? "✕"
                : "○";

        turnText.textContent =
            "Player " +
            currentPlayer +
            "'s Turn";
    }
}

// NEW GAME

function newGame() {

    board =
        ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    gameOver = false;

    cells.forEach(cell => {

        cell.textContent = "";

        cell.classList.remove(
            "x",
            "o",
            "filled",
            "win"
        );

    });

    modal.classList.remove("show");

    updateTurn();
}

// MODE BUTTONS

document
    .querySelectorAll(".mode")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".mode")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            mode =
                button.dataset.mode;

            if (mode === "ai") {

                difficultyBox.style.display =
                    "block";

                oLabel.textContent =
                    "AI O";

            } else {

                difficultyBox.style.display =
                    "none";

                oLabel.textContent =
                    "PLAYER O";
            }

            newGame();
        });

    });

// DIFFICULTY

document
    .querySelectorAll(".difficultyBtn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".difficultyBtn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            difficulty =
                button.dataset.level;

            newGame();
        });

    });

// NEW GAME BUTTON

document
    .getElementById("newGame")
    .addEventListener(
        "click",
        newGame
    );

// PLAY AGAIN BUTTON

document
    .getElementById("playAgain")
    .addEventListener(
        "click",
        newGame
    );

// RESET SCORE

document
    .getElementById("resetScore")
    .addEventListener("click", () => {

        scores = {
            X: 0,
            O: 0,
            draw: 0
        };

        scoreX.textContent = 0;

        scoreO.textContent = 0;

        scoreDraw.textContent = 0;

        newGame();
    });

// CONFETTI

function createConfetti() {

    const container =
        document.getElementById("confetti");

    const colors = [
        "#22d3ee",
        "#a78bfa",
        "#fb7185",
        "#facc15",
        "#4ade80"
    ];

    for (let i = 0; i < 80; i++) {

        const piece =
            document.createElement("div");

        piece.className = "confetti";

        piece.style.left =
            Math.random() * 100 + "vw";

        piece.style.background =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        piece.style.animationDelay =
            Math.random() * 0.5 + "s";

        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;

        container.appendChild(piece);

        setTimeout(() => {

            piece.remove();

        }, 2500);
    }
}