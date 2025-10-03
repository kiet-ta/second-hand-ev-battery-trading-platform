import React from 'react'
import { Link } from 'react-router-dom';
import { IoMdHome } from "react-icons/io";
import { RiAuctionFill } from "react-icons/ri";
import { MdOutlineAttachMoney } from "react-icons/md";
import Logo from '../Logo/Logo';
import ProfileDropDown from '../ProfileDropDown';
import { FaShoppingCart } from "react-icons/fa";


function Navbar(userInfo) {
  const leftmenu = [
    { name: 'Home', link: '/', icon: <IoMdHome /> },
    { name: 'Auction', link: '/auctions', icon: <RiAuctionFill /> },
    { name: 'Manager', link: '/manage', icon: <MdOutlineAttachMoney /> }
  ]
  const rightmenu = [
    { name: 'Notification', link: '/notification', icon: <IoMdHome /> },
    { name: 'Support', link: '/support' }]
    // const user ={
    //   name: "Lady Furina",
    //   picture: "https://i.pinimg.com/736x/5b/3f/09/5b3f09d67f448e39dab9e8d8f3cc3f94.jpg"
    // }
  return (

    <div>
      <div className="w-full flex flex-col items-center justify-between p-4 bg-maincolor text-white left-0">
        <div className="flex items-center w-full justify-around h-5">
          <div className="left-header flex w-full" >
            {leftmenu.map((item, index) => (
              <Link to={item.link} key={index} className="mx-4 hover:text-green-300 flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            ))}
          </div>
          <div className="right-header flex w-full justify-end" >
            {rightmenu.map((item, index) => (
              <Link to={item.link} key={index} className="mx-4 hover:text-green-300 flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            ))}
            {userInfo.userInfo  ? (
              <div className="ml-4 pt-5">
                <ProfileDropDown users={userInfo.userInfo} />
              </div>
            )
              : (
                <div className="flex">
                  <Link to="/login" className="mx-4 hover:text-green-300 flex items-center">
                    Login
                  </Link>
                  <Link to="/register" className="mx-4 hover:text-green-300 flex items-center">
                    Register
                  </Link>
                </div>
              )
            }
          </div>
        </div>
        <div className="w-full flex justify-around h-20">
          <Logo className="absolute bottom-0 left-0" />
          <div className="ml-10 w-1/2 content-center align-middle  ">
            <form action='/search' method='GET'>
              <input type="text" name="query" placeholder="Search..." className="w-full p-2 rounded-lg text-black bg-white" />
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>
          <div className="mt-10 w-1/5 flex justify-end items-center content-center gap-4">
                        <Link to={'/cart'} className="mx-4 hover:text-green-300 flex items-center">
                {<FaShoppingCart/>}
                <span className="ml-2">Cart</span>
              </Link>
          </div>
        </div>
      </div>


    </div>
  )
}

export default Navbar