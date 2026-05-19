import mongoose from "mongoose";

const dailyQuranSession = new mongoose.Schema({
   student : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
   },
   status : {
     type: String,
     enum: ["gartay", "garan waayay", "majoogo"],
     default: "majoogo",
     required: true,
   },
   surah: {
     type: String,
     default: "",
     trim: true
   },
   fromVerse: {
     type: String,
     default: "",
     trim: true
   },
   toVerse: {
     type: String,
     default: "",
     trim: true
   },
   notes: {
     type: String,
     default: "",
     trim: true
   },
   date : {
    type: Date,
    default: Date.now,
   },
   class : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
   }
} , { timestamps : true} )


const DailyQuran = mongoose.model("DailyQuran", dailyQuranSession);

export default DailyQuran;