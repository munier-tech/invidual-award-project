import Halaqa from "../models/halaqaModel.js";
import Student from "../models/studentsModel.js";

export const createHalaqa = async (req, res) => {
  try {
    const { name, description, teacher: bodyTeacher, startingSurah, taxdiid } = req.body;
    const exists = await Halaqa.findOne({ name });
    if (exists) {
      // if existing is owned by another teacher, prevent duplicate
      if (req.user?.role === 'teacher') {
        if (exists.teacher && exists.teacher.toString() !== req.teacher._id.toString()) {
          return res.status(400).json({ message: "Halaqa with this name already exists" });
        }
        // if exists with no teacher or owned by this teacher, block creating duplicate
        return res.status(400).json({ message: "Halaqa with this name already exists" });
      }
      return res.status(400).json({ message: "Halaqa with this name already exists" });
    }

    let teacher = bodyTeacher || null;
    if (req.user?.role === 'teacher') {
      if (!req.teacher) return res.status(403).json({ message: 'Forbidden - teacher profile not linked' });
      teacher = req.teacher._id;
    }

    // owner is the authenticated user (ensures teacher isolation)
    const owner = req.user ? req.user._id : null;

    const halaqa = await Halaqa.create({ name, description, teacher, startingSurah, taxdiid, owner });
    res.status(201).json(halaqa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllHalaqas = async (req, res) => {
  try {
    const query = {};
    // enforce owner-based filtering for teachers
    if (req.user?.role === 'teacher') {
      if (!req.teacher) return res.status(403).json({ message: 'Forbidden' });
      query.owner = req.user._id;
    }

    const items = await Halaqa.find(query).populate("teacher", "name").populate("students", "fullname studentId");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHalaqaByName = async (req, res) => {
  try {
    const { name } = req.query;
    const baseQuery = { name: new RegExp(`^${name}$`, 'i') };
    if (req.user?.role === 'teacher') {
      if (!req.teacher) return res.status(403).json({ message: 'Forbidden' });
      baseQuery.owner = req.user._id;
    }

    const item = await Halaqa.findOne(baseQuery).populate("teacher", "name").populate("students", "fullname studentId");
    if (!item) return res.status(404).json({ message: "Halaqa not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHalaqaById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Halaqa.findById(id).populate("teacher", "name").populate("students", "fullname studentId");
    if (!item) return res.status(404).json({ message: "Halaqa not found" });
    if (req.user?.role === 'teacher') {
      if (!req.teacher) return res.status(403).json({ message: 'Forbidden' });
      if (!item.owner || item.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to access this Halaqa" });
      }
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateHalaqa = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const existing = await Halaqa.findById(id);
    if (!existing) return res.status(404).json({ message: "Halaqa not found" });

    if (req.user?.role === 'teacher') {
      if (!req.teacher) return res.status(403).json({ message: 'Forbidden' });
      if (!existing.owner || existing.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to modify this Halaqa" });
      }
    }

    // Prevent teachers from changing the owner or teacher of the halaqa
    if (req.user?.role === 'teacher') {
      if (update && Object.prototype.hasOwnProperty.call(update, 'teacher')) delete update.teacher;
      if (update && Object.prototype.hasOwnProperty.call(update, 'owner')) delete update.owner;
    }

    const item = await Halaqa.findByIdAndUpdate(id, update, { new: true }).populate("teacher", "name").populate("students", "fullname studentId");
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteHalaqa = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Halaqa.findById(id);
    if (!existing) return res.status(404).json({ message: "Halaqa not found" });

    if (req.user?.role === 'teacher') {
      if (!req.teacher) return res.status(403).json({ message: 'Forbidden' });
      if (!existing.teacher || existing.teacher.toString() !== req.teacher._id.toString()) {
        return res.status(404).json({ message: "Halaqa not found" });
      }
    }

    await Halaqa.findByIdAndDelete(id);
    res.json({ message: "Halaqa deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addStudentsToHalaqa = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body; // array

    const halaqa = await Halaqa.findById(id);
    if (!halaqa) return res.status(404).json({ message: "Halaqa not found" });

    // Only the owner teacher (or admins) can modify students
    if (req.user?.role === 'teacher') {
      if (!req.teacher) return res.status(403).json({ message: 'Forbidden' });
      if (!halaqa.teacher || halaqa.teacher.toString() !== req.teacher._id.toString()) {
        return res.status(404).json({ message: "Halaqa not found" });
      }
    }

    // ensure students exist
    const validStudents = await Student.find({ _id: { $in: studentIds } }, "_id");
    const validIds = validStudents.map(s => s._id.toString());

    const set = new Set(halaqa.students.map(s => s.toString()));
    for (const sid of validIds) set.add(sid);
    halaqa.students = Array.from(set);

    await halaqa.save();
    const populated = await halaqa.populate("students", "fullname studentId");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeStudentFromHalaqa = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const halaqa = await Halaqa.findById(id);
    if (!halaqa) return res.status(404).json({ message: "Halaqa not found" });

    // Only the owner teacher (or admins) can modify students
    if (req.user?.role === 'teacher') {
      if (!req.teacher) return res.status(403).json({ message: 'Forbidden' });
      if (!halaqa.teacher || halaqa.teacher.toString() !== req.teacher._id.toString()) {
        return res.status(404).json({ message: "Halaqa not found" });
      }
    }

    halaqa.students = halaqa.students.filter(s => s.toString() !== studentId);
    await halaqa.save();

    const populated = await halaqa.populate("students", "fullname studentId");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};