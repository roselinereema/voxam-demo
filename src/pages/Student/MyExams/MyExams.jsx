
import { useEffect, useState } from "react";
import StudentLayout from "../../../components/Layout/StudentLayout";
import { supabase } from "../../../lib/supabase";

function MyExams() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyExams = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          setError("Please log in to view your examinations.");
          return;
        }

        const { data, error: attemptsError } = await supabase
          .from("exam_attempts")
          .select(`
            id,
            exam_id,
            attempt_number,
            started_at,
            submitted_at,
            status,
            exams (
              exam_title,
              subject,
              duration_minutes,
              total_questions,
              total_marks,
              exam_date
            )
          `)
          .eq("student_id", user.id)
          .order("started_at", { ascending: false });

        if (attemptsError) throw attemptsError;

        setAttempts(data || []);
      } catch (err) {
        console.error("My exams error:", err.message);
        setError("Unable to load your examinations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyExams();
  }, []);

  return (
    <StudentLayout>
      <div className="student-dashboard">
        <div className="student-dashboard-header">
          <div>
            <h2>My Examinations</h2>
            <p>View your completed and ongoing examinations.</p>
          </div>
        </div>

        <div className="available-exam-section">
          {loading ? (
            <p>Loading your examinations...</p>
          ) : error ? (
            <p>{error}</p>
          ) : attempts.length === 0 ? (
            <p>You have not attempted any examinations yet.</p>
          ) : (
            attempts.map((attempt) => {
              const exam = attempt.exams;

              if (!exam) return null;

              return (
                <div className="student-exam-card" key={attempt.id}>
                  <div className="exam-card-icon">📚</div>

                  <div className="exam-card-details">
                    <h3>{exam.exam_title}</h3>
                    <p>Subject: {exam.subject}</p>

                    <div className="exam-card-info">
                      <span>⏱️ {exam.duration_minutes} Minutes</span>
                      <span>📝 {exam.total_questions} Questions</span>
                      <span>🎯 {exam.total_marks} Marks</span>
                    </div>

                    <p>Attempt: {attempt.attempt_number}</p>

                    <p>
                      Started:{" "}
                      {new Date(attempt.started_at).toLocaleString()}
                    </p>

                    {attempt.submitted_at && (
                      <p>
                        Submitted:{" "}
                        {new Date(attempt.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <span>
                    {attempt.status === "submitted"
                      ? "Submitted"
                      : attempt.status === "in_progress"
                      ? "Ongoing"
                      : "Abandoned"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default MyExams;
