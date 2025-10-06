<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< HEAD
import { useRef } from 'react';
=======
import { useEffect, useRef, useState } from 'react';
>>>>>>> page/purchase-page-order-seller
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import userApi from '../api/userApi'
function MainLayout() {
    const userData = JSON.parse(localStorage.getItem('user'));
  const [userProfile, setUser] = useState(null);
  const fetchUser = async () => {
    try {
      const userByID = await userApi.getUserByID(userData.userId);
=======
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import userApi from '../api/userApi';
function MainLayout() {
=======
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import userApi from '../api/userApi';
function MainLayout() {
>>>>>>> Stashed changes
  const userData = localStorage.getItem('userId');
  const [userProfile, setUser] = useState(null);
  const fetchUser = async () => {
    try {
      const userByID = await userApi.getUserByID(userData);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      setUser(userByID)
    } catch (error) {
      console.error("Error fetching items", error);
    }
  }
  useEffect(() => {
    fetchUser();
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  },[]);
  const mainRef = useRef(null);
  return (
    <div className="h-screen w-screen flex flex-col m-0 p-0 bg-gray-200">
            <ScrollToTop scrollRef={mainRef} />

      <Navbar className="w-full h-16 sticky top-0 z-50" data={userProfile}/>
      <main ref ={mainRef} className="flex-1 overflow-y-auto">   
=======
  }, []);
  const mainRef = useRef(null);
  return (
    <div className="h-screen w-screen flex flex-col m-0 p-0 bg-gray-200">
=======
  }, []);
  const mainRef = useRef(null);
  return (
    <div className="h-screen w-screen flex flex-col m-0 p-0 bg-gray-200">
>>>>>>> Stashed changes
      <ScrollToTop scrollRef={mainRef} />

      <Navbar className="w-full h-16 sticky top-0 z-50" data={userProfile} />
      <main ref={mainRef} className="flex-1 overflow-y-auto">
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout