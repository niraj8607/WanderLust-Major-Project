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
const multer = require("multer");

// =================================================
// MODELS & UTILS
// =================================================
const User = require("./models/user.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require('./utils/ExpressError.js');

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
// ## FIX 1: Make the 'uploads' folder public so images can be served
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
const upload = multer({ dest: 'uploads/' }); 

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
// GLOBAL MIDDLEWARE & UTILS
// =================================================
const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

const isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// =================================================
// ALL ROUTES ARE DEFINED HERE
// =================================================

// --- Listing Routes ---
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

app.get("/listings/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// ## FIX 2: Correct the image URL path when creating a listing
app.post("/listings", isLoggedIn, upload.single("listing[image]"), wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (req.file) {
        let url = "/uploads/" + req.file.filename;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

app.get("/listings/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
     if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

// ## FIX 3: Correct the image URL path when updating a listing
app.put("/listings/:id", isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(req.file){
        let url = "/uploads/" + req.file.filename;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


// --- Review Routes ---
app.post("/listings/:id/reviews", isLoggedIn, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}));

app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));


// --- User Routes ---
app.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

app.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

app.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

app.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});

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
