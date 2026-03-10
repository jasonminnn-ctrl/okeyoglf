# ⚠️ 필수 수동 조치: .gitignore 업데이트

`.gitignore` 파일이 시스템 관리 파일이라 자동 수정이 불가합니다.
아래 항목을 `.gitignore`에 수동으로 추가해주세요.

```
# Environment variables
.env
.env.*
!.env.example
```

## 왜 필요한가?

- `.env`에는 Supabase URL, anon key 등 실제 값이 포함됩니다.
- 이 값들이 Git 히스토리에 남으면 보안 리스크가 됩니다.
- `.env.example`은 키 이름만 포함한 템플릿이므로 추적 대상에 포함합니다.

## 공개용 키 vs 비밀키 구분

| 키 | 유형 | 위치 |
|---|---|---|
| `VITE_SUPABASE_URL` | 공개용 | `.env` (프론트 빌드 시 포함) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 공개용 (anon key) | `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | **비밀키** | Edge Function secrets only |
| `OPENAI_API_KEY` | **비밀키** | Edge Function secrets only |

**비밀키는 절대 프론트엔드 코드나 `.env`에 포함하지 마세요.**
Lovable Cloud secrets 또는 Edge Function 환경변수로만 관리합니다.
