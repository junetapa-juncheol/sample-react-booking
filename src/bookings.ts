export type ClassKind = '핸드드립' | '도자기' | '베이킹';
export type BookingStatus = '확정' | '대기' | '취소';
export interface Booking {
  id: string;
  code: string;
  group: string;
  kind: ClassKind;
  date: string;
  time: string;
  seats: number;
  status: BookingStatus;
}

export const storageKey = 'yeobaek-bookings-v1';
export const classInfo: Record<
  ClassKind,
  { title: string; duration: string; price: number; tone: string }
> = {
  핸드드립: {
    title: '천천히 내리는 커피',
    duration: '90분',
    price: 35000,
    tone: 'coffee',
  },
  도자기: {
    title: '나만의 작은 그릇',
    duration: '120분',
    price: 55000,
    tone: 'pottery',
  },
  베이킹: {
    title: '오븐에서 만난 오후',
    duration: '120분',
    price: 45000,
    tone: 'baking',
  },
};

export const initialBookings: Booking[] = [
  {
    id: 'b-101',
    code: 'YB-1101',
    group: '모임 A',
    kind: '핸드드립',
    date: '2026-11-10',
    time: '10:00',
    seats: 2,
    status: '확정',
  },
  {
    id: 'b-102',
    code: 'YB-1102',
    group: '모임 B',
    kind: '도자기',
    date: '2026-11-10',
    time: '14:00',
    seats: 3,
    status: '확정',
  },
  {
    id: 'b-103',
    code: 'YB-1103',
    group: '모임 C',
    kind: '베이킹',
    date: '2026-11-11',
    time: '11:00',
    seats: 2,
    status: '대기',
  },
  {
    id: 'b-104',
    code: 'YB-1104',
    group: '모임 D',
    kind: '핸드드립',
    date: '2026-11-12',
    time: '10:00',
    seats: 1,
    status: '확정',
  },
  {
    id: 'b-105',
    code: 'YB-1105',
    group: '모임 E',
    kind: '도자기',
    date: '2026-11-13',
    time: '14:00',
    seats: 2,
    status: '대기',
  },
  {
    id: 'b-106',
    code: 'YB-1106',
    group: '모임 F',
    kind: '베이킹',
    date: '2026-11-14',
    time: '11:00',
    seats: 4,
    status: '확정',
  },
  {
    id: 'b-107',
    code: 'YB-1107',
    group: '모임 G',
    kind: '도자기',
    date: '2026-11-15',
    time: '14:00',
    seats: 2,
    status: '확정',
  },
  {
    id: 'b-108',
    code: 'YB-1108',
    group: '모임 H',
    kind: '핸드드립',
    date: '2026-11-09',
    time: '10:00',
    seats: 2,
    status: '취소',
  },
];

export function addDays(date: string, count: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
}

export function validBooking(value: unknown): value is Booking {
  if (!value || typeof value !== 'object') return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.id === 'string' &&
    /^b-[a-z0-9-]+$/.test(b.id) &&
    typeof b.code === 'string' &&
    /^YB-\d+$/.test(b.code) &&
    typeof b.group === 'string' &&
    /^모임 [A-Z]$|^체험 모임$/.test(b.group) &&
    typeof b.kind === 'string' &&
    Object.hasOwn(classInfo, b.kind) &&
    typeof b.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
    !Number.isNaN(Date.parse(`${b.date}T00:00:00Z`)) &&
    addDays(b.date, 0) === b.date &&
    ['10:00', '11:00', '14:00'].includes(String(b.time)) &&
    Number.isInteger(b.seats) &&
    Number(b.seats) >= 1 &&
    Number(b.seats) <= 6 &&
    ['확정', '대기', '취소'].includes(String(b.status))
  );
}

export function readBookings(): { bookings: Booking[]; warning: string } {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return { bookings: initialBookings, warning: '' };
    const parsed: unknown = JSON.parse(stored);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(validBooking) ||
      new Set(parsed.map((b) => b.id)).size !== parsed.length
    ) {
      throw new Error('Invalid booking data');
    }
    return { bookings: parsed, warning: '' };
  } catch {
    return {
      bookings: initialBookings,
      warning: '저장된 예약을 읽을 수 없어 체험 데이터를 표시합니다.',
    };
  }
}

export function selectBookings(
  bookings: Booking[],
  week: string,
  kind: string,
  status: string,
  query: string,
): Booking[] {
  const last = addDays(week, 6);
  const term = query.trim().toLowerCase();
  return bookings
    .filter(
      (b) =>
        b.date >= week &&
        b.date <= last &&
        (kind === '전체' || b.kind === kind) &&
        (status === '전체' || b.status === status) &&
        `${b.code} ${b.group} ${b.kind} ${classInfo[b.kind].title}`
          .toLowerCase()
          .includes(term),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}
