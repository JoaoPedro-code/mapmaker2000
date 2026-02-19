import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import MapEditor from './components/MapEditor';

function App() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>atWar Clone Prototype</h1>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Switch to Game Mode" : "Switch to Editor Mode"}
        </button>
      </div>

      {isEditing ? <MapEditor /> : <GameCanvas />}
    </div>
  );
}

export default App;
