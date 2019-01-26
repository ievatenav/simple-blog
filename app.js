const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");



// APP CONFIG
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(expressSanitizer());
app.set("view engine", "ejs");
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);



// MONGOOSE/MODEL CONFIG
let blogSchema = new mongoose.Schema({
    title: String,
    img: String,
    body: String,
    created: {type: Date, default: Date.now}
});

let Blog = mongoose.model("Blog", blogSchema);



// RESTFUL ROUTES

// ROOT - redirect to blog page
app.get("/", function(reg, res){
    res.redirect("/blogs");
});

// INDEX - show all blog posts
app.get("/blogs", function(req, res){
    // find all blog posts in DB
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("An error occured: " + err);
        } else {
            // render all blog posts in index page
            res.render("index", {blogs: blogs});
        };
    });
});

// NEW - show form to create new blog post
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE - add a new blog post
app.post("/blogs", function(req, res){
    // sanitize blog post text area
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // create new blog post
    Blog.create(req.body.blog, function(err, newPost){
        if(err){
            console.log("An error occured: " + err);
        } else {
            // redirect to index page
            res.redirect("/blogs");
        };
    });
});

// SHOW - shows more info about one blog post
app.get("/blogs/:id", function(req, res){
    // find blog post with provided id
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log("An error occured: " + err);
        } else {
            // render show page with chosen blog post
            res.render("show", {blog: foundBlog});
        };
    });
});

// EDIT - edit the existing blog post
app.get("/blogs/:id/edit", function(req, res){
    // find blog post with provided id
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log("An error occured: " + err);
        } else {
            // render edit template with the chosen blog post
            res.render("edit", {blog: foundBlog});
        };
    });
});

// UPDATE - updating the existing blog post
app.put("/blogs/:id", function(req, res){
    // sanitize blog post text area
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // update blog post with provided id
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            console.log("An error occured: " + err);
        } else {
            // redirect to show page
            res.redirect("/blogs/" + req.params.id);  
        };
    })
});

// DELETE - delete a blog post
app.delete("/blogs/:id", function(req, res){
    //delete blog post
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log("An error occured: " + err);
        } else {
            // redirect to blogs page
            res.redirect("/blogs");
        }
    });
});



// RUNNING SERVER
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Blog App Server is running on port: " + process.env.PORT); 
});