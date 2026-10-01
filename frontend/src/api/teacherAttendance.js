import axios from '../config/axios';

export const recordTeacherAttendance = async (data) => {
  const response = await axios.post('/teachersAttendance/create', data);
  return response.data;
};

export const getTeacherAttendance = async (from, to, teacherFilter = '') => {
  const params = { from, to };
  if (teacherFilter) params.teacherId = teacherFilter;

  const response = await axios.get('/teachersAttendance/get', { params });
  return response.data;
};