/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { FaRegEyeSlash, FaRegEye, FaUser, FaEnvelope, FaPhone, FaLock, FaBriefcase, FaUserTie } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App.jsx';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../redux/userSlice.js';
import { ClipLoader } from 'react-spinners';
import { Slide, toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase.js';

function Signup() {

  const [role, setRole] = useState('seeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required.';
    if (!email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email is required.';
    if (password.length < 6) e.password = 'Password must be at least 8 characters.';
    if (phone.length < 10 && !phone.match(/^\+?[0-9 -]{7,15}$/)) e.phone = 'Enter a valid phone number';
    return e;
  }

  function passwordStrengthLabel(pw) {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return 'Very strong';
    if (pw.length >= 10) return 'Strong';
    if (pw.length >= 8) return 'Okay';
    if (!pw) return '';
    return 'Weak';
  }

  const handleSignup = async () => {
    setLoading(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signup`, {
        fullname: name, email, password, phone, role
      }, { withCredentials: true });

      const token = result.data?.token
      if (token) {
        localStorage.setItem('authToken', token)
      }

      const { token: _token, ...user } = result.data || {}
      dispatch(setUserData(user))
      console.log("signup successfully")
      setErrors({});
      setLoading(false);
      toast.success('Signup successful!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
      navigate('/');
    } catch (error) {
      setLoading(false);
      setErrors({ general: error?.response?.data?.message });
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setErrors({});
      const provider = new GoogleAuthProvider();
      
      const result = await signInWithPopup(auth, provider);

      const { data } = await axios.post(`${serverUrl}/api/auth/googleAuth`, {
        fullname: result.user.displayName,
        email: result.user.email,
        phone: result.user.phoneNumber,
        role: role
      }, { withCredentials: true });

      const token = data?.token
      if (token) {
        localStorage.setItem('authToken', token)
      }

      const { token: _token, ...user } = data || {}
      dispatch(setUserData(user));
      console.log("Google signup successful");
      
      toast.success('Signup successful!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
      
      setLoading(false);
      navigate('/');

    } catch (error) {
      setLoading(false);
      console.error("Google signup error:", error);
      const errorMessage = error?.response?.data?.message;
      setErrors({ general: errorMessage });
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    }
  }

  useEffect(() => {
    setErrors({});
  }, [email, password, name, phone, role]);


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl mb-4 shadow-xl transform hover:scale-110 transition-transform duration-300">
              <FaUserTie className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-lg">Join our platform and start your journey</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">Select Your Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('seeker')}
                className={`group relative px-4 py-5 rounded-2xl font-semibold cursor-pointer transition-all duration-300 transform hover:scale-105 ${role === 'seeker'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:shadow-lg border border-gray-200'
                  }`}>
                <div className="flex flex-col items-center gap-2">
                  <FaBriefcase className="text-2xl" />
                  <span>Job Seeker</span>
                </div>
                {role === 'seeker' && (
                  <div className="absolute inset-0 rounded-2xl bg-white opacity-20 animate-pulse"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`group relative px-4 py-5 rounded-2xl font-semibold cursor-pointer transition-all duration-300 transform hover:scale-105 ${role === 'employer'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:shadow-lg border border-gray-200'
                  }`}>
                <div className="flex flex-col items-center gap-2">
                  <FaUserTie className="text-2xl" />
                  <span>Employer</span>
                </div>
                {role === 'employer' && (
                  <div className="absolute inset-0 rounded-2xl bg-white opacity-20 animate-pulse"></div>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder="Your full name"
                />
              </div>
              {errors.name && <small className="text-red-500 text-xs mt-1.5 block">{errors.name}</small>}
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <small className="text-red-500 text-xs mt-1.5 block">{errors.email}</small>}
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder="+91 98765 43210"
                />
              </div>
              {errors.phone && <small className="text-red-500 text-xs mt-1.5 block">{errors.phone}</small>}
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-indigo-600 transition-colors">
                  {showPassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                </button>
              </div>
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-600 font-medium">Password strength:</span>
                    <span className={`font-semibold ${passwordStrengthLabel(password) === 'Very strong' ? 'text-green-600' :
                      passwordStrengthLabel(password) === 'Strong' ? 'text-blue-600' :
                        passwordStrengthLabel(password) === 'Okay' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{passwordStrengthLabel(password)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full transition-all duration-500 ${passwordStrengthLabel(password) === 'Very strong' ? 'w-full bg-gradient-to-r from-green-500 to-green-600' :
                      passwordStrengthLabel(password) === 'Strong' ? 'w-3/4 bg-gradient-to-r from-blue-500 to-blue-600' :
                        passwordStrengthLabel(password) === 'Okay' ? 'w-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600' : 'w-1/4 bg-gradient-to-r from-red-500 to-red-600'
                      }`}></div>
                  </div>
                </div>
              )}
              {errors.password && <small className="text-red-500 text-xs mt-1.5 block">{errors.password}</small>}
            </div>
          </div>

          {errors.general && (
            <div className="text-center text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-6 shadow-sm">
              <span className="font-medium">{errors.general}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-7">
            <button
              onClick={handleSignup}
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <ClipLoader size={22} color="white" />
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>


          <div className='flex items-center w-full mt-8'>
            <div className='grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
            <span className='text-gray-500 font-semibold text-sm mx-4'>OR</span>
            <div className='grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
          </div>

          <button onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full h-14 bg-white rounded-xl flex items-center justify-center mt-6 cursor-pointer hover:scale-[1.02]  transition-all duration-300 border-2 border-gray-200  disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <ClipLoader size={22} color="#4F46E5" />
            
              </>
            ) : (
              <>
                <FcGoogle size={24} />
                <span className='text-gray-700 font-bold ml-3 text-lg'>Continue with Google</span>
              </>
            )}
          </button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
            <p className="text-gray-600 text-base">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:text-indigo-600 transition-colors hover:underline cursor-pointer">
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Signup 