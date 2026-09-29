import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from '../lib/connectdb.js';
import Halaqa from '../models/halaqaModel.js';
import Teachers from '../models/teachersModel.js';
import User from '../models/userModel.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function backfill() {
  try {
    await connectDb();

    const total = await Halaqa.countDocuments();
    console.log(`Found ${total} halaqas`);

    const report = {
      total,
      assigned: [],
      noTeacherRef: [],
      teacherHasNoEmail: [],
      noMatchingUser: [],
      ambiguousUsers: [],
      skippedAlreadyOwned: 0
    };

    const cursor = Halaqa.find().cursor();
    for (let halaqa = await cursor.next(); halaqa != null; halaqa = await cursor.next()) {
      // skip if owner already present
      if (halaqa.owner) {
        report.skippedAlreadyOwned += 1;
        continue;
      }

      if (!halaqa.teacher) {
        report.noTeacherRef.push(String(halaqa._id));
        continue;
      }

      const teacher = await Teachers.findById(halaqa.teacher).lean();
      if (!teacher) {
        report.noTeacherRef.push(String(halaqa._id));
        continue;
      }

      const email = teacher.email && String(teacher.email).trim().toLowerCase();
      if (!email) {
        report.teacherHasNoEmail.push({ halaqaId: String(halaqa._id), teacherId: String(teacher._id) });
        continue;
      }

      const matchedUsers = await User.find({ email }).select('_id email').lean();
      if (!matchedUsers || matchedUsers.length === 0) {
        report.noMatchingUser.push({ halaqaId: String(halaqa._id), teacherId: String(teacher._id), email });
        continue;
      }

      if (matchedUsers.length > 1) {
        report.ambiguousUsers.push({ halaqaId: String(halaqa._id), teacherId: String(teacher._id), email, matchedCount: matchedUsers.length, matchedUserIds: matchedUsers.map(u=>u._id) });
        continue;
      }

      // exactly one matching user
      const userId = matchedUsers[0]._id;

      // Assign owner safely
      await Halaqa.findByIdAndUpdate(halaqa._id, { owner: userId }, { new: true });
      report.assigned.push({ halaqaId: String(halaqa._id), teacherId: String(teacher._id), email, owner: String(userId) });
    }

    // write report
    const outDir = path.join(process.cwd(), 'backend', 'scripts', 'output');
    try { fs.mkdirSync(outDir, { recursive: true }); } catch (e) {}
    const outPath = path.join(outDir, `backfill_halaqa_owner_report_${Date.now()}.json`);
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

    console.log('Backfill report written to', outPath);
    console.log('Summary:', {
      total: report.total,
      assigned: report.assigned.length,
      noTeacherRef: report.noTeacherRef.length,
      teacherHasNoEmail: report.teacherHasNoEmail.length,
      noMatchingUser: report.noMatchingUser.length,
      ambiguousUsers: report.ambiguousUsers.length,
      skippedAlreadyOwned: report.skippedAlreadyOwned
    });

    process.exit(0);
  } catch (err) {
    console.error('Backfill error:', err);
    process.exit(1);
  }
}

backfill();
