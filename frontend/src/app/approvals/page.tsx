"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function ApprovalsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch (err: any) {
      setError("Failed to fetch recommendations. Ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED" | "REVISION_REQUESTED") => {
    try {
      const comments = prompt(`Reason for ${status}?`);
      await api.reviewRecommendation(id, status, comments || undefined);
      await fetchRecommendations();
    } catch (err: any) {
      alert("Failed to review: " + err.message);
    }
  };

  const canReview = user?.role === "EXECUTIVE" || user?.role === "OPS_MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">AI Recommendations & Approvals</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      ) : recommendations.length === 0 ? (
        <div className="text-slate-600 dark:text-slate-400 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          No pending AI recommendations.
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.recommendation_id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-500">{rec.recommendation_id}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  rec.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  rec.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  {rec.status}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">User Query</h3>
                <p className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg text-sm font-mono">{rec.query}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">AI Action Plan</h3>
                <div className="text-slate-700 dark:text-slate-300 text-sm prose dark:prose-invert max-w-none bg-slate-50 dark:bg-blue-950/20 p-4 rounded-lg border border-slate-200 dark:border-blue-900/30">
                  <ReactMarkdown>{rec.recommendation_text}</ReactMarkdown>
                </div>
              </div>

              {rec.status === 'PENDING' && canReview && (
                <div className="flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
                  <button 
                    onClick={() => handleReview(rec.recommendation_id, "APPROVED")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Approve Execution
                  </button>
                  <button 
                    onClick={() => handleReview(rec.recommendation_id, "REVISION_REQUESTED")}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Request Revision
                  </button>
                  <button 
                    onClick={() => handleReview(rec.recommendation_id, "REJECTED")}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Reject Plan
                  </button>
                </div>
              )}

              {rec.reviewer_id && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col gap-1">
                  <div>Reviewed by <span className="font-semibold text-slate-700 dark:text-slate-300">{rec.reviewer_id}</span> at {new Date(rec.reviewed_at).toLocaleString()}</div>
                  {rec.reviewer_comments && <div>Comments: <span className="italic">"{rec.reviewer_comments}"</span></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
