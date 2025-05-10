// const router = require("express").Router();
// const Staff = require("../db/staffdb");
// const Student = require("../db/studentdb");
// const { saveChatMessage } = require("../middleware/chat"); // Update the path to chat.js
// const { isAuthenticated, isAuthorized } = require("../middleware/auth");
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");
// const mammoth = require("mammoth");
// const PDFDocument = require("pdfkit");

// // student home route
// router.get("/student",isAuthenticated, async (req, res) => {
//   res.render("studentdashboard", {
//     user: req.user,
//     socketIOClientScript: "/socket.io/socket.io.js",
//   });
// });

// // student Project route
// router.get("/student/myproject/:params", isAuthenticated, (req, res) => {
//   const messages = req.flash("info");
// console.log(req.user.topic)
//   // Check if the project Topic field is empty
//   if (req.user.topic) {
//     if (req.user.thesisStatus === "Approve For Defense") {
//       if (
//         req.user.thesisStatus === "Approve For Defense" &&
//         req.user.final_document[0]
//       ) {
//         res.render("myProject", {
//           user: req.user,
//           showModal: false,
//           showModal1: false,
//           messages: messages,
//         });
//       } else {
//         res.render("myProject", {
//           user: req.user,
//           showModal: false,
//           showModal1: true,
//           messages: messages,
//         });
//       }
//     } else {
//       res.render("myProject", {
//         user: req.user,
//         showModal: false,
//         showModal1: false,
//         messages: messages,
//       });
//     }
//   } else if (!req.user.topic) {
//     // Render the myProject page with a modal to show that the field is empty

//     res.render("myProject", {
//       user: req.user,
//       showModal: true,
//       messages: messages,
//       showModal1: false,
//     });
//   }
// });

// // student submit project topic
// router.post("/student/myprojectTopic", async (req, res) => {
//   const messages = req.flash("info");

//   // Check if the project Topic field is empty
//   console.log(req.user);
//   if (req.body.topic) {
//     if (req.body.description) {
//       // Render the myProject page with a modal to show that the field is empty
//       await Student.findOneAndUpdate(
//         { ID: req.user.ID },
//         {
//           topic: req.body.topic,
//           description: req.body.description,
//           thesisStatus: "Pending Approval",
//         }
//       );

//       req.flash("info", "Thesis Topic Submitted Successfully");

//       res.redirect("/student/myproject/" + req.user.ID);
//     }
//   }
// });

// // Set up multer to store uploaded files in specific folders based on studentID and uploaderType
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const studentID = req.body.studentID;
//     const uploaderType = req.body.uploaderType;

//     let destinationFolder = "";
//     if (uploaderType === "supervisor") {
//       destinationFolder = `uploads/${studentID}/supervisor/`;
//     } else if (uploaderType === "student") {
//       destinationFolder = `uploads/${studentID}/student/`;
//     }else
//     if (uploaderType === "student_final") {
//       destinationFolder = `uploads/${studentID}/final/`;
//     } else {
//       destinationFolder = "uploads/"; // Fallback, you can handle other cases as needed
//     }

//     // Create the directory if it doesn't exist
//     fs.mkdirSync(path.join(destinationFolder), { recursive: true });

//     cb(null, destinationFolder);
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// // Handle supervisor upload
// router.post("/student/upload", upload.single("document"), async (req, res) => {
//   const studentID = req.body.studentID;
//   const uploadedDocument = req.file;
//   console.log(studentID);

//   req.flash("info", "File uploaded successfully!");

//   const findStudent = await Student.findOne({ ID: studentID });
//   if (!findStudent) {
//     console.log("student not found");
//   } else {
//     const filename = uploadedDocument.filename;
//     console.log(filename);
//     const documentName = {
//       sender: "student",
//       filename,
//       timestamp: new Date(),
//     };
//     findStudent.uploads.push(documentName);
//     await findStudent.save();
//   }

//   res.redirect(`/student/myproject/${studentID}`);
// });

// // Student message their supervisor
// router.get("/student/message",isAuthenticated, async (req, res) => {
//   const supervisor = await Staff.findOne({ ID: req.user.supervisorID });
//   const studentId = req.user.ID;
//   const room = `supervisor_${supervisor.ID}_student_${req.user.ID}`;
//   const student = await Student.findOne({ ID: req.user.ID });
//   res.render("studentMessage", {
//     user: req.user,
//     supervisor,
//     room,
//     socketIOClientScript: "/socket.io/socket.io.js",
//     studentId,
//     chats: student.chats,
//   });
// });

// // Handle student messages to their supervisor
// router.post("/student/message", async (req, res) => {
//   const supervisorId = req.user.supervisorID;
//   const studentId = req.user.ID;
//   const message = req.body.message;
//   const room = `supervisor_${supervisorId}_student_${req.user.ID}`;
//   const io = req.io;
//   // Emit the message to the supervisor's room
//   io.to(room).emit("chat message", { sender: "student", message });

//   // Save the chat message to your database
//   saveChatMessage("student", message, studentId);

//   res.redirect("/student/message");
// });

// router.get("/student/:studentID/student/:fileName",  (req, res) => {
//   const { studentID, fileName } = req.params;

//   // Build the file path based on studentID, uploaderType, and fileName
//   const filePath = path.join(
//     __dirname,
//     "..",
//     "uploads",
//     studentID,
//     "supervisor",
//     fileName
//   );

//   // Check if the file exists
//   if (fs.existsSync(filePath)) {
//     res.sendFile(filePath);
//   } else {
//     res.status(404).send("File not found");
//   }
// });

// router.get("/plagiarism", isAuthenticated, (req, res) => {
//   const { originalname, score, pdfFilePath } = "";
//   const messages = req.flash("info");
//   res.render("plagiarism", {
//     user: req.user,
//     messages: messages,
//     originalname,
//     score,
//     pdfFilePath,
//   });
// });

// // Route to handle file upload and plagiarism check
// router.post("/plagiarism", upload.single("document"), async (req, res) => {
//   try {
//     const { originalname, path } = req.file;
//     const outputFileName = originalname.replace(".docx", ".pdf");

//     // Read the DOCX file using mammoth
//     mammoth
//       .extractRawText({ path: path })
//       .then((result) => {
//         const text = result.value.trim();
//         const score = "10%";

//         // Create a new PDF
//         const doc = new PDFDocument();
//         const outputPath = `./uploads/${outputFileName}`;

//         // Add text to the PDF
//         doc.pipe(fs.createWriteStream(outputPath));
//         doc.fontSize(12).text(text);
//         doc.fontSize(12).text(`Score is ${score}`);
//         doc.end();

//         // Set the appropriate headers for file download
//         res.setHeader(
//           "Content-Disposition",
//           `attachment; filename="${outputFileName}"`
//         );
//         res.setHeader("Content-Type", "application/pdf");

//         // Send the PDF as a response
//         const readStream = fs.createReadStream(outputPath);
//         readStream.pipe(res);

//         // Remove the temporary files
//         readStream.on("end", () => {
//           fs.unlinkSync(path); // Remove the uploaded DOCX file
//           fs.unlinkSync(outputPath); // Remove the temporary PDF file
//         });
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//         res.status(500).send("Error occurred");
//       });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Error occurred");
//   }
// });

// router.post( "/thesis/finalDocument",upload.single("document"),async (req, res) => {
//     const studentID = req.user.ID;
//     const uploadedDocument = req.file;
//     const topic = req.body.topic;
//     const abstract = req.body.abstract;
//     console.log(uploadedDocument);

//     const findStudent = await Student.findOne({ ID: studentID });
//     if (!findStudent) {
//       console.log("student not found");
//     } else {
//       const filename = uploadedDocument.filename;
//       console.log(filename);
//       const documentName = {
//         sender: "student",
//         topic,
//         abstract,
//         filename,

//         timestamp: new Date(),
//       };
//       findStudent.final_document.push(documentName);
//       await findStudent.save();
//     }

//     res.redirect(`/student/myproject/${studentID}`);
//   }
// );


// router.get("/student/thesis", isAuthenticated, async (req, res) => {
//   const findallstudentswithpublish = await Student.find({
//     thesisStatus: "Published",
//   });
//   res.render("studentThesis", {
//     user: req.user,
//     findallstudentswithpublish,
//   });
// });



// module.exports = router;


const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mammoth = require("mammoth");
const PDFDocument = require("pdfkit");
const { Student, Staff } = require("../db/models");
const { isAuthenticated, isStudent } = require("../middleware/auth");
const { saveChatMessage } = require("../middleware/chat");

// Configure file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const { studentID, uploaderType } = req.body;
      const uploadDirs = {
        supervisor: `uploads/${studentID}/supervisor/`,
        student: `uploads/${studentID}/student/`,
        student_final: `uploads/${studentID}/final/`
      };
      
      const dir = uploadDirs[uploaderType] || "uploads/";
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Student dashboard
router.get("/", isStudent, (req, res) => {
  res.render("student/dashboard", {
    user: req.user,
    messages: req.flash()
  });
});

// Project management
router.get("/project/:id", isStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      req.flash("error", "Student not found");
      return res.redirect("/student");
    }

    res.render("student/project", {
      user: student,
      showTopicModal: !student.topic,
      showFinalModal: student.thesisStatus === "Approve For Defense" && !student.final_document?.length,
      messages: req.flash()
    });
  } catch (error) {
    console.error("Project error:", error);
    req.flash("error", "Error loading project");
    res.redirect("/student");
  }
});

// Submit project topic
router.post("/project/topic", isStudent, async (req, res) => {
  try {
    const { topic, description } = req.body;
    if (!topic || !description) {
      req.flash("error", "Topic and description are required");
      return res.redirect(`/student/project/${req.user.id}`);
    }

    await Student.findByIdAndUpdate(req.user.id, {
      topic,
      description,
      thesisStatus: "Pending Approval"
    });

    req.flash("success", "Topic submitted successfully");
    res.redirect(`/student/project/${req.user.id}`);
  } catch (error) {
    console.error("Topic submission error:", error);
    req.flash("error", "Error submitting topic");
    res.redirect(`/student/project/${req.user.id}`);
  }
});

// File upload handler
router.post("/upload", isStudent, upload.single("document"), async (req, res) => {
  try {
    const { studentID, uploaderType } = req.body;
    const file = req.file;

    if (!file) {
      req.flash("error", "No file uploaded");
      return res.redirect(`/student/project/${studentID}`);
    }

    const update = {
      $push: {
        uploads: {
          sender: uploaderType,
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          timestamp: new Date()
        }
      }
    };

    await Student.findByIdAndUpdate(studentID, update);
    req.flash("success", "File uploaded successfully");
    res.redirect(`/student/project/${studentID}`);
  } catch (error) {
    console.error("Upload error:", error);
    req.flash("error", "Error uploading file");
    res.redirect(`/student/project/${req.body.studentID}`);
  }
});

// Messaging system
router.get("/messages", isStudent, async (req, res) => {
  try {
    const supervisor = await Staff.findById(req.user.supervisor);
    if (!supervisor) {
      req.flash("error", "Supervisor not found");
      return res.redirect("/student");
    }

    const room = `supervisor_${supervisor.id}_student_${req.user.id}`;
    const student = await Student.findById(req.user.id).populate("chats");

    res.render("student/messages", {
      user: req.user,
      supervisor,
      room,
      chats: student.chats,
      messages: req.flash()
    });
  } catch (error) {
    console.error("Messages error:", error);
    req.flash("error", "Error loading messages");
    res.redirect("/student");
  }
});

// Download file
router.get("/download/:type/:filename", isStudent, (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      req.user.id,
      req.params.type,
      req.params.filename
    );

    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    }
    throw new Error("File not found");
  } catch (error) {
    console.error("Download error:", error);
    req.flash("error", error.message);
    res.redirect("/student");
  }
});

module.exports = router;