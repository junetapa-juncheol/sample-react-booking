import {
  addDays,
  initialBookings,
  readBookings,
  selectBookings,
  storageKey,
  validBooking,
} from './bookings';

beforeEach(() => localStorage.clear());

test('주 경계와 월 경계를 날짜 손실 없이 이동한다', () => {
  expect(addDays('2026-11-09', -7)).toBe('2026-11-02');
  expect(addDays('2026-11-30', 6)).toBe('2026-12-06');
});

test('주간 범위, 클래스, 상태, 검색 조건을 함께 적용한다', () => {
  expect(
    selectBookings(initialBookings, '2026-11-09', '도자기', '대기', '1105').map(
      (b) => b.id,
    ),
  ).toEqual(['b-105']);
  expect(
    selectBookings(initialBookings, '2026-11-16', '전체', '전체', ''),
  ).toEqual([]);
});

test('잘못된 날짜와 저장 데이터 구조를 거부한다', () => {
  expect(validBooking({ ...initialBookings[0], date: '2026-02-30' })).toBe(
    false,
  );
  expect(validBooking({ ...initialBookings[0], seats: -1 })).toBe(false);
  expect(validBooking({ ...initialBookings[0], kind: '__proto__' })).toBe(
    false,
  );
  localStorage.setItem(storageKey, '{broken');
  expect(readBookings().bookings).toEqual(initialBookings);
  expect(readBookings().warning).not.toBe('');
});

test('중복 예약 식별자가 있는 저장 데이터를 복구한다', () => {
  localStorage.setItem(
    storageKey,
    JSON.stringify([initialBookings[0], initialBookings[0]]),
  );
  expect(readBookings().warning).not.toBe('');
});
