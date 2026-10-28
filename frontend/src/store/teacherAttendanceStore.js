// useTeacherAttendanceStore.js
import { create } from 'zustand';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import { withSaveToast } from '../utils/saveToast';

const TOAST_IDS = {
  create: 'teacher-attendance-create-form',
  update: 'store-teacher-attendance-update',
  remove: 'store-teacher-attendance-delete',
  load: 'store-teacher-attendance-load'
};

const useTeacherAttendanceStore = create((set) => ({
  attendance: [],
  loading: false,
  error: null,
  success: false,

  createAttendance: async (data) => {
    set({ loading: true, error: null, success: false });
    let outcome;
    try {
      outcome = await withSaveToast(
        toast,
        { id: TOAST_IDS.create, loading: 'Diiwaangelinaya xaadiriska macallinka...' },
        async () => {
          const res = await axios.post('/teachersAttendance/create', data);
          set((state) => ({
            attendance: [res.data.data, ...state.attendance],
            success: true,
            loading: false
          }));
          return { success: true, data: res.data.data };
        }
      );
    } catch (error) {
      console.error('Create attendance error:', error);
      set({
        error: error.response?.data?.message || 'Failed to record attendance',
        loading: false
      });
      return { success: false };
    }
    return outcome.thrown ? { success: false } : outcome;
  },

  getAttendance: async (params = {}) => {
    set({ loading: true });
    try {
      toast.loading('Soo dejinaya xaadiriska...', { id: TOAST_IDS.load });
      const res = await axios.get('/teachersAttendance/get', { params });
      toast.dismiss(TOAST_IDS.load);
      set({ attendance: res.data.data, loading: false });
    } catch (error) {
      toast.dismiss(TOAST_IDS.load);
      toast.error('Failed to load attendance');
      set({ loading: false });
    }
  },

  getAttendanceByDate: async (input = {}, teacherId = null) => {
    set({ loading: true, error: null });
    try {
      const filter = typeof input === 'string' ? { date: input, teacherId } : input || {};
      const { date, from, to, teacherId: selectedTeacherId } = filter;

      if (!date && !(from && to)) {
        throw new Error('Date or date range is required');
      }

      const params = {};
      if (date) params.date = date;
      if (from) params.from = from;
      if (to) params.to = to;
      if (selectedTeacherId || teacherId) params.teacherId = selectedTeacherId || teacherId;

      const response = await axios.get('/teachersAttendance/get', { params });

      set({
        attendanceRecords: response.data.data || [],
        currentDate: date || from,
        loading: false,
        error: null
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to fetch attendance';

      toast.error(errorMessage);
      set({
        error: errorMessage,
        loading: false
      });
      throw error;
    }
  },

  updateAttendance: async (id, data) => {
    try {
      return await withSaveToast(
        toast,
        { id: TOAST_IDS.update, loading: 'Cusboonaysiinaya xaadiriska...' },
        async () => {
          const res = await axios.put(`/teacher-attendance/update`, { id, ...data });
          set((state) => ({
            attendance: state.attendance.map((a) => (a._id === id ? res.data.data : a))
          }));
          toast.success('Attendance updated');
          return { success: true };
        }
      );
    } catch (error) {
      toast.dismiss(TOAST_IDS.update);
      toast.error('Failed to update attendance');
      return { success: false };
    }
  },

  deleteAttendance: async (id) => {
    try {
      return await withSaveToast(
        toast,
        { id: TOAST_IDS.remove, loading: 'Tirtiraya xaadiriska...' },
        async () => {
          await axios.delete(`/teacher-attendance/delete`, { data: { id } });
          set((state) => ({
            attendance: state.attendance.filter((a) => a._id !== id)
          }));
          toast.success('Attendance deleted');
          return { success: true };
        }
      );
    } catch (error) {
      toast.dismiss(TOAST_IDS.remove);
      toast.error('Failed to delete attendance');
      return { success: false };
    }
  },

  clearStatus: () => set({ success: false, error: null })
}));

export default useTeacherAttendanceStore;
