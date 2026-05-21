import React from 'react'
import Header from '../components/Header'
import SpecialistFinder from './SpecialistFinder'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'

const Home = () => {
  return (
    <div className='animate-fade-in-up'>
      <Header />
      <SpecialistFinder section />
      <TopDoctors />
      <Banner />
    </div>
  )
}

export default Home