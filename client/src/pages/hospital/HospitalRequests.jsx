import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

const HospitalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm('Verify this request? It will trigger the matching engine automatically.')) return;
    try {
      await api.put(`/requests/${id}/verify`);
      fetchRequests();
    } catch (err) {
      alert('Error verifying request: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="page-container"><p className="text-neutral-400">Loading...</p></div>;

  return (
    <div className="page-container">
      <h1 className="section-title">Hospital Requests</h1>
      <p className="section-subtitle">Blood requests directed to your hospital</p>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>{req.patientName}</td>
                <td><span className="badge border-red-500/30 text-red-400 bg-red-500/10">{req.bloodGroup}</span></td>
                <td>{req.unitsRequired}</td>
                <td>
                  <span className={`badge ${req.status === 'pending' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                      req.status === 'verified' || req.status === 'matching' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                        req.status === 'fulfilled' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                          'border-neutral-500/30 text-neutral-400 bg-neutral-500/10'
                    }`}>
                    {req.status}
                  </span>
                </td>
                <td className="flex gap-2">
                  <Link to={`/hospital/requests/${req._id}`} className="btn-ghost">View</Link>
                  {req.status === 'pending' && (
                    <button onClick={() => handleVerify(req._id)} className="btn-ghost text-green-400 hover:bg-green-400/10 hover:text-green-300">
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-neutral-500">No requests found for your hospital.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HospitalRequests;
