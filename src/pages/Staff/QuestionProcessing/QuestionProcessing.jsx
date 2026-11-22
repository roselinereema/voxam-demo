
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import { supabase } from "../../../lib/supabase";
import "./QuestionProcessing.css";

function QuestionProcessing() {
  const location = useLocation();

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(
    location.state?.examId || ""
  );

  const [questions, setQuestions] = useState([
    { question_text: "", marks: "1" }
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  // Load examinations from Supabase.
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from("exams")
          .select("id, exam_title, subject, total_questions, total_marks")
          .eq("status", "draft")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setExams(data || []);
      } catch (error) {
        console.error("Error loading examinations:", error);
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const currentExam = exams.find(
    (exam) => exam.id === selectedExam
  );

  const totalEnteredMarks = questions.reduce(
    (total, question) => total + (Number(question.marks) || 0),
    0
  );

  const handleExamChange = (e) => {
    setSelectedExam(e.target.value);
    setQuestions([{ question_text: "", marks: "1" }]);
    setMessage("");
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question, questionIndex) =>
        questionIndex === index
          ? { ...question, [field]: value }
          : question
      )
    );
  };

  const addQuestion = () => {
    setQuestions((previousQuestions) => [
      ...previousQuestions,
      { question_text: "", marks: "1" }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      alert("At least one question is required.");
      return;
    }

    setQuestions((previousQuestions) =>
      previousQuestions.filter(
        (_, questionIndex) => questionIndex !== index
      )
    );
  };

  const handleSaveQuestions = async () => {
    if (!selectedExam) {
      alert("Please select an examination.");
      return;
    }

    const validQuestions = questions.every(
      (question) =>
        question.question_text.trim() &&
        Number(question.marks) > 0
    );

    if (!validQuestions) {
      alert("Please enter every question and its marks.");
      return;
    }

    if (questions.length !== Number(currentExam.total_questions)) {
      const confirmSave = window.confirm(
        `This examination expects ${currentExam.total_questions} questions, but you have entered ${questions.length}. Do you want to continue?`
      );

      if (!confirmSave) return;
    }

    if (totalEnteredMarks !== Number(currentExam.total_marks)) {
      const confirmSave = window.confirm(
        `The examination has ${currentExam.total_marks} total marks, but your questions add up to ${totalEnteredMarks}. Do you want to continue?`
      );

      if (!confirmSave) return;
    }

    setSaving(true);
    setMessage("");

    try {
      const questionsToSave = questions.map((question, index) => ({
        exam_id: selectedExam,
        question_number: index + 1,
        question_text: question.question_text.trim(),
        marks: Number(question.marks),
        question_type: "voice"
      }));

      const { error } = await supabase
        .from("questions")
        .insert(questionsToSave);

      if (error) throw error;

      setMessage("Questions saved successfully!");

      alert("Questions saved successfully!");

      setQuestions([{ question_text: "", marks: "1" }]);
    } catch (error) {
      console.error("Error saving questions:", error);
      alert(error.message || "Unable to save questions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="question-processing-page">

        {/* PAGE HEADER */}
        <div className="question-processing-header">
          <div>
            <h2>Manual Question Entry</h2>
            <p>
              Select an examination and manually enter its questions.
            </p>
          </div>
        </div>

        {/* SELECT EXAM */}
        <div className="processing-card">
          <div className="processing-card-header">
            <div>
              <h3>Select Examination</h3>
              <p>Choose the examination for which you want to add questions.</p>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "20px" }}>
            <label>Examination</label>

            <select
              value={selectedExam}
              onChange={handleExamChange}
              disabled={loading || saving}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                marginTop: "8px"
              }}
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

          {currentExam && (
            <div className="file-details">
              <div>
                <strong>{currentExam.exam_title}</strong>
                <p>Subject: {currentExam.subject}</p>
                <p>Expected Questions: {currentExam.total_questions}</p>
                <p>Total Marks: {currentExam.total_marks}</p>
              </div>
            </div>
          )}

          {!loading && exams.length === 0 && (
            <p style={{ marginTop: "15px", color: "#64748b" }}>
              No draft examinations found. Create an examination first.
            </p>
          )}
        </div>

        {/* QUESTION ENTRY */}
        {currentExam && (
          <div className="questions-preview-card">

            <div className="questions-preview-header">
              <div>
                <h3>Enter Examination Questions</h3>
                <p>Add each question and assign its marks.</p>
              </div>

              <span className="question-count">
                {questions.length} Questions
              </span>
            </div>

            {questions.map((question, index) => (
              <div className="preview-question" key={index}>
                <div className="question-number">
                  Q{index + 1}
                </div>

                <div className="question-content">

                  <div className="form-group">
                    <label>Question {index + 1}</label>

                    <textarea
                      rows="3"
                      value={question.question_text}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "question_text",
                          e.target.value
                        )
                      }
                      placeholder="Enter your question here..."
                      disabled={saving}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        marginTop: "8px",
                        resize: "vertical"
                      }}
                    />
                  </div>

                  <div
                    className="form-group"
                    style={{ marginTop: "12px" }}
                  >
                    <label>Marks</label>

                    <input
                      type="number"
                      min="1"
                      value={question.marks}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "marks",
                          e.target.value
                        )
                      }
                      disabled={saving}
                      style={{
                        width: "120px",
                        padding: "10px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        marginTop: "8px"
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    disabled={saving}
                    style={{
                      marginTop: "12px",
                      padding: "8px 14px",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      background: "#fef2f2",
                      color: "#dc2626",
                      cursor: "pointer"
                    }}
                  >
                    Remove Question
                  </button>

                </div>
              </div>
            ))}

            {/* TOTALS */}
            <div className="processing-info">
              <div>
                <strong>Question Summary</strong>
                <p>Questions entered: {questions.length}</p>
                <p>Total marks entered: {totalEnteredMarks}</p>
              </div>
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "20px"
              }}
            >
              <button
                type="button"
                onClick={addQuestion}
                disabled={saving}
                style={{
                  padding: "12px 18px",
                  border: "1px solid #2563eb",
                  borderRadius: "8px",
                  background: "white",
                  color: "#2563eb",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                + Add Another Question
              </button>

              <button
                type="button"
                onClick={handleSaveQuestions}
                disabled={saving}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {saving ? "Saving Questions..." : "Save Questions"}
              </button>
            </div>

          </div>
        )}

        {/* MESSAGE */}
        {message && (
          <div className="processing-info" style={{ marginTop: "20px" }}>
            <div>
              <strong>{message}</strong>
            </div>
          </div>
        )}

        {/* NEXT STEP */}
        <div className="processing-next-info">
          <span>➡️</span>

          <div>
            <strong>Next Step</strong>
            <p>
              After adding questions, the examination can be scheduled
              and assigned to candidates.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default QuestionProcessing;
