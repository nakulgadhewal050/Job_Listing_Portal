/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaDollarSign,
  FaTimes,
  FaSave,
  FaUsers,
  FaEye,
  FaFileAlt,
  FaSpinner,
} from "react-icons/fa";
import { MdWork } from "react-icons/md";

function EmployeeDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    qualifications: "",
    responsibilities: "",
    location: "",
    salaryRange: "",
    jobType: "full-time",
    status: "active",
  });

  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData) {
      fetchJobs();
    }
  }, [userData]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/jobs/my-jobs`, {
        withCredentials: true,
      });
      setJobs(res.data);
    } catch (error) {
      console.error("Fetch jobs error:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      jobTitle: "",
      description: "",
      qualifications: "",
      responsibilities: "",
      location: "",
      salaryRange: "",
      jobType: "full-time",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      jobTitle: job.jobTitle || "",
      description: job.description || "",
      qualifications: job.qualifications || "",
      responsibilities: job.responsibilities || "",
      location: job.location || "",
      salaryRange: job.salaryRange || "",
      jobType: job.jobType || "full-time",
      status: job.status || "active",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.jobTitle || !formData.description || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      if (editingJob) {
        // Update job
        await axios.put(`${serverUrl}/api/jobs/${editingJob._id}`, formData, {
          withCredentials: true,
        });
        toast.success("Job updated successfully!");
      } else {
        // Create job
        await axios.post(`${serverUrl}/api/jobs`, formData, {
          withCredentials: true,
        });
        toast.success("Job created successfully!");
      }
      setShowModal(false);
      fetchJobs();
    } catch (error) {
      setLoading(false);
      console.error("Save job error:", error);
      toast.error(error.response?.data?.message || "Failed to save job");
    }
  };

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${serverUrl}/api/jobs/${jobId}`, {
        withCredentials: true,
      });
      toast.success("Job deleted successfully!");
      fetchJobs();
    } catch (error) {
      console.error("Delete job error:", error);
      toast.error("Failed to delete job");
    }
  };

  const viewApplications = async (job) => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/applications/job/${job._id}`,
        { withCredentials: true },
      );
      setSelectedJobApplications(res.data);
      setSelectedJobTitle(job.jobTitle);
      setShowApplicationsModal(true);
    } catch (error) {
      console.error("Fetch applications error:", error);
      toast.error("Failed to load applications");
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(
        `${serverUrl}/api/applications/${applicationId}/status`,
        {
          status: newStatus,
        },
        { withCredentials: true },
      );

      toast.success("Application status updated!");
      // Refresh applications
      const res = await axios.get(
        `${serverUrl}/api/applications/job/${selectedJobApplications[0].jobId}`,
        { withCredentials: true },
      );
      setSelectedJobApplications(res.data);
    } catch (error) {
      console.error("Update application error:", error);
      toast.error("Failed to update application");
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      case "shortlisted":
        return "bg-purple-100 text-purple-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Job Listings
                </h1>
                <p className="text-gray-600">
                  Manage your job postings and attract top talent
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer"
              >
                <FaPlus />
                Create New Job
              </button>
            </div>
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <MdWork className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No jobs posted yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first job listing
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(job)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                        title="Edit job"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Delete job"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => viewApplications(job)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        title="View applications"
                      >
                        <FaEye />
                      </button>
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
                    <div className="mb-3">
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Responsibilities:
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {job.responsibilities}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingJob ? "Edit Job" : "Create New Job"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g. San Francisco, CA"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g. $80k - $120k"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Describe the job role and what you are looking for..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications
                </label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="List the required qualifications and skills..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Describe the key responsibilities..."
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg transition-all cursor-pointer"
                >
                  <FaSave />
                  {loading ? (
                    editingJob ? (
                      <>
                        <FaSpinner className="animate-spin" /> Updating Job...
                      </>
                    ) : (
                      <>
                        <FaSpinner className="animate-spin" /> Creating Job...
                      </>
                    )
                  ) : editingJob ? (
                    "Update Job"
                  ) : (
                    "Create Job"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaUsers />
                Job Applications
              </h2>
              <button
                onClick={() => {
                  setShowApplicationsModal(false);
                  setSelectedJobApplications([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6">
              {selectedJobApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FaUsers className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 text-lg">
                    No applications received yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedJobApplications.map((app) => (
                    <div
                      key={app._id}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {app.seekerId?.fullname || "Unknown Applicant"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {app.seekerId?.email}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(app.status)}`}
                            >
                              {app.status.charAt(0).toUpperCase() +
                                app.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-2">
                            Applied{" "}
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                updateApplicationStatus(app._id, e.target.value)
                              }
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <h4 className="font-semibold text-sm text-gray-900 mb-2">
                            Cover Letter:
                          </h4>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {app.coverLetter}
                          </p>
                        </div>
                      )}

                      {app.resumeUrl && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <FaFileAlt />
                            View Resume
                          </a>
                        </div>
                      )}

                      {app.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <h4 className="font-semibold text-sm text-gray-900 mb-1">
                            Notes:
                          </h4>
                          <p className="text-sm text-gray-600">{app.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EmployeeDashboard;
