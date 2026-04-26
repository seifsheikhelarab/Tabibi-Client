import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { authClient } from '../api/auth'

const Navbar = () => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: session, isPending } = authClient.useSession()

  const user = session?.user
  const isAuthenticated = !!user

  const logout = async () => {
    await authClient.signOut()
    navigate('/login')
  }

  return (
    <div className='flex items-center justify-between text-sm py-4 px-4 md:px-8 border-b border-gray-100'>
      <img onClick={() => navigate('/')} className='w-32 cursor-pointer' src={assets.logo} alt="Tabibi" />
      
      <ul className='md:flex items-center gap-6 hidden'>
        <NavLink to='/' className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}>
          <li className='py-1'>Home</li>
        </NavLink>
        <NavLink to='/doctors' className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}>
          <li className='py-1'>All Doctors</li>
        </NavLink>
        <NavLink to='/about' className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}>
          <li className='py-1'>About</li>
        </NavLink>
        <NavLink to='/collaborations' className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}>
          <li className='py-1'>Collaborations</li>
        </NavLink>
        <NavLink to='/contact' className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}>
          <li className='py-1'>Contact</li>
        </NavLink>
      </ul>

      <div className='flex items-center gap-4'>
        {isPending ? null : isAuthenticated ? (
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <img className="w-2.5 hidden md:block" src={assets.dropdown_icon} alt="" />
            </button>
            <div className={`absolute right-0 top-full pt-4 text-sm z-20 ${showDropdown ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 min-w-44 flex flex-col p-2">
                <button onClick={() => navigate('/my-profile')} className="text-left px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors">My Profile</button>
                <button onClick={() => navigate('/my-appointments')} className="text-left px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors">My Appointments</button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={logout} className="text-left px-4 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors">Logout</button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className='bg-primary text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity hidden md:block'>
            Sign In
          </button>
        )}
        <button onClick={() => setShowMenu(true)} className='md:hidden p-2'>
          <img className='w-6' src={assets.menu_icon} alt="Menu" />
        </button>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 z-30 bg-white transition-transform duration-300 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex items-center justify-between px-5 py-4'>
            <img src={assets.logo} className='w-28' alt="Tabibi" />
            <button onClick={() => setShowMenu(false)} className='p-2'>
              <img src={assets.cross_icon} className='w-6' alt="Close" />
            </button>
          </div>
          <ul className='flex flex-col gap-2 px-5 py-6'>
            <NavLink onClick={() => setShowMenu(false)} to='/' className={({ isActive }) => `px-4 py-3 rounded-lg ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              Home
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors' className={({ isActive }) => `px-4 py-3 rounded-lg ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              All Doctors
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about' className={({ isActive }) => `px-4 py-3 rounded-lg ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              About
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/collaborations' className={({ isActive }) => `px-4 py-3 rounded-lg ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              Collaborations
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact' className={({ isActive }) => `px-4 py-3 rounded-lg ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              Contact
            </NavLink>
            {!isAuthenticated && (
              <button onClick={() => { setShowMenu(false); navigate('/login') }} className='mt-4 w-full bg-primary text-white px-4 py-3 rounded-lg font-medium'>
                Sign In
              </button>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar
