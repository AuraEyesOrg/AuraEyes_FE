# Project Context: Aura Retinal Health Screening (Aura Eyes)

You are an expert Senior Frontend Engineer assisting with the "Aura Eyes" project.
This project is a modern web application focused on retinal health screening.

## Tech Stack & Versions

- **Framework:** React 19 (Latest) with Vite.
- **Language:** TypeScript (Strict mode).
- **Styling:** Tailwind CSS v4 (using `@tailwindcss/vite`), SASS for complex overrides.
- **State Management:** Zustand (Client state), TanStack Query v5 (Server state/Async).
- **Routing:** React Router v7.
- **Forms:** React Hook Form + Yup (Validation) + @hookform/resolvers.
- **Animations:** GSAP (Complex timelines) & Framer Motion (UI transitions).
- **Icons:** Lucide React.
- **Testing:** Jest + React Testing Library.

## Coding Principles & Rules

### 1. React & TypeScript

- **React 19:** Use functional components and Hooks. Avoid class components.
- **Typing:** strictly type all props, state, and API responses. Avoid `any`. Use `interface` for object definitions.
- **Imports:** Use absolute paths (configured via `vite-tsconfig-paths`) if applicable, or explicit relative paths.
- **Exports:** Prefer named exports for components (`export const Component = ...`) to ensure consistent naming.

### 2. Styling (Tailwind CSS v4)

- **Priority:** Use Tailwind utility classes for styling. Only use SASS (`.scss`) for very complex animations or legacy overrides.
- **Design System:** Follow a mobile-first approach.
- **Class Sorting:** Keep Tailwind classes organized (e.g., layout -> spacing -> typography -> visual).
- **Components:** When creating reusable UI components, use `clsx` or `tailwind-merge` (if available) or template literals to allow class overriding.

### 3. State Management

- **Global UI State:** Use `zustand`. Keep stores small and focused (e.g., `useAuthStore`, `useThemeStore`).
- **Server Data:** ALWAYS use `@tanstack/react-query` for fetching data. Do not use `useEffect` + `axios` directly in components for data fetching.
- **Mutations:** Use `useMutation` for POST/PUT/DELETE operations.

### 4. Forms & Validation

- **Pattern:** Use `react-hook-form` controlled by `yup` schemas via `@hookform/resolvers/yup`.
- **Validation:** Define the Yup schema _outside_ the component or in a separate `.schema.ts` file.

### 5. Routing (React Router v7)

- Use the modern data APIs (loaders, actions) if adhering to the v7 full-stack capabilities, or standard Route objects.
- Ensure type safety for route parameters.

### 6. Animations

- **UI Interactions:** Use `framer-motion` for simple layout transitions, hover effects, and page transitions.
- **Complex Sequences:** Use `gsap` for timeline-based animations or high-performance interactions.

### 7. Testing

- Write unit tests using `jest` and `@testing-library/react`.
- Mock API calls using Jest mocks or MSW (if setup).

## Code Generation Examples

**Fetching Data:**

```tsx
// Do this:
const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

// Do NOT do this:
useEffect(() => { axios.get('/users').then(...) }, []);
```
