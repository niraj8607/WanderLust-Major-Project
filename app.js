//Environment varibale
if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}


// =================================================
// ALL REQUIRED PACKAGES
// =================================================
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// =================================================
// MODELS & UTILS
// =================================================
const User = require("./models/user.js");
const ExpressError = require('./utils/ExpressError.js');

// =================================================
// ROUTERS
// =================================================
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// =================================================
// APP INITIALIZATION & CONFIG
// =================================================
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =================================================
// DATABASE CONNECTION
// =================================================
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
  await mongoose.connect(MONGO_URL);
}
main().then(() => console.log("Connected to DB")).catch(err => console.log("DB Connection Error:", err));

// =================================================
// SESSION & PASSPORT CONFIG
// =================================================
const sessionOptions = {
  secret: "mySupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =================================================
// GLOBAL MIDDLEWARE
// =================================================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// =================================================
// MOUNTING ROUTERS
// =================================================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// --- Root Route ---
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// =================================================
// ERROR HANDLING (Must be at the end)
// =================================================
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// =================================================
// START THE SERVER
// =================================================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});