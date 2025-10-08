
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import userApi from '../api/userApi';
function MainLayout() {
  const userData = localStorage.getItem('userId');
  const [userProfile, setUser] = useState(null);
  const fetchUser =  () => {
    try {
      userApi.getUserByID(userData)
      .then(user => {
              setUser(user)
      })
    } catch (error) {
      console.error("Error fetching items", error);
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);
  const mainRef = useRef(null);
  return (
    <div className="h-screen w-screen flex flex-col m-0 p-0">
      <ScrollToTop scrollRef={mainRef} />

      <Navbar className="w-full h-16 sticky" data={userProfile} />
      <main ref={mainRef} className=" bg-gray-300 ">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout