/* eslint-disable react-hooks/set-state-in-effect */
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaRegEyeSlash, FaRegEye, FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import { ClipLoader } from 'react-spinners';
import { Slide, toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  function validate() {
    const e = {};

    if (!email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email is required.';
    if (password.length < 6) e.password = 'Password must be at least 6 characters.';

    return e;
  }

  const handleLogin = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/login`, {
        email, password
      }, { withCredentials: true });

      dispatch(setUserData(result.data))
      console.log("login successfully")
      setErrors({});
      setLoading(false);
      toast.success('Login successful!', {
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
      const status = error.response?.status;
      if (status === 400 || status === 401) {
        setErrors({ general: 'Invalid email or password' });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrors({});
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const { data } = await axios.post(`${serverUrl}/api/auth/googleAuth`, {
        email: result.user.email,
        fullname: result.user.displayName,
      }, { withCredentials: true });

      dispatch(setUserData(data));

      toast.success('Login successful!', {
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
      console.error("Google login error:", error);
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
  }, [email, password]);


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-100 via-indigo-50 to-purple-100 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <FaSignInAlt className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Log in to continue your journey</p>
          </div>


          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <small className="text-red-500 text-xs mt-1">{errors.email}</small>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
              {errors.password && <small className="text-red-500 text-xs mt-1">{errors.password}</small>}
            </div>
          </div>

          {errors.general && (
            <div className="text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              {errors.general}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
            {loading ? (
              <>
                <ClipLoader size={22} color="white" />
              </>
            ) : (
              <>
                <FaSignInAlt />
                <span>Log In</span>
              </>
            )}
          </button>


          <div className='flex items-center w-full mt-8'>
            <div className='grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
            <span className='text-gray-500 font-semibold text-sm mx-4'>OR</span>
            <div className='grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
          </div>

          <button onClick={handleGoogleLogin}
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
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-blue-600 font-semibold hover:text-indigo-600 transition-colors hover:underline cursor-pointer">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Login 