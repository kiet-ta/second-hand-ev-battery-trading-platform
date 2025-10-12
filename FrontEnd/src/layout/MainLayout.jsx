
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import userApi from '../api/userApi';
function MainLayout() {
  const userData = localStorage.getItem('userId');
  const [userProfile, setUser] = useState(null);
  const fetchUser = async () => {
    try {
      const userByID = await userApi.getUserByID(userData);
      setUser(userByID)
    } catch (error) {
      console.error("Error fetching items", error);
    }
  }
  useEffect(() => {
    fetchUser();
  },[]);
  const mainRef = useRef(null);
  return (
    <div className="h-screen w-screen flex flex-col m-0 p-0 bg-gray-200">
            <ScrollToTop scrollRef={mainRef} />

      <Navbar className="w-full h-16 sticky top-0 z-50" data={userProfile}/>
      <main ref ={mainRef} className="flex-1 overflow-y-auto">   
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout