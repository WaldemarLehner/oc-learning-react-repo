import { Outlet } from 'react-router';

function App() {
  return (
    <div className="flex flex-col w-full min-h-[100vh] bg-black items-center justify-center text-white">
      <Outlet />
    </div>
  );
}

export default App;
