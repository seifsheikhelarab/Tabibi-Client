import React, { useState, useRef } from 'react'
import { assets } from '../assets/assets'
import { NavLink, Link, useNavigate } from 'react-router-dom'
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

  const dropdownRef = useRef(null)

  return (
    <div className='flex items-center justify-between text-sm py-4 px-4 md:px-8'>
      <img onClick={() => navigate('/')} className='w-28 cursor-pointer' src={assets.logo} alt="Tabibi" />
      
      <ul className='md:flex items-center gap-8 hidden'>
        <NavLink to='/' className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text transition-colors'}>
          <li className='py-1'>Home</li>
        </NavLink>
        <NavLink to='/doctors' className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text transition-colors'}>
          <li className='py-1'>All Doctors</li>
        </NavLink>
        <NavLink to='/about' className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text transition-colors'}>
          <li className='py-1'>About</li>
        </NavLink>
        <NavLink to='/collaborations' className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text transition-colors'}>
          <li className='py-1'>Collaborations</li>
        </NavLink>
        <NavLink to='/contact' className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text transition-colors'}>
          <li className='py-1'>Contact</li>
        </NavLink>
      </ul>

      <div className='flex items-center gap-4'>
        {isPending ? null : isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold font-display">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <img className="w-2.5 hidden md:block" src={assets.dropdown_icon} alt="" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 z-[60]">
                <div className="bg-white rounded-xl shadow-lg border border-border-light">
                  <div className="px-4 pt-3 pb-2">
                    <p className="font-display font-semibold text-text text-sm">{user.name}</p>
                    {user.email && (
                      <p className="text-text-muted text-xs mt-0.5 truncate">{user.email}</p>
                    )}
                  </div>

                  <div className="h-px bg-border-light mx-4" />

                  <div className="p-2">
                    <Link to="/my-profile" onClick={() => setShowDropdown(false)}
                          className="w-full text-left px-3 py-3 text-text hover:bg-surface-raised rounded-lg transition-colors flex items-center gap-3 no-underline">
                      <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link to="/my-appointments" onClick={() => setShowDropdown(false)}
                          className="w-full text-left px-3 py-3 text-text hover:bg-surface-raised rounded-lg transition-colors flex items-center gap-3 no-underline">
                      <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      My Appointments
                    </Link>
                  </div>

                  <div className="h-px bg-border-light mx-4" />

                  <div className="p-2">
                    <button onClick={() => { logout(); setShowDropdown(false) }}
                            className="w-full text-left px-3 py-3 text-text-secondary hover:bg-surface-raised hover:text-text rounded-lg transition-colors flex items-center gap-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className='bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all active:scale-[0.97] hidden md:block'>
            Sign In
          </button>
        )}
        <button onClick={() => setShowMenu(true)} className='md:hidden p-2'>
          <img className='w-6' src={assets.menu_icon} alt="Menu" />
        </button>

        <div className={`fixed inset-0 z-30 bg-surface transition-transform duration-300 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex items-center justify-between px-5 py-4'>
            <img src={assets.logo} className='w-28' alt="Tabibi" />
            <button onClick={() => setShowMenu(false)} className='p-2'>
              <img src={assets.cross_icon} className='w-6' alt="Close" />
            </button>
          </div>
          <ul className='flex flex-col gap-1 px-5 py-6'>
            <NavLink onClick={() => setShowMenu(false)} to='/' className={({ isActive }) => `px-4 py-3 rounded-xl ${isActive ? 'bg-primary/5 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-raised'}`}>
              Home
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors' className={({ isActive }) => `px-4 py-3 rounded-xl ${isActive ? 'bg-primary/5 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-raised'}`}>
              All Doctors
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about' className={({ isActive }) => `px-4 py-3 rounded-xl ${isActive ? 'bg-primary/5 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-raised'}`}>
              About
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/collaborations' className={({ isActive }) => `px-4 py-3 rounded-xl ${isActive ? 'bg-primary/5 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-raised'}`}>
              Collaborations
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact' className={({ isActive }) => `px-4 py-3 rounded-xl ${isActive ? 'bg-primary/5 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-raised'}`}>
              Contact
            </NavLink>
            {!isAuthenticated && (
              <button onClick={() => { setShowMenu(false); navigate('/login') }} className='mt-4 w-full bg-primary text-white px-4 py-3 rounded-xl font-semibold'>
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
