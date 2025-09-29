import React from 'react'
import LogoImages from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';

function Logo() {
  return (
    <div class="flex">
        <Link to="/" class="flex items-center text-white hover:text-green-300">
            <img src={LogoImages} alt="Logo" className="h-30" />
            <h2 class="text-white">Cóc Mua Xe</h2>
        </Link>
        </div>
  )
}

export default Logo