
// const express = require("express");
// const ejs = require("ejs");
// const session = require("express-session");
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const bcrypt = require("bcrypt");
// const dotenv = require("dotenv");
// const path = require("path");
// const port = process.env.PORT || 3000;
// const app = express();

// const http = require("http");
// const socketIO = require("socket.io");

// const server = http.createServer(app);
// const io = socketIO(server);
// require("dotenv").config();
// // creating session
// app.use(session({
//   secret: process.env.SESSION_SECRET ,
//   resave: false,
//   saveUninitialized: false,
 
// }));

// // using flash for alerts
// app.use(flash());

// const conn = require("./db/conn");
// const register = require("./register/register");
// const hodRoute = require("./HOD/hod");
// const studentRoute = require("./student/student");
// const supervisorRoute = require("./supervisor/supervisor");
// const Staff = require("./db/staffdb");
// const Student = require("./db/studentdb");
// const { saveChatMessage } = require("./middleware/chat");

// app.set("views", path.join(__dirname, "views"));

// app.set("view engine", "ejs");
// app.use(express.static(__dirname + "/public"));
// app.use(express.urlencoded({ extended: false }));
// app.use(passport.initialize());
// app.use(passport.session());

// async function findUserByID(ID) {
//   let user = await Staff.findOne({ ID });

//   if (!user) {
//     user = await Student.findOne({ ID });
//   }

//   return user;
// }
// //strategy for passport
// passport.use(
//   new LocalStrategy({ usernameField: "ID" }, async (ID, password, done) => {
//     try {
//       const user = await findUserByID(ID);

//       if (!user || !bcrypt.compareSync(password, user.password)) {
//         return done(null, false, {
//           message: "Incorrect username or password.",
//         });
//       }

//       return done(null, user);
//     } catch (error) {
//       return done(error);
//     }
//   })
// );

// // Serialize User
// passport.serializeUser((user, done) => {
//   done(null, user.ID); // Assuming the user object has an 'id' field
// });

// // Deserialize User
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await findUserByID(id);
//     done(null, user);
//   } catch (error) {
//     done(error);
//   }
// });

// app.use("", register);
// app.use("", hodRoute);
// app.use("", studentRoute);
// app.use("", supervisorRoute);

// app.get("/", (req, res) => {
//   res.render("index");
// });


// app.get("/login", (req, res) => {
//   const messages = req.flash("info");
//   res.render("login", { messages: messages });
// });

// app.post("/login", (req, res, next) => {
//   passport.authenticate("local", (err, user, info) => {
//     if (err) {
//       return next(err);
//     }

//     if (!user) {
//       req.flash("info", info.message);
//       return res.redirect("/login");
//     }

//     req.logIn(user, (err) => {
//       if (err) {
//         return next(err);
//       }

//       if (user.role === "student") {
//         return res.redirect("/student");
//       } else if (user.role === "supervisor") {
//         return res.redirect("/supervisor");
//       } else if (user.role === "HOD") {
//         return res.redirect("/HOD");
//       } else {
//         return res.redirect("/");
//       }
//     });
//   })(req, res, next);
// });

// app.get("/logout", (req, res) => {
//   // req.logout();
//   req.session.destroy((err) => {
//     res.redirect("/login");
//   });
// });

// // Socket.io logic
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   // Handle chat messages
//   socket.on("chat message", (message) => {
//     // Save the chat message to  database
  
//     console.log(message);
//     saveChatMessage(message.sender, message.message, message.studentid);

//     // Broadcast the chat message to all connected clients
//     socket.to(message.room).emit("chat message", message);
//   });

//   // Handle room joining
//   socket.on("join room", (data) => {
//     const { room } = data;
//     socket.join(room);
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

// server.listen(port, "0.0.0.0", () => console.log(`server up on ${port}`));
const express = require("express");
const ejs = require("ejs");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

// Load environment variables once at the start
require("dotenv").config();

const port = process.env.PORT || 3000;
const app = express();

// Database and route imports
const conn = require("./db/conn");
const register = require("./register/register");
const hodRoute = require("./HOD/hod");
const studentRoute = require("./student/student");
const supervisorRoute = require("./supervisor/supervisor");
const Staff = require("./db/staffdb");
const Student = require("./db/studentdb");
const { saveChatMessage } = require("./middleware/chat");

// Server setup
const server = http.createServer(app);
const io = socketIO(server);

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};
app.use(session(sessionConfig));

// Flash messages
app.use(flash());

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// User lookup utility function
async function findUserByID(ID) {
  return await Staff.findOne({ ID }) || await Student.findOne({ ID });
}

// Passport configuration
passport.use(
  new LocalStrategy(
    { usernameField: "ID" },
    async (ID, password, done) => {
      try {
        const user = await findUserByID(ID);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: "Incorrect username or password." });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize/Deserialize User
passport.serializeUser((user, done) => done(null, user.ID));
passport.deserializeUser(async (id, done) => {
  try {
    done(null, await findUserByID(id));
  } catch (error) {
    done(error);
  }
});

// Routes
app.use("/", register);
app.use("/", hodRoute);
app.use("/", studentRoute);
app.use("/", supervisorRoute);

app.get("/", (req, res) => res.render("index"));

app.get("/login", (req, res) => 
  res.render("login", { messages: req.flash("info") })
);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("info", info.message);
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      
      const redirects = {
        student: "/student",
        supervisor: "/supervisor",
        HOD: "/HOD"
      };
      
      return res.redirect(redirects[user.role] || "/");
    });
  })(req, res, next);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chat message", async (message) => {
    try {
      await saveChatMessage(message.sender, message.message, message.studentid);
      socket.to(message.room).emit("chat message", message);
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  });

  socket.on("join room", ({ room }) => socket.join(room));
  socket.on("disconnect", () => console.log("User disconnected"));
});

// Start server
server.listen(port, "0.0.0.0", () => 
  console.log(`Server running on port ${port}`)
);