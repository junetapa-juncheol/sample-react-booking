import { useRef, useState, type FormEvent } from 'react';
import {
  addDays,
  classInfo,
  readBookings,
  selectBookings,
  storageKey,
  type Booking,
  type ClassKind,
} from './bookings';
import Icon from './Icon';
import Modal from './Modal';

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
const money = (value: number) => `${value.toLocaleString('ko-KR')}원`;
const dateLabel = (date: string) =>
  `${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일`;

export default function App() {
  const [data, setData] = useState(readBookings);
  const [week, setWeek] = useState('2026-11-09');
  const [kind, setKind] = useState('전체');
  const [status, setStatus] = useState('전체');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('b-101');
  const [modal, setModal] = useState<'new' | 'classes' | 'help' | null>(null);
  const [notice, setNotice] = useState('');
  const detailRef = useRef<HTMLElement>(null);
  const days = Array.from({ length: 7 }, (_, index) => addDays(week, index));
  const visible = selectBookings(data.bookings, week, kind, status, query);
  const weekly = selectBookings(data.bookings, week, '전체', '전체', '');
  const active = weekly.filter((b) => b.status !== '취소');
  const selected = visible.find((b) => b.id === selectedId) ?? visible[0];
  const pending = active.filter((b) => b.status === '대기').length;

  function saveBookings(bookings: Booking[], message: string) {
    setData({ bookings, warning: '' });
    try {
      localStorage.setItem(storageKey, JSON.stringify(bookings));
      setNotice(message);
    } catch {
      setNotice(
        '브라우저 저장 공간을 사용할 수 없습니다. 이번 화면에서만 변경됩니다.',
      );
    }
  }

  function updateStatus(booking: Booking) {
    const next =
      booking.status === '대기' || booking.status === '취소' ? '확정' : '취소';
    saveBookings(
      data.bookings.map((b) =>
        b.id === booking.id ? { ...b, status: next } : b,
      ),
      `${booking.code} 예약을 ${next} 상태로 변경했습니다.`,
    );
  }

  function createBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const kind = fields.get('kind') as ClassKind;
    const id = `b-${Date.now()}`;
    const nextCode =
      Math.max(1100, ...data.bookings.map((b) => Number(b.code.slice(3)))) + 1;
    const date = String(fields.get('date'));
    const booking: Booking = {
      id,
      code: `YB-${nextCode}`,
      group: '체험 모임',
      kind,
      date,
      time:
        kind === '핸드드립' ? '10:00' : kind === '도자기' ? '14:00' : '11:00',
      seats: Number(fields.get('seats')),
      status: '대기',
    };
    saveBookings(
      [...data.bookings, booking],
      `${booking.code} 체험 예약을 추가했습니다.`,
    );
    setKind('전체');
    setStatus('전체');
    setQuery('');
    setSelectedId(id);
    setModal(null);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        본문으로 이동
      </a>
      <aside className="sidebar">
        <a className="brand" href="#main">
          <span className="brand-mark">
            <Icon name="leaf" size={25} />
          </span>
          <span>
            여백<span className="brand-sub">STUDIO YEOBAEK</span>
          </span>
        </a>
        <div className="workspace-label">STUDIO WORKSPACE</div>
        <nav aria-label="주 메뉴">
          <button
            className="nav-item active"
            aria-current="page"
            onClick={() => {
              setWeek('2026-11-09');
              setKind('전체');
              setStatus('전체');
              setQuery('');
            }}
          >
            <Icon name="calendar" />
            예약 관리
            <span className="nav-dot" />
          </button>
          <button className="nav-item" onClick={() => setModal('classes')}>
            <Icon name="book" />
            클래스 안내
          </button>
          <button className="nav-item" onClick={() => setModal('help')}>
            <Icon name="help" />
            이용 안내
          </button>
        </nav>
        <div className="sidebar-note">
          <Icon name="leaf" size={26} />
          <p>
            조금 느리게,
            <br />더 깊이 즐기는 시간.
          </p>
          <span>여백의 하루를 채워 보세요.</span>
        </div>
        <div className="sidebar-bottom">
          <span className="avatar">Y</span>
          <div>
            여백 스튜디오<small>가상 공방 · 체험 공간</small>
          </div>
        </div>
      </aside>

      <main id="main" className="main-content">
        <header className="topbar">
          <span className="breadcrumb">
            워크스페이스 <span>/</span> <strong>예약 관리</strong>
          </span>
          <span className="demo-label">
            <span /> SAMPLE STUDIO
          </span>
        </header>
        <div className="page-heading">
          <div>
            <p className="eyebrow">MAKE ROOM FOR A GOOD DAY</p>
            <h1>클래스 예약</h1>
            <p className="subtitle">
              커피 한 잔의 여유처럼, 오늘의 예약도 차분하게.
            </p>
          </div>
          <button className="primary-button" onClick={() => setModal('new')}>
            <Icon name="plus" size={18} />새 예약
          </button>
        </div>
        <div className="notice" role="status" aria-live="polite">
          {notice ||
            data.warning ||
            '체험 데이터입니다. 변경한 예약은 이 브라우저에 저장됩니다.'}
        </div>

        <section className="stat-grid" aria-label="이번 주 예약 요약">
          <div className="stat-card">
            <span className="stat-icon green">
              <Icon name="calendar" />
            </span>
            <div>
              <span className="stat-title">이번 주 예약</span>
              <p>
                <strong>{active.length}</strong>
                <span>건</span>
              </p>
            </div>
            <span className="stat-foot">취소 제외</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon peach">
              <Icon name="grid" />
            </span>
            <div>
              <span className="stat-title">함께하는 인원</span>
              <p>
                <strong>{active.reduce((sum, b) => sum + b.seats, 0)}</strong>
                <span>명</span>
              </p>
            </div>
            <span className="stat-foot">예약 인원 합계</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon gold">
              <Icon name="clock" />
            </span>
            <div>
              <span className="stat-title">확인을 기다려요</span>
              <p>
                <strong>{pending}</strong>
                <span>건</span>
              </p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setStatus('대기');
                setKind('전체');
                setQuery('');
              }}
            >
              대기 예약 보기 <Icon name="arrow" size={15} />
            </button>
          </div>
        </section>

        <div className="workspace-grid">
          <div className="schedule-column">
            <section
              className="card calendar-card"
              aria-labelledby="calendar-heading"
            >
              <div className="section-heading">
                <div className="heading-inline">
                  <h2 id="calendar-heading">이번 주 일정</h2>
                  <span className="muted small">WEEKLY</span>
                </div>
                <div className="week-control">
                  <button
                    className="icon-button"
                    aria-label="이전 주"
                    onClick={() => setWeek(addDays(week, -7))}
                  >
                    ‹
                  </button>
                  <span>
                    {dateLabel(week)} – {dateLabel(days[6])}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="다음 주"
                    onClick={() => setWeek(addDays(week, 7))}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="calendar-grid">
                {days.map((date, index) => (
                  <div
                    key={date}
                    className={`calendar-day ${date === '2026-11-10' ? 'reference-day' : ''}`}
                  >
                    <div className="day-heading">
                      <span>{weekdays[index]}</span>
                      <strong>{Number(date.slice(8))}</strong>
                    </div>
                    <div className="day-events">
                      {weekly
                        .filter((b) => b.date === date && b.status !== '취소')
                        .map((b) => (
                          <button
                            key={b.id}
                            className={`calendar-event ${classInfo[b.kind].tone}`}
                            onClick={() => {
                              setKind('전체');
                              setStatus('전체');
                              setQuery('');
                              setSelectedId(b.id);
                            }}
                          >
                            <span>{b.time}</span>
                            <strong>{b.kind}</strong>
                            <small>{b.seats}명</small>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="calendar-legend">
                <span>
                  <i className="coffee-dot" />
                  핸드드립
                </span>
                <span>
                  <i className="pottery-dot" />
                  도자기
                </span>
                <span>
                  <i className="baking-dot" />
                  베이킹
                </span>
                <span className="legend-note">체험 기준일 2026. 11. 10.</span>
              </div>
            </section>

            <section
              className="card booking-card"
              aria-labelledby="list-heading"
            >
              <div className="section-heading">
                <div className="heading-inline">
                  <h2 id="list-heading">예약 목록</h2>
                  <span className="count-pill">{visible.length}</span>
                </div>
                <label className="search-field">
                  <Icon name="search" size={16} />
                  <input
                    type="search"
                    aria-label="예약 검색"
                    placeholder="예약번호, 클래스 검색"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="filter-row">
                <div className="tabs" role="group" aria-label="클래스 필터">
                  {['전체', ...Object.keys(classInfo)].map((item) => (
                    <button
                      key={item}
                      className={kind === item ? 'selected' : ''}
                      aria-pressed={kind === item}
                      onClick={() => setKind(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <label className="status-filter">
                  <span className="sr-only">예약 상태 필터</span>
                  <select
                    aria-label="예약 상태 필터"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="전체">모든 상태</option>
                    <option>확정</option>
                    <option>대기</option>
                    <option>취소</option>
                  </select>
                </label>
              </div>
              <div className="table-labels" aria-hidden="true">
                <span>클래스 / 예약번호</span>
                <span>일정</span>
                <span>인원</span>
                <span>상태</span>
                <span />
              </div>
              <div className="booking-list">
                {visible.length === 0 ? (
                  <div className="empty-state">
                    <Icon name="calendar" size={30} />
                    <h3>조건에 맞는 예약이 없어요</h3>
                    <p>검색어나 필터를 바꾸거나 새 예약을 추가해 보세요.</p>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setQuery('');
                        setKind('전체');
                        setStatus('전체');
                      }}
                    >
                      필터 초기화
                    </button>
                  </div>
                ) : (
                  visible.map((b) => (
                    <button
                      key={b.id}
                      className={`booking-row ${selected?.id === b.id ? 'row-selected' : ''}`}
                      aria-pressed={selected?.id === b.id}
                      onClick={() => {
                        setSelectedId(b.id);
                        detailRef.current?.focus();
                      }}
                    >
                      <span className="booking-title">
                        <span
                          className={`class-avatar ${classInfo[b.kind].tone}`}
                        >
                          <Icon
                            name={
                              b.kind === '핸드드립'
                                ? 'leaf'
                                : b.kind === '도자기'
                                  ? 'grid'
                                  : 'book'
                            }
                            size={19}
                          />
                        </span>
                        <span>
                          <strong>{classInfo[b.kind].title}</strong>
                          <small>
                            {b.code} · {b.group}
                          </small>
                        </span>
                      </span>
                      <span className="booking-date">
                        {dateLabel(b.date)}
                        <small>{b.time}</small>
                      </span>
                      <span className="booking-seats">{b.seats}명</span>
                      <span
                        className={`status-badge ${b.status === '확정' ? 'confirmed' : b.status === '대기' ? 'pending' : 'cancelled'}`}
                      >
                        {b.status}
                      </span>
                      <Icon name="arrow" size={16} />
                    </button>
                  ))
                )}
              </div>
              <div className="list-footer">
                <span>총 {visible.length}개의 예약</span>
                <span>
                  <Icon name="check" size={14} />
                  브라우저에 저장
                </span>
              </div>
            </section>
          </div>

          <aside
            ref={detailRef}
            tabIndex={-1}
            className="card detail-card"
            aria-label="예약 상세"
          >
            <div className="section-heading">
              <h2>예약 상세</h2>
              <span className="muted small">DETAIL</span>
            </div>
            {selected ? (
              <>
                <div className={`detail-art ${classInfo[selected.kind].tone}`}>
                  <span className="detail-circle">
                    <Icon
                      name={selected.kind === '핸드드립' ? 'leaf' : 'book'}
                      size={43}
                    />
                  </span>
                  <span className="detail-art-label">
                    A LITTLE MOMENT FOR YOU
                  </span>
                </div>
                <span className="detail-category">{selected.kind} 클래스</span>
                <h3>{classInfo[selected.kind].title}</h3>
                <p className="detail-code">{selected.code}</p>
                <dl className="detail-fields">
                  <div>
                    <dt>예약 모임</dt>
                    <dd>{selected.group}</dd>
                  </div>
                  <div>
                    <dt>클래스 일정</dt>
                    <dd>
                      {dateLabel(selected.date)} · {selected.time}
                    </dd>
                  </div>
                  <div>
                    <dt>소요 시간</dt>
                    <dd>{classInfo[selected.kind].duration}</dd>
                  </div>
                  <div>
                    <dt>예약 인원</dt>
                    <dd>{selected.seats}명</dd>
                  </div>
                  <div>
                    <dt>예약 상태</dt>
                    <dd>{selected.status}</dd>
                  </div>
                </dl>
                <div className="total-line">
                  <span>체험 금액</span>
                  <strong>
                    {money(classInfo[selected.kind].price * selected.seats)}
                  </strong>
                </div>
                <div className="detail-note">
                  <Icon name="help" size={17} />
                  <p>
                    앞치마와 재료는 준비되어 있어요.
                    <br />
                    시작 10분 전 여유롭게 만나요.
                  </p>
                </div>
                <button
                  className={
                    selected.status === '확정'
                      ? 'secondary-button full-width'
                      : 'primary-button full-width'
                  }
                  onClick={() => updateStatus(selected)}
                >
                  {selected.status === '확정'
                    ? '예약 취소'
                    : selected.status === '취소'
                      ? '예약 복원'
                      : '예약 확정'}
                  <Icon name="arrow" size={17} />
                </button>
                <p className="detail-disclaimer">
                  가상 예약입니다. 실제 예약·결제는 진행되지 않습니다.
                </p>
              </>
            ) : (
              <div className="empty-state">
                <Icon name="book" size={32} />
                <p>목록에서 예약을 선택해 주세요.</p>
              </div>
            )}
          </aside>
        </div>
        <footer className="page-footer">
          <span>
            여백 스튜디오 <span>·</span> 작은 취향이 모이는 곳
          </span>
          <span>FICTIONAL STUDIO / LOCAL DEMO</span>
        </footer>
      </main>

      {modal && (
        <Modal
          title={
            modal === 'new'
              ? '새 클래스 예약'
              : modal === 'classes'
                ? '여백의 클래스'
                : '이용 안내'
          }
          onClose={() => setModal(null)}
        >
          {modal === 'new' ? (
            <form onSubmit={createBooking} className="booking-form">
              <p className="subtitle">
                현재 보고 있는 주에 체험 예약을 추가합니다.
              </p>
              <label>
                클래스
                <select name="kind" aria-label="클래스" required>
                  {Object.keys(classInfo).map((key) => (
                    <option key={key}>{key}</option>
                  ))}
                </select>
              </label>
              <label>
                날짜
                <select name="date" aria-label="날짜" required>
                  {days.map((date, index) => (
                    <option key={date} value={date}>
                      {dateLabel(date)} ({weekdays[index]})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                인원
                <select name="seats" aria-label="인원" required>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}명
                    </option>
                  ))}
                </select>
              </label>
              <p className="form-note">
                핸드드립 10:00 · 베이킹 11:00 · 도자기 14:00
                <br />
                예약 모임은 ‘체험 모임’으로 표시됩니다.
              </p>
              <button type="submit" className="primary-button full-width">
                대기 예약 추가
                <Icon name="plus" size={17} />
              </button>
            </form>
          ) : modal === 'classes' ? (
            <div className="class-guide">
              {Object.entries(classInfo).map(([name, info]) => (
                <div key={name}>
                  <span className={`class-avatar ${info.tone}`}>
                    <Icon name="leaf" />
                  </span>
                  <div>
                    <h3>{info.title}</h3>
                    <p>
                      {name} · {info.duration} · 1인 {money(info.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="help-copy">
              <p>
                여백은 커피, 도자기, 베이킹 클래스를 체험하는 가상 공방입니다.
              </p>
              <p>
                주간 달력으로 일정을 살펴보고, 검색·필터로 예약을 찾아 상세
                패널에서 확정하거나 취소할 수 있습니다. 취소한 예약은 다시
                복원할 수 있습니다.
              </p>
              <p>
                개인정보는 입력받지 않습니다. 예약은 현재 브라우저에만 저장되며,
                브라우저 저장 공간을 비우면 초기 데이터로 돌아갑니다.
              </p>
              <p>
                달력의 기준 주는 2026년 11월 9일입니다. 실제 날짜와 관계없이
                같은 체험 데이터를 보여 줍니다.
              </p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
