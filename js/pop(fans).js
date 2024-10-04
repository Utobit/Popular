// script.js

// 보드 크기와 보석 종류 설정
const boardSize = 6;
const crystals = ['a', 'b', 'c', 'd', 'e', 'f'];
let score = 0;
let firstSelectedCrystal = null;

// 게임 보드를 초기화하고 보석을 무작위로 배치 (이미 완성된 족보 패턴이 없도록)
function initializeBoard() {
    const boardElement = document.getElementById('popular-board');
    boardElement.innerHTML = ''; // 기존 보드를 초기화

    const boardArray = [];

    for (let i = 0; i < boardSize * boardSize; i++) {
        let crystalType;
        do {
            crystalType = crystals[Math.floor(Math.random() * crystals.length)];
        } while (wouldCompletePattern(i, crystalType, boardArray));

        boardArray.push(crystalType);

        const crystalElement = document.createElement('div');
        crystalElement.classList.add('crystal', crystalType);
        crystalElement.addEventListener('click', () => selectCrystal(crystalElement));
        boardElement.appendChild(crystalElement);
    }
}

// 보석 선택 처리
function selectCrystal(crystalElement) {
    if (firstSelectedCrystal === null) {
        // 첫 번째 보석 선택
        firstSelectedCrystal = crystalElement;
        crystalElement.classList.add('selected');
    } else {
        // 두 번째 보석 선택 - 보석 교환
        swapCrystals(firstSelectedCrystal, crystalElement);
        firstSelectedCrystal.classList.remove('selected');
        firstSelectedCrystal = null;
        checkForPatterns(); // 교환 후 패턴 체크
    }
}

// 보석 교환 처리
function swapCrystals(crystal1, crystal2) {
    const class1 = crystal1.classList[1]; // 첫 번째 보석의 클래스
    const class2 = crystal2.classList[1]; // 두 번째 보석의 클래스
    
    crystal1.classList.remove(class1);
    crystal1.classList.add(class2);
    
    crystal2.classList.remove(class2);
    crystal2.classList.add(class1);
}

// 보드 재배열
function shuffleBoard() {
    initializeBoard();
    score = 1000; // 점수를 1000점으로 설정
    updateScore(); // 점수판을 업데이트
}

function checkForPatterns() {
    const boardElement = document.getElementById('popular-board');
    const boardArray = Array.from(boardElement.children).map(cell => cell.classList[1]); // 보드의 모든 보석을 배열로 저장

    let patternFound = false; // 패턴이 발견되었는지 여부를 추적
    const matchedCells = []; // 패턴이 발견된 셀을 기록
    const matchedSequences = new Set(); // 이미 점수를 추가한 sequence를 추적하는 집합

    patterns.forEach(pattern => {
        const patternLength = pattern.sequence.length;

        // 가로 체크
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col <= boardSize - patternLength; col++) {
                const startIdx = row * boardSize + col;
                const segment = boardArray.slice(startIdx, startIdx + patternLength).join('');

                if (segment === pattern.sequence && !matchedSequences.has(pattern.sequence)) {
                    score += pattern.score * 1; // 점수를 10배로 추가
                    updateScore();
                    matchedCells.push({ startIdx, length: patternLength, direction: 'horizontal' });
                    patternFound = true; // 패턴이 발견되었음을 기록
                    matchedSequences.add(pattern.sequence); // 점수를 추가한 sequence를 기록
                }
            }
        }

        // 세로 체크
        for (let col = 0; col < boardSize; col++) {
            for (let row = 0; row <= boardSize - patternLength; row++) {
                const startIdx = row * boardSize + col;
                let segment = '';
                for (let i = 0; i < patternLength; i++) {
                    segment += boardArray[startIdx + i * boardSize];
                }

                if (segment === pattern.sequence && !matchedSequences.has(pattern.sequence)) {
                    score += pattern.score * 1; // 점수를 10배로 추가
                    updateScore();
                    matchedCells.push({ startIdx, length: patternLength, direction: 'vertical' });
                    patternFound = true; // 패턴이 발견되었음을 기록
                    matchedSequences.add(pattern.sequence); // 점수를 추가한 sequence를 기록
                }
            }
        }
    });

    // 모든 패턴 체크 후, 매칭된 셀들을 처리
    matchedCells.forEach(match => {
        replaceMatchedCrystals(match.startIdx, match.length, match.direction);
    });

    // 패턴이 발견되지 않았을 경우 -100점 적용
    if (!patternFound) {
        score -= 10;
        updateScore();
    }
}


// 일치하는 보석을 새 보석으로 교체
function replaceMatchedCrystals(startIdx, length, direction) {
    const boardElement = document.getElementById('popular-board');

    for (let i = 0; i < length; i++) {
        let crystalIdx = (direction === 'horizontal') ? startIdx + i : startIdx + i * boardSize;
        const crystalElement = boardElement.children[crystalIdx];
        const newCrystalType = crystals[Math.floor(Math.random() * crystals.length)];
        crystalElement.className = 'crystal ' + newCrystalType;
    }
}


// 특정 위치에 보석을 놓았을 때 족보 패턴이 완성되는지 확인
function wouldCompletePattern(index, crystalType, boardArray) {
    const testArray = [...boardArray];
    testArray[index] = crystalType;

    const row = Math.floor(index / boardSize);
    const col = index % boardSize;

    // 현재 행과 열의 보석 배열
    const currentRow = testArray.slice(row * boardSize, (row + 1) * boardSize).join('');
    let currentCol = '';
    for (let i = 0; i < boardSize; i++) {
        currentCol += testArray[i * boardSize + col];
    }

    // 각 패턴에 대해 가로와 세로 체크
    return patterns.some(pattern => {
        return currentRow.includes(pattern.sequence) || currentCol.includes(pattern.sequence);
    });
}

// 점수판 업데이트
function updateScore() {
    const boardContainer = document.querySelector('.board-container');
    document.getElementById('score').innerText = score;
}




// 일치하는 보석을 새 보석으로 교체
function replaceMatchedCrystals(startIdx, length, direction) {
    const boardElement = document.getElementById('popular-board');

    for (let i = 0; i < length; i++) {
        let crystalIdx = (direction === 'horizontal') ? startIdx + i : startIdx + i * boardSize;
        const crystalElement = boardElement.children[crystalIdx];
        const newCrystalType = crystals[Math.floor(Math.random() * crystals.length)];
        crystalElement.className = 'crystal ' + newCrystalType;
    }
}

// 초기화 함수 실행
initializeBoard();
