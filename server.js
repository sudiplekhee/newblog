const express = require("express")
const app = express()
const { db } = require("./database/db")
const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
app.use(cookieParser())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const isLogInOrNot = require("./middleware/isLogInOrNot")
const { where } = require("sequelize")

app.set("view engine", "ejs")
//home page 
app.get("/", (req, res) => {
    res.render("page/home")
})

//register page
app.get("/register", (req, res) => {
    res.render("authentication/register")
})

//register page recieve data
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body
    const user = await db.users.create({
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 10)
    })
    res.render("authentication/login")
})

//login page 
app.get("/login", (req, res) => {
    res.render("authentication/login")
})

//login page receive 
app.post("/login", async (req, res) => {
    const { email, password } = req.body
    const user = await db.users.findAll({
        where: {
            email: email
        }
    })
    if (user.length == 0) {
        res.send("Email is not registered")
    } else {
        const isPasswordMatch = bcrypt.compareSync(password, user[0].password)
        if (isPasswordMatch) {
            const token = JWT.sign({ id: user[0].id }, "secretekey", { expiresIn: "1d" })
            res.cookie("token", token)
            res.redirect("/")
        } else {
            res.send("Invalid credentials")
        }
    }
    res.redirect("/")
})

//addBlog page
app.get("/addBlog", isLogInOrNot, (req, res) => {
    res.render("page/addBlog")
})
//addBlog page recieve data
app.post("/addBlog", isLogInOrNot, async (req, res) => {
    const userId = req.userId
    const { title, subtitle, description } = req.body
    const blog = await db.blogs.create({
        title: title,
        subtitle: subtitle,
        description: description,
        userId: userId
    })
    res.redirect("/")
})

//editBlog page
app.get("/editBlog/:id", isLogInOrNot, async (req, res) => {
    const id = req.params.id
    const BLOG = await db.blogs.findAll({
        where: {
            id: id
        }
    })
    res.render("page/editBlog", { BLOG: BLOG })
})
//editBlog page recieve data
app.post("/editBlog/:id", isLogInOrNot, async (req, res) => {
    const id = req.params.id
    const { title, subtitle, description } = req.body
    const blog = await db.blogs.update({
        title: title,
        subtitle: subtitle,
        description: description,
    }, {
        where: {
            id: id
        }
    })
    res.redirect("/")
})

//deleteBlog page
app.post("/deleteBlog/:id", isLogInOrNot, async (req, res) => {
    const id = req.params.id
    await db.blogs.destroy({
        where: {
            id: id
        }
    })
    res.redirect("/")
})

//Blog page
app.get("/Blog", isLogInOrNot, async (req, res) => {
    const userId = req.userId
    const BLOG = await db.blogs.findAll({
        where: {
            userId: userId
        }
    })
    res.render("page/Blog", { BLOG: BLOG })
})
// Single blog page
app.get("/blog/:id", isLogInOrNot, async (req, res) => {
    const blogId = req.params.id;
    const blog = await db.blogs.findOne({
        where: {
            id: blogId
        }
    })
    res.render("page/singleBlog", { blog });
});



app.listen(4444, () => {
    console.log("Server is running on http://localhost:4444")
})
