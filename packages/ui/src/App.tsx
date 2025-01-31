import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { Outlet } from 'react-router';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col w-full min-h-[100vh] bg-slate-900 items-center justify-center text-white">
      <Outlet />
    </div>
  );
}

export default App;
