// src/App.tsx
import { useStore } from './store/useStore';

function App() {
  const { count, increment } = useStore();

  return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🕹️ Monomat Project Foundation</h1>
        <p>Zustand Count: <strong>{count}</strong></p>
        <button onClick={increment} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Increment Test
        </button>
        <div style={{ marginTop: '20px', color: '#666' }}>
          {/* TanStack Query가 정상이라면 개발자 도구(F12)에서 에러가 없어야 합니다. */}
          <small>TanStack Query & Zustand 뼈대 구성 완료</small>
        </div>
      </div>
  );
}

export default App;