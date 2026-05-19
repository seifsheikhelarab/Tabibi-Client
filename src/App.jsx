import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import SpecialistFinder from './pages/SpecialistFinder'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import Chatbot from './components/Chatbot.jsx'
import Collaborations from './pages/Collaborations.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import { setNavigate } from './api/client'

const App = () => {
  const navigate = useNavigate()

  React.useEffect(() => {
    setNavigate(navigate)
  }, [navigate])
  return (
    <div className='min-h-screen bg-surface text-text'>
      <ToastContainer />
      <Navbar />
      <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/find-specialist' element={<SpecialistFinder />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/collaborations' element={<Collaborations />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/appointment/:docId' element={
            <ProtectedRoute><Appointment /></ProtectedRoute>
          } />
          <Route path='/my-appointments' element={
            <ProtectedRoute><MyAppointments /></ProtectedRoute>
          } />
          <Route path='/my-profile' element={
            <ProtectedRoute><MyProfile /></ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}

export default App
