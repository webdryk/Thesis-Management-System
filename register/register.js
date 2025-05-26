const mongoose=require('mongoose')
const bcrypt= require('bcrypt')
const router= require('express').Router()
const staff= require('../db/staffdb')
const student= require('../db/studentdb')
const flash = require('connect-flash');

router.use(flash());

router.get('/staffregister',(req,res)=>{
  const messages = req.flash('info');
  res.render('staffRegister', { messages: messages });
});
 
router.get('/studentregister',(req,res)=>{
  const messages = req.flash('info');
  res.render('studentRegister', { messages: messages });
});

//staff registration

router.post('/staffregister',async(req,res)=>{
  const {fName, lName, ID, email,faculty, department, role,cPassword}=req.body
  const user= await staff.findOne({ID})
  if(user){
    req.flash('info', 'User already exists');
    res.redirect('/staffregister');
  }
  if(!user){
    await bcrypt.hash(cPassword,10,(err,password)=>{
      if(password){
        staff.create({fName,lName,ID,email,faculty,department,role,password})
        req.flash('info', 'User created');
        res.redirect('/login');
      }
    })
  }
  
});

//student registration
router.post('/studentregister',async(req,res)=>{
  const {fName, lName, ID, email, department, faculty,cPassword}=req.body
  console.log(req.body)
  const role='student'
  const user= await student.findOne({ID})
  
  if(user){
    req.flash('info', 'User already exists');
    res.redirect('/studentregister');
  }
  if(!user){

    await bcrypt.hash(cPassword,10,(err,password)=>{
      if(password){
        student.create({fName,lName,ID,email,department,faculty,role,password, supervisor:'Not Assigned'})
        req.flash('info', 'User created');
        res.redirect('/login');
      }
    })
  }
  
});

module.exports = router;