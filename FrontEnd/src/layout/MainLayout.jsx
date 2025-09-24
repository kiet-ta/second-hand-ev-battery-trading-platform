import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
function MainLayout() {
  return (
    <div className="w-screen m-0 p-0 bg-gray-200">
      <Navbar className="w-full"/>
      <Outlet className="w-full"/>
    </div>
  );
};

export default MainLayout