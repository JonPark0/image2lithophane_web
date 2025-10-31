# Image to Lithophane Converter

이미지를 리소페인(Lithophane) 3D 모델로 변환하는 웹 애플리케이션입니다.

## 기능

### 리소페인 타입
- **평면형**: 단일 이미지로 생성하는 평면형 리소페인
- **원통형**: 곡면에 이미지가 배치되는 원통형 리소페인
- **n각기둥형**: 다중 이미지를 각 면에 배치 (3~8면)

### 주요 기능
- 이미지 업로드 및 미리보기
- 치수 설정 (가로, 세로, 높이, 두께)
- 이미지 조정 모드 (늘리기, 맞추기, 채우기, 타일)
- 실시간 3D 미리보기
- STL 파일 다운로드

## 기술 스택

- **Vite**: 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Three.js**: 3D 그래픽 라이브러리
- **OrbitControls**: 3D 뷰어 컨트롤

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 미리보기

```bash
npm run preview
```

## GitHub Pages 배포

이 프로젝트는 GitHub Actions를 통해 자동으로 배포됩니다.

1. GitHub 저장소 생성
2. 코드를 main 브랜치에 푸시
3. GitHub 저장소 Settings > Pages에서 Source를 "GitHub Actions"로 설정
4. 자동으로 배포가 진행됩니다

배포 URL: `https://<username>.github.io/<repository-name>/`

## 프로젝트 구조

```
image2lithophane_web/
├── src/
│   ├── main.js                    # 앱 진입점
│   ├── styles/
│   │   └── main.css              # Tailwind CSS 설정
│   ├── components/
│   │   ├── type-selector.js      # 리소페인 타입 선택
│   │   ├── image-uploader.js     # 이미지 업로드
│   │   ├── dimension-controls.js # 치수 입력
│   │   └── preview-viewer.js     # 3D 미리보기
│   ├── core/
│   │   ├── lithophane-generator.js # 리소페인 생성 로직
│   │   ├── mesh-builder.js         # 3D 메쉬 생성
│   │   └── image-processor.js      # 이미지 처리
│   └── utils/
│       └── stl-exporter.js        # STL 파일 내보내기
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 사용 방법

1. **리소페인 타입 선택**: 평면형, 원통형, n각기둥형 중 선택
2. **이미지 업로드**: 변환할 이미지 업로드
3. **치수 설정**: 가로, 세로, 높이, 두께 등 설정
4. **이미지 조정**: 늘리기, 맞추기, 채우기, 타일 중 선택
5. **변환하기**: 리소페인 생성
6. **미리보기**: 3D 뷰어에서 확인
7. **다운로드**: STL 파일 다운로드

## 라이선스

MIT License
