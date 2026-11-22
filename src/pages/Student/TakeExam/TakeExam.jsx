
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../../components/Layout/StudentLayout";
import { supabase } from "../../../lib/supabase";

function TakeExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [originalAnswers, setOriginalAnswers] = useState({});
  const [interimAnswers, setInterimAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [saveErrors, setSaveErrors] = useState({});
  const [listeningQuestionId, setListeningQuestionId] = useState(null);
  const [speechErrors, setSpeechErrors] = useState({});
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setSpeechSupported(Boolean(SpeechRecognition));

    const fetchExamData = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("Please log in to continue.");

        const { data: attempt, error: attemptError } = await supabase
          .from("exam_attempts")
          .select("id, exam_id, student_id, status, started_at")
          .eq("id", attemptId)
          .eq("student_id", user.id)
          .single();

        if (attemptError) throw attemptError;

        if (attempt.status !== "in_progress") {
          throw new Error("This examination attempt is not active.");
        }

        const { data: examData, error: examError } = await supabase
          .from("exams")
          .select(`
            id,
            exam_title,
            subject,
            duration_minutes,
            total_questions,
            total_marks,
            instructions,
            answer_mode
          `)
          .eq("id", attempt.exam_id)
          .eq("status", "published")
          .single();

        if (examError) throw examError;

        const { data: questionData, error: questionError } =
          await supabase
            .from("questions")
            .select("id, question_number, question_text, marks")
            .eq("exam_id", attempt.exam_id)
            .order("question_number", { ascending: true });

        if (questionError) throw questionError;

        const { data: answerData, error: answerError } = await supabase
          .from("student_answers")
          .select("question_id, edited_answer, original_answer")
          .eq("attempt_id", attemptId);

        if (answerError) throw answerError;

        const existingAnswers = {};
        const existingOriginalAnswers = {};
        const existingSaved = {};

        (answerData || []).forEach((answer) => {
          existingAnswers[answer.question_id] =
            answer.edited_answer || "";
          existingOriginalAnswers[answer.question_id] =
            answer.original_answer || "";
          existingSaved[answer.question_id] = true;
        });

        setExam(examData);
        setQuestions(questionData || []);
        setAnswers(existingAnswers);
        setOriginalAnswers(existingOriginalAnswers);
        setSaved(existingSaved);
      } catch (err) {
        console.error("Examination loading error:", err.message);
        setError(err.message || "Unable to load the examination.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [attemptId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    setSaved((previous) => ({
      ...previous,
      [questionId]: false,
    }));

    setSaveErrors((previous) => ({
      ...previous,
      [questionId]: "",
    }));
  };

  const startVoiceRecognition = (questionId) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechErrors((previous) => ({
        ...previous,
        [questionId]:
          "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
      }));
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setSpeechErrors((previous) => ({
      ...previous,
      [questionId]: "",
    }));

    setInterimAnswers((previous) => ({
      ...previous,
      [questionId]: "",
    }));

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListeningQuestionId(questionId);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setAnswers((previous) => {
          const currentAnswer = previous[questionId] || "";
          const separator = currentAnswer.trim() ? " " : "";

          return {
            ...previous,
            [questionId]: currentAnswer + separator + finalTranscript.trim(),
          };
        });

        setOriginalAnswers((previous) => {
          const currentOriginal = previous[questionId] || "";
          const separator = currentOriginal.trim() ? " " : "";

          return {
            ...previous,
            [questionId]:
              currentOriginal + separator + finalTranscript.trim(),
          };
        });

        setSaved((previous) => ({
          ...previous,
          [questionId]: false,
        }));
      }

      setInterimAnswers((previous) => ({
        ...previous,
        [questionId]: interimTranscript,
      }));
    };

    recognition.onerror = (event) => {
      setSpeechErrors((previous) => ({
        ...previous,
        [questionId]: `Microphone error: ${event.error}. Please try again.`,
      }));

      setListeningQuestionId(null);
    };

    recognition.onend = () => {
      setListeningQuestionId(null);
      setInterimAnswers((previous) => ({
        ...previous,
        [questionId]: "",
      }));

      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setSpeechErrors((previous) => ({
        ...previous,
        [questionId]: "Unable to start the microphone. Please try again.",
      }));

      setListeningQuestionId(null);
      recognitionRef.current = null;
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setListeningQuestionId(null);
  };

  const handleSaveAnswer = async (questionId) => {
    const answerText = answers[questionId] || "";

    if (!answerText.trim()) {
      setSaveErrors((previous) => ({
        ...previous,
        [questionId]: "Please enter or record an answer before saving.",
      }));
      return;
    }

    try {
      setSaving((previous) => ({
        ...previous,
        [questionId]: true,
      }));

      setSaveErrors((previous) => ({
        ...previous,
        [questionId]: "",
      }));

      const { error: saveError } = await supabase
        .from("student_answers")
        .upsert(
          {
            attempt_id: attemptId,
            question_id: questionId,
            original_answer: originalAnswers[questionId] || null,
            edited_answer: answerText,
            answered_at: new Date().toISOString(),
          },
          {
            onConflict: "attempt_id,question_id",
          }
        );

      if (saveError) throw saveError;

      setSaved((previous) => ({
        ...previous,
        [questionId]: true,
      }));
    } catch (err) {
      console.error("Answer saving error:", err.message);

      setSaveErrors((previous) => ({
        ...previous,
        [questionId]: err.message || "Unable to save answer.",
      }));
    } finally {
      setSaving((previous) => ({
        ...previous,
        [questionId]: false,
      }));
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="student-dashboard">
          <p>Loading examination...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="student-dashboard">
          <h2>Unable to Open Examination</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/student/my-exams")}>
            Back to My Examinations
          </button>
        </div>
      </StudentLayout>
    );
  }

  const answerMode = (exam.answer_mode || "voice-text").toLowerCase();

  const isTextMode = answerMode === "text";
  const isVoiceMode = answerMode === "voice";
  const isVoiceTextMode = answerMode === "voice-text";
  const usesVoice = isVoiceMode || isVoiceTextMode;

  return (
    <StudentLayout>
      <div className="student-dashboard">
        <div className="student-dashboard-header">
          <div>
            <h2>{exam.exam_title}</h2>
            <p>{exam.subject}</p>
          </div>
        </div>

        <div className="available-exam-section">
          <div className="student-exam-card">
            <div className="exam-card-details">
              <h3>Examination Details</h3>

              <div className="exam-card-info">
                <span>⏱️ {exam.duration_minutes} Minutes</span>
                <span>📝 {questions.length} Questions</span>
                <span>🎯 {exam.total_marks} Marks</span>
              </div>

              <p>
                Answer Mode:{" "}
                <strong>
                  {isTextMode
                    ? "Text Answers"
                    : isVoiceMode
                    ? "Voice Answers"
                    : "Voice + Text Answers"}
                </strong>
              </p>
            </div>
          </div>

          {exam.instructions && (
            <div className="student-exam-card">
              <div className="exam-card-details">
                <h3>Instructions</h3>
                <p>{exam.instructions}</p>
              </div>
            </div>
          )}

          <h3>Examination Questions</h3>

          {questions.length === 0 ? (
            <p>No questions have been added to this examination.</p>
          ) : (
            questions.map((question) => (
              <div className="student-exam-card" key={question.id}>
                <div className="exam-card-details">
                  <h3>Question {question.question_number}</h3>
                  <p>{question.question_text}</p>
                  <p>Marks: {question.marks}</p>

                  {usesVoice && (
                    <div style={{ marginTop: "15px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (listeningQuestionId === question.id) {
                            stopVoiceRecognition();
                          } else {
                            startVoiceRecognition(question.id);
                          }
                        }}
                        disabled={
                          listeningQuestionId !== null &&
                          listeningQuestionId !== question.id
                        }
                      >
                        {listeningQuestionId === question.id
                          ? "⏹ Stop Recording"
                          : "🎤 Start Recording"}
                      </button>

                      {listeningQuestionId === question.id && (
                        <p style={{ color: "red", marginTop: "8px" }}>
                          Listening... Speak your answer.
                        </p>
                      )}

                      {!speechSupported && (
                        <p style={{ color: "red", marginTop: "8px" }}>
                          Speech recognition is not supported in this browser.
                          Please use Chrome or Edge.
                        </p>
                      )}

                      {speechErrors[question.id] && (
                        <p style={{ color: "red", marginTop: "8px" }}>
                          {speechErrors[question.id]}
                        </p>
                      )}
                    </div>
                  )}

                  {isTextMode || isVoiceTextMode ? (
                    <div style={{ marginTop: "15px" }}>
                      <label
                        htmlFor={`answer-${question.id}`}
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600",
                        }}
                      >
                        {isVoiceTextMode
                          ? "Your Converted / Edited Answer"
                          : "Your Answer"}
                      </label>

                      <textarea
                        id={`answer-${question.id}`}
                        value={answers[question.id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        placeholder="Type your answer here..."
                        rows={5}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          resize: "vertical",
                          fontSize: "15px",
                          boxSizing: "border-box",
                        }}
                      />

                      {interimAnswers[question.id] && (
                        <p style={{ color: "#777", marginTop: "8px" }}>
                          Recognizing: {interimAnswers[question.id]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: "15px" }}>
                      <label
                        htmlFor={`answer-${question.id}`}
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600",
                        }}
                      >
                        Your Converted Speech
                      </label>

                      <textarea
                        id={`answer-${question.id}`}
                        value={
                          (answers[question.id] || "") +
                          (interimAnswers[question.id]
                            ? ` ${interimAnswers[question.id]}`
                            : "")
                        }
                        readOnly
                        placeholder="Your spoken answer will appear here..."
                        rows={5}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          resize: "vertical",
                          fontSize: "15px",
                          boxSizing: "border-box",
                          backgroundColor: "#f5f5f5",
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(question.id)}
                    disabled={saving[question.id]}
                    style={{ marginTop: "10px" }}
                  >
                    {saving[question.id] ? "Saving..." : "Save Answer"}
                  </button>

                  {saved[question.id] && (
                    <p style={{ color: "green", marginTop: "8px" }}>
                      Answer saved successfully!
                    </p>
                  )}

                  {saveErrors[question.id] && (
                    <p style={{ color: "red", marginTop: "8px" }}>
                      {saveErrors[question.id]}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default TakeExam;
