import React from 'react'
import LogoImages from '../assets/images/Logo.png'
import { Link } from 'react-router-dom';

function Logo() {
  return (
    <div className="flex">
        <Link to="/" className="flex items-center text-white hover:text-green-300">
            <img src={LogoImages} alt="Logo" className="w-1/5" />
            <h2 className="text-white text-2xl font-bold">Cóc Mua Xe</h2>
        </Link>
        </div>
  )
}

export default Logo