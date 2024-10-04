const levelSettings = [
    { size: 6, colors: ['a', 'b', 'c'] },      // 레벨 1: 6x6 보드, 3가지 색상
    { size: 9, colors: ['a', 'b', 'c', 'd'] }, // 레벨 2: 9x9 보드, 4가지 색상
    { size: 12, colors: ['a', 'b', 'c', 'd', 'e'] }, // 레벨 3: 12x12 보드, 5가지 색상
];

let score = 0;
let clickCount = 0;
let board = [];
let level = 1; // 초기 레벨 설정

// 보드 크기 및 색상 가져오기
function getLevelSettings() {
    return levelSettings[level - 1];
}

// 보드 초기화
function initializeBoard() {
    const { size: boardSize, colors: crystals } = getLevelSettings();
    const boardElement = document.getElementById('popular-board');
    boardElement.innerHTML = ''; // 보드를 초기화
    board = []; // 보드 데이터를 초기화

    // 그리드 설정
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, 50px)`;

    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            const crystalType = crystals[Math.floor(Math.random() * crystals.length)];
            row.push(crystalType);
            const crystal = document.createElement('div');
            crystal.className = 'crystal ' + crystalType;
            crystal.dataset.row = i;
            crystal.dataset.col = j;
            crystal.addEventListener('click', () => onCellClick(i, j));
            boardElement.appendChild(crystal);
        }
        board.push(row);
    }
}

// 셀 클릭 시 호출되는 함수
function onCellClick(row, col) {
    incrementClickCount();
    selectCrystal(row, col);
}

// 클릭 카운터 증가 함수
function incrementClickCount() {
    clickCount++;
    document.getElementById('clickCount').innerText = clickCount;
}
// 셀 선택 시 상하좌우 및 대각선으로 연결된 같은 색상의 셀들을 파괴
function selectCrystal(row, col) {
    const selectedColor = board[row][col];
    const toBeDestroyed = [];
    const { size: boardSize } = getLevelSettings();
    const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));

    function floodFill(r, c) {
        if (r < 0 || c < 0 || r >= boardSize || c >= boardSize) return;
        if (visited[r][c] || board[r][c] !== selectedColor) return;

        visited[r][c] = true;
        toBeDestroyed.push([r, c]);

        // 상하좌우 탐색
        floodFill(r - 1, c); // 상
        floodFill(r + 1, c); // 하
        floodFill(r, c - 1); // 좌
        floodFill(r, c + 1); // 우

        // 대각선 탐색
        floodFill(r - 1, c - 1); // 좌상
        floodFill(r - 1, c + 1); // 우상
        floodFill(r + 1, c - 1); // 좌하
        floodFill(r + 1, c + 1); // 우하
    }

    floodFill(row, col);

    // 기본 점수 계산: 1 + 2 + 3 + ... + n
    let points = toBeDestroyed.length * (toBeDestroyed.length + 1) / 2;

  // 추가 점수 계산: 7개 이상 파괴 시 추가 점수
if (toBeDestroyed.length >= 19) {
    points += 800; // 19개 이상 파괴 시 추가 800점
} else if (toBeDestroyed.length >= 14) {
    points += 200; // 14개 이상 파괴 시 추가 200점
} else if (toBeDestroyed.length >= 10) {
    points += 100; // 10개 이상 파괴 시 추가 100점
} else if (toBeDestroyed.length >= 7) {
    points += 70; // 7개 이상 파괴 시 추가 70점
}


    if (toBeDestroyed.length > 0) {
        score += points;
        updateScore();

        // 선택된 셀을 새로운 랜덤 색상으로 대체
        const { colors: crystals } = getLevelSettings();
        toBeDestroyed.forEach(([r, c]) => {
            const newColor = crystals[Math.floor(Math.random() * crystals.length)];
            board[r][c] = newColor;
            const cellElement = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            cellElement.className = 'crystal ' + newColor;
        });
    }

    // 레벨 업 조건: 일정 점수 도달 시 다음 레벨로
    if (shouldLevelUp()) {
        levelUp();
    }
}
// 점수 업데이트 함수
function updateScore() {
    document.getElementById('score').innerText = score;
}

// 레벨 업 조건 함수
function shouldLevelUp() {
    const levelThresholds = {
        1: 2000,  // 레벨 1에서 2로 넘어가기 위한 점수
        2: 10000,  // 레벨 2에서 3으로 넘어가기 위한 점수
    };

    return score >= levelThresholds[level];
}

// 레벨 업 함수
function levelUp() {
    if (level < 3) {
        level++;
        showLevelUpMessage(() => {
            shuffleBoard(); // 보드를 재배열하여 새 레벨로 시작
        });
    } else {
        alert('최고 레벨에 도달했습니다!');
    }
}

// 레벨 업 메시지와 축하 이펙트 표시
function showLevelUpMessage(callback) {
    const message = `레벨 ${level}(으)로 올라갑니다!`;
    const messageElement = document.createElement('div');
    messageElement.className = 'level-up-message';
    messageElement.innerText = message;
    document.body.appendChild(messageElement);

    // 클릭 방지 레이어 추가
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    setTimeout(() => {
        messageElement.remove();
        overlay.remove(); // 클릭 방지 레이어 제거
        callback(); // 레벨 업 후 보드 재배열
    }, 1200); // 2초 후에 메시지 제거 및 콜백 실행
}


// 보드 재배열 함수
function shuffleBoard() {
    initializeBoard();
    score = 0;
    clickCount = 0;
    updateScore();
    document.getElementById('clickCount').innerText = clickCount;
}

// 초기화 함수 실행
initializeBoard();
