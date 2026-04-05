import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaDollarSign,
  FaBriefcase,
  FaFilter,
  FaTimes,
  FaPaperPlane,
  FaCheckCircle,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import { MdWork } from "react-icons/md";

function SeekerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [savedJobs, setSavedJobs] = useState(new Set());

  const { userData } = useSelector((state) => state.user);

  // Public API — user ki zaroorat nahi
  useEffect(() => {
    fetchJobs();
  }, []);

  // Protected APIs — sirf tab call karo jab userData available ho
  useEffect(() => {
    if (userData) {
      checkAppliedJobs();
      fetchSavedJobIds();
    }
  }, [userData]);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, locationFilter, jobTypeFilter, jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/jobs`);
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (error) {
      console.error("Fetch jobs error:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const checkAppliedJobs = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/applications/my-applications`,
        { withCredentials: true },
      );
      const appliedJobIds = new Set(res.data.map((app) => app.jobId._id));
      setAppliedJobs(appliedJobIds);
    } catch (error) {
      console.error("Check applied jobs error:", error);
    }
  };

  const fetchSavedJobIds = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/saved-jobs/saved-ids`, {
        withCredentials: true,
      });
      setSavedJobs(new Set(res.data.map((id) => id.toString())));
    } catch (error) {
      console.error("Fetch saved jobs error:", error);
    }
  };

  const toggleSaveJob = async (jobId) => {
    const JobId = jobId.toString();
    try {
      if (savedJobs.has(JobId)) {
        // Unsave
        await axios.delete(`${serverUrl}/api/saved-jobs/unsave/${jobId}`, {
          withCredentials: true,
        });
        setSavedJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(JobId);
          return newSet;
        });
        toast.success("Job removed from saved jobs");
      } else {
        // Save
        await axios.post(
          `${serverUrl}/api/saved-jobs/save`,
          { jobId },
          { withCredentials: true },
        );
        setSavedJobs((prev) => new Set([...prev, JobId]));
        toast.success("Job saved successfully!");
      }
    } catch (error) {
      console.error("Toggle save job error:", error);
      toast.error(error.response?.data?.message || "Failed to save job");
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Keyword search (job title, description, qualifications, responsibilities)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.jobTitle?.toLowerCase().includes(keyword) ||
          job.description?.toLowerCase().includes(keyword) ||
          job.qualifications?.toLowerCase().includes(keyword) ||
          job.responsibilities?.toLowerCase().includes(keyword),
      );
    }

    // Location filter
    if (locationFilter.trim()) {
      const location = locationFilter.toLowerCase();
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(location),
      );
    }

    // Job type filter
    if (jobTypeFilter) {
      filtered = filtered.filter((job) => job.jobType === jobTypeFilter);
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchKeyword("");
    setLocationFilter("");
    setJobTypeFilter("");
  };

  const openApplicationModal = (job) => {
    setSelectedJob(job);
    setCoverLetter("");
    setShowApplicationModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      await axios.post(
        `${serverUrl}/api/applications/apply`,
        {
          jobId: selectedJob._id,
          coverLetter,
        },
        { withCredentials: true },
      );

      toast.success("Application submitted successfully!");
      setAppliedJobs((prev) => new Set([...prev, selectedJob._id]));
      setShowApplicationModal(false);
      setCoverLetter("");
    } catch (error) {
      console.error("Apply error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setApplying(false);
    }
  };

  const hasActiveFilters = searchKeyword || locationFilter || jobTypeFilter;

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Find Your Dream Job
              </h1>
              <p className="text-gray-600">
                Explore {jobs.length} job opportunities
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search by job title, description, or skills..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
              >
                <FaFilter />
                Filters{" "}
                {hasActiveFilters && (
                  <span className="bg-white text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    !
                  </span>
                )}
              </button>
            </div>

            {/* Filters - Desktop */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-4 mt-4">
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Location"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <FaBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Job Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <FaTimes />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Filters - Mobile */}
            {showFilters && (
              <div className="lg:hidden mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <FaBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">All Job Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <FaTimes />
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Results count */}
            {hasActiveFilters && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </div>
            )}
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <MdWork className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {hasActiveFilters ? "No jobs found" : "No jobs available"}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results"
                  : "Check back later for new opportunities"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
                >
                  <FaTimes />
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100"
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.jobTitle}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-indigo-600" />
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1">
                          <FaDollarSign className="text-green-600" />
                          {job.salaryRange}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium capitalize">
                        {job.jobType}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {job.qualifications && (
                    <div className="mb-3">
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Qualifications:
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {job.qualifications}
                      </p>
                    </div>
                  )}

                  {job.responsibilities && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Responsibilities:
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {job.responsibilities}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveJob(job._id)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          savedJobs.has(job._id)
                            ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                            : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                        }`}
                        title={
                          savedJobs.has(job._id)
                            ? "Remove from saved"
                            : "Save job"
                        }
                      >
                        {savedJobs.has(job._id) ? (
                          <FaBookmark size={18} />
                        ) : (
                          <FaRegBookmark size={18} />
                        )}
                      </button>
                      <div className="text-xs text-gray-500">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {appliedJobs.has(job._id) ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed"
                      >
                        <FaCheckCircle />
                        Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => openApplicationModal(job)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FaPaperPlane />
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Apply for {selectedJob.jobTitle}
              </h2>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900">
                  {selectedJob.jobTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-indigo-600" />
                    {selectedJob.location}
                  </span>
                  {selectedJob.salaryRange && (
                    <span className="flex items-center gap-1">
                      <FaDollarSign className="text-green-600" />
                      {selectedJob.salaryRange}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium capitalize">
                    {selectedJob.jobType}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows="8"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Tell the employer why you are a great fit for this position..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  📄 Your profile resume will be automatically attached to this
                  application.
                </p>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium shadow-lg transition-all cursor-pointer"
                >
                  <FaPaperPlane />
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SeekerDashboard;
