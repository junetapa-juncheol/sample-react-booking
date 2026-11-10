# 여백 스튜디오 · 클래스 예약

가상 공방의 클래스 일정과 예약을 관리하는 프론트엔드 샘플입니다.
주간 달력, 예약 검색·필터, 상세 패널에서 예약 흐름을 살펴볼 수 있습니다.
예약 추가·확정·취소·복원 결과는 현재 브라우저에 저장됩니다.

## 쓴 기술과 근거

| 기술                         | 사용한 곳                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| React 19                     | [src/App.tsx](src/App.tsx): 달력·목록·상세 패널, 상태와 이벤트 처리                                                          |
| TypeScript                   | [src/bookings.ts](src/bookings.ts): 예약 타입·저장 데이터 검증, [tsconfig.json](tsconfig.json): strict 검사                  |
| Vite 8                       | [vite.config.ts](vite.config.ts): 개발 서버, `/sample-react-booking/` 기준 빌드, `docs/` 출력                                |
| ESLint                       | [eslint.config.js](eslint.config.js): TypeScript·React Hooks 규칙                                                            |
| Prettier                     | [.prettierrc.json](.prettierrc.json): 코드 형식, `format:check` 명령                                                         |
| Jest + React Testing Library | [src/App.test.tsx](src/App.test.tsx), [src/bookings.test.ts](src/bookings.test.ts): 사용자 동작과 저장 데이터 경계 조건 10개 |
| GitHub Actions CI            | [.github/workflows/ci.yml](.github/workflows/ci.yml): push·PR에 린트·형식·테스트·빌드                                        |
| Lighthouse                   | [HTML 보고서](reports/lighthouse/mobile.html), [JSON 보고서](reports/lighthouse/mobile.json): Chrome에서 빌드 결과 실측      |
| Chrome 성능 점검             | 이 문서의 성능 점검 절: Lighthouse 지표와 번들 크기를 함께 확인                                                              |

## 실행 방법

Node.js 24와 npm을 사용합니다.

```sh
npm ci
npm run dev
```

개발 주소: `http://127.0.0.1:5173/sample-react-booking/`

```sh
npm run lint
npm run format:check
npm test -- --ci
npm run build
npm run preview
```

빌드 미리보기: `http://127.0.0.1:4173/sample-react-booking/`

## 체험 방법

1. 달력의 이전·다음 주 버튼으로 주간 일정을 이동합니다.
2. 클래스 탭, 예약 상태, 검색어를 함께 적용해 예약을 찾습니다.
3. 목록이나 달력의 예약을 선택해 상세 정보를 확인합니다.
4. 대기 예약을 확정하거나, 확정 예약을 취소한 뒤 복원할 수 있습니다.
5. 새 예약에서 클래스·날짜·인원을 선택하면 ‘체험 모임’의 대기 예약이 추가됩니다.

시작 주는 2026년 11월 9일로 고정되어 있습니다. 새 예약은 현재 보고 있는 주에 추가됩니다.
핸드드립은 10:00, 베이킹은 11:00, 도자기는 14:00에 진행하는 설정입니다.
초기 데이터는 예약 8건이며 취소 1건을 제외한 주간 예약은 7건·16명입니다.
예약 정보는 `localStorage`의 `yeobaek-bookings-v1`에 저장됩니다.
저장 데이터가 손상되면 안내 후 초기 데이터로 복구하고, 저장이 차단되면 현재 화면에서만 변경을 유지합니다.
이름·연락처를 입력받지 않으며 실제 예약·결제는 진행되지 않습니다.

## 보는 주소

[여백 스튜디오 열기](https://junetapa-juncheol.github.io/sample-react-booking/)

위 주소는 저장소 업로드와 GitHub Pages 설정 후 사용하는 주소입니다.
소스와 빌드 결과를 함께 업로드한 다음, Settings → Pages → Deploy from a branch → `main` / `/docs`를 선택합니다.
`docs/index.html`과 `docs/assets/`를 같은 위치 관계로 유지해야 합니다.

## 성능 점검

2026-11-10 10:18 KST에 프로덕션 `docs/`를 로컬 정적 서버의 `/sample-react-booking/` 경로에서 측정했습니다.
환경은 Windows, Chrome 156, Lighthouse 13.6.0, mobile·simulate, CPU 4배 감속·RTT 150ms·1,638.4Kbps입니다.
별도 성능 타임라인 대신 Lighthouse와 번들 크기를 근거로 사용합니다. 공개 호스팅에서는 수치가 달라질 수 있습니다.

| Lighthouse 항목 | 점수 / 100 |
| --------------- | ---------: |
| Performance     |        100 |
| Accessibility   |        100 |
| Best Practices  |        100 |
| SEO             |        100 |

| 지표                    | JSON 실측값 |
| ----------------------- | ----------: |
| FCP                     |  902.9466ms |
| LCP                     |  902.9466ms |
| Total Blocking Time     |         5ms |
| Cumulative Layout Shift |           0 |
| Speed Index             |  902.9466ms |

TBT는 JSON의 `numericValue`이며, Lighthouse의 반올림된 표시값은 10ms입니다.

| 빌드 파일                        | 원본 크기 | gzip 크기 |
| -------------------------------- | --------: | --------: |
| `docs/assets/index-BmkLbfWv.js`  |  239,544B |   74,085B |
| `docs/assets/index-4WpgSDiA.css` |   16,591B |    4,360B |
| 합계                             |  256,135B |   78,445B |

파일 크기는 빌드 결과를 읽어 측정했으며 gzip은 Node.js `gzipSync` 기본 설정으로 압축한 크기입니다.
실제 호스팅 응답의 전송량을 의미하지 않습니다. 빌드가 바뀌면 파일명과 수치도 바뀝니다.
Lighthouse HTML은 같은 폴더의 JSON을 [scripts/render-report.mjs](scripts/render-report.mjs)로 표시한 정적 보고서입니다.
감사별 측정값과 점수는 그대로 유지하며, 재표시는 `npm run report:render`로 실행합니다.
Lighthouse 재측정은 빌드 미리보기를 켠 후 다음과 같이 실행할 수 있습니다.

```sh
npx --yes lighthouse@13.6.0 http://127.0.0.1:4173/sample-react-booking/ --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --output-path=reports/lighthouse/mobile
npm run report:render
```

## 검증

Jest 2개 스위트·10개 테스트, 린트와 형식 검사를 통과했습니다.
Chrome에서 390px·1280px의 하위 경로와 예약 추가·상태 변경·새로고침 후 복구를 확인했습니다.
키보드 포커스, Escape 닫기, 본문 건너뛰기 링크를 지원합니다.
워크플로는 업로드 후 push·PR에서 실행되도록 구성되어 있습니다.

## 라이선스

MIT · Copyright (c) 2026 junetapa. [LICENSE](LICENSE)를 참고하세요.
브라우저 번들에 포함된 라이브러리 고지는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)에 있습니다.
