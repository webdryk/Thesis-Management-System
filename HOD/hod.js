const router= require('express').Router()
const Staff = require('../db/staffdb')
const Student = require('../db/studentdb')
const fs= require('fs')
const path = require("path");


router.get('/HOD', async(req, res) => {
    if (req.user && req.user.role === 'HOD') {
      
        res.render('HODDashboard', { user: req.user });
    } else {
        res.redirect('/login');
    }
});


const checkHOD = (req, res, next) => {
    if (req.user && req.user.role === 'HOD') {
        return next();
    }
    res.redirect('/login');
};

// Get all data for HOD approval dashboard
router.get('/HOD/HODapproval', checkHOD, async (req, res) => {
    try {
        const department = req.user.department;
        
        // Fetch all data in parallel for better performance
        const [
            pendingStudents,
            supervisors,
            panelists,
            approvedStudents,
            studentsToAssign
        ] = await Promise.all([
            Student.find({ 
                department,
                thesisStatus: 'Pending Approval of Topic'
            }),
            Staff.find({ 
                role: 'supervisor', 
                department 
            }),
            Staff.find({ department }),
            Student.find({ 
                department, 
                thesisStatus: 'Approved'
            }),
            Student.find({ 
                department, 
                thesisStatus: 'Approved',
                supervisor: 'Not Assigned'
            })
        ]);

        res.render('HODapproval', {
            user: req.user,
            listOfStudent: pendingStudents,
            listOfSupervisor: supervisors,
            listOfPanelist: panelists,
            listOfStudentApproved: approvedStudents,
            listOfStudentToAssign: studentsToAssign
        });
    } catch (error) {
        console.error('Error fetching HOD approval data:', error);
        res.status(500).send('Internal Server Error');
    }
});

//revoke student thesis
router.post('/HOD/HODapproval/revoke', checkHOD, async (req, res) => {
    try {
        const { studentID } = req.body;
        
        await Student.findOneAndUpdate(
            { ID: studentID },{supervisor: 'Not Assigned'});
            res.redirect('/HOD/HODapproval');
    } catch (error) {
        console.error('Error revoking student supervisor:', error);
    res.status(500).send('Internal Server Error');
    res.redirect('/HOD/HODapproval');
    }
});
        

// Approve student thesis
router.post('/HOD/HODapproval/approve', checkHOD, async (req, res) => {
    try {
        const { studentID } = req.body;
        
        await Student.findOneAndUpdate(
            { ID: studentID },
            { thesisStatus: 'Approved' },
            { new: true }
        );
        
        res.redirect('/HOD/HODapproval');
    } catch (error) {
        console.error('Error approving student:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Reject student thesis
router.post('/HOD/HODapproval/reject', checkHOD, async (req, res) => {
    try {
        const { studentID } = req.body;
        
        await Student.findOneAndUpdate(
            { ID: studentID },
            { thesisStatus: 'Rejected' },
            { new: true }
        );
        
        res.redirect('/HOD/HODapproval');
    } catch (error) {
        console.error('Error rejecting student:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Activate panelist
router.post('/HOD/HODapproval/activate', checkHOD, async (req, res) => {
    try {
        const { staffID } = req.body;
        
        await Staff.findOneAndUpdate(
            { ID: staffID },
            { panelist: 'activated' },
            { new: true }
        );
        
        res.redirect('/HOD/HODapproval');
    } catch (error) {
        console.error('Error activating panelist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Deactivate panelist
router.post('/HOD/HODapproval/deactivate', checkHOD, async (req, res) => {
    try {
        const { staffID } = req.body;
        
        await Staff.findOneAndUpdate(
            { ID: staffID },
            { panelist: 'deactivated' },
            { new: true }
        );
        
        res.redirect('/HOD/HODapproval');
    } catch (error) {
        console.error('Error deactivating panelist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Assign student to supervisor
router.post('/HOD/HODapproval/assign', checkHOD, async (req, res) => {
    try {
        const { studentID, supervisorAssigned } = req.body;
        
        const supervisor = await Staff.findOne({ ID: supervisorAssigned });
        if (!supervisor) {
            return res.status(404).send('Supervisor not found');
        }
        
        await Student.findOneAndUpdate(
            { ID: studentID },
            { 
                supervisor: `${supervisor.fName} ${supervisor.lName}`,
                supervisorID: supervisor.ID
            },
            { new: true }
        );
        
        res.redirect('/HOD/HODapproval');
    } catch (error) {
        console.error('Error assigning student:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/HOD/students', async(req, res) => {
    if (req.user && req.user.role === 'HOD') {

        let listOfStudent= await Student.find({department:req.user.department})
      const   totalNumberOfStudentt= listOfStudent.length

        res.render('HODStudents', { user: req.user , listOfStudent , totalNumberOfStudentt});
    }
    else {
        res.redirect('/login');
    }
})

router.post('/HOD/students/publish', async(req, res) => {
    if(req.user && req.user.role === 'HOD') {
        
        const studentID= req.body.studentID
        const status= req.body.status

        if (status==='publish'){
            await Student.findOneAndUpdate({ID:studentID},{thesisStatus:'Published'})
            res.redirect('/HOD/students')
        }else if(status==='reject'){
            await Student.findOneAndUpdate({ID:studentID},{thesisStatus:'unpublished'})
            res.redirect('/HOD/students')
        }

        
    }
    else {
        res.redirect('/login');
    }
})

router.post('/HOD/panelistActivation', async(req, res) => {
    if (req.user && req.user.role === 'HOD') {


        

        res.redirect('/HOD/HODapproval');
    }
    else {
        res.redirect('/login');
    }
})

router.get("/HOD/thesis", async (req, res) => {
    if (req.user && req.user.role === 'HOD') {

        const findallstudentswithpublish=await Student.find({thesisStatus:'Published'})
        res.render("HODThesispublish", {
          user: req.user,
          findallstudentswithpublish,
        });

    } else {
        res.redirect('/login');
    }
});

router.post('/hod/publish/download',async (req,res)=>{
    
       const  studentID= req.body.studentID
    const Name= await Student.findOne({ID:studentID})

    if(Name){
    const filename= Name.final_document[0].filename;
    console.log(filename)

    const filePath = path.join(__dirname, '..', 'uploads', studentID, 'final', filename)

  // Check if the file exists
    if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
    
    } else {
    res.status(404).send('File not found');
    }
    
    }
})


router.get('/HOD/report',async(req,res)=>{

  if (req.user && req.user.role === "HOD") {
    let listOfStudent = await Student.find({ department: req.user.department });
    const totalNumberOfStudentt = listOfStudent.length;

    res.render("hodreport", {
      user: req.user,
      listOfStudent,
      totalNumberOfStudentt,
    });
  } else {
    res.redirect("/login");
  }
})

module.exports=router