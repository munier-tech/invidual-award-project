import multer from 'multer';
import XLSX from 'xlsx';
import Student from "../models/studentsModel.js";
import Class from "../models/classModel.js";
import fs from 'fs';
import path from 'path';

// Simple multer configuration - memory storage to avoid file system issues
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Export the upload middleware
export { upload };

// 1. Create Single Student
export const createStudent = async (req, res) => {
  try {
    const { fullname, age, gender, classId, motherNumber, fatherNumber } = req.body;

    if (!fullname || !motherNumber || !fatherNumber || !classId) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha looga baahan yahay" });
    }

    if (age < 0) {
      return res.status(400).json({ message: "Da'da waa khaldan tahay" });
    }

    const existedFullname = await Student.findOne({ fullname });
    if (existedFullname) {
      return res.status(400).json({ message: "Arday magacan leh hore ayuu u diiwaangashanaa" });
    }

    const student = new Student({
      fullname,
      age,
      gender,
      class: classId || null,
      motherNumber,
      fatherNumber,
    });

    await student.save();

    // If class provided, also add student to Class.students array
    if (classId) {
      await Class.findByIdAndUpdate(classId, { $addToSet: { students: student._id } });
    }

    const populated = await Student.findById(student._id).populate("class");
    res.status(201).json({ message: "Arday si guul leh ayaa loo abuuray", student: populated });
  } catch (error) {
    console.error("Error in createStudent:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create Multiple Students with Excel upload
export const createMultipleStudents = async (req, res) => {
  try {
    console.log('createMultipleStudents called');
    console.log('File received:', !!req.file);
    console.log('Body received:', req.body);

    let parsedStudents = [];
    let classId = null;

    // Check if file was uploaded (Excel mode)
    if (req.file) {
      classId = req.body.classId;
      
      if (!classId) {
        return res.status(400).json({
          success: false,
          message: "Fadlan dooro fasalka"
        });
      }

      try {
        // Parse Excel file from memory buffer
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Excel data parsed:', excelData.length, 'rows');

        // Convert Excel data to student format
        parsedStudents = excelData.map(row => ({
          fullname: row['Student Name'] || row['studentName'] || row['Fullname'] || row['Magaca'] || row['magaca'],
          age: row['Age'] || row['age'] || row['Da\'da'] || row['da\'da'],
          gender: row['Gender'] || row['gender'] || row['Jinsiga'] || row['jinsiga'] || 'male',
          classId: classId,
          motherNumber: row['motherNumber'] || row['Mother Number'] || row['mother'] || row['Hooyo'] || row['hooyo'],
          fatherNumber: row['fatherNumber'] || row['Father Number'] || row['father'] || row['Aabo'] || row['aabo'],
        })).filter(student => student.fullname && student.fullname.trim() !== '');

        console.log(`Parsed ${parsedStudents.length} students from Excel file`);
      } catch (excelError) {
        console.error('Excel parsing error:', excelError);
        return res.status(400).json({
          success: false,
          message: "Faylka Excel-ka waa khalad ama qaabkeedu waa khaldan"
        });
      }
      
    } else {
      // Manual entry mode
      const { students, classId: bodyClassId } = req.body;
      
      if (!students || !bodyClassId) {
        return res.status(400).json({
          success: false,
          message: "Fadlan soo gudbi arday badan iyo fasalka"
        });
      }

      classId = bodyClassId;
      parsedStudents = typeof students === "string" ? JSON.parse(students) : students;
    }

    if (!Array.isArray(parsedStudents) || parsedStudents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Fadlan soo gudbi arday badan oo ku jira list ama faylka Excel"
      });
    }

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Fadlan dooro fasalka ardayda"
      });
    }

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: "Fasalka lama helin"
      });
    }

    // Create students
    const createdStudents = [];
    const errors = [];

    for (const stu of parsedStudents) {
      try {
        const { fullname, age, gender, motherNumber, fatherNumber, fee } = stu;

        // Validate required fields
        if (!fullname || !motherNumber || !fatherNumber) {
          errors.push(`Xogta ardayga "${fullname || "mid ka mid ah"}" waa ka maqan tahay`);
          continue;
        }

        if (age && age < 0) {
          errors.push(`Da'da ardayga "${fullname}" waa khaldan tahay`);
          continue;
        }

        // Check duplicate student by name and class
        const existed = await Student.findOne({ 
          fullname: fullname.trim(),
          class: classId 
        });
        if (existed) {
          errors.push(`Ardayga "${fullname}" hore ayuu u diiwaangashanaa fasalkaan`);
          continue;
        }

        // Create student
        const newStudent = new Student({
          fullname: fullname.trim(),
          age: age || undefined,
          gender: gender || 'male',
          class: classId,
          motherNumber: motherNumber.toString(),
          fatherNumber: fatherNumber.toString(),
          fee: {
            total: fee?.total || 0,
            paid: fee?.paid || 0
          },
        });

        await newStudent.save();

        // Add student to class
        await Class.findByIdAndUpdate(classId, {
          $addToSet: { students: newStudent._id }
        });

        createdStudents.push(newStudent);

      } catch (error) {
        errors.push(`Qalad ku dhacay ardayga "${stu.fullname}": ${error.message}`);
      }
    }

    // Handle results
    if (errors.length > 0 && createdStudents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Qalado ayaa dhacay markii la abuurinayo ardayda",
        errors: errors
      });
    }

    // Populate final results
    const populated = await Student.find({
      _id: { $in: createdStudents.map(s => s._id) }
    }).populate("class");

    const response = {
      success: true,
      message: `${createdStudents.length} arday si guul leh ayaa loo abuuray`,
      students: populated
    };

    // Add warnings if there were errors but some students were created
    if (errors.length > 0) {
      response.warnings = errors;
      response.message = `${createdStudents.length} arday ayaa loo abuuray, ${errors.length} ardayna way fashilmeen`;
    }

    res.status(201).json(response);

  } catch (error) {
    console.error("Error in createMultipleStudents:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 2. Get All Students
export const getAllStudents = async (req , res) => {
  try {
    const student = await Student.find().populate("class")
    res.status(200).json({ students : student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Student by ID
export const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId)
      .populate({
        path: "examRecords",
        options: { sort: { date: -1 } },
        populate: [
          { 
            path: "subjectId",
            select: "name code teacher"
          },
          { path: "teacher", select: "name" }
        ]
      })
      .populate({
        path: "disciplineReports",
        options: { sort: { date: -1 } }
      })
      .populate("class")
      .populate("healthRecords");

    if (!student) return res.status(404).json({ message: "Arday lama helin" });

    res.status(200).json({ student });
  } catch (error) {
    console.error("Error in getStudentById:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Students by Class
export const getStudentsByClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const students = await Student.find({ class: classId }).populate('class', 'name level');
    
    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Error fetching students by class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students for this class",
    });
  }
};

// 4. Update Student
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fullname, age, gender, motherNumber, fatherNumber } = req.body;
    const newClassId = req.body.classId || req.body.class || null;

    const prevStudent = await Student.findById(studentId);
    if (!prevStudent) return res.status(404).json({ message: "Arday lama helin" });

    const updated = await Student.findByIdAndUpdate(
      studentId,
      { fullname, age, gender, class: newClassId, motherNumber, fatherNumber },
      { new: true }
    ).populate("class");

    // Sync Class.students if class changed
    const prevClassId = prevStudent.class ? String(prevStudent.class) : null;
    const nextClassId = newClassId ? String(newClassId) : null;
    if (prevClassId !== nextClassId) {
      if (prevClassId) {
        await Class.findByIdAndUpdate(prevClassId, { $pull: { students: studentId } });
      }
      if (nextClassId) {
        await Class.findByIdAndUpdate(nextClassId, { $addToSet: { students: studentId } });
      }
    }

    res.status(200).json({ message: "Macluumaadka ardayga waa la cusboonaysiiyay", student: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const deleted = await Student.findByIdAndDelete(studentId);

    if (!deleted) return res.status(404).json({ message: "Arday lama helin" });

    // Remove from class if present
    if (deleted.class) {
      await Class.findByIdAndUpdate(deleted.class, { $pull: { students: studentId } });
    }

    res.status(200).json({ message: "Ardayga si guul leh ayaa loo tirtiray" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Assign Student to Class
export const assignStudentToClass = async (req, res) => {
  try {
    const { studentId, classId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Arday lama helin" });

    const prevClassId = student.class ? String(student.class) : null;

    student.class = classId;
    await student.save();

    // Update class membership arrays
    if (prevClassId && prevClassId !== String(classId)) {
      await Class.findByIdAndUpdate(prevClassId, { $pull: { students: studentId } });
    }
    const updatedClass = await Class.findByIdAndUpdate(classId, { $addToSet: { students: studentId } }, { new: true });

    const populatedStudent = await Student.findById(studentId).populate("class");
    res.status(200).json({ message: "Fasalka ayaa loo qoondeeyay ardayga", student: populatedStudent, class: updatedClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Track Fee Payment
export const trackFeePayment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { total, paid } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Arday lama helin" });
    }

    if (total !== undefined) student.fee.total = total;
    if (paid !== undefined) student.fee.paid += paid;

    await student.save();

    res.status(200).json({ message: "Lacag bixinta waa la diiwaangeliyay", fee: student.fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Get Fee Status
export const getFeeStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Arday lama helin" });
    }

    const { total, paid } = student.fee;
    const balance = total - paid;

    res.status(200).json({
      feeStatus: {
        total,
        paid,
        balance,
        status: balance === 0 ? "La bixiyay" : balance < 0 ? "Lacag dheeri ah ayaa la bixiyay" : "Lacag harsan"
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 9. Update Fee Info
export const updateFeeInfo = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { total, paid } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Arday lama helin" });

    if (total !== undefined) student.fee.total = total;
    if (paid !== undefined) student.fee.paid = paid;

    await student.save();

    res.status(200).json({ message: "Xogta lacagta waa la cusboonaysiiyay", fee: student.fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 10. Delete Fee Info
export const deleteFeeInfo = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Arday lama helin" });

    student.fee = { total: 0, paid: 0 };

    await student.save();

    res.status(200).json({ message: "Xogta lacagta waa la tiray", fee: student.fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};