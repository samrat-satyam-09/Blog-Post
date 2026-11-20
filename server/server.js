import dotenv, { populate } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
dotenv.config();
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import aws from 'aws-sdk';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";


// Schemas below
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js';


// Regex for email, and password validation.
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;


const server = express();
let PORT = process.env.PORT || 3000;

server.set("trust proxy", 1);

// Robust CORS Middleware
server.use((req, res, next) => {
   const origin = req.headers.origin;
   if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
   } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
   }
   res.setHeader("Access-Control-Allow-Credentials", "true");
   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
   res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

   if (req.method === "OPTIONS") {
      return res.status(200).end();
   }
   next();
});

server.use(express.json());

// Health check / root route (does not block on DB)
server.get("/", (req, res) => {
   return res.status(200).json({
      status: "success",
      message: "Thinkpress Server is running!",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
   });
});

// Database Connection & Serverless Setup
let isDbConnected = false;
const connectDB = async () => {
   if (isDbConnected || mongoose.connection.readyState === 1) {
      return;
   }
   if (!process.env.DATABASE) {
      console.error("DATABASE connection string is missing in environment variables!");
      return;
   }
   try {
      const dbUri = process.env.DATABASE.replace(/^['"]|['"]$/g, '');
      await mongoose.connect(dbUri, {
         serverSelectionTimeoutMS: 5000,
      });
      isDbConnected = true;
      console.log("DB Connected Successfully");
   } catch (error) {
      console.log("DB Connection Failed:", error);
   }
};

// Auto-connect middleware for serverless/cold starts
server.use(async (req, res, next) => {
   if (req.path === "/" || req.method === "OPTIONS") {
      return next();
   }
   await connectDB();
   if (mongoose.connection.readyState !== 1) {
      console.error("Database not connected. ReadyState:", mongoose.connection.readyState);
      return res.status(500).json({
         status: "error",
         message: "Database connection failed. Please ensure MongoDB Atlas Network Access allows 0.0.0.0/0 and DATABASE environment variable is set in Vercel."
      });
   }
   next();
});

if (!process.env.VERCEL) {
   connectDB().then(() => {
      server.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
      });
   });
}



// Setting up the Amazon S3 service...
const s3 = new aws.S3({
   region: 'ap-south-1',
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const genrateUploadURL = async () => {

   const date = new Date();
   const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

   return await s3.getSignedUrlPromise('putObject', {
      Bucket: 'blog-post0',
      Key: imageName,
      Expires: 2000, // 3 days expiration
      ContentType: 'image/jpeg'
   })

}


const verifyJWT = (req, res, next) => {

   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(" ")[1];

   if (token == null) {
      return res.status(401).json({ message: "No access token found." });
   }
   jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
      if (err) {
         return res.status(403).json({ message: "Invalid access token." });
      }
      req.user = user.id;
      next();
   })
};

// Function to validate and format the user data before saving it to the database.
const formatDatatoSend = (user) => {

   const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)

   return {
      access_token,
      profile_img: user.personal_info.profile_img,
      username: user.personal_info.username,
      fullname: user.personal_info.fullname
   }
}


// Function to generate a unique username from the email.
const genrateUsername = async (email) => {
   let username = email.split("@")[0];
   if (username.length < 3) {
      username = username + nanoid().substring(0, 3);
   }

   let isUsernameNotUnique = await User.exists({ "personal_info.username": username });
   if (isUsernameNotUnique) {
      username += nanoid().substring(0, 4);
   }

   return username;
}

server.use(passport.initialize());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
   passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
   },
      async (accessToken, refreshToken, profile, done) => {
         try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            if (!email) {
               return done(new Error("No email found from Google account."), null);
            }

            const name = profile.displayName || email.split("@")[0] || "User";
            const picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : undefined;

            let user = await User.findOne({ "personal_info.email": email });

            if (user) {
               return done(null, user);
            } else {
               let fullname = name;
               if (fullname.length < 3) {
                  fullname = `${fullname} User`;
               }

               const username = await genrateUsername(email);

               user = await new User({
                  personal_info: {
                     fullname,
                     email,
                     profile_img: picture,
                     username
                  },
                  google_auth: true
               }).save();

               return done(null, user);
            }
         } catch (error) {
            console.error("Google strategy error:", error);
            return done(error, null);
         }
      }
   ));
} else {
   console.warn("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google OAuth strategy skipped.");
}

// Google OAuth Login Route
server.get("/auth/google", (req, res, next) => {
   if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Google OAuth credentials are not configured on server." });
   }

   const clientOrigin = req.query.from || req.headers.referer || process.env.ORIGIN_URL || "http://localhost:5173";
   let sanitizedOrigin = process.env.ORIGIN_URL || "http://localhost:5173";
   try {
      sanitizedOrigin = new URL(clientOrigin).origin;
   } catch (e) {
      // fallback
   }

   passport.authenticate("google", {
      scope: ["profile", "email"],
      state: sanitizedOrigin,
      prompt: "select_account"
   })(req, res, next);
});

// Google OAuth Callback Route
server.get("/auth/google/callback", (req, res, next) => {
   let targetOrigin = process.env.ORIGIN_URL || "http://localhost:5173";
   if (req.query.state) {
      try {
         targetOrigin = new URL(decodeURIComponent(req.query.state)).origin;
      } catch (e) {
         console.error("Invalid state origin:", e);
      }
   }

   if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${targetOrigin}/sign-in?error=Google%20OAuth%20not%20configured%20on%20server`);
   }

   if (req.query.error) {
      const errorMsg = req.query.error === "access_denied" ? "Google sign-in was cancelled" : req.query.error;
      return res.redirect(`${targetOrigin}/sign-in?error=${encodeURIComponent(errorMsg)}`);
   }

   passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err || !user) {
         const errorMessage = info?.message || err?.message || "Google authentication failed. Please try again.";
         return res.redirect(`${targetOrigin}/sign-in?error=${encodeURIComponent(errorMessage)}`);
      }

      const userData = formatDatatoSend(user);
      const encodedData = encodeURIComponent(JSON.stringify(userData));

      return res.redirect(`${targetOrigin}/auth-success?data=${encodedData}`);
   })(req, res, next);
});

// Get current user route (fallback for token authentication)
server.get("/get-current-user", verifyJWT, async (req, res) => {
   try {
      const user = await User.findById(req.user);
      if (!user) {
         return res.status(404).json({ message: "User not found." });
      }
      return res.status(200).json(formatDatatoSend(user));
   } catch (err) {
      return res.status(500).json({ message: err.message });
   }
});




// Upload image url route...
server.get('/get-upload-url', (req, res) => {
   genrateUploadURL().then(url => res.status(200).json({ uploadURL: url }))
      .catch(err => {
         console.log(err);
         return res.status(500).json({ "message": "Error while generating upload URL." });
      });
})



// Validate and Create a new user and save it to the database.
// TODO: SignUp...
server.post("/signup", (req, res) => {

   const { fullname, email, password } = req.body;

   if (fullname.length < 3) {
      return res.status(403).json({ "message": "Fullname must be at least 3 characters long." });
   }
   if (!email.length) {
      return res.status(403).json({ "message": "Enter your email" });
   }
   if (!emailRegex.test(email)) {
      return res.status(403).json({ "message": "Enter a valid email" });
   }
   if (!passwordRegex.test(password)) {
      return res.status(403).json({ "message": "Password must be at least 6 characters long, contain at least 1 uppercase, 1 lowercase, and 1 number." });
   }
   // Hash the password before saving it to the database.
   bcrypt.hash(password, 12, async (err, hashPassword) => {
      let username = await genrateUsername(email);
      const user = new User({
         personal_info: { fullname, email, password: hashPassword, username }
      })

      user.save().then((u) => {
         return res.status(201).json(formatDatatoSend(u));
      })
         .catch(err => {

            // Check if the email already exists in the database.
            if (err.code === 11000) {
               return res.status(409).json({ "message": "This email is Already exists." });
            }
            res.status(500).json({ "message": err.message });
         })
   });
});


// TODO: Sign In...
server.post("/signin", (req, res) => {

   const { email, password } = req.body;

   User.findOne({ "personal_info.email": email })
      .then(user => {
         if (!user) {
            return res.status(404).json({ "message": "User not found." });
         }

         if (user.personal_info.password) {
            bcrypt.compare(password, user.personal_info.password, (err, result) => {

               if (err) {
                  return res.status(403).json({ "message": "Error occured while login please try again." });
               }

               if (!result) {
                  return res.status(401).json({ "message": "Invalid credentials." });
               }
               else {
                  return res.status(200).json(formatDatatoSend(user));
               }
            });
         }
         else {
            return res.status(403).json({ "message": "This account was registered using Google. Please log in with Google." });
         }

      })
      .catch(err => {
         console.log(err.message);
         return res.status(500).json({ "message": err.message });
      });
})


// Change Password API callback.

server.post('/change-password', verifyJWT, (req, res) => {
   let { currentPassword, newPassword } = req.body;

   if (!currentPassword.length || !newPassword.length) {
      return res.status(403).json({ error: 'All fields are required' })
   }
   if (currentPassword === newPassword) {
      return res.status(403).json({ error: 'New password should not be same as current password' })
   }

   // Validate password strength here.
   if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
      return res.status(403).json({ error: 'Password must be at least 6 characters long, contain at least 1 uppercase, 1 lowercase, and 1 number.' })
   }

   User.findOne({ _id: req.user })
      .then((user) => {
         if (user.google_auth) {
            return res.status(403).json({ error: "You can't change account password because you loged-in through google" })
         }

         bcrypt.compare(currentPassword, user.personal_info.password, (err, result) => {
            if (err) {
               return res.status(500).json({ error: "Somthing is wrong while changing the password, Please try again." });
            }
            if (!result) {
               return res.status(401).json({ error: "Incorrect current password" });
            }

            bcrypt.hash(newPassword, 12, (err, hashed_password) => {

               User.findOneAndUpdate({ _id: req.user }, { "personal_info.password": hashed_password })
                  .then((u) => {
                     return res.status(200).json({ message: "Password changed successfully" });
                  })
                  .catch((error) => {
                     return res.status(500).json({ error: "Error occoured while saving New Password, Please try again later." });
                  });
            })
         })
      })
      .catch(err => {
         console.log(err);
         return res.status(500).json({ "message": "Error while fetching user." });
      });
})


// User Profile page api...
server.post("/get-profile", (req, res) => {

   let { username } = req.body;

   User.findOne({ "personal_info.username": username })
      .select("-personal_info.password -google_auth -updatedAt -blogs")
      .then(user => {
         return res.status(200).json(user)
      })
      .catch(err => {
         console.log(err);
         return res.status(500).json({ "message": "Error while fetching user profile." });
      });

});


// TODO: Update User Profile Image...

server.post("/update-profile-img", verifyJWT, (req, res) => {

   let { url } = req.body;

   User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
      .then(() => {
         return res.status(200).json({ profile_img: url });
      })
      .catch(error => {
         return res.status(500).json({ error: error.message });
      });
})

// TODO: Update User Profile...

server.post("/update-profile", verifyJWT, (req, res) => {

   let { username, bio, social_links } = req.body;

   let bioLimit = 200;

   if (username.length < 3) {
      return res.status(403).json({ "message": "Username must be at least 3 characters long" });
   }

   if (bio.length > bioLimit) {
      return res.status(403).json({ error: `Bio should not exceed ${bioLimit} characters` })
   }

   let socialLinksArr = Object.keys(social_links);

   try {
      for (let i = 0; i < socialLinksArr.length; i++) {
         if (social_links[socialLinksArr[i]].length) {
            let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

            if (!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != 'website') {
               return res.status(403).json({ error: `${socialLinksArr[i]} link is invalid. you must specify the full URL!` })
            }

         }
      }
   }
   catch (error) {
      return res.status(500).json({ error: "You must provide full social links with https:// included" });
   }

   let UpdateObj = {
      "personal_info.username": username,
      "personal_info.bio": bio,
      social_links
   }

   User.findOneAndUpdate({ _id: req.user }, UpdateObj, {
      runValidators: true
   })
      .then(() => {
         return res.status(200).json({ username });
      })
      .catch(error => {
         if (error.code == 11000) {
            return res.status(409).json({ message: "Username already taken." });
         }
      });

})

// create-blog route api...
server.post('/create-blog', verifyJWT, (req, res) => {

   let autherId = req.user;
   let { title, desc, banner, tags, content, draft, id } = req.body;

   if (!title.length) {
      return res.status(403).json({ "message": "You must provide a title" });
   }

   if (!draft) {
      if (!desc.length) {
         return res.status(403).json({ "message": "You must provide a description to publish this blog" });
      }
      if (desc.length > 250) {
         return res.status(403).json({ "message": "Description should not exceed 250 characters" });
      }
      if (!banner.length) {
         return res.status(403).json({ "message": "You must provide a banner image to publish this blog" });
      }
      if (!tags.length) {
         return res.status(403).json({ "message": "You must provide at least 1 tag to publish this blog" });

      }
      if (tags.length > 10) {
         return res.status(403).json({ "message": "Maximum number of tags reached!" });
      }
      if (!content.blocks.length) {
         return res.status(403).json({ "message": "You must provide a content to publish this blog" });
      }
   }

   tags = tags.map(tag => tag.toLowerCase());

   let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid();

   if (id) {

      Blog.findOneAndUpdate({ blog_id }, { title, desc, banner, content, tags, draft: draft ? draft : false })
         .then(() => {
            return res.status(200).json({ id: blog_id });
         })
         .catch(error => {
            return res.status(500).json({ error: "Failed to update blog, Please try again later." });
         });

   }
   else {
      let blog = new Blog({
         title,
         desc,
         banner,
         tags,
         content,
         author: autherId, blog_id, draft: Boolean(draft)
      })

      blog.save().then(blog => {
         let incrementVal = draft ? 0 : 1;

         User.findOneAndUpdate({ _id: autherId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
            .then(user => {
               res.status(200).json({ id: blog.blog_id });
            })
            .catch(error => {
               return res.status(500).json({ "message": "Failed to update total blog post, Please try again later." });
            });
      })
         .catch(error => {
            return res.status(500).json({ "message": "Failed to create blog, Please try again later." });
         });
   }

});

// Latest blog api...
server.post('/latest-blogs', (req, res) => {

   let { page } = req.body;

   let MaxLimit = 10;

   Blog.find({ draft: false })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .sort({ "publishedAt": -1 })
      .select("blog_id title desc banner activity tags publishedAt -_id")
      .skip((page - 1) * MaxLimit)
      .limit(MaxLimit)
      .then(blogs => {
         return res.status(200).json({ blogs });
      })
      .catch(error => {
         return res.status(500).json({ error, "message": "Failed to fetch Latest blog, Please try again later." });
      });

});

// Pagination all latest blog posts count...
server.post("/all-latest-blogs-count", (req, res) => {
   Blog.countDocuments({ draft: false })
      .then(count => {
         res.status(200).json({ totalDocs: count });
      })
      .catch(error => {
         return res.status(500).json({ error, "message": "Failed to fetch blog count, Please try again later." });
      });
})


// Trending blog api...
server.get('/trending-blogs', (req, res) => {

   let MaxLimit = 10;

   Blog.find({ draft: false })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 })
      .select("blog_id title publishedAt -_id")
      .limit(MaxLimit)
      .then(blogs => {
         return res.status(200).json({ blogs });
      })
      .catch(error => {
         return res.status(500).json({ error, "message": "Failed to fetch Trending blog, Please try again later." });
      });
});

// Search blogs api...
server.post("/search-blogs", (req, res) => {

   let { tag, query, author, page, limit, eliminate_blog } = req.body;

   let findQuary;

   if (tag) {
      findQuary = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
   }
   else if (query) {
      findQuary = { draft: false, title: new RegExp(query, 'i') };
   }
   else if (author) {
      findQuary = { author: author, draft: false };
   }

   let maxLimit = limit ? limit : 6;

   Blog.find(findQuary)
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .sort({ "publishedAt": -1 })
      .select("blog_id title desc banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .then(blogs => {
         return res.status(200).json({ blogs });
      })
      .catch(error => {
         return res.status(500).json({ error, "message": "Failed to fetch Latest blog, Please try again later." });
      });
})


// Search by filter the users in search page api...
server.post("/search-users", (req, res) => {
   let { query } = req.body;

   User.find({ "personal_info.username": new RegExp(query, 'i') })
      .limit(50)
      .select("personal_info.username personal_info.fullname personal_info.profile_img -_id")
      .then(users => {
         return res.status(200).json({ users });
      })
      .catch(error => {
         return res.status(500).json({ error, "message": "Failed to fetch users, Please try again later." });
      });

});



// Search blogs count...
server.post("/search-blogs-count", (req, res) => {
   let { tag, author, query } = req.body;

   let findQuary;

   if (tag) {
      findQuary = { tags: tag, draft: false };
   }
   else if (query) {
      findQuary = { draft: false, title: new RegExp(query, 'i') };
   }
   else if (author) {
      findQuary = { author: author, draft: false };
   }

   Blog.countDocuments(findQuary)
      .then(blogs => {
         res.status(200).json({ totalDocs: blogs });
      })
      .catch(error => {
         return res.status(500).json({ error, "message": "Failed to fetch blog count, Please try again later." });
      });
});

// Blog Page Route ...
server.post("/get-blog", (req, res) => {

   let { blog_id, draft, mode } = req.body;

   let incrementVal = mode != 'edit' ? 1 : 0;

   Blog.findOneAndUpdate({ blog_id }, { $inc: { "activity.total_reads": incrementVal } })
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .select("title desc content banner activity publishedAt blog_id tags")
      .then(blog => {

         User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username }, { $inc: { "account_info.total_reads": incrementVal } })
            .catch(err => {
               return res.status(500).json({ err: err.message });
            });

         if (blog.draft && !draft) {
            return res.status(500).json({ "error": "You can't access blogs" });
         }

         return res.status(200).json({ blog });
      })
      .catch(error => {
         return res.status(500).json({ error, "message": "Failed to fetch blog, Please try again later." });
      });

});

// Add Like Intreciations
server.post('/like-blog', verifyJWT, (req, res) => {
   let user_id = req.user;

   let { _id, islikedByUser } = req.body;

   let incrementVal = !islikedByUser ? 1 : -1;

   Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal } })
      .then(blog => {

         if (!islikedByUser) {
            let like = new Notification({
               type: "like",
               blog: _id,
               notification_for: blog.author,
               user: user_id

            })
            like.save().then(notification => {
               return res.status(200).json({ liked_by_user: true })
            })
         }
         else {
            Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
               .then(data => {
                  return res.status(200).json({ liked_by_user: false })
               })
               .catch(err => {
                  return res.status(500).json({ error: err.message });
               });
         }
      })
});

server.post('/isliked-by-user', verifyJWT, (req, res) => {
   let user_id = req.user;
   let { _id } = req.body;

   Notification.exists({ user: user_id, type: "like", blog: _id })
      .then(result => {
         return res.status(200).json({ result })
      })
      .catch(err => {
         return res.status(500).json({ error: err.message });
      });
});


// Add comments intrections
server.post('/add-comments', verifyJWT, (req, res) => {

   let user_id = req.user;
   let { _id, comment, blog_author, replying_to, notification_id } = req.body;

   if (!comment.length) {
      return res.status(400).json({ error: "Comment can't be empty" });
   }
   if (comment.length > 250) {
      return res.status(400).json({ error: "Comment can't be more than 250 characters" });
   }

   // Creating a comment document
   let commentObj = {
      blog_id: _id, blog_author, comment, commented_by: user_id,
   };

   if (replying_to) {
      commentObj.parent = replying_to;
      commentObj.isReply = true;
   }

   new Comment(commentObj).save().then(async commentFile => {
      // Update the blog comment activity

      let { comment, commentedAt, children } = commentFile;

      Blog.findOneAndUpdate({ _id }, { $push: { "comments": commentFile._id }, $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 }, })
         .then(blog => { })

      let notificationObj = {
         type: replying_to ? "reply" : "comment",
         blog: _id,
         notification_for: blog_author,
         user: user_id,
         comment: commentFile._id
      }

      if (replying_to) {
         notificationObj.replied_on_comment = replying_to;

         await Comment.findOneAndUpdate({ _id: replying_to }, { $push: { children: commentFile._id } })

            .then(replyingToCommentDoc => { notificationObj.notification_for = replyingToCommentDoc.commented_by })

         if (notification_id) {
            Notification.findOneAndUpdate({ _id: notification_id }, { reply: commentFile._id })
               .then(notification => { })
         }

      }

      new Notification(notificationObj).save().then(notification => { })
      return res.status(200).json({
         comment, commentedAt,
         _id: commentFile._id,
         user_id, children
      })
   });

})


server.post('/get-blog-comments', (req, res) => {

   let { blog_id, skip } = req.body;

   let maxLimit = 5;

   Comment.find({ blog_id, isReply: false })
      .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
      .skip(skip)
      .limit(maxLimit)
      .sort({
         'commentedAt': -1
      })
      .then(comment => {
         return res.status(200).json(comment);
      })
      .catch(error => {
         console.log(error.message);
         return res.status(500).json({ error: error.message });
      });

})

server.post('/get-replies-to-comment', (req, res) => {

   let { _id, skip } = req.body;
   let maxLimit = 5;

   Comment.findOne({ _id })
      .populate({
         path: "children",
         options: {
            limit: maxLimit,
            skip: skip,
            sort: {
               'commentedAt': -1
            }
         },
         populate: {
            path: "commented_by",
            select: "personal_info.username personal_info.fullname personal_info.profile_img"
         },
         select: "-blog_id -updatedAt"
      })
      .select("children")
      .then(doc => {
         return res.status(200).json({ replies: doc.children });
      })
      .catch(error => {
         return res.status(500).json({ error: error.message });
      });

})

const deleteComments = (_id) => {
   Comment.findOneAndDelete({ _id })
      .then(comment => {
         if (comment.parent) {
            Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } })
               .then(data => { })

               .catch(error => {
                  return res.status(500).json({ error: error.message });
               });
         }
         Notification.findOneAndDelete({ comment: _id }).then(notification => { })

         Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } }).then(notification => { });

         Blog.findOneAndUpdate({ _id: comment.blog_id }, { $pull: { comments: _id }, $inc: { "activity.total_comments": -1 }, "activity.total_parent_comments": comment.parent ? 0 : -1 })
            .then(blog => {
               if (comment.children.length) {
                  comment.children.map(replies => {
                     deleteComments(replies)
                  })
               }
            })

      })
      .catch(error => {
         return res.status(500).json({ error: error.message });
      });
}

server.post('/delete-comment', verifyJWT, (req, res) => {

   let user_id = req.user;
   let { _id } = req.body;

   Comment.findOne({ _id })
      .then(comment => {
         if (user_id == comment.commented_by || user_id == comment.blog_author) {
            deleteComments(_id)
            return res.status(200).json({ status: "deleted" });
         }
         else {
            return res.status(403).json({ error: "You can't delete this comment" });
         }
      })
})

// TODO:Notifications section...
server.get("/new-notification", verifyJWT, (req, res) => {

   let user_id = req.user;

   Notification.exists({ notification_for: user_id, seen: false, user: { $ne: user_id } })
      .then(result => {
         if (result) {
            return res.status(200).json({ new_notification_available: true });
         } else {
            return res.status(200).json({ new_notification_available: false });
         }
      })
      .catch(err => {
         return res.status(500).json({ error: err.message });
      });
})


server.post("/notifications", verifyJWT, (req, res) => {

   let user_id = req.user;

   let { page, filter, deletedDocCount } = req.body;

   let MaxLimit = 12;

   let findQuery = { notification_for: user_id, user: { $ne: user_id } };

   let skipDocs = (page - 1) * MaxLimit;

   if (filter != 'all') {
      findQuery.type = filter;
   }

   if (deletedDocCount) {
      skipDocs -= deletedDocCount;
   }

   Notification.find(findQuery)
      .sort({ createdAt: -1 })

      .skip(skipDocs)

      .limit(MaxLimit)

      .populate("blog", "title blog_id")

      .populate("user", "personal_info.username personal_info.fullname personal_info.profile_img")

      .populate("comment", "comment")

      .populate("replied_on_comment", "comment")

      .populate("reply", "comment")

      .select("createdAt type seen reply")

      .then(notifications => {

         Notification.updateMany(findQuery, { seen: true })

            .skip(skipDocs)

            .limit(MaxLimit)
            .then(() => { })

         return res.status(200).json({ notifications });
      })
      .catch(err => {
         return res.status(500).json({ error: err.message });
      });

});


server.post("/all-notifications-count", verifyJWT, (req, res) => {

   let user_id = req.user;

   let { filter } = req.body;

   let findQuery = { notification_for: user_id, user: { $ne: user_id } };

   if (filter != 'all') {
      findQuery.type = filter;
   }

   Notification.countDocuments(findQuery)
      .then(count => {
         return res.status(200).json({ totalDocs: count });
      })
      .catch(err => {
         return res.status(500).json({ error: err.message });
      });
});



server.post("/user-written-blogs", verifyJWT, (req, res) => {

   let user_id = req.user;

   let { page, draft, query, deletedDocCount } = req.body;

   let MaxLimit = 12;
   let skipDocs = (page - 1) * MaxLimit;

   if (deletedDocCount) {
      skipDocs -= deletedDocCount;
   }

   Blog.find({ author: user_id, draft, title: new RegExp(query, 'i') })
      .sort({ publishedAt: -1 })
      .skip(skipDocs)
      .limit(MaxLimit)
      .select("title banner blog_id publishedAt desc activity draft -_id")
      .then(blogs => {
         return res.status(200).json({ blogs: blogs })
      })
      .catch(err => {
         return res.status(500).json({ error: err.message });
      });

});


server.post("/user-written-blogs-count", verifyJWT, (req, res) => {

   let user_id = req.user;
   let { draft, query } = req.body;

   Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, 'i') })
      .then(count => {
         return res.status(200).json({ totalDocs: count });
      })
      .catch(err => {
         return res.status(500).json({ error: err.message });
      });
});



server.post("/delete-blog", verifyJWT, (req, res) => {

   let user_id = req.user;
   let { blog_id } = req.body;

   Blog.findOneAndDelete({ blog_id })
      .then(blog => {
         Notification.deleteMany({ blog: blog._id }).then(data => { });
         Comment.deleteMany({ blog_id: blog._id }).then(data => { });

         User.findOneAndUpdate({ _id: user_id }, { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } })

            .then(user => {
               return res.status(200).json({ status: "Blog deleted" });
            })
            .catch(err => {
               return res.status(500).json({ error: err.message });
            });

      })
      .catch(err => {
         return res.status(500).json({ error: err.message });
      });
});

export default server;

