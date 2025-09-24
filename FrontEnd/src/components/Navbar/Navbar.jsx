import React from 'react'
import { Link } from 'react-router-dom';
import { IoMdHome } from "react-icons/io";
import { RiAuctionFill } from "react-icons/ri";
import { MdOutlineAttachMoney } from "react-icons/md";
import Logo from '../Logo/Logo';
import ProfileDropDown from '../ProfileDropDown';


function Navbar() {
  const leftmenu = [
    { name: 'Home', link: '/', icon: <IoMdHome /> },
    { name: 'Auction', link: '/auctions', icon: <RiAuctionFill /> },
    { name: 'Seller', link: '/about', icon: <MdOutlineAttachMoney /> }
  ]
  const rightmenu = [
    { name: 'Notification', link: '/notification', icon: <IoMdHome /> },
    { name: 'Support', link: '/support' }]
  const userprofile = null;

  return (

    <div>
      <div class="w-full h-38 flex flex-col items-center justify-between p-4 bg-maincolor text-white fixed top-0 left-0">
        <div class="flex items-center w-full justify-around h-5">
          <div className="left-header flex w-full" >
            {leftmenu.map((item, index) => (
              <Link to={item.link} key={index} className="mx-4 hover:text-green-300 flex items-center">
                {item.icon}
                <span class="ml-2">{item.name}</span>
              </Link>
            ))}
          </div>
          <div className="right-header flex w-full justify-end" >
            {rightmenu.map((item, index) => (
              <Link to={item.link} key={index} class="mx-4 hover:text-green-300 flex items-center">
                {item.icon}
                <span class="ml-2">{item.name}</span>
              </Link>
            ))}
            {userprofile ? (
              <div className="ml-4 pt-5">
                <ProfileDropDown users={userprofile} />
              </div>
            )
              : (
                <div class="flex">
                  <Link to="/login" class="mx-4 hover:text-green-300 flex items-center">
                    Login
                  </Link>
                  <Link to="/register" class="mx-4 hover:text-green-300 flex items-center">
                    Register
                  </Link>
                </div>
              )
            }
          </div>
        </div>
        <div class="w-full flex justify-around h-20">
          <Logo class="absolute bottom-0 left-0" />
          <div class="ml-10 w-1/2 content-center align-middle  ">
            <input type="text" placeholder="Search..." class="p-2 rounded w-full bg-amber-50 text-d" />
          </div>
          <div class="w-1/5 flex justify-end align-middle content-center">
          </div>
        </div>
      </div>


    </div>
  )
}

export default Navbar