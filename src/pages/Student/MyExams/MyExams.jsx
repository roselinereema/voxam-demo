
import StudentLayout from "../../../components/Layout/StudentLayout";

function MyExams() {
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

          <div className="student-exam-card">
            <div className="exam-card-icon">📚</div>

            <div className="exam-card-details">
              <h3>Data Structures - Internal Exam</h3>
              <p>Subject: Data Structures</p>
              <div className="exam-card-info">
                <span>⏱️ 60 Minutes</span>
                <span>📝 20 Questions</span>
                <span>🎯 100 Marks</span>
              </div>
            </div>

            <span>Not Attempted</span>
          </div>

        </div>

      </div>
    </StudentLayout>
  );
}

export default MyExams;
