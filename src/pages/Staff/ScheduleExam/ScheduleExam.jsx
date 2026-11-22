
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout/Layout";
import { supabase } from "../../../lib/supabase";
import "./ScheduleExam.css";

function ScheduleExam() {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  const [scheduleData, setScheduleData] = useState({
    exam: "",
    date: "",
    startTime: "",
  });

  const [allStudents, setAllStudents] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [individualStudents, setIndividualStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, []);

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from("exams")
      .select("id, exam_title, subject, exam_date")
      .eq("status", "draft")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching exams:", error.message);
      alert("Unable to load examinations.");
    } else {
      setExams(data || []);
    }

    setLoading(false);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, register_number, department, year_of_study")
      .eq("role", "student")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching students:", error.message);
      alert("Unable to load students: " + error.message);
    } else {
      setStudents(data || []);
    }

    setStudentsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setScheduleData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleIndividualStudent = (studentId) => {
    setIndividualStudents((previous) =>
      previous.includes(studentId)
        ? previous.filter((id) => id !== studentId)
        : [...previous, studentId]
    );
  };

  const departmentOptions = [
    ...new Set(
      students
        .map((student) => student.department)
        .filter(Boolean)
    ),
  ];

  const yearOptions = [
    ...new Set(
      students
        .map((student) => student.year_of_study)
        .filter((year) => year !== null && year !== undefined && year !== "")
        .map(String)
    ),
  ];

  const groupStudents = students.filter((student) => {
    if (allStudents) return true;

    const departmentMatches =
      !selectedDepartment ||
      student.department === selectedDepartment;

    const yearMatches =
      !selectedYear ||
      String(student.year_of_study) === selectedYear;

    return (
      (selectedDepartment || selectedYear) &&
      departmentMatches &&
      yearMatches
    );
  });

  const selectedStudentIds = [
    ...new Set([
      ...groupStudents.map((student) => student.id),
      ...individualStudents,
    ]),
  ];

  const filteredStudents = students.filter((student) => {
    const search = studentSearch.trim().toLowerCase();

    if (!search) return true;

    return (
      (student.full_name || "").toLowerCase().includes(search) ||
      (student.register_number || "").toLowerCase().includes(search)
    );
  });

  const handleSave = async (e, isScheduling) => {
    e.preventDefault();

    if (!scheduleData.exam || !scheduleData.date || !scheduleData.startTime) {
      alert("Please select an examination, date and start time.");
      return;
    }

    if (selectedStudentIds.length === 0) {
      alert("Please select at least one candidate for this examination.");
      return;
    }

    const selectedDate = new Date(
      `${scheduleData.date}T${scheduleData.startTime}`
    );

    if (Number.isNaN(selectedDate.getTime())) {
      alert("Please enter a valid date and time.");
      return;
    }

    if (selectedDate <= new Date()) {
      alert("Please select a future date and time.");
      return;
    }

    setSaving(true);

    const { error: scheduleError } = await supabase
      .from("exams")
      .update({ exam_date: selectedDate.toISOString() })
      .eq("id", scheduleData.exam);

    if (scheduleError) {
      setSaving(false);
      console.error("Error saving schedule:", scheduleError.message);
      alert("Unable to save schedule: " + scheduleError.message);
      return;
    }

    const assignments = selectedStudentIds.map((studentId) => ({
      exam_id: scheduleData.exam,
      student_id: studentId,
    }));

    const { error: assignmentError } = await supabase
      .from("exam_assignments")
      .upsert(assignments, {
        onConflict: "exam_id,student_id",
        ignoreDuplicates: true,
      });

    setSaving(false);

    if (assignmentError) {
      console.error("Error assigning students:", assignmentError.message);
      alert(
        "The schedule date was saved, but candidate assignment failed: " +
          assignmentError.message
      );
      return;
    }

    setExams((previous) =>
      previous.map((exam) =>
        exam.id === scheduleData.exam
          ? { ...exam, exam_date: selectedDate.toISOString() }
          : exam
      )
    );

    alert(
      `Schedule and candidate assignments saved successfully!\n${selectedStudentIds.length} candidate(s) assigned.\nThe examination remains in draft until published.`
    );
  };

  return (
    <Layout>
      <div className="schedule-exam-page">
        <div className="schedule-page-header">
          <h1>Schedule Examination</h1>
          <p>Set the examination date, time and assigned candidates.</p>
        </div>

        <form className="schedule-form" onSubmit={(e) => handleSave(e, true)}>
          <div className="schedule-section">
            <h2>Examination Details</h2>
            <p className="schedule-description">
              Choose an examination and set its schedule.
            </p>

            <div className="schedule-form-group">
              <label htmlFor="exam">Select Examination</label>
              <select
                id="exam"
                name="exam"
                value={scheduleData.exam}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">
                  {loading ? "Loading examinations..." : "Select an examination"}
                </option>

                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.exam_title} - {exam.subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="schedule-form-grid">
              <div className="schedule-form-group">
                <label htmlFor="date">Examination Date</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={scheduleData.date}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString("en-CA")}
                />
              </div>

              <div className="schedule-form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  value={scheduleData.startTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="schedule-section">
            <h2>Assign Candidates</h2>
            <p className="schedule-description">
              Select candidates using groups, individual search, or both.
            </p>

            {studentsLoading ? (
              <p>Loading students...</p>
            ) : (
              <>
                <div className="schedule-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={allStudents}
                      onChange={(e) => setAllStudents(e.target.checked)}
                    />
                    {" "}Assign to All Students ({students.length})
                  </label>
                </div>

                <div className="schedule-form-grid">
                  <div className="schedule-form-group">
                    <label htmlFor="department">Department</label>
                    <select
                      id="department"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option value="">All Departments</option>
                      {departmentOptions.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="schedule-form-group">
                    <label htmlFor="year">Year of Study</label>
                    <select
                      id="year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="">All Years</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="schedule-form-group">
                  <label htmlFor="studentSearch">
                    Search Individual Students
                  </label>
                  <input
                    id="studentSearch"
                    type="text"
                    placeholder="Search by student name or register number"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    maxHeight: "260px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "12px",
                    marginTop: "10px",
                  }}
                >
                  {filteredStudents.length === 0 ? (
                    <p>No matching students found.</p>
                  ) : (
                    filteredStudents.map((student) => (
                      <label
                        key={student.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 4px",
                          borderBottom: "1px solid #eee",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => toggleIndividualStudent(student.id)}
                        />

                        <span>
                          <strong>
                            {student.full_name || "Unnamed Student"}
                          </strong>
                          <br />
                          <small>
                            {student.register_number || "No register number"}
                            {" | "}
                            {student.department || "No department"}
                            {" | Year "}
                            {student.year_of_study || "Not specified"}
                          </small>
                        </span>
                      </label>
                    ))
                  )}
                </div>

                <p style={{ marginTop: "14px", fontWeight: "600" }}>
                  Total Candidates Selected: {selectedStudentIds.length}
                </p>
              </>
            )}
          </div>

          <div className="schedule-summary">
            <div className="summary-icon">📅</div>
            <div>
              <h3>Schedule Summary</h3>
              <p>
                {scheduleData.exam
                  ? exams.find((exam) => exam.id === scheduleData.exam)
                      ?.exam_title
                  : "No examination selected"}
              </p>
              <p>
                {scheduleData.date || "Date not selected"}
                {scheduleData.startTime
                  ? ` at ${scheduleData.startTime}`
                  : ""}
              </p>
              <p>{selectedStudentIds.length} candidate(s) selected</p>
            </div>
          </div>

          <div className="schedule-actions">
            <button
              type="button"
              className="schedule-draft-button"
              disabled={saving || studentsLoading}
              onClick={(e) => handleSave(e, false)}
            >
              Save as Draft
            </button>

            <button
              type="submit"
              className="schedule-button"
              disabled={saving || studentsLoading}
            >
              {saving ? "Saving..." : "Schedule Examination"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default ScheduleExam;
