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



const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mammoth = require("mammoth");
const PDFDocument = require("pdfkit");
const Staff = require("../db/staffdb");
const Student = require("../db/studentdb");
const { saveChatMessage } = require("../middleware/chat");
const { isAuthenticated } = require("../middleware/auth");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { studentID, uploaderType } = req.body;
    const uploadTypes = {
      supervisor: `uploads/${studentID}/supervisor/`,
      student: `uploads/${studentID}/student/`,
      student_final: `uploads/${studentID}/final/`
    };
    
    const destinationFolder = uploadTypes[uploaderType] || "uploads/";
    fs.mkdirSync(destinationFolder, { recursive: true });
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Student Dashboard
router.get("/student", isAuthenticated, (req, res) => {
  res.render("studentdashboard", {
    user: req.user,
    socketIOClientScript: "/socket.io/socket.io.js"
  });
});

// Student Project Management
router.get("/student/myproject/:params", isAuthenticated, async (req, res) => {
  const messages = req.flash("info");
  const { user } = req;

  if (!user.topic) {
    return res.render("myProject", {
      user,
      showModal: true,
      showModal1: false,
      messages
    });
  }

  const showModal1 = user.thesisStatus === "Approve For Defense" && !user.final_document?.[0];
  res.render("myProject", {
    user,
    showModal: false,
    showModal1,
    messages
  });
});

router.post("/student/myprojectTopic", isAuthenticated, async (req, res) => {
  const { topic, description } = req.body;
  
  if (!topic || !description) {
    req.flash("info", "Topic and description are required");
    return res.redirect(`/student/myproject/${req.user.ID}`);
  }

  await Student.findOneAndUpdate(
    { ID: req.user.ID },
    { 
      topic, 
      description, 
      thesisStatus: "Pending Approval" 
    }
  );

  req.flash("info", "Thesis Topic Submitted Successfully");
  res.redirect(`/student/myproject/${req.user.ID}`);
});

// File Upload Handling
router.post("/student/upload", upload.single("document"), async (req, res) => {
  try {
    const { studentID } = req.body;
    const uploadedDocument = req.file;

    if (!uploadedDocument) {
      req.flash("info", "No file uploaded");
      return res.redirect(`/student/myproject/${studentID}`);
    }

    const student = await Student.findOne({ ID: studentID });
    if (!student) {
      req.flash("info", "Student not found");
      return res.redirect(`/student/myproject/${studentID}`);
    }

    student.uploads.push({
      sender: "student",
      filename: uploadedDocument.filename,
      timestamp: new Date()
    });

    await student.save();
    req.flash("info", "File uploaded successfully!");
    res.redirect(`/student/myproject/${studentID}`);
  } catch (error) {
    console.error("Upload error:", error);
    req.flash("info", "Error uploading file");
    res.redirect(`/student/myproject/${req.body.studentID}`);
  }
});

// Messaging System
router.get("/student/message", isAuthenticated, async (req, res) => {
  const supervisor = await Staff.findOne({ ID: req.user.supervisorID });
  if (!supervisor) {
    req.flash("info", "Supervisor not found");
    return res.redirect("/student");
  }

  const room = `supervisor_${supervisor.ID}_student_${req.user.ID}`;
  const student = await Student.findOne({ ID: req.user.ID });

  res.render("studentMessage", {
    user: req.user,
    supervisor,
    room,
    socketIOClientScript: "/socket.io/socket.io.js",
    studentId: req.user.ID,
    chats: student?.chats || []
  });
});

router.post("/student/message", isAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;
    const { supervisorID, ID: studentId } = req.user;
    const room = `supervisor_${supervisorID}_student_${studentId}`;

    req.io.to(room).emit("chat message", { sender: "student", message });
    await saveChatMessage("student", message, studentId);

    res.redirect("/student/message");
  } catch (error) {
    console.error("Message error:", error);
    req.flash("info", "Error sending message");
    res.redirect("/student/message");
  }
});

// File Download
router.get("/student/:studentID/student/:fileName", (req, res) => {
  const { studentID, fileName } = req.params;
  const filePath = path.join(__dirname, "..", "uploads", studentID, "supervisor", fileName);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

// Plagiarism Check
router.get("/plagiarism", isAuthenticated, (req, res) => {
  res.render("plagiarism", {
    user: req.user,
    messages: req.flash("info"),
    originalname: "",
    score: "",
    pdfFilePath: ""
  });
});

router.post("/plagiarism", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      req.flash("info", "No file uploaded");
      return res.redirect("/plagiarism");
    }

    const { originalname, path: filePath } = req.file;
    const outputFileName = originalname.replace(".docx", ".pdf");
    const outputPath = `./uploads/${outputFileName}`;

    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value.trim();
    const score = "10%"; // Replace with actual plagiarism check logic

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPath));
    doc.fontSize(12).text(text).text(`Score is ${score}`);
    doc.end();

    res.set({
      "Content-Disposition": `attachment; filename="${outputFileName}"`,
      "Content-Type": "application/pdf"
    });

    fs.createReadStream(outputPath)
      .pipe(res)
      .on("finish", () => {
        [filePath, outputPath].forEach(path => {
          if (fs.existsSync(path)) fs.unlinkSync(path);
        });
      });
  } catch (error) {
    console.error("Plagiarism check error:", error);
    req.flash("info", "Error processing document");
    res.redirect("/plagiarism");
  }
});

// Thesis Final Document Submission
router.post(
  "/thesis/finalDocument",
  isAuthenticated,
  upload.single("document"),
  async (req, res) => {
    try {
      const { topic, abstract } = req.body;
      const { ID: studentID } = req.user;
      const uploadedDocument = req.file;

      if (!uploadedDocument || !topic || !abstract) {
        req.flash("info", "All fields and document are required");
        return res.redirect(`/student/myproject/${studentID}`);
      }

      const student = await Student.findOne({ ID: studentID });
      if (!student) {
        req.flash("info", "Student not found");
        return res.redirect(`/student/myproject/${studentID}`);
      }

      student.final_document.push({
        sender: "student",
        topic,
        abstract,
        filename: uploadedDocument.filename,
        timestamp: new Date()
      });

      await student.save();
      req.flash("info", "Final document submitted successfully");
      res.redirect(`/student/myproject/${studentID}`);
    } catch (error) {
      console.error("Final document error:", error);
      req.flash("info", "Error submitting final document");
      res.redirect(`/student/myproject/${req.user.ID}`);
    }
  }
);

// Published Thesis View
router.get("/student/thesis", isAuthenticated, async (req, res) => {
  try {
    const publishedTheses = await Student.find({ thesisStatus: "Published" });
    res.render("studentThesis", {
      user: req.user,
      findallstudentswithpublish: publishedTheses
    });
  } catch (error) {
    console.error("Thesis view error:", error);
    req.flash("info", "Error loading published theses");
    res.redirect("/student");
  }
});

module.exports = router;