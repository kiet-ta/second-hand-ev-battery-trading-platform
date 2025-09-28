import React from 'react'
import MainLayout from '../layout/MainLayout'
import Navbar from '../components/Navbar/Navbar';
import CardComponent from '../components/Cards/Card';
import '../styles/HomePage.css'
function HomePage() {
  return (
    <>
      <div className="HomePage w-full m-0 p-0 bg-amber-100y overflow-x-hidden">
        <div className="First-sale flex flex-wrap w-full bg-white  gap-0 p-0 justify-around  ">
          <div className="Advertisement grid grid-flow-col grid-row-4 w-1/4 gap-4 p-2 m-0 item-middle">
            <div className="col-span-2 w-50 h-50"><img src="https://i.pinimg.com/736x/9f/2b/97/9f2b9783252352925b8bbc1c0f1f2145.jpg" /></div>
            <div className="col-span-1 row-span-2 w-50 h-50"><img src="https://i.pinimg.com/1200x/e9/22/29/e9222949753e671a7e8f7c09725ebed0.jpg" /></div>
            <div className="row-span-3 w-70 h-50 content-center"><img src="https://i.pinimg.com/1200x/73/9d/61/739d6130ed4b7c1abf45a429d1e83b0b.jpg" /></div>
          </div>
          <div className="Products flex w-2/4 justify-center content-center self-center gap-4 p-4 m-0 ">
            <CardComponent title="Furina" type={'vehicle'} price={100} sales={0} image={"https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg"} />
            <CardComponent title="Sleepy Furina" type={'vehicle'} price={1000} sales={0.3} image={"https://i.pinimg.com/736x/b6/96/16/b6961611f87b3433707d937b3f4871b1.jpg"} />
            <CardComponent title="Very cute Furina Picture" type={'battery'} price={100000} sales={0.5} image={""} />
          </div>
        </div> 
        <div className="Banner">
          <img src="https://images4.alphacoders.com/136/thumb-1920-1360814.png" 
          className="h-40 w-full object-cover object-[40%_25%]"/>
        </div>
        <div className="Car bg-white mt-2 w-full">
          <div>
            Car
          </div>
          <div className="Products flex justify-center content-center self-center gap-4 p-4 m-0 ">
            <CardComponent />
            <CardComponent />
            <CardComponent />
            <CardComponent />
          </div>
        </div>

      </div>

    </>


  )
}

export default HomePage