import {create} from "zustand";
import axios from "../config/axios"; 
import toast from "react-hot-toast";

const TOAST_IDS = {
  create: "store-exam-create",
  createClass: "store-exam-create-class",
  update: "store-exam-update",
};

export const useExamStore = create((set) => ({
  // State properties
  isLoading: false,
  loading: false, // Add this for consistency with component
  error: null,
  successMessage: null,
  exams: [], // Add this for getExamsByClassAndYear
  studentExams: [], // Add this for getStudentExamsByYear

  createExam: async (examData) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      toast.loading("Diiwaangelinaya imtixaanka...", { id: TOAST_IDS.create });
      const response = await axios.post("/exams/create", examData);
      toast.dismiss(TOAST_IDS.create);
      set({ isLoading: false, successMessage: response.data.message });
      return response.data.exam;
    } catch (error) {
      toast.dismiss(TOAST_IDS.create);
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message,
      });
      return null;
    }
  },

   createClassExam: async ({ examType, date, classId, subjectId, totalMarks, marksList }) => {
    try {
      set({ isLoading: true });
      toast.loading("Diiwaangelinaya imtixaanka fasalka...", { id: TOAST_IDS.createClass });

      const response = await axios.post("/exams/createClassExam", {
        examType,
        date,
        classId,
        subjectId,
        totalMarks,
        marksList, // [{ studentId, obtainedMarks }]
      });

      toast.dismiss(TOAST_IDS.createClass);
      toast.success("Imtixanka Fasalka si Fican Ayaa Loo Abuuray ");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("createClassExam error:", error);
      toast.dismiss(TOAST_IDS.createClass);
      toast.error(error.response?.data?.message || "Failed to create class exam");
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  getExamsByClassAndYear: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post("/exams/classExams", filters);
      set({ exams: res.data.exams, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch exams",
        loading: false,
      });
    }
  },

  updateExam: async (examId, examData) => {
    try {
      set({ isLoading: true, error: null });
      toast.loading("Cusboonaysiinaya dhibcaha...", { id: TOAST_IDS.update });
      const res = await axios.patch(`/exams/update/${examId}`, examData);
      toast.dismiss(TOAST_IDS.update);
      const updatedExam = res.data.exam;

      set((state) => ({
        exams: state.exams.map((exam) => exam._id === examId ? { ...exam, ...updatedExam } : exam),
        isLoading: false,
        successMessage: res.data.message,
      }));

      toast.success("Imtixaanka waa la cusbooneysiiyay");
      return { success: true, data: updatedExam };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update exam";
      toast.dismiss(TOAST_IDS.update);
      set({ isLoading: false, error: message });
      toast.error(message);
      return { success: false, error: message };
    }
  },

  getStudentExamsByYear: async ({ studentId, academicYear, examType, subjectId }) => {
    try {
      console.log('Starting getStudentExamsByYear with:', { studentId, academicYear, examType, subjectId });
      set({ loading: true, error: null });

      const res = await axios.post('/exams/student', {
        studentId,
        academicYear,
        examType,
        subjectId,
      });

      console.log('API Response:', res.data);
      console.log('Setting studentExams to:', res.data.data);
      
      const newState = { studentExams: res.data.data, loading: false };
      console.log('Setting new state:', newState);
      set(newState);
      
      // Verify the state was set correctly
      setTimeout(() => {
        console.log('State after setting:', useExamStore.getState());
      }, 100);
      
    } catch (error) {
      console.error('API Error:', error);
      set({
        error: error?.response?.data?.message || 'Failed to fetch exams',
        loading: false,
      });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));
