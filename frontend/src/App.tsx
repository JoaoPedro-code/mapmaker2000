import GameCanvas from './components/GameCanvas';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>atWar Clone Prototype</h1>
      <GameCanvas />
    </div>
  );
}

export default App;
