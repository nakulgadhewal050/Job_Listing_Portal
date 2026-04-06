import { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaDollarSign,
  FaTrash,
  FaBookmark,
  FaPaperPlane,
} from "react-icons/fa";
import Nav from "../component/Nav";
import { toast } from "react-toastify";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Redux se userData lo
  const { userData } = useSelector((state) => state.user);

  // ✅ Protected API — sirf tab call karo jab userData available ho
  useEffect(() => {
    if (userData) {
      fetchSavedJobs();
    }
  }, [userData]);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.get(`${serverUrl}/api/saved-jobs/my-saved-jobs`, {
        withCredentials: true,
         headers: { Authorization: `Bearer ${token}` },
      });
      setSavedJobs(res.data);
    } catch (error) {
      console.error("Fetch saved jobs error:", error);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    if (!window.confirm("Remove this job from saved jobs?")) return;

    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`${serverUrl}/api/saved-jobs/unsave/${jobId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Job removed from saved jobs");
      setSavedJobs((prev) => prev.filter((saved) => saved.jobId._id !== jobId));
    } catch (error) {
      console.error("Unsave job error:", error);
      toast.error("Failed to remove job");
    }
  };

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FaBookmark className="text-yellow-600" />
              Saved Jobs
            </h1>
            <p className="text-gray-600">Jobs you've bookmarked for later</p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading saved jobs...</p>
            </div>
          ) : savedJobs.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <FaBookmark className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Saved Jobs Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start saving jobs to view them here
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all cursor-pointer"
              >
                Browse Jobs
              </a>
            </div>
          ) : (
            /* Jobs Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedJobs.map((saved) => {
                const job = saved.jobId;
                if (!job) return null;

                return (
                  <div
                    key={saved._id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {job.jobTitle}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              job.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {job.status}
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
                      <button
                        onClick={() => handleUnsave(job._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Remove from saved jobs"
                      >
                        <FaTrash />
                      </button>
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
                      <div className="text-xs text-gray-500">
                        Saved {new Date(saved.createdAt).toLocaleDateString()}
                      </div>
                      <a
                        href={`/?apply=${job._id}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FaPaperPlane />
                        Apply Now
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavedJobs;
