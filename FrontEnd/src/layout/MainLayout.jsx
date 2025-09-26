import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
function MainLayout() {
  return (
    <div className="w-screen m-0 p-0 bg-gray-200">
      <Navbar className="w-full fixed top-0 left-0 z-50" />
      <main className="pt-3">   
        <Outlet />
      </main>
    </div>
  );
} 

export default MainLayout