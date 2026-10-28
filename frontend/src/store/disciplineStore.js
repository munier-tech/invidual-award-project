import { create } from "zustand";
import axios from "../config/axios";
import toast from "react-hot-toast";

const TOAST_IDS = {
  create: "store-discipline-create",
  update: "store-discipline-update",
  remove: "store-discipline-delete",
  load: "store-discipline-load",
};

export const useDisciplineStore = create((set, get) => ({
  disciplineRecords: [],
  loading: false,
  error: null,

  // ✅ Create discipline
  createDiscipline: async (data) => {
    try {
      set({ loading: true });
      toast.loading("Diiwaangelinaya anshaxa...", { id: TOAST_IDS.create });
      const res = await axios.post("/discipline/create", data);
      toast.dismiss(TOAST_IDS.create);
      set((state) => ({
        disciplineRecords: [...state.disciplineRecords, res.data],
        loading: false,
      }));
      toast.success("Diiwaanka anshaxa waa lagu daray");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Create failed";
      toast.dismiss(TOAST_IDS.create);
      toast.error(message);
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ✅ Fetch all disciplines
  getAllDiscipline: async () => {
    try {
      set({ loading: true });
      toast.loading("Soo dejinaya diiwaanka anshaxa...", { id: TOAST_IDS.load });
      const res = await axios.get("/discipline/getAll");
      toast.dismiss(TOAST_IDS.load);
      set({ disciplineRecords: res.data, loading: false });
    } catch (error) {
      toast.dismiss(TOAST_IDS.load);
      set({ error: error.response?.data?.message || "Fetch failed", loading: false });
    }
  },

  // ✅ Get one discipline by ID
  getDisciplineById: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.get(`/discipline/${id}`);
      set({ loading: false });
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Fetch single failed", loading: false });
    }
  },

  // ✅ Update discipline
  updateDiscipline: async (id, updatedData) => {
    try {
      set({ loading: true });
      toast.loading("Cusboonaysiinaya diiwaanka anshaxa...", { id: TOAST_IDS.update });
      const res = await axios.put(`/discipline/${id}`, updatedData);
      toast.dismiss(TOAST_IDS.update);
      set((state) => ({
        disciplineRecords: state.disciplineRecords.map((item) =>
          item._id === id ? res.data : item
        ),
        loading: false,
      }));
      toast.success("Diiwaanka anshaxa waa la cusboonaysiiyay");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      toast.dismiss(TOAST_IDS.update);
      toast.error(message);
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ✅ Delete discipline
  deleteDiscipline: async (id) => {
    try {
      set({ loading: true });
      toast.loading("Tirtiraya diiwaanka anshaxa...", { id: TOAST_IDS.remove });
      await axios.delete(`/discipline/${id}`);
      toast.dismiss(TOAST_IDS.remove);
      set((state) => ({
        disciplineRecords: state.disciplineRecords.filter((item) => item._id !== id),
        loading: false,
      }));
      toast.success("Diiwaanka anshaxa waa la tirtiray");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Delete failed";
      toast.dismiss(TOAST_IDS.remove);
      toast.error(message);
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },
}));
