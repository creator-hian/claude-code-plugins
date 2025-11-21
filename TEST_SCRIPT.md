# create_plugin.py 테스트 가이드

## 테스트 시나리오

### 테스트 1: 정상 플로우
```bash
python create_plugin.py
```

**입력값:**
- Plugin name: `test-plugin`
- Description: `Test plugin for validation`
- Author name: `Test User`
- Version: `1.0.0` (또는 Enter로 기본값)
- Proceed: `y`
- Register to marketplace: `n` (테스트이므로)

**예상 결과:**
- `test-plugin` 디렉토리 생성
- `.claude-plugin/plugin.json`의 모든 필드 업데이트 확인
- 성공 메시지 출력

**확인 사항:**
```bash
# 1. 디렉토리 생성 확인
dir test-plugin

# 2. plugin.json 내용 확인
type test-plugin\.claude-plugin\plugin.json

# 3. 폴더 구조 확인
tree test-plugin /F
```

---

### 테스트 2: 중복 이름 검증
```bash
python create_plugin.py
```

**입력값:**
- Plugin name: `csharp-plugin` (이미 존재)

**예상 결과:**
- ❌ 에러 메시지: "Directory 'csharp-plugin' already exists!"
- 다시 입력 요청

---

### 테스트 3: Marketplace 등록
```bash
python create_plugin.py
```

**입력값:**
- Plugin name: `typescript-plugin`
- Description: `TypeScript development helper`
- Author name: `Your Name`
- Version: `1.0.0`
- Proceed: `y`
- Register to marketplace: `y`

**예상 결과:**
- Plugin 생성
- marketplace.json에 entry 추가
- marketplace.json 백업 확인

**확인 사항:**
```bash
# marketplace.json 확인
type marketplace.json
```

---

### 테스트 4: 입력 검증
```bash
python create_plugin.py
```

**테스트 케이스:**
1. Plugin name에 공백 입력 → 에러 메시지
2. Description 빈 값 → 에러 메시지
3. Author 빈 값 → 에러 메시지

---

## 테스트 후 정리

```bash
# 테스트 plugin 삭제
rmdir /S test-plugin
rmdir /S typescript-plugin

# marketplace.json 원상복구 (필요 시)
# Git을 사용하는 경우:
git checkout marketplace.json
```

---

## 피드백 포인트

테스트 후 다음 항목에 대한 피드백을 주세요:

1. **사용성**
   - 입력 프롬프트가 명확한가?
   - 에러 메시지가 이해하기 쉬운가?
   - 성공 메시지가 충분한 정보를 제공하는가?

2. **기능**
   - 빠진 검증 로직이 있는가?
   - 추가해야 할 기능이 있는가?
   - Marketplace 등록 로직이 적절한가?

3. **개선 사항**
   - 추가하고 싶은 옵션이 있는가?
   - 출력 형식 개선이 필요한가?
   - 추가 안내 메시지가 필요한가?

4. **에러 처리**
   - 예상하지 못한 에러가 발생했는가?
   - 에러 복구 방법이 명확한가?

---

## 예상 질문

**Q: Template이 없으면?**
A: 스크립트가 자동으로 감지하고 에러 메시지 출력

**Q: UTF-8 인코딩 문제는?**
A: 스크립트가 `encoding='utf-8'` 사용하여 한글 지원

**Q: Windows Path 문제는?**
A: `Path` 객체 사용으로 OS 독립적

**Q: JSON 파싱 실패 시?**
A: Try-except로 에러 처리 및 명확한 메시지 출력
