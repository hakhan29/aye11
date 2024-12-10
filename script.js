const video = document.getElementById('video');
const expressionDiv = document.getElementById('expression');
const colorBox = document.getElementById('colorBox'); 
const clickText = document.getElementById('clickText');
const title = document.querySelector('h1');
const subtitle = document.querySelector('p');
const emotionResult = document.getElementById('emotionResult');
const mainEmotionText = document.getElementById('mainEmotion');
const finalColorBox = document.getElementById('finalColorBox');
let finalColor = '';
let mainEmotion = '';

// 감정별 추천 문구
const emotionMessages = {
    anger: "화가 날 땐 잠시 심호흡을 해보세요. 마음을 차분히 가다듬으면 새로운 시야가 열립니다.",
    happy: "행복한 순간을 마음껏 만끽하세요! 이 순간을 사진으로 남겨보는 건 어떨까요?",
    sad: "슬플 땐 감정을 충분히 느껴보세요. 하지만 곧 더 나은 날이 올 거예요.",
    neutral: "지금의 차분함을 유지하며 스스로에게 집중해보는 시간을 가져보세요.",
    surprised: "놀랐다면, 그 놀라움을 즐겨보세요! 새로운 경험이 당신을 기다리고 있어요.",
    fear: "두려움을 느낄 땐 스스로를 믿으세요. 당신은 충분히 이겨낼 수 있습니다.",
};

// 감정별 음악 객체 생성
const audioMap = {
    anger: new Audio('./audio/anger.mp3'),
    happy: new Audio('./audio/happy.mp3'),
    sad: new Audio('./audio/sad.mp3'),
    neutral: new Audio('./audio/neutral.mp3'),
    surprised: new Audio('./audio/surprised.mp3'),
    fear: new Audio('./audio/fear.mp3'),
};

// 초기 상태: 클릭 텍스트를 필요할 때만 표시
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        clickText.style.display = 'block';
    }, 2000);
});

// 클릭 시 이벤트
clickText.addEventListener('click', () => {
    clickText.style.display = 'none';

    // 모든 음악을 볼륨 0으로 재생
    Object.values(audioMap).forEach(audio => {
        audio.volume = 0;
        audio.loop = true;
        audio.play();
    });

    title.style.display = 'none';
    subtitle.textContent = "잠시 후 카메라가 켜집니다. 카메라를 보며 담고 싶은 감정을 표정으로 드러내주세요.";
    setTimeout(() => {
        subtitle.style.display = 'none';
        startVideo();
        video.style.display = 'block';
        colorBox.style.display = 'block';
        expressionDiv.style.display = 'block';

        // 5초 후 컬러와 메인 감정을 저장하고 카메라 종료
        setTimeout(() => {
            stopVideo();
            showFinalResult();
        }, 5000);
    }, 3000);
});

// 모델 파일 로드
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error(err));
}

function stopVideo() {
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => track.stop());
    video.srcObject = null;
}

function showFinalResult() {
    video.style.display = 'none';
    colorBox.style.display = 'none';
    expressionDiv.style.display = 'none';

    emotionResult.style.display = 'block';
    finalColorBox.style.width = '400px';
    finalColorBox.style.height = '200px';
    finalColorBox.style.margin = '20px auto';
    finalColorBox.style.background = finalColor;

    mainEmotionText.textContent = mainEmotion;

    adjustMusicVolume(mainEmotion);

    setTimeout(() => {
        createInputSection();
    }, 1000);
}

function adjustMusicVolume(emotion) {
    Object.values(audioMap).forEach(audio => {
        audio.volume = 0;
    });

    const targetAudio = audioMap[emotion];
    if (targetAudio) {
        targetAudio.volume = 1.0;
    }
}

function createInputSection() {
    const inputSection = document.createElement('div');
    inputSection.style.textAlign = 'center';
    inputSection.style.marginTop = '20px';

    const dateNow = new Date();
    const formattedDate = `${dateNow.getFullYear()}년 ${dateNow.getMonth() + 1}월 ${dateNow.getDate()}일`;

    const dateText = document.createElement('p');
    dateText.textContent = formattedDate;
    inputSection.appendChild(dateText);

    const inputBox = document.createElement('input');
    inputBox.type = 'text';
    inputBox.placeholder = '이름을 입력하세요';
    inputBox.style.marginRight = '10px';

    const inputButton = document.createElement('button');
    inputButton.textContent = '입력하기';
    inputButton.addEventListener('click', () => handleInputSubmit(inputBox.value, formattedDate));

    inputSection.appendChild(inputBox);
    inputSection.appendChild(inputButton);

    const guideText = document.createElement('p');
    guideText.textContent = "이름을 입력하여 이 감정을 기록해보세요.";
    guideText.style.marginTop = '10px';

    inputSection.appendChild(guideText);

    const resetButton = document.createElement('button');
    resetButton.textContent = '처음으로 돌아가기';
    resetButton.style.marginTop = '20px';
    resetButton.addEventListener('click', resetToStart);

    inputSection.appendChild(resetButton);

    emotionResult.appendChild(inputSection);
}

function resetToStart() {
    emotionResult.innerHTML = '';
    clickText.style.display = 'block';
    title.style.display = 'block';
    subtitle.style.display = 'block';
    subtitle.textContent = '당신의 감정을 확인해보세요.';

    Object.values(audioMap).forEach(audio => {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
    });

    finalColor = '';
    mainEmotion = '';
}

function handleInputSubmit(name, date) {
    emotionResult.innerHTML = '';

    const recordSection = document.createElement('div');
    recordSection.style.textAlign = 'center';

    const dateText = document.createElement('p');
    dateText.textContent = date;
    dateText.style.marginBottom = '20px';
    recordSection.appendChild(dateText);

    const emotionTitle = document.createElement('h2');
    emotionTitle.textContent = `${name}의 감정`;
    emotionTitle.style.marginBottom = '20px';
    recordSection.appendChild(emotionTitle);

    const colorBox = document.createElement('div');
    colorBox.style.width = '400px';
    colorBox.style.height = '200px';
    colorBox.style.background = finalColor;
    colorBox.style.margin = '0 auto 20px';
    recordSection.appendChild(colorBox);

    const emotionText = document.createElement('p');
    emotionText.textContent = mainEmotion;
    emotionText.style.fontSize = '1.5rem';
    emotionText.style.marginBottom = '10px';
    recordSection.appendChild(emotionText);

    const messageText = document.createElement('p');
    messageText.textContent = emotionMessages[mainEmotion] || "감정과 관련된 추천 문구가 없습니다.";
    recordSection.appendChild(messageText);

    emotionResult.appendChild(recordSection);
}

video.addEventListener('play', () => {
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        if (detections.length > 0) {
            const expressions = detections[0].expressions;

            const anger = expressions.anger || 0;
            const happy = expressions.happy || 0;
            const sad = expressions.sad || 0;
            const neutral = expressions.neutral || 0;
            const surprised = expressions.surprised || 0;
            const fear = expressions.fear || 0;

            const maxEmotion = Math.max(anger, happy, sad, neutral, surprised, fear);

            if (maxEmotion === anger) {
                mainEmotion = 'anger';
                finalColor = '#FF0000';
            } else if (maxEmotion === happy) {
                mainEmotion = 'happy';
                finalColor = '#FFFF00';
            } else if (maxEmotion === sad) {
                mainEmotion = 'sad';
                finalColor = '#0000FF';
            } else if (maxEmotion === neutral) {
                mainEmotion = 'neutral';
                finalColor = '#FFFFFF';
            } else if (maxEmotion === surprised) {
                mainEmotion = 'surprised';
                finalColor = '#FFA500';
            } else if (maxEmotion === fear) {
                mainEmotion = 'fear';
                finalColor = '#800080';
            }

            colorBox.style.background = finalColor;
            expressionDiv.textContent = `현재 감정: ${mainEmotion}`;
        }
    }, 100);
});
