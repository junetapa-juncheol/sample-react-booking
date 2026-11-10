import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { storageKey, type Booking } from './bookings';

beforeEach(() => localStorage.clear());

test('검색과 상태 필터를 함께 사용하고 빈 결과를 안내한다', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole('searchbox', { name: '예약 검색' }), '1105');
  expect(
    screen.getByRole('button', { name: /YB-1105.*대기/ }),
  ).toBeInTheDocument();
  await user.selectOptions(
    screen.getByRole('combobox', { name: '예약 상태 필터' }),
    '확정',
  );
  expect(screen.getByText('조건에 맞는 예약이 없어요')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '필터 초기화' }));
  expect(
    screen.getByRole('button', { name: /YB-1101.*확정/ }),
  ).toBeInTheDocument();
});

test('대기 예약을 확정하고 새로 렌더링해도 변경을 보존한다', async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  await user.click(screen.getByRole('button', { name: /YB-1103.*대기/ }));
  await user.click(screen.getByRole('button', { name: '예약 확정' }));
  expect(
    JSON.parse(localStorage.getItem(storageKey)!).find(
      (b: Booking) => b.id === 'b-103',
    ).status,
  ).toBe('확정');
  view.unmount();
  render(<App />);
  expect(
    screen.getByRole('button', { name: /YB-1103.*확정/ }),
  ).toBeInTheDocument();
});

test('취소와 복원으로 예약 상태를 되돌린다', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '예약 취소' }));
  expect(
    screen.getByRole('button', { name: /YB-1101.*취소/ }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '예약 복원' }));
  expect(
    screen.getByRole('button', { name: /YB-1101.*확정/ }),
  ).toBeInTheDocument();
});

test('개인정보 입력 없이 선택한 날짜와 인원으로 새 예약을 만든다', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '새 예약' }));
  const dialog = screen.getByRole('dialog');
  await user.selectOptions(within(dialog).getByLabelText('클래스'), '도자기');
  await user.selectOptions(within(dialog).getByLabelText('날짜'), '2026-11-13');
  await user.selectOptions(within(dialog).getByLabelText('인원'), '4');
  await user.click(
    within(dialog).getByRole('button', { name: '대기 예약 추가' }),
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const saved: Booking[] = JSON.parse(localStorage.getItem(storageKey)!);
  expect(saved.at(-1)).toMatchObject({
    kind: '도자기',
    date: '2026-11-13',
    seats: 4,
    status: '대기',
    group: '체험 모임',
  });
});

test('이전 주로 이동해 빈 일정을 보여 주고 모달을 Escape로 닫는다', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '이전 주' }));
  expect(screen.getByText('조건에 맞는 예약이 없어요')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '이용 안내' }));
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '이용 안내' })).toHaveFocus();
});

test('브라우저 저장이 차단되어도 화면에서 변경할 수 있다', async () => {
  const spy = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new Error('blocked');
    });
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '예약 취소' }));
  expect(screen.getByRole('status')).toHaveTextContent(
    '브라우저 저장 공간을 사용할 수 없습니다.',
  );
  expect(
    screen.getByRole('button', { name: /YB-1101.*취소/ }),
  ).toBeInTheDocument();
  spy.mockRestore();
});
