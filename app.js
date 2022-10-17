const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv").config();
const passport = require("passport");
const nodemailer = require("nodemailer");
const Code = require('./models/codeSchemas');
const LocalStrategy = require("passport-local").Strategy;
const session = require('express-session');
const flash = require("express-flash");



// template engine
app.set("view engine", "ejs");

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: "nodeX-man-123",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());



    app.listen(3000, () => {
      console.log("Server is running on port 3000 ...");
    });
   
     mongoose.connect(
      process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => {
        console.log("Database Connected ...");
      }
    );

// Routes
app.get("/", checkUserAuth, (req, res) => {
      res.render("home");
});

app.get("/login", (req, res) => {
  res.render("sign_in");
});

app.get("/logout", (req, res) => {
  res.render("log_out");
});

app.get("/number", (req, res) => {
  res.render("numberSigning");
});

app.get("/phone-code", (req, res) => {
  res.render("num_code");
});

app.get("/email-code", (req, res) => {
  res.render("email_code");
});










app.post("/login", (req, res) => {
    const transporter = nodemailer.createTransport({
     service: 'gmail',
      auth: {
       user: '', // sender-email
        pass: '', // generated pass 
     },
  });
   mailOptions = {
      from: '', // sender-email,
        to: req.body.email,
          subject: 'Login Code',
            text:  Math.floor ( Math.random () * (999999 - 100000) + 100000 ).toString()
       };
    const emailDoc = new Code({
            email: mailOptions.to,
            code: mailOptions.text,
        });
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
           } else {
              emailDoc.save().then( result => { res.redirect ('/email-code') })
                .catch(error => { console.log (error) })
                   console.log('email sent :' + info.response)         
             }
          }); 
      });        
    


      const passportConfig = () => {
             passport.use(
               new LocalStrategy({ usernameField: 'code', passwordField: 'code' }, async (code, password, done) => {

                  const user = await Code.findOne({ code: code });
		       
                     if (!user || code !== user.code)  return done(null, false, { message: "incorrect code . please, check your code or resend it" });

                          return done(null, user);

                       }
                    ));

           passport.serializeUser((user, done) => done(null, user.id));
           passport.deserializeUser((id, done) => done(null, Code.findById({_id: id})));

        };

       passportConfig();

       

    app.post('/email-code', passport.authenticate('local', {
                failureFlash: true,             
                  failureRedirect: '/email-code',
                      }),
                             (req, res) => {
	                        Code.findOneAndRemove({
                                 code: req.body.code 
                                  }).then( () => {
                                   console.log("code removed from db, don't use it again ..");
                                   res.redirect('/');
                              });
                           });
                                    
                  
    
    
 
   



// logOut  
app.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Show Login Page When User Get to Home Page 
function checkUserAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
}

