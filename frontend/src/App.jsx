/* eslint-disable react-refresh/only-export-components */
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home';
import SeekerDashboard from './component/SeekerDashboard.jsx';
import EmployeeDadhboard from './component/EmployeeDadhboard.jsx';
import Profile from './pages/Profile.jsx';
import getCurrentUser from './hooks/getCurrentUser.jsx';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MyApplication from './pages/MyApplication.jsx';
import Applications from './pages/Applications.jsx';
import SavedJobs from './pages/SavedJobs.jsx';
export const serverUrl = import.meta.env.VITE_SERVER_URL;



function App() {
  getCurrentUser();
  const {userData} = useSelector((state) => state.user);

  return (
    <>
      <Routes>
        <Route path='/signup' element= {<Signup/>} />
        <Route path='/login' element=  {<Login />} />
        <Route path='/' element={!userData ? <Home/> : (userData.role === 'seeker' ? <SeekerDashboard/> : <EmployeeDadhboard/>)} />
        <Route path='/seekerprofile' element={<Profile />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/myapplication' element={<MyApplication/>} />
        <Route path='/savedjobs' element={<SavedJobs/>} />
        <Route path='/application' element={<Applications/>} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
    </>
  )
}

export default App