/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaBriefcase, FaUser, FaFileAlt, FaSignOutAlt, FaTachometerAlt, FaBars, FaTimes, FaBookmark, FaMoon, FaSun } from 'react-icons/fa'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice.js'

export default function Nav() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userData = useSelector(s => s.user?.userData)
  const role = userData?.role

  const [openMobile, setOpenMobile] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const profileRef = useRef(null)

  const capitalize = (str) => {
    if (!str) return ''
    const s = String(str).trim()
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  }

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.body.classList.add('dark-mode')
    }
  }, [])

  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode)
    if (newDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/logout`, null, { withCredentials: true })
      dispatch(setUserData(null))
      localStorage.removeItem('authToken')
      navigate('/login')
    } catch (err) {
      console.warn('logout error', err)
    }
  }

  return (
    <nav className="w-full fixed top-0 z-50 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <FaBriefcase className="text-indigo-600 text-xl" />
              </div>
              <span className="text-2xl font-bold text-white hidden sm:block">JobPortal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {userData && (
            <div className="hidden md:flex items-center gap-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-white hover:bg-white/20'
                  }`
                }
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink
                to="/seekerprofile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-white hover:bg-white/20'
                  }`
                }
              >
                <FaUser />
                <span>Profile</span>
              </NavLink>

              {role === 'seeker' && (
                <>
                  <NavLink
                    to="/savedjobs"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-white text-indigo-600 shadow-md'
                          : 'text-white hover:bg-white/20'
                      }`
                    }
                  >
                    <FaBookmark />
                    <span>Saved Jobs</span>
                  </NavLink>
                  <NavLink
                    to="/myapplication"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-white text-indigo-600 shadow-md'
                          : 'text-white hover:bg-white/20'
                      }`
                    }
                  >
                    <FaFileAlt />
                    <span>My Applications</span>
                  </NavLink>
                </>
              )}

              {role === 'employer' && (
                <NavLink
                  to="/application"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-md'
                        : 'text-white hover:bg-white/20'
                    }`
                  }
                >
                  <FaFileAlt />
                  <span>Applications</span>
                </NavLink>
              )}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm border border-white/30"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>

            {userData ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile((s) => !s)}
                  className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all cursor-pointer border border-white/30"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center font-semibold text-indigo-600 shadow-md">
                    {userData?.avatarUrl ? (
                      <img src={userData.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      userData?.fullname?.[0]?.toUpperCase() || userData?.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-white">{capitalize(userData.fullname || userData.name)}</p>
                  </div>
                </button>
                
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
                    <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3">
                      <p className="font-semibold text-white">{capitalize(userData.fullname || userData.name)}</p>
                      <p className="text-xs text-white/90 ">{userData.email}</p>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/'); setShowProfile(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <FaTachometerAlt className="text-indigo-600" />
                        <span>Dashboard</span>
                      </button>
                      
                      <button
                        onClick={() => { navigate('/seekerprofile'); setShowProfile(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <FaUser className="text-indigo-600" />
                        <span>Profile</span>
                      </button>

                      {role === 'seeker' && (
                        <>
                          <button
                            onClick={() => { navigate('/savedjobs'); setShowProfile(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <FaBookmark className="text-indigo-600" />
                            <span>Saved Jobs</span>
                          </button>
                          <button
                            onClick={() => { navigate('/myapplication'); setShowProfile(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <FaFileAlt className="text-indigo-600" />
                            <span>My Applications</span>
                          </button>
                        </>
                      )}

                      {role === 'employer' && (
                        <button
                          onClick={() => { navigate('/application'); setShowProfile(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <FaFileAlt className="text-indigo-600" />
                          <span>View Applications</span>
                        </button>
                      )}

                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white font-medium hover:bg-white/20 rounded-lg transition-all"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpenMobile((s) => !s)}
              className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-all"
            >
              {openMobile ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile drawer */}
      {openMobile && (
        <div className="md:hidden bg-white border-t border-white/20 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {userData ? (
              <>
                <button
                  onClick={() => { navigate('/'); setOpenMobile(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-all font-medium"
                >
                  <FaTachometerAlt className="text-indigo-600" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => { navigate('/seekerprofile'); setOpenMobile(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-all font-medium"
                >
                  <FaUser className="text-indigo-600" />
                  <span>Profile</span>
                </button>

                {role === 'seeker' && (
                  <>
                    <button
                      onClick={() => { navigate('/savedjobs'); setOpenMobile(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-all font-medium"
                    >
                      <FaBookmark className="text-indigo-600" />
                      <span>Saved Jobs</span>
                    </button>
                    <button
                      onClick={() => { navigate('/myapplication'); setOpenMobile(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-all font-medium"
                    >
                      <FaFileAlt className="text-indigo-600" />
                      <span>My Applications</span>
                    </button>
                  </>
                )}

                {role === 'employer' && (
                  <button
                    onClick={() => { navigate('/application'); setOpenMobile(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-all font-medium"
                  >
                    <FaFileAlt className="text-indigo-600" />
                    <span>View Applications</span>
                  </button>
                )}

                <div className="border-t border-gray-200 my-2"></div>
                
                <button
                  onClick={() => { handleLogout(); setOpenMobile(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all font-medium"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  onClick={() => setOpenMobile(false)}
                  to="/login"
                  className="block w-full px-4 py-3 text-center text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-all"
                >
                  Log in
                </Link>
                <Link
                  onClick={() => setOpenMobile(false)}
                  to="/signup"
                  className="block w-full px-4 py-3 text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold shadow-md transition-all"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}


