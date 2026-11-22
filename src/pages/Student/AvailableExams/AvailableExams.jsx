
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../../components/Layout/StudentLayout";
import { supabase } from "../../../lib/supabase";

function AvailableExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingExam, setStartingExam] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableExams = async () => {
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

        const { data, error: examsError } = await supabase
          .from("exams")
          .select(`
            id,
            exam_title,
            subject,
            description,
            duration_minutes,
            total_questions,
            total_marks,
            exam_date,
            instructions,
            allowed_attempts
          `)
          .eq("status", "published")
          .order("exam_date", { ascending: true });

        if (examsError) throw examsError;

        setExams(data || []);
      } catch (err) {
        console.error("Available exams error:", err.message);
        setError("Unable to load examinations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableExams();
  }, []);

  const handleStartExam = async (exam) => {
    try {
      setStartingExam(exam.id);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      // Check whether the student already has an ongoing attempt.
      const { data: ongoingAttempt, error: ongoingError } = await supabase
        .from("exam_attempts")
        .select("id")
        .eq("exam_id", exam.id)
        .eq("student_id", user.id)
        .eq("status", "in_progress")
        .maybeSingle();

      if (ongoingError) throw ongoingError;

      // Resume the existing attempt instead of creating another one.
      if (ongoingAttempt) {
        navigate(`/student/take-exam/${ongoingAttempt.id}`);
        return;
      }

      // Count previously created attempts.
      const { count, error: countError } = await supabase
        .from("exam_attempts")
        .select("id", { count: "exact", head: true })
        .eq("exam_id", exam.id)
        .eq("student_id", user.id);

      if (countError) throw countError;

      const allowedAttempts = exam.allowed_attempts || 1;

      if (count >= allowedAttempts) {
        alert("You have used all allowed attempts for this examination.");
        return;
      }

      // Create a new attempt.
      const { data: attempt, error: insertError } = await supabase
        .from("exam_attempts")
        .insert({
          exam_id: exam.id,
          student_id: user.id,
          attempt_number: count + 1,
          status: "in_progress",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Open the examination screen.
      navigate(`/student/take-exam/${attempt.id}`);

    } catch (err) {
      console.error("Start examination error:", err.message);
      setError(err.message || "Unable to start the examination.");
    } finally {
      setStartingExam(null);
    }
  };

  return (
    <StudentLayout>
      <div className="student-dashboard">
        <div className="student-dashboard-header">
          <div>
            <h2>Available Examinations</h2>
            <p>View examinations assigned to you.</p>
          </div>
        </div>

        <div className="available-exam-section">
          {loading ? (
            <p>Loading examinations...</p>
          ) : error && exams.length === 0 ? (
            <p>{error}</p>
          ) : exams.length === 0 ? (
            <p>No examinations are currently available.</p>
          ) : (
            <>
              {error && <p>{error}</p>}

              {exams.map((exam) => (
                <div className="student-exam-card" key={exam.id}>
                  <div className="exam-card-icon">📚</div>

                  <div className="exam-card-details">
                    <h3>{exam.exam_title}</h3>
                    <p>Subject: {exam.subject}</p>

                    {exam.description && <p>{exam.description}</p>}

                    <div className="exam-card-info">
                      <span>⏱️ {exam.duration_minutes} Minutes</span>
                      <span>📝 {exam.total_questions} Questions</span>
                      <span>🎯 {exam.total_marks} Marks</span>
                    </div>

                    {exam.exam_date && (
                      <p>
                        Exam Date:{" "}
                        {new Date(exam.exam_date).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button
                    className="start-exam-button"
                    onClick={() => handleStartExam(exam)}
                    disabled={startingExam !== null}
                  >
                    {startingExam === exam.id
                      ? "Starting..."
                      : "Start Exam"}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default AvailableExams;
