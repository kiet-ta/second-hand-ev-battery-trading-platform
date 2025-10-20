import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { IoMdHome } from "react-icons/io";
import { RiAuctionFill } from "react-icons/ri";
import Logo from '../components/Logo';
import ProfileDropDown from './ProfileDropDown';
import { FaShoppingCart } from "react-icons/fa";
import { FaSuitcase } from "react-icons/fa6";
import { LuShoppingBag } from "react-icons/lu";
import { jwtDecode } from 'jwt-decode';
import walletApi from '../api/walletApi';
import NotificationDropDown from './NotificationDropdown'

function Navbar(data) {
  const navigate = useNavigate()
  const [walletBalance,setWalletBalance] = useState(null)
  useEffect(() => {
    const fetchData = async () => {
        const walletBalance = await walletApi.getWalletByUser(localStorage.getItem("userId"))
  setWalletBalance(walletBalance.balance)
    }
    fetchData()
  },[])
  const handleSellerClick = (e) =>{
    e.preventDefault();
    e.stopPropagation();
    const jwt = localStorage.getItem("token")
    const decodeJWT = jwtDecode(jwt)
    if(decodeJWT.role == "buyer") {
      navigate('/seller-registration')
    }
    else {
      navigate('/seller')
    }
  }
  const leftmenu = [
    { name: 'Home', link: '/', icon: <IoMdHome /> },
    { name: 'Auction', link: '/auctions', icon: <RiAuctionFill /> }
  ]
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
            {data.data && data.data.role == "Manager" ? (
              <Link to="/manage" className="mx-4 hover:text-green-300 flex items-center">
                <FaSuitcase />
                <span className="ml-2">Manager</span>
              </Link>
            ) : (
              <Link onClick={handleSellerClick} className="mx-4 hover:text-green-300 flex items-center">
                <FaSuitcase />
                <span className="ml-2">Seller</span>
              </Link>
            )
            }

          </div>
          <div className="right-header flex w-full justify-end" >
            {data.data ? (
              <div className="flex justify-center">
              <div className="ml-5 mt-2">
                <NotificationDropDown userId={localStorage.getItem("userId")} />
              </div>
              <div className="ml-5">
                <ProfileDropDown users={data.data} walletBalance={walletBalance} />
              </div>

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
        <div className="w-full flex h-20 items-center align-middle content-center">
          <div className="w-1/4 h-full flex justify-start"><Logo></Logo></div>
          <div className="content-center align-middle w-2/4">
            <form action='/search' method='GET' className="w-full p-2 rounded-lg text-black bg-white relative">
                <input type="text" name="query" placeholder="Search..." className="w-5/6"/>
                <select className="bg-maincolor-darker w-1/6 absolute right-0 top-0 h-full align-middle text-center font-bold border-1" name="itemType">
                <option value="All">All</option>
                <option value="EV">Vehicle</option>
                <option value="Battery">Battery</option>
                </select>
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>
          <div className="w-1/4 flex justify-end">
            <Link to={'/cart'} className="mx-4 hover:text-green-300 flex items-center">
              {<FaShoppingCart />}
              <span className="ml-2">Cart</span>
            </Link>
            <Link to={'/favourite'} className="mx-4 hover:text-green-300 flex items-center">
              {<LuShoppingBag />}
              <span className="ml-2">Favourite</span>
            </Link>
          </div>
        </div>
      </div>


    </div>
  )
}

export default Navbar