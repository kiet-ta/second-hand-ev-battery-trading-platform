import React from 'react';
import LogoImages from '../assets/images/Logo.png';
import { Link } from 'react-router-dom';

function Logo() {
 return (
  <Link to="/" className="flex items-center gap-x-3 transition-opacity hover:opacity-80">
   <img src={LogoImages} alt="Cóc Mua Xe Logo" className="h-14 w-auto" />
   <div className="flex flex-col">
     <span className="!font-serif font-extrabold text-2xl tracking-tighter leading-none text-[#2C2C2C]">
       Cóc Mua Xe
     </span>
     <span className="text-xs text-gray-500 tracking-wide uppercase">
       XE ĐÃ QUA SỬ DỤNG
     </span>
   </div>
  </Link>
 );
}

export default Logo;