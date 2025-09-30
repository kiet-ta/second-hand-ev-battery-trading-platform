import { Outlet } from 'react-router-dom';
function MainLayout() {
  return (
    <div className="h-screen w-screen flex flex-col m-0 p-0 bg-gray-200">
      <main className="flex-1 overflow-y-auto">   
        <Outlet />
      </main>
    </div>
  );
} 

export default MainLayout