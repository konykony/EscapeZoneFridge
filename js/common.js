
// ==========================================
// [START: COMMON JS LOGIC]
// 모든 문제에서 공통으로 사용하는 스크립트입니다.
// ==========================================
// const startTime = Date.now();
let startTime;
let hintInterval = null;

// 쿠키 헬퍼
function SetFridgeCookie(name, val) {
    try {
        let d = new Date(); d.setTime(d.getTime() + (24*60*60*1000));
        document.cookie = `${name}=${encodeURIComponent(val)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    } catch (e) { console.error("Cookie Set Error", e); }
}
function GetFridgeCookie(name) {
    try {
        let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? decodeURIComponent(v[2]) : null;
    } catch (e) { return null; }
}

// // UI 및 보안 체크 초기화
// function initializeUI(pageNum) {
//     const userName = GetFridgeCookie('fridge_name');
//     const fridgeIdx = parseInt(GetFridgeCookie('fridge_idx'));
//     const fridgeStartTime = GetFridgeCookie('fridge_start_time');
//     const fridgeStatus = GetFridgeCookie('fridge_status');

//     // [보안 체크] 필수 데이터 누락 시 (미리보기 환경에서는 리다이렉트 유예)
//     if (!userName || !fridgeStartTime || isNaN(fridgeIdx) || fridgeStatus !== 'playing') {
//         console.warn("데이터를 찾을 수 없습니다. (테스트용 데이터로 표시합니다)");
//         // 실제 서버 환경에서는 아래 주석을 해제하세요.
//         window.location.href = 'error.html'; 
//         return;
//     }

//     // [페이지 정합성 체크]
//     if (!isNaN(fridgeIdx) && pageNum !== fridgeIdx) {
//         console.log(`페이지 위치 불일치: ${pageNum} -> ${fridgeIdx}`);
//         window.location.href = `question_${fridgeIdx}.html`;
//         return;
//     }

//     const gaugeWidth = (pageNum / 12) * 100;
//     const displayUserName = userName || "코니";

//     // 상단 헤더 주입
//     $('#common-header').html(`
//         <div class="d-flex justify-content-between align-items-center">
//             <span class="q-tag">문제 ${pageNum}</span>
//             <span class="user-display">${displayUserName}님</span>
//         </div>
//         <div class="temp-container">
//             <div class="temp-bar" style="width: ${gaugeWidth}%"></div>
//         </div>
//     `);

//     // 하단 푸터 주입
//     $('#common-footer').html(`
//         <button class="hint-btn" onclick="handleHint(1)">힌트 1</button>
//         <button class="hint-btn" onclick="handleHint(2)">힌트 2</button>
//         <button class="hint-btn" onclick="handleHint(3)">힌트 3</button>
//     `);

//     // 공통 모달 주입
//     if (!$('#hint-modal').length) {
//         $('body').append(`
//             <div id="hint-modal" class="common-modal-overlay">
//                 <div class="common-modal-content">
//                     <div id="hint-title" class="modal-title-style hint-title-color">💡 힌트</div>
//                     <p id="hint-msg" class="modal-body-text">내용</p>
//                     <button class="modal-main-btn" onclick="closeHint()">닫기</button>
//                 </div>
//             </div>
//         `);
//     }
//     if (!$('#result-modal').length) {
//         $('body').append(`
//             <div id="result-modal" class="common-modal-overlay">
//                 <div class="common-modal-content">
//                     <h2 id="modal-title" class="modal-title-style">결과</h2>
//                     <p id="modal-msg" class="modal-body-text">내용</p>
//                     <div id="modal-btn-group">
//                         <button id="modal-ok-btn" class="modal-main-btn">확인</button>
//                         <button id="modal-retry-btn" class="modal-main-btn btn-retry" style="display: none;">다시 시도하기</button>
//                     </div>
//                 </div>
//             </div>
//         `);
//     }
// }

function applyTempBarColor(pageNum) {
    const colors = [
        "#FF4B2B", "#FF6B2B", "#FF8C2B", "#FFAF2B", // 1~4번
        "#FACC15", "#E2E415", "#A3E635", "#22C55E", // 5~8번
        "#10B981", "#06B6D4", "#3B82F6", "#1D4ED8"  // 9~12번
    ];
    
    // 페이지 번호에 맞는 색상 추출 (배열은 0부터 시작하므로 -1)
    const currentColor = colors[pageNum - 1] || "#1D4ED8";
    
    // 게이지 색상 변경 (temp-bar 클래스 기준)
    $('.temp-bar').css('background', currentColor);
}

// // UI 및 보안 체크 초기화 메인 함수
// function initializeUI(pageNum) {
//     const urlParams = new URLSearchParams(window.location.search);
//     const isTestMode = urlParams.get('type') === 'test';

//     // 1. 데이터 로드
//     const sessionData = {
//         userName: GetFridgeCookie('fridge_name') || "코니",
//         fridgeIdx: parseInt(GetFridgeCookie('fridge_idx')),
//         fridgeStatus: GetFridgeCookie('fridge_status'),
//         isTestMode: isTestMode
//     };

//     // 2. 보안 및 정합성 체크 (테스트 모드일 때는 스킵)
//     if (!isTestMode) {
//         if (!checkSecurity(sessionData)) return;
//         if (!checkPageConsistency(pageNum, sessionData.fridgeIdx)) return;
//     } else {
//         console.warn(`[TEST MODE] ${pageNum}번 페이지 강제 로드됨.`);
//     }

//     // 3. UI 렌더링
//     renderHeader(pageNum, sessionData.userName);
//     renderFooter();
//     injectModals();
//     // 4.  온도바 색상 적용
//     applyTempBarColor(pageNum);
//     initHintTimestamp(pageNum) ;
// }

// UI 및 보안 체크 초기화 메인 함수
function initializeUI(pageNum) {
    // 1. URL 파라미터 판정
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = (urlParams.get('type') || "").toLowerCase(); 
    const isTestMode = typeParam === 'test';

    // 2. 데이터 로드
    let userName, fridgeIdx, fridgeStatus;

    if (isTestMode) {
        userName = "테스트대원";
        fridgeIdx = pageNum; // [중요] 테스트 중인 현재 페이지 번호로 강제 설정
        fridgeStatus = "playing";
        
        // [추가] 쿠키와 상관없이 전역 변수나 시스템이 현재 페이지를 '진행 중'으로 인식하게 함
        console.warn(`[TEST MODE] ${pageNum}번 페이지 테스트 시작 (기존 진행상황 무시)`);
    } else {
        userName = GetFridgeCookie('fridge_name') || "코니";
        fridgeIdx = parseInt(GetFridgeCookie('fridge_idx')) || 0;
        fridgeStatus = GetFridgeCookie('fridge_status');
    }

    const sessionData = {
        userName: userName,
        fridgeIdx: fridgeIdx,
        fridgeStatus: fridgeStatus,
        isTestMode: isTestMode
    };

    // 3. 보안 및 정합성 체크
    if (!isTestMode) {
        // 일반 모드일 때만 페이지 이탈 및 보안 체크 실행
        if (!checkSecurity(sessionData)) return; 
        if (!checkPageConsistency(pageNum, sessionData.fridgeIdx)) return;
    }

    // 4. UI 렌더링
    // sessionData를 인자로 넘겨서 내부에서도 testMode인지 알 수 있게 합니다.
    renderHeader(pageNum, sessionData.userName);
    renderFooter(sessionData); // [수정] 푸터 등에도 세션 정보를 넘겨 리다이렉트 방지
    injectModals();
    
    // 5. 온도바 색상 적용
    applyTempBarColor(pageNum);

    // 6. 힌트 타임스탬프 초기화 (전역 hintBaseTime 사용 권장)
    if (typeof hintBaseTime !== 'undefined') {
        hintBaseTime = initHintTimestamp(pageNum);
    } else {
        initHintTimestamp(pageNum);
    }
}

/**
 * 페이지별 힌트 시작 시간을 쿠키에서 가져오거나 새로 생성하는 함수
 */
function initHintTimestamp(pageNum) {
    const cookieKey = 'start_time_p' + pageNum;
    
    // 1. 쿠키를 가져오되, 없으면 빈 문자열("")로 초기화하여 에러 방지
    let savedTime = GetFridgeCookie(cookieKey) || ""; 

    // 2. 데이터가 유효한 숫자인지 체크
    if (savedTime !== "" && !isNaN(savedTime)) {
        // 기존 기록이 있으면 숫자로 변환
        startTime = parseInt(savedTime);
        console.log(`[Hint] p${pageNum} 기존 시간 로드: ${startTime}`);
    } else {
        // 기록이 없거나 비정상적이면 현재 시간으로 신규 생성
        startTime = Date.now();
        SetFridgeCookie(cookieKey, startTime);
        console.log(`[Hint] p${pageNum} 시간 신규 생성: ${startTime}`);
    }

    return startTime;
}

/**
 * 성공 시 해당 페이지의 힌트 타임스탬프를 삭제
 */
function clearHintTimestamp(pageNum) {
    SetFridgeCookie('start_time_p' + pageNum, '', -1);
}

// [기능 분리] 보안 체크
function checkSecurity(data) {
    const fridgeStartTime = GetFridgeCookie('fridge_start_time');
    if (!data.userName || !fridgeStartTime || isNaN(data.fridgeIdx) || data.fridgeStatus !== 'playing') {
        console.warn("데이터 누락 - 에러 페이지로 이동");
        window.location.href = 'error.html';
        return false;
    }
    return true;
}

// [기능 분리] 페이지 위치 정합성 체크
function checkPageConsistency(pageNum, fridgeIdx) {
    if (!isNaN(fridgeIdx) && pageNum !== fridgeIdx) {
        console.log(`위치 불일치: ${pageNum} -> ${fridgeIdx}`);
        window.location.href = `question_${fridgeIdx}.html`;
        return false;
    }
    return true;
}

// [기능 분리] 헤더 렌더링
function renderHeader(pageNum, userName) {
    const gaugeWidth = (pageNum / 12) * 100;
    $('#common-header').html(`
        <div class="d-flex justify-content-between align-items-center">
            <span class="q-tag">문제 ${pageNum}</span>
            <span class="user-display">${userName}님</span>
        </div>
        <div class="temp-container">
            <div class="temp-bar" style="width: ${gaugeWidth}%"></div>
        </div>
    `);
}

// [기능 분리] 푸터 렌더링
function renderFooter() {
    $('#common-footer').html(`
        <button class="hint-btn" onclick="handleHint(1)">힌트 1</button>
        <button class="hint-btn" onclick="handleHint(2)">힌트 2</button>
        <button class="hint-btn" onclick="handleHint(3)">힌트 3</button>
    `);
}

// [기능 분리] 모달 주입 (중복 방지 체크 포함)
function injectModals() {
    if (!$('#hint-modal').length) {
        $('body').append(`
            <div id="hint-modal" class="common-modal-overlay">
                <div class="common-modal-content">
                    <div id="hint-title" class="modal-title-style hint-title-color">💡 힌트</div>
                    <p id="hint-msg" class="modal-body-text">내용</p>
                    <button class="modal-main-btn" onclick="closeHint()">닫기</button>
                </div>
            </div>
        `);
    }
    if (!$('#result-modal').length) {
        $('body').append(`
            <div id="result-modal" class="common-modal-overlay">
                <div class="common-modal-content">
                    <h2 id="modal-title" class="modal-title-style">결과</h2>
                    <p id="modal-msg" class="modal-body-text">내용</p>
                    <div id="modal-btn-group">
                        <button id="modal-ok-btn" class="modal-main-btn">확인</button>
                        <button id="modal-retry-btn" class="modal-main-btn btn-retry" style="display: none;">다시 시도하기</button>
                    </div>
                </div>
            </div>
        `);
    }
}

// // 힌트 처리
// window.handleHint = function(n) {
//     const limits = [60, 180, 300]; 
//     // const limits = [1, 3, 5]; 
//     const limit = limits[n-1];
//     $('#hint-title').text('💡 힌트 ' + n);
//     if (hintInterval) clearInterval(hintInterval);

//     const update = () => {
//         const elapsed = Math.floor((Date.now() - startTime) / 1000);
//         if (elapsed < limit) {
//             const rem = limit - elapsed;
//             const m = Math.floor(rem / 60), s = rem % 60;
//             $('#hint-msg').html(`<span class="lock-icon">🔒</span> 아직 볼 수 없습니다.<br><br><strong>${m > 0 ? m+'분 ' : ''}${s}초</strong> 뒤에 공개됩니다.`);
//         } else {
//             clearInterval(hintInterval);
//             $('#hint-msg').html(window.hints[n-1]);
//         }
//     };
//     update();
//     hintInterval = setInterval(update, 1000);
//     $('#hint-modal').css('display', 'flex');
// };

window.handleHint = function(n) {
    // 1. 전역 변수 선언 확인 (오류 방지 핵심)
    if (typeof window.hintInterval === 'undefined') window.hintInterval = null;
    
    const limits = [60, 180, 300]; 
    const limit = limits[n-1];
    
    $('#hint-title').text('💡 힌트 ' + n);

    // 2. 기존에 돌고 있는 인터벌이 있다면 확실히 정지
    if (window.hintInterval) {
        clearInterval(window.hintInterval);
        window.hintInterval = null;
    }

    // 3. 내부 업데이트 함수 정의
    const update = () => {
        // startTime이 숫자가 아니면 현재 시간으로 긴급 복구
        const currentStart = (typeof startTime === 'number' && !isNaN(startTime)) ? startTime : Date.now();
        const elapsed = Math.floor((Date.now() - currentStart) / 1000);
        
        console.log(`[Hint Update] 경과시간: ${elapsed}s / 목표: ${limit}s`);

        if (elapsed < limit) {
            const rem = limit - elapsed;
            const m = Math.floor(rem / 60), s = rem % 60;
            $('#hint-msg').html(`<span class="lock-icon">🔒</span> 아직 볼 수 없습니다.<br><br><strong>${m > 0 ? m+'분 ' : ''}${s}초</strong> 뒤에 공개됩니다.`);
        } else {
            console.log("[Hint Success] 힌트 공개!");
            if (window.hintInterval) {
                clearInterval(window.hintInterval);
                window.hintInterval = null;
            }
            $('#hint-msg').html(window.hints[n-1]);
        }
    };

    // 4. 즉시 실행 및 인터벌 설정
    try {
        update(); // 여기서 에러가 나도 catch로 잡음
        window.hintInterval = setInterval(update, 1000);
    } catch (e) {
        console.error("[Hint Error] update 실행 중 오류 발생:", e);
    }

    $('#hint-modal').css('display', 'flex');
};

window.closeHint = () => { if(hintInterval) clearInterval(hintInterval); $('#hint-modal').hide(); };


/**
 * 결과 모달 통합 관리 함수
 */
window.showResultModal = function(options) {
    const { success, message, onRetry, pageNum } = options;
    const isTestMode = new URLSearchParams(window.location.search).get('type') === 'test';
    
    const modal = $('#result-modal');
    
    if (success) {
        setupSuccessUI(message, pageNum, isTestMode);
    } else {
        setupFailureUI(message, onRetry);
    }

    modal.css('display', 'flex');
};

// [기능 분리] 성공 UI 설정
function setupSuccessUI(message, pageNum, isTestMode) {
    const title = $('#modal-title');
    const msg = $('#modal-msg');
    const okBtn = $('#modal-ok-btn');
    const retryBtn = $('#modal-retry-btn');

    title.text('정답입니다!').removeClass('fail-title-color').addClass('result-title-color');
    msg.text(message || '성공적으로 미션을 완수했습니다.');

    // 테스트 모드에 따라 버튼 텍스트 변경
    const btnText = isTestMode ? '테스트 목록으로' : '다음 문제로';

    okBtn.show().text(btnText).off().click(() => {
        handleNextStep(pageNum, isTestMode);
    });
    
    retryBtn.hide();
}

// [기능 분리] 실패 UI 설정
function setupFailureUI(message, onRetry) {
    const title = $('#modal-title');
    const msg = $('#modal-msg');
    const okBtn = $('#modal-ok-btn');
    const retryBtn = $('#modal-retry-btn');

    title.text('길을 잃었어요!').removeClass('result-title-color').addClass('fail-title-color');
    msg.text(message || '규칙이 어긋났습니다. 다시 확인해보세요.');
    
    okBtn.hide();
    retryBtn.show().text('다시 시도하기').off().click(() => {
        $('#result-modal').hide();
        if(onRetry) onRetry();
    });
}

// // [기능 분리] 다음 단계 처리 (테스트 모드 분기)
// function handleNextStep(pageNum, isTestMode) {
//     $('#result-modal').hide();

//     // 1. 테스트 모드인 경우 대시보드로 복귀
//     if (isTestMode) {
//         window.location.href = 'test.html';
//         return;
//     }

//     // 2. 일반 모드인 경우 다음 문제 진행
//     if (typeof window.runTemperatureSequence === 'function') {
//         window.runTemperatureSequence(pageNum);
//     } else {
//         const nextIdx = pageNum + 1;
//         SetFridgeCookie('fridge_idx', nextIdx);
//         window.location.href = `question_${nextIdx}.html`;
//     }
// }

// [기능 분리] 다음 단계 처리 (테스트 모드 분기 및 엔딩 처리)
function handleNextStep(pageNum, isTestMode) {
    $('#result-modal').hide();
    clearHintTimestamp(pageNum);
    // 1. 테스트 모드인 경우 대시보드로 복귀
    if (isTestMode) {
        window.location.href = 'test.html';
        return;
    }

    // 2. 일반 모드인 경우 (12번 문제 완료 체크)
    if (pageNum === 12) {
        // 12번을 맞췄다면 엔딩 페이지로 바로 이동
        window.location.href = 'ending.html';
    } else if (typeof window.runTemperatureSequence === 'function') {
        // 온도계 애니메이션 실행 (이 안에서 다음 문제 혹은 엔딩으로 분기됨)
        window.runTemperatureSequence(pageNum);
    } else {
        // 백업 로직
        const nextIdx = pageNum + 1;
        SetFridgeCookie('fridge_idx', nextIdx);
        window.location.href = nextIdx > 12 ? 'ending.html' : `question_${nextIdx}.html`;
    }
}

// [END: COMMON JS LOGIC] ===================

/**
 * ==========================================
 * [START: COMMON JS LOGIC]
 * 코니님(Kony)의 북극곰 프로젝트 통합 공통 로직
 * ==========================================
 */

// 1. 쿠키 관리 로직
function SetFridgeCookie(name, val) {
    let d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(val)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function GetFridgeCookie(name) {
    let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? decodeURIComponent(v[2]) : null;
}

// 쿠키 삭제 함수 (미션 완료 시 사용)
function DeleteFridgeCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;path=/';
}

// window.runTemperatureSequence = function(pageNum) {
//     // 1. 오버레이 생성 및 초기화 (기존과 동일)
//     if (!$('#thermometer-overlay').length) {
//         $('body').append(`
//             <div id="thermometer-overlay">
//                 <div class="temp-msg">미션 성공!<br>지구의 온도를 낮추고 있습니다...</div>
//                 <div class="thermometer-container">
//                     <div class="thermometer-glass">
//                         <div id="mercury-column"></div>
//                     </div>
//                     <div id="mercury-bulb" class="thermometer-bulb"></div>
//                 </div>
//             </div>
//         `);
//     }

//     const overlay = $('#thermometer-overlay');
//     const column = $('#mercury-column');
//     const bulb = $('#mercury-bulb');

//     // [색상 배열 정의] 1번부터 12번까지의 색상
//     const colors = [
//         "#FF4B2B", "#FF6B2B", "#FF8C2B", "#FFAF2B", // 1~4
//         "#FACC15", "#E2E415", "#A3E635", "#22C55E", // 5~8
//         "#10B981", "#06B6D4", "#3B82F6", "#1D4ED8"  // 9~12
//     ];

//     // [계산식 수정]
//     const getPos = (n) => 100 - (n / 12 * 90);
    
//     // [색상 추출 함수 수정]
//     const getCol = (n) => {
//         if (n <= 0) return colors[0]; // 시작 전에는 무조건 1번 색상(빨강)
//         return colors[Math.min(n - 1, colors.length - 1)];
//     };

//     const startPos = getPos(pageNum - 1); 
//     const endPos = getPos(pageNum); 
//     const startColor = getCol(pageNum - 1); // 이전 단계 색상
//     const endColor = getCol(pageNum);     // 현재 완료한 단계 색상

//     // 2. 애니메이션 전 "시작 지점" 설정
//     column.css({ 'transition': 'none', 'height': startPos + '%', 'background-color': startColor });
//     bulb.css({ 'transition': 'none', 'background-color': startColor });

//     // 3. 오버레이 노출 및 애니메이션 실행
//     overlay.css('display', 'flex').hide().fadeIn(500, () => {
//         column[0].offsetHeight; // 리플로우 강제 발생

//         setTimeout(() => {
//             const effect = '1.8s cubic-bezier(0.4, 0, 0.2, 1)';
//             // 높이가 낮아지면서 색상도 endColor로 변함!
//             column.css({ 
//                 'transition': `height ${effect}, background-color ${effect}`, 
//                 'height': endPos + '%', 
//                 'background-color': endColor 
//             });
//             bulb.css({ 'transition': `background-color ${effect}`, 'background-color': endColor });
            
//             // 4. 다음 페이지로 이동
//             setTimeout(() => {
//                 const nextIdx = pageNum + 1;
//                 SetFridgeCookie('fridge_idx', nextIdx);
                
//                 if (nextIdx > 12) {
//                     window.location.href = 'ending.html';
//                 } else {
//                     window.location.href = `question_${nextIdx}.html`;
//                 }
//             }, 2200); 
//         }, 300);
//     });
// };

window.runTemperatureSequence = function(pageNum) {
    // 1. 오버레이 생성 및 초기화 (기존과 동일)
    if (!$('#thermometer-overlay').length) {
        $('body').append(`
            <div id="thermometer-overlay">
                <div class="temp-msg">미션 성공!<br>지구의 온도를 낮추고 있습니다...</div>
                <div class="thermometer-container">
                    <div class="thermometer-glass">
                        <div id="mercury-column"></div>
                    </div>
                    <div id="mercury-bulb" class="thermometer-bulb"></div>
                </div>
            </div>
        `);
    }

    const overlay = $('#thermometer-overlay');
    const column = $('#mercury-column');
    const bulb = $('#mercury-bulb');

    // [색상 배열 정의] 1번부터 12번까지의 색상
    const colors = [
        "#FF4B2B", "#FF6B2B", "#FF8C2B", "#FFAF2B", // 1~4
        "#FACC15", "#E2E415", "#A3E635", "#22C55E", // 5~8
        "#10B981", "#06B6D4", "#3B82F6", "#1D4ED8"  // 9~12
    ];

    // [계산식 수정]
    const getPos = (n) => 100 - (n / 12 * 90);
    
    // [색상 추출 함수 수정]
    const getCol = (n) => {
        if (n <= 0) return colors[0]; // 시작 전에는 무조건 1번 색상(빨강)
        return colors[Math.min(n - 1, colors.length - 1)];
    };

    const startPos = getPos(pageNum - 1); 
    const endPos = getPos(pageNum); 
    const startColor = getCol(pageNum - 1); // 이전 단계 색상
    const endColor = getCol(pageNum);     // 현재 완료한 단계 색상

    // 2. 애니메이션 전 "시작 지점" 설정
    column.css({ 'transition': 'none', 'height': startPos + '%', 'background-color': startColor });
    bulb.css({ 'transition': 'none', 'background-color': startColor });

    // 3. 오버레이 노출 및 애니메이션 실행
    overlay.css('display', 'flex').hide().fadeIn(500, () => {
        column[0].offsetHeight; // 리플로우 강제 발생

        setTimeout(() => {
            const effect = '1.8s cubic-bezier(0.4, 0, 0.2, 1)';
            // 높이가 낮아지면서 색상도 endColor로 변함!
            column.css({ 
                'transition': `height ${effect}, background-color ${effect}`, 
                'height': endPos + '%', 
                'background-color': endColor 
            });
            bulb.css({ 'transition': `background-color ${effect}`, 'background-color': endColor });
            
            // 4. 다음 페이지로 이동
            setTimeout(() => {
                const isTestMode = new URLSearchParams(window.location.search).get('type') === 'test';
                
                // 테스트 모드면 무조건 테스트 목록으로
                if (isTestMode) {
                    window.location.href = 'test.html';
                    return;
                }

                const nextIdx = pageNum + 1;
                SetFridgeCookie('fridge_idx', nextIdx);
                
                // 12번 문제 완료 후 연출이 끝났다면 엔딩 영상 페이지로!
                if (nextIdx > 12) {
                    window.location.href = 'ending.html';
                } else {
                    window.location.href = `question_${nextIdx}.html`;
                }
            }, 2200);
        }, 300);
    });
};

/**
 * [Kony-Manager] 중앙 집중형 사운드 시스템
 * 모든 문제 페이지에서 공통으로 사용하는 사운드를 관리합니다.
 */
const Snd = {
    _cache: {}, 

    // 1. 공통 사운드 리스트 (경로를 이곳에서 한꺼번에 관리)
    _registry: {
        'click': '../sounds/coin05.mp3',
        'success': '../sounds/success.mp3',
        'fail': '../sounds/fail.mp3',
        'info': '../sounds/powerup01.mp3' // [추가] 안내용 부드러운 경고음
    },

    /**
     * 초기화: 사운드 객체를 생성하고 미리 로드합니다.
     * common.js 로드 시 하단에서 자동으로 실행됩니다.
     */
    init: function() {
        for (const [id, path] of Object.entries(this._registry)) {
            const audio = new Audio(path);
            audio.preload = 'auto'; 
            this._cache[id] = audio;
        }
    },

    /**
     * 재생: 페이지 어디서든 Snd.play('ID')로 호출합니다.
     */
    play: function(id) {
        const audio = this._cache[id];
        if (!audio) {
            console.warn(`[Snd] '${id}' 사운드가 등록되지 않았습니다.`);
            return;
        }

        audio.currentTime = 0; // 연속 클릭 대응
        audio.play().catch(e => {
            // 브라우저 정책 및 로드 실패 시 무시 (안전장치)
            console.warn(`[Snd] '${id}' 재생 불가:`, e.message);
        });
    }
};

// [중요] common.js가 로드될 때 사운드 시스템을 자동으로 가동합니다.
Snd.init();