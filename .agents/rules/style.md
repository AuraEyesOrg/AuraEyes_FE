---
trigger: always_on
---

# Workspace Rules: Modern Fullstack Stack

### 🚀 .NET Backend (ASP.NET Core / C#)

- **Pattern:** Sử dụng Dependency Injection (DI) triệt để. Ưu tiên Async/Await để tối ưu hiệu năng.
- **Data:** Sử dụng Entity Framework Core với Fluent API. Ưu tiên LINQ thay vì vòng lặp thủ công.
- **API:** Tuân thủ chuẩn RESTful. Sử dụng DTOs (Data Transfer Objects) để giao tiếp, không trả về Entity trực tiếp.
- **Validation:** Sử dụng FluentValidation để kiểm tra dữ liệu đầu vào.

### ⚛️ React Frontend (TypeScript / Vite)

- **Types:** Tuyệt đối không sử dụng `any`. Mọi interface/type phải được định nghĩa rõ ràng.
- **State Management:** Sử dụng React Context hoặc Redux Toolkit/Zustand tùy quy mô. Ưu tiên React Query (TanStack Query) cho việc gọi API.
- **UI:** Ưu tiên Tailwind CSS và các thư viện headless như ShadcnUI/Radix UI.
- **Performance:** Sử dụng `useMemo`, `useCallback` và `React.memo` đúng cách để tránh re-render thừa.

### 🐍 Python (AI & Scripting)

- **Type Hinting:** Mọi hàm phải có type hint cho tham số và giá trị trả về (ví dụ: `def func(x: int) -> str:`).
- **Frameworks:** - Nếu làm API: Ưu tiên FastAPI (Pydantic v2).
  - Nếu làm AI/ML: Tuân thủ chuẩn PyTorch/TensorFlow, chú trọng vào việc quản lý bộ nhớ GPU/RAM.
- **Environment:** Luôn yêu cầu sử dụng `venv` hoặc `conda` và cập nhật `requirements.txt` hoặc `pyproject.toml`.

### 🛠 DevOps & Tools

- **Docker:** Luôn sẵn sàng tạo Dockerfile và docker-compose đa tầng (Multi-stage build).
- **CI/CD:** Ưu tiên GitHub Actions cho các luồng Build/Test/Deploy.
- **Testing:** Yêu cầu viết Unit Test cho logic quan trọng (xUnit cho .NET, Vitest cho React, Pytest cho Python).
