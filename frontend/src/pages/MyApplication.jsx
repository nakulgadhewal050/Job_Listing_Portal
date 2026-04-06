import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaDollarSign,
  FaBriefcase,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import Nav from "../component/Nav";
import { toast } from "react-toastify";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";

function MyApplication() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Redux se userData lo
  const { userData } = useSelector((state) => state.user);

  // ✅ Protected API — sirf tab call karo jab userData available ho
  useEffect(() => {
    if (userData) {
      fetchMyApplications();
    }
  }, [userData]);

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.get(
        `${serverUrl}/api/applications/my-applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      setApplications(res.data);
    } catch (error) {
      console.error("Fetch applications error:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`${serverUrl}/api/applications/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Application deleted successfully");
      fetchMyApplications();
    } catch (error) {
      console.error("Delete application error:", error);
      toast.error("Failed to withdraw application");
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      reviewed: "bg-blue-100 text-blue-700",
      shortlisted: "bg-purple-100 text-purple-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Applications
            </h1>
            <p className="text-gray-600">
              Track the status of all your job applications
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <FaBriefcase className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Applications Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start applying for jobs to see them here
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all cursor-pointer"
              >
                Browse Jobs
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {app.jobId?.jobTitle || "Job Title Unavailable"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(app.status)}`}
                        >
                          {app.status.charAt(0).toUpperCase() +
                            app.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-gray-600 mb-3">
                        {app.jobId?.employerId?.fullname || "Company Name"}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-indigo-600" />
                          {app.jobId?.location || "Location not specified"}
                        </span>
                        {app.jobId?.salaryRange && (
                          <span className="flex items-center gap-1">
                            <FaDollarSign className="text-green-600" />
                            {app.jobId.salaryRange}
                          </span>
                        )}
                        {app.jobId?.jobType && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium capitalize">
                            {app.jobId.jobType}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-purple-600" />
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteApplication(app._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Withdraw application"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {app.jobId?.description && (
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {app.jobId.description}
                    </p>
                  )}

                  {app.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">
                        Your Cover Letter:
                      </h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {app.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Employer Notes:
                      </h4>
                      <p className="text-sm text-gray-600 italic">
                        {app.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyApplication;
