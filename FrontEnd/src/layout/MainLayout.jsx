import { useRef } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
function MainLayout() {
  const mainRef = useRef(null);
  return (
    <div className="  flex flex-col m-0 p-0 bg-gray-200">
            <ScrollToTop scrollRef={mainRef} />
      <Navbar className="  sticky top-0 z-50" />
      <main ref ={mainRef} className="flex-1 overflow-y-auto">   
        <Outlet />
      </main>
    </div>
  );
} 

export default MainLayout