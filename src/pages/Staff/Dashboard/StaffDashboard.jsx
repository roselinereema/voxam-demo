
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout/Layout";
import { supabase } from "../../../lib/supabase";
import "./StaffDashboard.css";

function StaffDashboard() {
  const [totalExams, setTotalExams] = useState(0);
  const [activeExams, setActiveExams] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [draftExams, setDraftExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingExam, setReviewingExam] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [reviewedExams, setReviewedExams] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        examsResult,
        activeResult,
        studentsResult,
        draftsResult,
      ] = await Promise.all([
        supabase
          .from("exams")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("exams")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),

        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "student"),

        supabase
          .from("exams")
          .select("id, exam_title, subject, exam_date, total_marks, duration_minutes")
          .eq("status", "draft")
          .order("created_at", { ascending: false }),
      ]);

      if (examsResult.error) throw examsResult.error;
      if (activeResult.error) throw activeResult.error;
      if (studentsResult.error) throw studentsResult.error;
      if (draftsResult.error) throw draftsResult.error;

      setTotalExams(examsResult.count ?? 0);
      setActiveExams(activeResult.count ?? 0);
      setTotalStudents(studentsResult.count ?? 0);
      setDraftExams(draftsResult.data || []);
    } catch (error) {
      console.error("Dashboard data error:", error.message);
      alert("Unable to load dashboard data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCandidates = async (exam) => {
    setReviewingExam(exam);
    setCandidates([]);
    setReviewedExams((previous) =>
      previous.filter((id) => id !== exam.id)
    );

    const { data, error } = await supabase
      .from("exam_assignments")
      .select(`
        student_id,
        profiles (
          full_name,
          register_number,
          department,
          year_of_study
        )
      `)
      .eq("exam_id", exam.id);

    if (error) {
      console.error("Candidate loading error:", error.message);
      alert("Unable to load assigned candidates: " + error.message);
      setReviewingExam(null);
      return;
    }

    if (!data || data.length === 0) {
      alert("No candidates are assigned to this examination.");
      setReviewingExam(null);
      return;
    }

    setCandidates(data);
    setReviewedExams((previous) =>
      previous.includes(exam.id) ? previous : [...previous, exam.id]
    );
  };

  const handlePublishExam = async (exam) => {
    if (!reviewedExams.includes(exam.id)) {
      alert("Please review the candidate list before publishing.");
      return;
    }

    if (candidates.length === 0) {
      alert("This examination has no assigned candidates.");
      return;
    }

    const confirmed = window.confirm(
      `Publish "${exam.exam_title}" for ${candidates.length} assigned candidate(s)?`
    );

    if (!confirmed) return;

    setPublishing(true);

    const { error } = await supabase
      .from("exams")
      .update({ status: "published" })
      .eq("id", exam.id)
      .eq("status", "draft");

    setPublishing(false);

    if (error) {
      console.error("Publish error:", error.message);
      alert("Unable to publish examination: " + error.message);
      return;
    }

    alert("Examination published successfully!");

    setReviewingExam(null);
    setCandidates([]);
    setReviewedExams((previous) =>
      previous.filter((id) => id !== exam.id)
    );

    fetchDashboardData();
  };

  return (
    <Layout>
      <div className="staff-dashboard">
        <h2>Welcome to Staff Portal</h2>

        <p>
          Manage examinations, students, questions and student answer
          submissions from this portal.
        </p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Total Exams</h3>
            <strong>{loading ? "..." : totalExams}</strong>
          </div>

          <div className="dashboard-card">
            <h3>Active Exams</h3>
            <strong>{loading ? "..." : activeExams}</strong>
          </div>

          <div className="dashboard-card">
            <h3>Total Students</h3>
            <strong>{loading ? "..." : totalStudents}</strong>
          </div>
        </div>

        <section className="draft-exams-section">
          <h2>Draft Examinations</h2>
          <p>Review assigned candidates before publishing an examination.</p>

          {loading ? (
            <p>Loading examinations...</p>
          ) : draftExams.length === 0 ? (
            <div className="empty-drafts">
              No draft examinations available.
            </div>
          ) : (
            <div className="draft-exams-list">
              {draftExams.map((exam) => (
                <div className="draft-exam-card" key={exam.id}>
                  <div className="draft-exam-details">
                    <h3>{exam.exam_title}</h3>
                    <p>{exam.subject}</p>
                    <p>
                      Date:{" "}
                      {exam.exam_date
                        ? new Date(exam.exam_date).toLocaleString()
                        : "Not scheduled"}
                    </p>
                    <p>
                      Duration: {exam.duration_minutes} minutes
                    </p>
                    <p>Maximum Marks: {exam.total_marks}</p>
                  </div>

                  <div className="draft-exam-actions">
                    <button
                      className="review-candidates-button"
                      onClick={() => handleReviewCandidates(exam)}
                    >
                      Review Candidates
                    </button>
                  </div>

                  {reviewingExam?.id === exam.id && (
                    <div className="candidate-review-panel">
                      <h3>Assigned Candidates</h3>

                      <p>
                        {candidates.length} candidate(s) assigned
                      </p>

                      <div className="candidate-table-wrapper">
                        <table className="candidate-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Register Number</th>
                              <th>Department</th>
                              <th>Year</th>
                            </tr>
                          </thead>

                          <tbody>
                            {candidates.map((candidate) => (
                              <tr key={candidate.student_id}>
                                <td>
                                  {candidate.profiles?.full_name || "Unknown"}
                                </td>
                                <td>
                                  {candidate.profiles?.register_number || "-"}
                                </td>
                                <td>
                                  {candidate.profiles?.department || "-"}
                                </td>
                                <td>
                                  {candidate.profiles?.year_of_study || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="publish-actions">
                        <span className="reviewed-message">
                          Candidate list reviewed
                        </span>

                        <button
                          className="publish-exam-button"
                          disabled={
                            publishing ||
                            !reviewedExams.includes(exam.id)
                          }
                          onClick={() => handlePublishExam(exam)}
                        >
                          {publishing
                            ? "Publishing..."
                            : "Publish Examination"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default StaffDashboard;
