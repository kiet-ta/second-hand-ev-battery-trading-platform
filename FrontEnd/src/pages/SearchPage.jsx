import React from 'react'
import { useSearchParams } from 'react-router-dom'
import CardComponent from '../components/Cards/Card';
import { FaStar } from "react-icons/fa";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    return (
        <div className='w-full flex mt-2'>
            <div className='w-1/5 m-4 rounded-2xl h-full bg-white p-4'>
                <div className='filter text-2xl font-bold p-4 text-left'>Filter</div>
                <div className='filter-rating border-t-1 border-gray-300'>
                    <div className='text-left'>
                        Rating
                    </div>
                    <div className='hover:bg-gray-300 flex justify-start content-center mt-2'>
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                    </div>
                    <div className='hover:bg-gray-300 flex justify-start content-center mt-2'>
                        <FaStar color="orange"/>
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                    </div>
                    <div className='hover:bg-gray-300 flex justify-start content-center mt-2'>
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                    </div>
                    <div className='hover:bg-gray-300 flex justify-start content-center mt-2'>
                        <FaStar color="orange" />
                        <FaStar color="orange" />
                    </div>
                    <div className='hover:bg-gray-300 flex justify-start content-center mt-2'>
                        <FaStar color="orange" />
                    </div>
                </div>
            </div>
            <div className='w-3/5'>
                <div className='text-2xl'>Search result of "{query}"</div>
                <div className='bg-white rounded-2xl mt-2 p-2 gap-4 flex flex-wrap justify-evenly'>
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />

                </div>
            </div>
        </div>
    )
}
