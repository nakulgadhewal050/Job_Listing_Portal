import { useState, useEffect } from "react";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaBriefcase,
  FaEnvelope,
  FaCalendarAlt,
  FaFileAlt,
  FaChevronDown,
} from "react-icons/fa";
import Nav from "../component/Nav";
import { toast } from "react-toastify";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ✅ Redux se userData lo
  const { userData } = useSelector((state) => state.user);

  // ✅ Protected API — sirf tab call karo jab userData available ho
  useEffect(() => {
    if (userData) {
      fetchAllApplications();
    }
  }, [userData]);

  useEffect(() => {
    let filtered = applications;
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.seekerId?.fullname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.seekerId?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.jobId?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredApplications(filtered);
  }, [statusFilter, searchTerm, applications]);

  const fetchAllApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.get(
        `${serverUrl}/api/applications/employer/all`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setApplications(res.data);
      setFilteredApplications(res.data);
    } catch (error) {
      console.error("Fetch applications error:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('jwt');
      await axios.put(
        `${serverUrl}/api/applications/${id}/status`,
        { status: newStatus },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Application status updated successfully");
      fetchAllApplications();
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      reviewed: "bg-blue-100 text-blue-700 border-blue-300",
      shortlisted: "bg-purple-100 text-purple-700 border-purple-300",
      accepted: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const viewDetails = (app) => {
    setSelectedApplication(app);
    setShowDetailModal(true);
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FaUsers className="text-indigo-600" />
              Candidate Applications
            </h1>
            <p className="text-gray-600">
              View and manage all job applications
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusCounts.all}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">
                {statusCounts.pending}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-blue-700">
                {statusCounts.reviewed}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-purple-700">
                {statusCounts.shortlisted}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-700">
                {statusCounts.accepted}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-700">
                {statusCounts.rejected}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by candidate name, email, or job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <FaUsers className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {applications.length === 0
                  ? "No Applications Yet"
                  : "No Matching Applications"}
              </h3>
              <p className="text-gray-600">
                {applications.length === 0
                  ? "Applications will appear here once candidates start applying"
                  : "Try adjusting your filters or search term"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {app.seekerId?.fullname || "Unknown Candidate"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FaEnvelope className="text-indigo-600" />
                              {app.seekerId?.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-purple-600" />
                              Applied{" "}
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(app.status)}`}
                        >
                          {app.status.charAt(0).toUpperCase() +
                            app.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <FaBriefcase className="text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {app.jobId?.jobTitle || "Job Position"}
                        </span>
                      </div>

                      {app.coverLetter && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg line-clamp-2">
                          {app.coverLetter}
                        </p>
                      )}
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:w-48">
                      <button
                        onClick={() => viewDetails(app)}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all cursor-pointer"
                      >
                        View Details
                      </button>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateApplicationStatus(app._id, e.target.value)
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accept</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Application Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Candidate Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaUsers className="text-indigo-600" />
                  Candidate Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-900">
                    <strong>Name:</strong>{" "}
                    {selectedApplication.seekerId?.fullname}
                  </p>
                  <p className="text-gray-900">
                    <strong>Email:</strong>{" "}
                    {selectedApplication.seekerId?.email}
                  </p>
                </div>
              </div>

              {/* Job Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaBriefcase className="text-indigo-600" />
                  Job Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-900">
                    <strong>Position:</strong>{" "}
                    {selectedApplication.jobId?.jobTitle}
                  </p>
                  <p className="text-gray-900">
                    <strong>Location:</strong>{" "}
                    {selectedApplication.jobId?.location}
                  </p>
                  <p className="text-gray-900">
                    <strong>Type:</strong> {selectedApplication.jobId?.jobType}
                  </p>
                  {selectedApplication.jobId?.salaryRange && (
                    <p className="text-gray-900">
                      <strong>Salary Range:</strong>{" "}
                      {selectedApplication.jobId.salaryRange}
                    </p>
                  )}
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Application Status
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700">Current Status:</span>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadgeColor(selectedApplication.status)}`}
                    >
                      {selectedApplication.status.charAt(0).toUpperCase() +
                        selectedApplication.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium">
                      Update Status:
                    </label>
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => {
                        updateApplicationStatus(
                          selectedApplication._id,
                          e.target.value,
                        );
                        setShowDetailModal(false);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="accepted">Accept</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Cover Letter
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApplication.resumeUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Resume
                  </h3>
                  <div className="flex gap-3">
                    <a
                      href={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedApplication.resumeUrl)}&embedded=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all cursor-pointer"
                    >
                      <FaFileAlt />
                      View Resume
                    </a>
                  </div>
                </div>
              )}

              {/* Employer Notes */}
              {selectedApplication.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Notes
                  </h3>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-gray-700">{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              {/* Application Date */}
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
                Applied on{" "}
                {new Date(selectedApplication.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Applications;
