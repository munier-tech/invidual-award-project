import { create } from "zustand";
import axios from "../config/axios"; // make sure this points to your axios instance
import toast from "react-hot-toast";

const TOAST_IDS = {
  create: "store-health-create",
  update: "store-health-update",
  remove: "store-health-delete",
  load: "store-health-load",
};

export const useHealthStore = create((set, get) => ({
  healthRecords: [],
  studentHealthRecords: [],
  loading: false,
  error: null,

  // ✅ Add Health Record
  addHealthRecord: async (data) => {
    try {
      set({ loading: true });
      toast.loading("Diiwaangelinaya xogta caafimaadka...", { id: TOAST_IDS.create });
      const res = await axios.post("/health/create", data);
      toast.dismiss(TOAST_IDS.create);
      set((state) => ({
        healthRecords: [res.data.healthRecord, ...state.healthRecords],
        loading: false,
      }));
      toast.success("Xogta caafimaadka waa lagu daray");
      return { success: true, record: res.data.healthRecord };
    } catch (err) {
      console.error("Error adding health record:", err);
      const message = err.response?.data?.message || err.message;
      toast.dismiss(TOAST_IDS.create);
      toast.error(message);
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ✅ Get All Health Records
  getAllHealthRecords: async () => {
    try {
      set({ loading: true });
      toast.loading("Soo dejinaya xogta caafimaadka...", { id: TOAST_IDS.load });
      const res = await axios.get("/health/getAll");
      toast.dismiss(TOAST_IDS.load);
      set({ healthRecords: res.data.healthRecords, loading: false });
    } catch (err) {
      console.error("Error fetching all health records:", err);
      toast.dismiss(TOAST_IDS.load);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ✅ Get Health Records for One Student
getStudentHealthRecords: async (studentId) => {
  try {
    set({ loading: true });
    const res = await axios.get(`/health/getStudent/${studentId}`);
    set({ studentHealthRecords: res.data.studentHealthRecords, loading: false });
    return res.data.studentHealthRecords; // ✅ This line was missing!
  } catch (err) {
    console.error("Error fetching student health records:", err);
    set({ error: err.response?.data?.message || err.message, loading: false });
    return []; // ✅ Prevents undefined return
  }
},

  // ✅ Update Health Record
  updateHealthRecord: async (healthId, updatedData) => {
    try {
      set({ loading: true });
      toast.loading("Cusboonaysiinaya xogta caafimaadka...", { id: TOAST_IDS.update });
      const res = await axios.put(`/health/update/${healthId}`, updatedData);
      toast.dismiss(TOAST_IDS.update);
      set((state) => ({
        healthRecords: state.healthRecords.map((rec) =>
          rec._id === healthId ? res.data.Health : rec
        ),
        loading: false,
      }));
    } catch (err) {
      console.error("Error updating health record:", err);
      toast.dismiss(TOAST_IDS.update);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ✅ Delete Health Record
  deleteHealthRecord: async (healthId) => {
    try {
      set({ loading: true });
      toast.loading("Tirtiraya xogta caafimaadka...", { id: TOAST_IDS.remove });
      await axios.delete(`/health/delete/${healthId}`);
      toast.dismiss(TOAST_IDS.remove);
      set((state) => ({
        healthRecords: state.healthRecords.filter((rec) => rec._id !== healthId),
        loading: false,
      }));
    } catch (err) {
      console.error("Error deleting health record:", err);
      toast.dismiss(TOAST_IDS.remove);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ✅ Clear Errors
  clearError: () => set({ error: null }),
}));
