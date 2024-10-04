// scripts.js + script.js 병합된 코드

/*!
* Start Bootstrap - Agency v7.0.12 (https://startbootstrap.com/theme/agency)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
*/
//
// Scripts
//

window.addEventListener('DOMContentLoaded', event => {
    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };

    // Shrink the navbar
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
});

// 보드 크기 및 보석 종류 설정
let firstCell = null; // 첫 번째 클릭된 셀을 저장
let secondCell = null; // 두 번째 클릭된 셀을 저장
let score = 0; // 시작 스코어

const boardSize = 6; // 보드 크기
const classes = ['a', 'b', 'c', 'd', 'e', 'f'];

// 족보 데이터를 저장할 배열
let patterns = [];

// CSV 파일을 파싱하여 족보 데이터를 읽어옵니다.
Papa.parse("../assets/familytree.csv", {
    download: true,
    header: true,
    complete: function(results) {
        patterns = results.data;
        console.log("CSV 파일 로드 완료. 전체 행 수:", patterns.length);
        generateBoard();  // CSV 로드 완료 후 보드 생성
    },
    error: function(error) {
        console.error("CSV 파싱 중 오류 발생:", error.message);
    },
    skipEmptyLines: true,  // 빈 줄 건너뛰기
    dynamicTyping: true    // 숫자를 자동으로 숫자형으로 변환
});

// 족보가 없는 보드를 생성
function generateBoard() {
    let boardIsValid = false;

    while (!boardIsValid) {
        const board = [];  // 보드를 배열로 저장

        for (let i = 0; i < boardSize * boardSize; i++) {
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            board.push(randomClass);
        }

        // 보드가 유효한지 검사
        boardIsValid = !checkForScore(board);

        if (boardIsValid) {
            const boardElement = document.getElementById('popular-board');
            boardElement.innerHTML = ''; // 기존 보드 초기화

            board.forEach(cellClass => {
                const cell = document.createElement('div');
                cell.className = `crystal ${cellClass}`;
                cell.addEventListener('click', handleCellClick);
                boardElement.appendChild(cell);
            });
        }
    }
}

// 보드에서 족보가 있는지 확인
function checkForScore(board) {
    const rows = [];
    for (let r = 0; r < boardSize; r++) {
        rows.push(board.slice(r * boardSize, (r + 1) * boardSize));
    }

    let scoreGained = false;
    let completedCells = [];

    // 행에서 점수 계산
    for (let row of rows) {
        const rowClasses = row.join('');
        if (isPatternMatch(rowClasses)) {
            completedCells = completedCells.concat(row);
            scoreGained = true;
        }
    }

    // 열에서도 동일한 로직으로 점검
    for (let c = 0; c < boardSize; c++) {
        let colClasses = '';
        let colCells = [];
        for (let r = 0; r < boardSize; r++) {
            colCells.push(rows[r][c]);
            colClasses += rows[r][c].className.split(' ')[1];  // 수정된 부분
        }
        if (isPatternMatch(colClasses)) {
            completedCells = completedCells.concat(colCells);
            scoreGained = true;
        }
    }

    // 족보가 완성된 셀이 있으면 이펙트 추가 후 일정 시간 후 재생성
    if (scoreGained) {
        completedCells.forEach(cell => {
            // 이펙트 추가 (예: 번쩍이는 효과)
            cell.classList.add('completed-effect');
        });

        setTimeout(() => {
            completedCells.forEach(cell => {
                // 셀 재생성
                const randomClass = classes[Math.floor(Math.random() * classes.length)];
                cell.className = `crystal ${randomClass}`;
                cell.classList.remove('completed-effect'); // 이펙트 제거
            });

            // 연쇄 반응을 위해 다시 점수 확인
            checkForScore();

        }, 1000); // 1초 동안 이펙트가 유지됨
    }

    return scoreGained;
}

// 패턴 매칭 확인
function isPatternMatch(sequence) {
    for (let { 항목: patternString } of patterns) {
        if (sequence.includes(patternString)) {
            return true; // 패턴이 매칭되면 true 반환
        }
    }
    return false; // 매칭되는 패턴이 없으면 false 반환
}

// 셀 클릭 이벤트 핸들러
function handleCellClick(event) {
    const clickedCell = event.target;

    if (!firstCell) {
        firstCell = clickedCell;
        firstCell.classList.add('selected'); // 첫 번째 셀에 빨간 테두리 추가
    } else if (!secondCell && clickedCell !== firstCell) {
        secondCell = clickedCell;

        // 두 셀이 상하좌우로 인접해 있는지 확인
        if (isAdjacent(firstCell, secondCell)) {
            // 자리 바꾸기
            swapCells(firstCell, secondCell);

            // 족보 확인 및 점수 계산
            checkForScore();

            // 선택된 상태 초기화 (빨간 테두리 제거)
            firstCell.classList.remove('selected');
            secondCell.classList.remove('selected');
        } else {
            // 인접하지 않은 경우 선택 초기화
            firstCell.classList.remove('selected');
        }

        // 다음 클릭을 위해 선택 상태 초기화
        firstCell = null;
        secondCell = null;
    }
}

document.addEventListener('click', function(event) {
    // 클릭된 요소가 셀이 아닌 경우에만 실행
    if (!event.target.classList.contains('crystal')) {
        // 선택된 셀이 있으면 선택 해제
        if (firstCell) {
            firstCell.classList.remove('selected');
            firstCell = null;
        }
        if (secondCell) {
            secondCell.classList.remove('selected');
            secondCell = null;
        }
    }
});

// 셀 자리 바꾸기
function swapCells(cell1, cell2) {
    const tempClass = cell1.className;
    cell1.className = cell2.className;
    cell2.className = tempClass;
}

// 보드 섞기
function shuffleBoard() {
    const board = document.getElementById('popular-board');
    const cells = Array.from(board.children); // 보드에 있는 모든 셀을 배열로 가져오기
    const shuffledClasses = cells.map(cell => cell.className).sort(() => Math.random() - 0.5); // 클래스 섞기

    cells.forEach((cell, index) => {
        cell.className = shuffledClasses[index]; // 셀의 클래스를 섞인 클래스로 재배치
    });
    score = 0;
    document.getElementById('score').textContent = score; // 점수판도 업데이트
}

// 상하좌우 인접 여부 확인
function isAdjacent(cell1, cell2) {
    const index1 = Array.prototype.indexOf.call(cell1.parentNode.children, cell1);
    const index2 = Array.prototype.indexOf.call(cell2.parentNode.children, cell2);

    const row1 = Math.floor(index1 / boardSize);
    const col1 = index1 % boardSize;
    const row2 = Math.floor(index2 / boardSize);
    const col2 = index2 % boardSize;

    // 상하좌우로 인접한 경우만 true를 반환
    return (row1 === row2 && Math.abs(col1 - col2) === 1) ||
           (col1 === col2 && Math.abs(row1 - row2) === 1);
}

// 페이지 로드 시 보드 생성
window.onload = function() {
    generateBoard(); // Ensure this runs after patterns are loaded
};


document.addEventListener("scroll", function() {
    var scrollPos = window.scrollY;
    var scrollToTopBtn = document.querySelector(".scroll-to-top");

    // 스크롤 위치가 100px 이상이면 버튼 표시
    if (scrollPos > 100) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

document.querySelector(".scroll-to-top").addEventListener("click", function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const imageModal = document.getElementById('imageModal');
imageModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const title = button.getAttribute('data-bs-title');
    const src = button.getAttribute('data-bs-src');
    const description = button.getAttribute('data-bs-description');
    const downloadLink = button.getAttribute('data-bs-download');
    
    const modalTitle = imageModal.querySelector('.modal-title');
    const modalImage = imageModal.querySelector('#modalImage');
    const modalDescription = imageModal.querySelector('#imageDescription');
    const downloadButton = imageModal.querySelector('#downloadButton');

    modalTitle.textContent = title;
    modalImage.src = src;
    modalDescription.innerHTML = description; // innerHTML로 변경하여 HTML 태그를 적용
    downloadButton.href = downloadLink;
});
