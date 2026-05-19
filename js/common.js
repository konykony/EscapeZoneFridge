
// ==========================================
// [START: COMMON JS LOGIC]
// 모든 문제에서 공통으로 사용하는 스크립트입니다.
// ==========================================
const startTime = Date.now();
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

// UI 및 보안 체크 초기화 메인 함수
function initializeUI(pageNum) {
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get('type') === 'test';

    // 1. 데이터 로드
    const sessionData = {
        userName: GetFridgeCookie('fridge_name') || "코니",
        fridgeIdx: parseInt(GetFridgeCookie('fridge_idx')),
        fridgeStatus: GetFridgeCookie('fridge_status'),
        isTestMode: isTestMode
    };

    // 2. 보안 및 정합성 체크 (테스트 모드일 때는 스킵)
    if (!isTestMode) {
        if (!checkSecurity(sessionData)) return;
        if (!checkPageConsistency(pageNum, sessionData.fridgeIdx)) return;
    } else {
        console.warn(`[TEST MODE] ${pageNum}번 페이지 강제 로드됨.`);
    }

    // 3. UI 렌더링
    renderHeader(pageNum, sessionData.userName);
    renderFooter();
    injectModals();
    // 4.  온도바 색상 적용
    applyTempBarColor(pageNum);
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

// 힌트 처리
window.handleHint = function(n) {
    // const limits = [60, 180, 300]; 
    const limits = [1, 3, 5]; 
    const limit = limits[n-1];
    $('#hint-title').text('💡 힌트 ' + n);
    if (hintInterval) clearInterval(hintInterval);

    const update = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed < limit) {
            const rem = limit - elapsed;
            const m = Math.floor(rem / 60), s = rem % 60;
            $('#hint-msg').html(`<span class="lock-icon">🔒</span> 아직 볼 수 없습니다.<br><br><strong>${m > 0 ? m+'분 ' : ''}${s}초</strong> 뒤에 공개됩니다.`);
        } else {
            clearInterval(hintInterval);
            $('#hint-msg').html(window.hints[n-1]);
        }
    };
    update();
    hintInterval = setInterval(update, 1000);
    $('#hint-modal').css('display', 'flex');
};

window.closeHint = () => { if(hintInterval) clearInterval(hintInterval); $('#hint-modal').hide(); };

// window.showResultModal = function(options) {
//     // 1. 매개변수로 전달받은 pageNum을 사용합니다. (예: 1번 문제면 1이 들어옴)
//     const { success, message, onRetry, pageNum } = options; 
//     const modal = $('#result-modal');
//     const title = $('#modal-title');
//     const msg = $('#modal-msg');
//     const okBtn = $('#modal-ok-btn');
//     const retryBtn = $('#modal-retry-btn');

//     if (success) {
//         // [중요] 여기서 const pageNum을 다시 선언하던 줄을 삭제했습니다!
//         title.text('정답입니다!').removeClass('fail-title-color').addClass('result-title-color');
//         msg.text(message || '성공적으로 미션을 완수했습니다.');
        
//         okBtn.show().text('다음 문제로').off().click(() => {
//             modal.hide();
            
//             // 2. 현재 페이지 번호(pageNum)를 그대로 애니메이션 함수에 넘깁니다.
//             // 더하기(+1)는 이 안에서 딱 한 번만 수행하도록 통일했습니다.
//             if (typeof window.runTemperatureSequence === 'function') {
//                 window.runTemperatureSequence(pageNum);
//             } else {
//                 // 백업 로직
//                 const nextIdx = pageNum + 1;
//                 SetFridgeCookie('fridge_idx', nextIdx);
//                 window.location.href = `question_${nextIdx}.html`;
//             }
//         });
//         retryBtn.hide();
//     } else {
//         // 실패 로직 (동일)
//         title.text('길을 잃었어요!').removeClass('result-title-color').addClass('fail-title-color');
//         msg.text(message || '규칙이 어긋났습니다. 다시 확인해보세요.');
//         okBtn.hide();
//         retryBtn.show().text('다시 시도하기').off().click(() => {
//             modal.hide();
//             if(onRetry) onRetry();
//         });
//     }
//     modal.css('display', 'flex');
// };

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