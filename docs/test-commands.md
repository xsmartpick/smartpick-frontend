### 1. Run All Tests (Watch Mode)
```bash
pnpm test
```
**Khi dùng**: Development, tự động re-run khi file thay đổi
**Output**: Interactive mode với file watcher

### 2. Run Tests Once (CI Mode)
```bash
pnpm test:run
```
**Khi dùng**: Trước khi commit, trong CI/CD
**Output**: Run 1 lần rồi exit
**Exit code**: 0 = pass, 1 = fail


### 3. Run Tests với UI
```bash
pnpm test:ui
```
**Khi dùng**: Debug tests, xem chi tiết từng test
**Output**: Mở browser với Vitest UI
**Features**:
- Tree view của tất cả tests
- Re-run specific tests
- View test duration
- View test output
- Filter tests

### 4. Run Tests với Coverage
```bash
pnpm test:coverage
```
**Khi dùng**: Kiểm tra code coverage
**Output**: Coverage report trong terminal + HTML report


### 5. Run Unit Tests Only (Components + Hooks)
```bash
pnpm test:unit
```
**Khi dùng**: Chỉ chạy tests cho UI components và custom hooks
**Filter**: Chỉ chạy tests trong `src/components` và `src/hooks`
**Output**: Coverage report cho unit tests only



### 6. Run Specific Test File
```bash
pnpm vitest src/components/ui/button/Button.test.tsx
```
**Khi dùng**: Debug một component cụ thể
**Output**: Chỉ chạy tests trong file đó

---

### 7. Run Tests Matching Pattern
```bash
pnpm vitest --grep "loading state"
```
**Khi dùng**: Chỉ chạy tests có tên chứa "loading state"
**Output**: Filtered tests

### 8. Run Tests với Debug Mode
```bash
pnpm vitest --inspect-brk
```
**Khi dùng**: Debug tests với Chrome DevTools
**Output**: Pause tại breakpoints trong tests

---

## 🎯 Component-Specific Test Commands

### 9. Run All UI Component Tests (Phase 2)
```bash
pnpm vitest src/components/ui
```
**Khi dùng**: Chạy tất cả tests cho base UI components
**Coverage**: Button, Input, Checkbox, Switch, Dialog, Table, Pagination, Select
**Output**: 280 tests (235 passing - 83.9%)

### 10. Run Specific Component Test
```bash
# Button component
pnpm vitest src/components/ui/button

# Input component
pnpm vitest src/components/ui/input

# Checkbox component
pnpm vitest src/components/ui/checkbox

# Switch component
pnpm vitest src/components/ui/switch

# Dialog component
pnpm vitest src/components/ui/dialog

# Table component
pnpm vitest src/components/ui/table

# Pagination component
pnpm vitest src/components/ui/pagination

# Select component
pnpm vitest src/components/ui/select
```
**Khi dùng**: Debug hoặc verify một component cụ thể
**Output**: Tests cho component đó only

### 11. Run Components với 100% Pass Rate
```bash
pnpm vitest src/components/ui/button src/components/ui/input src/components/ui/checkbox src/components/ui/switch src/components/ui/table src/components/ui/pagination
```
**Khi dùng**: Chạy chỉ các components không có test failures
**Coverage**: 6/8 components (Button, Input, Checkbox, Switch, Table, Pagination)
**Output**: 177 tests - 100% passing

### 12. Run Components với Known Issues
```bash
pnpm vitest src/components/ui/dialog src/components/ui/select
```
**Khi dùng**: Debug components có test failures do mock limitations
**Issues**:
- Dialog: Motion mock không preserve data-slot attributes (25 failures)
- Select: Radix portal rendering issues trong jsdom (33 failures)
**Output**: 115 tests (57 passing - 49.6%)

### 13. Run Tests với Coverage cho Specific Component
```bash
# Coverage cho Button component
pnpm vitest --coverage src/components/ui/button

# Coverage cho tất cả UI components
pnpm vitest --coverage src/components/ui
```
**Khi dùng**: Kiểm tra coverage chi tiết cho component
**Output**: Coverage report với lines/branches/functions percentages

### 14. Run Tests và Update Snapshots
```bash
pnpm vitest -u
```
**Khi dùng**: Update snapshots khi component UI thay đổi intentionally
**Output**: Update snapshot files

### 15. Run Tests với Reporter Verbose
```bash
pnpm vitest --reporter=verbose src/components/ui
```
**Khi dùng**: Xem chi tiết tất cả test cases pass/fail
**Output**: Full list của tất cả 280 tests với status

---