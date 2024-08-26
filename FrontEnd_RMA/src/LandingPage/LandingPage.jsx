    import React from 'react'
    import '../App.css'
    import Navbar from '../Commponents/Navbar';
    import HeroSection from '../Commponents/HeroSection';
    import Home from '../Commponents/Home';


    const LandingPage = () =>{
        return (
            <div>
                <Navbar/>
                <Home/>
                <HeroSection/>  
            </div>
        )
   
    }

    export default LandingPage;
