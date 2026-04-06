import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { serverUrl } from '../App'
import { toast } from 'react-toastify'
import { FaCamera, FaUser, FaPhone, FaMapMarkerAlt, FaBriefcase, FaBuilding, FaGlobe, FaFileAlt, FaSave, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa'
import { MdEmail, MdWork } from 'react-icons/md'
import Nav from '../component/Nav'

function Profile() {
  const userData = useSelector(s => s.user.userData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [data, setData] = useState({
    fullname: '', phone: '', location: '', headline: '', email: '',
    companyName: '', companyWebsite: '', companyDescription: '', contactEmail: '', contactPhone: '',
    resumeUrl: '', avatarUrl: '',
    degree: '', institution: '', fieldOfStudy: '', graduationYear: '', gpa: '',
    experiences: []
  })
  const role = userData?.role
  const fileInputRef = useRef(null)
  const resumeFileInputRef = useRef(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!userData) return
      setLoading(true)
      try {
        const token = localStorage.getItem('jwt');
        const res = await axios.get(`${serverUrl}/api/profile/me`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
        setData(prev => ({ ...prev, ...res.data }))
      } catch (e) {
        console.error('Fetch profile error:', e)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setData(d => ({ ...d, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.put(`${serverUrl}/api/profile/me`, data, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data?.user) {
        setData(prev => ({ ...prev, ...res.data.user }))
      } else {
        setData(prev => ({ ...prev, ...res.data }))
      }
      toast.success('✅ Profile updated successfully!')
    } catch (err) {
      console.error('Save profile error:', err)
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size should be less than 3MB')
      return
    }

    setUploadingPhoto(true)
    const form = new FormData()
    form.append('photo', file)
    
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.post(`${serverUrl}/api/profile/photo`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      })
      
      if (res.data?.user) {
        setData(prev => ({ ...prev, ...res.data.user }))
      } else if (res.data?.avatarUrl) {
        setData(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }))
      }
      toast.success('📸 Profile photo updated!')
    } catch (err) {
      console.error('Photo upload error:', err)
      toast.error(err.response?.data?.message || 'Photo upload failed')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume size should be less than 5MB')
      return
    }

    setUploadingResume(true)
    const form = new FormData()
    form.append('resume', file)
    
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.post(`${serverUrl}/api/profile/resume`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      })
      
      if (res.data?.resumeUrl) {
        setData(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }))
      }
      toast.success('📄 Resume uploaded successfully!')
    } catch (err) {
      console.error('Resume upload error:', err)
      toast.error(err.response?.data?.message || 'Resume upload failed')
    } finally {
      setUploadingResume(false)
      if (resumeFileInputRef.current) resumeFileInputRef.current.value = ''
    }
  }

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experiences: [...(prev.experiences || []), {
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: ''
      }]
    }))
  }

  const removeExperience = (index) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }))
  }

  const handleExperienceChange = (index, field, value) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  if (!userData) {
    return (
      <>
        <Nav />
        <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50'>
          <div className='text-center'>
            <FaUser className='text-6xl text-gray-300 mx-auto mb-4' />
            <p className='text-gray-600 text-lg'>Please log in to view your profile</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className='min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-5xl mx-auto'>
          
          {/* Header Card with Avatar */}
          <div className='bg-white rounded-2xl shadow-xl overflow-hidden mb-8'>
            <div className='h-32 sm:h-40 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 relative'>
              <div className='absolute -bottom-16 left-6 sm:left-10'>
                <div className='relative group'>
                  <div className='w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-linear-to-br from-indigo-400 to-purple-400 flex items-center justify-center'>
                    {data.avatarUrl ? (
                      <img src={data.avatarUrl} alt='avatar' className='w-full h-full object-cover' />
                    ) : (
                      <span className='text-4xl sm:text-5xl font-bold text-white'>
                        {data.fullname?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className='absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2.5 shadow-lg transition-all transform hover:scale-110 disabled:opacity-50'
                  >
                    {uploadingPhoto ? (
                      <FaSpinner className='animate-spin text-sm' />
                    ) : (
                      <FaCamera className='text-sm' />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/png,image/jpeg,image/jpg,image/webp'
                    onChange={handlePhotoChange}
                    className='hidden'
                  />
                </div>
              </div>
            </div>
            
            <div className='pt-20 pb-6 px-6 sm:px-10'>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
                {data.fullname || 'Your Name'}
              </h1>
              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                
                {data.location && (
                  <span className='flex items-center gap-1'>
                    <FaMapMarkerAlt className='text-indigo-600' />
                    {data.location}
                  </span>
                )}
              </div>
              {role === 'seeker' && data.headline && (
                <p className='mt-3 text-gray-700 text-lg'>{data.headline}</p>
              )}
            </div>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSave} className='space-y-6'>
            
            {/* Personal Information Section */}
            <div className='bg-white rounded-2xl shadow-lg p-6 sm:p-8'>
              <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200'>
                <div className='w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center'>
                  <FaUser className='text-indigo-600' />
                </div>
                <h2 className='text-xl font-semibold text-gray-900'>Personal Information</h2>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                    <FaUser className='text-gray-400' />
                    Full Name
                  </label>
                  <input
                    name='fullname'
                    value={data.fullname}
                    onChange={handleChange}
                    className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                    placeholder='Enter your full name'
                  />
                </div>
                
                <div>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                    <FaPhone className='text-gray-400' />
                    Phone Number
                  </label>
                  <input
                    name='phone'
                    value={data.phone}
                    onChange={handleChange}
                    className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                    placeholder='+91 1234567890'
                  />
                </div>

                <div>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                    <MdEmail className='text-gray-400' />
                    Email
                  </label>
                  <input
                    name='email'
                    value={data.email}
                    onChange={handleChange}
                    className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                    placeholder='you@example.com'
                  />
                </div>
                
                <div>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                    <FaMapMarkerAlt className='text-gray-400' />
                    Location
                  </label>
                  <input
                    name='location'
                    value={data.location}
                    onChange={handleChange}
                    className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                    placeholder='City, Country'
                  />
                </div>
                
                {role === 'seeker' && (
                  <div>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                      <FaBriefcase className='text-gray-400' />
                      Professional Headline
                    </label>
                    <input
                      name='headline'
                      value={data.headline}
                      onChange={handleChange}
                      className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                      placeholder='e.g. Senior Frontend Developer'
                    />
                  </div>
                )}
              </div>
            </div>

            

                {/* Academic Details Section */}
               {( role === 'seeker') && ( 
                <div className='bg-white rounded-2xl shadow-lg p-6 sm:p-8'>
                  <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200'>
                    <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center'>
                      <span className='text-blue-600 text-lg'>🎓</span>
                    </div>
                    <h2 className='text-xl font-semibold text-gray-900'>Academic Details</h2>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                        🎓 Degree
                      </label>
                      <input
                        name='degree'
                        value={data.degree || ''}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                        placeholder='e.g. Bachelor of Science'
                      />
                    </div>
                    
                    <div>
                      <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                        🏛️ Institution
                      </label>
                      <input
                        name='institution'
                        value={data.institution || ''}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                        placeholder='e.g. University of California'
                      />
                    </div>
                    
                    <div>
                      <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                        📚 Field of Study
                      </label>
                      <input
                        name='fieldOfStudy'
                        value={data.fieldOfStudy || ''}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                        placeholder='e.g. Computer Science'
                      />
                    </div>
                    
                    <div>
                      <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                        📅 Graduation Year
                      </label>
                      <input
                        name='graduationYear'
                        value={data.graduationYear || ''}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                        placeholder='e.g. 2024'
                      />
                    </div>
                    
                    <div>
                      <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                        ⭐ CGPA 
                      </label>
                      <input
                        name='gpa'
                        value={data.gpa || ''}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                      />
                    </div>
                  </div>
                </div>)}

                

                {/* Work Experience Section */}
               { role === 'seeker' && ( 
                <div className='bg-white rounded-2xl shadow-lg p-6 sm:p-8'>
                  <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-200'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center'>
                        <MdWork className='text-orange-600 text-xl' />
                      </div>
                      <h2 className='text-xl font-semibold text-gray-900'>Work Experience</h2>
                    </div>
                    <button
                      type='button'
                      onClick={addExperience}
                      className='flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all'
                    >
                      <FaPlus className='text-xs' />
                      Add Experience
                    </button>
                  </div>
                  
                  {(!data.experiences || data.experiences.length === 0) ? (
                    <div className='text-center py-8 text-gray-500'>
                      <MdWork className='text-4xl mx-auto mb-3 text-gray-300' />
                      <p>No work experience added yet</p>
                      <p className='text-sm mt-1'>Click "Add Experience" to get started</p>
                    </div>
                  ) : (
                    <div className='space-y-6'>
                      {data.experiences.map((exp, index) => (
                        <div key={index} className='border border-gray-200 rounded-lg p-5 relative hover:shadow-md transition-all'>
                          <button
                            type='button'
                            onClick={() => removeExperience(index)}
                            className='absolute top-3 right-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all'
                            title='Remove experience'
                          >
                            <FaTrash className='text-sm' />
                          </button>
                          
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pr-8'>
                            <div>
                              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                                Job Title *
                              </label>
                              <input
                                value={exp.jobTitle || ''}
                                onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                placeholder='e.g. Software Engineer'
                              />
                            </div>
                            
                            <div>
                              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                                Company *
                              </label>
                              <input
                                value={exp.company || ''}
                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                placeholder='e.g. Google'
                              />
                            </div>
                            
                            <div>
                              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                                Location
                              </label>
                              <input
                                value={exp.location || ''}
                                onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                placeholder='e.g. San Francisco, CA'
                              />
                            </div>
                            
                            <div>
                              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                                Start Date
                              </label>
                              <input
                                type='month'
                                value={exp.startDate || ''}
                                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                              />
                            </div>
                            
                            <div>
                              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                                End Date
                              </label>
                              <input
                                type='month'
                                value={exp.endDate || ''}
                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                disabled={exp.currentlyWorking}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100'
                              />
                            </div>
                            
                            <div className='flex items-center'>
                              <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                  type='checkbox'
                                  checked={exp.currentlyWorking || false}
                                  onChange={(e) => handleExperienceChange(index, 'currentlyWorking', e.target.checked)}
                                  className='w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500'
                                />
                                <span className='text-sm text-gray-700'>Currently working here</span>
                              </label>
                            </div>
                            
                            <div className='md:col-span-2'>
                              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                                Description
                              </label>
                              <textarea
                                value={exp.description || ''}
                                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                rows='3'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none'
                                placeholder='Describe your responsibilities and achievements...'
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>)}

                {/* Job Seeker Section */}
            {role === 'seeker' && (
              <>
                <div className='bg-white rounded-2xl shadow-lg p-6 sm:p-8'>
                  <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200'>
                    <div className='w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center'>
                      <FaFileAlt className='text-purple-600' />
                    </div>
                    <h2 className='text-xl font-semibold text-gray-900'>Resume & Documents</h2>
                  </div>
                  
                  <div>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                      <FaFileAlt className='text-gray-400' />
                      Resume
                    </label>
                    <input
                      type='file'
                      ref={resumeFileInputRef}
                      onChange={handleResumeChange}
                      accept='application/pdf'
                      className='hidden'
                    />
                    <div className='flex flex-col gap-3'>
                      <button
                        type='button'
                        onClick={() => resumeFileInputRef.current?.click()}
                        disabled={uploadingResume}
                        className='w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-8 text-sm hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {uploadingResume ? (
                          <>
                            <FaSpinner className='animate-spin text-indigo-600' />
                            <span className='text-gray-600'>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <FaFileAlt className='text-indigo-600 text-2xl' />
                            <div className='text-center'>
                              <p className='text-gray-700 font-medium'>Click to upload resume</p>
                              <p className='text-xs text-gray-500 mt-1'>PDF only, max 5MB</p>
                            </div>
                          </>
                        )}
                      </button>
                      {data.resumeUrl && (
                        <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
                          <FaFileAlt className='text-green-600' />
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-green-800'>Resume uploaded</p>
                            <a
                              href={`https://docs.google.com/viewer?url=${encodeURIComponent(data.resumeUrl)}&embedded=true`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-xs text-green-600 hover:underline'>
                              View Resume
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className='mt-2 text-xs text-gray-500 flex items-center gap-1'>
                      💡 Tip: Upload your resume as a PDF file for best compatibility
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Employer Section */}
            {role === 'employer' && (
              <div className='bg-white rounded-2xl shadow-lg p-6 sm:p-8'>
                <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200'>
                  <div className='w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center'>
                    <FaBuilding className='text-green-600' />
                  </div>
                  <h2 className='text-xl font-semibold text-gray-900'>Company Information</h2>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                      <FaBuilding className='text-gray-400' />
                      Company Name
                    </label>
                    <input
                      name='companyName'
                      value={data.companyName || ''}
                      onChange={handleChange}
                      className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                      placeholder='Your Company Name'
                    />
                  </div>
                  
                  <div>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                      <FaGlobe className='text-gray-400' />
                      Company Website
                    </label>
                    <input
                      name='companyWebsite'
                      value={data.companyWebsite || ''}
                      onChange={handleChange}
                      className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                      placeholder='https://yourcompany.com'
                    />
                  </div>
                  
                  <div className='md:col-span-2'>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                      <FaBriefcase className='text-gray-400' />
                      Company Description
                    </label>
                    <textarea
                      name='companyDescription'
                      value={data.companyDescription || ''}
                      onChange={handleChange}
                      rows='5'
                      className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none'
                      placeholder='Tell us about your company, what you do, your mission...'
                    />
                  </div>
                  
                  <div>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                      <MdEmail className='text-gray-400' />
                      Contact Email
                    </label>
                    <input
                      name='contactEmail'
                      value={data.contactEmail || ''}
                      onChange={handleChange}
                      className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                      placeholder='contact@company.com'
                    />
                  </div>
                  
                  <div>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                      <FaPhone className='text-gray-400' />
                      Contact Phone
                    </label>
                    <input
                      name='contactPhone'
                      value={data.contactPhone || ''}
                      onChange={handleChange}
                      className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                      placeholder='+1 (555) 000-0000'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className='bg-white rounded-2xl shadow-lg p-6 sm:p-8'>
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div className='text-sm text-gray-600'>
                  {loading ? (
                    <span className='flex items-center gap-2'>
                      <FaSpinner className='animate-spin' />
                      Loading your profile...
                    </span>
                  ) : (
                    <span>💾 Changes are saved automatically when you click Save</span>
                  )}
                </div>
                <button
                  type='submit'
                  disabled={saving || loading}
                  className='w-full sm:w-auto px-8 py-3 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer'
                >
                  {saving ? (
                    <>
                      <FaSpinner className='animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>  
      </div>
    </>
  )
}

export default Profile
