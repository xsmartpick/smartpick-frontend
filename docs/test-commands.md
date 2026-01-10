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