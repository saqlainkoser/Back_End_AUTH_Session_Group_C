const express = require("express");
const session = require("express-session")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

const app = express();

app.use(bodyParser.urlencoded({extended:true}))

const JWT_SECRET = "supersecret"
const JWT_EXPIRES = "2h" 

app.use(cookieParser())

function generateJwtToken(user){
 return jwt.sign(
    {id:user.id,name:user.name,email:user.email},
    JWT_SECRET,
    {expiresIn:JWT_EXPIRES}
)
}

function getDataFromToken(req,res,next) {
    if(req.cookies.token){
    const token = req.cookies.token
    const data = jwt.verify(token,JWT_SECRET)
    console.log(data);
    res.locals.user = data //global variable
    }
    next()
}

app.use(getDataFromToken)


//session config
// app.use(
//     session({
//         name:"sid",
//         resave:false,
//         saveUninitialized :false,
//         secret: "secret",
//         //config the cookie
//         rolling:false, //imp
//         cookie:{
//         //    maxAge: 1000 * 10 ,
//            expires : new Date(Date.now() + 1000 * 50) //50 sec 
//         //    sameSite: true,
//         //    secure : false,
//         //    httpOnly : true 
//         }
//     })
// )


//DB
const users = [
    {"id":1 ,"name":"shaan","email":"s@gmail.com","password":"secret"},
    {"id":2 ,"name":"neeraj","email":"n@gmail.com","password":"secret"},
    {"id":3 ,"name":"umair","email":"u@gmail.com","password":"secret"}
] 

//middlewares
//redirectLogin -  
//redirectHome - 

const redirectLogin = (req,res,next) =>{
    if(!res.locals.user){
        res.redirect('/login')
    }
    else{
        next()
    }
}

const redirectHome = (req,res,next)=>{
    if(res.locals.user){
        res.redirect("/home")
    }
    else{
        next()
    }
}
 

app.get("/",(req,res)=>{
    // const userId = 0
    const {user} = res.locals
    const id = user ? user.id : 0
    res.send(`
    <h1>Welcome!</h1>
    ${id ? `
        <a href="home">Home</a>
    <form action="/logout" method="POST">
        <button>Logout</button>
    <form>
        ` : `
       <a href="login">Login</a>
        <a href="register">Register</a> 
        ` }
    `)
})

app.get("/home",redirectLogin,(req,res)=>{
    const {user} = res.locals
    const myUser = users.find(el => el.id == user.id)
    // console.log(user);
res.send(`
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
        <li>Name:${myUser.name}</li>
        <li>Email:${myUser.email}</li>
    </ul>
    `)
})

app.get("/login",redirectHome,(req,res)=>{
res.send(`
    <h1>LOGIN</h1>
    <form action="/login" method="POST">
        <input type="email" name="email" placeholder="EMAIL" required />
        <input type="password" name="password" placeholder="PASSWORD" required />
        <input type="submit" />
    </form>
    <a href="/register">Register</a>
    `)
})

app.get("/register",(req,res)=>{
    res.send(`
    <h1>Register</h1>
    <form action="/register" method="POST">
         <input  name="name" placeholder="NAME"
        required />
        <input type="email" name="email" placeholder="EMAIL"
        required />
        <input type="password" name="password" 
        placeholder="PASSWORD" required />
        <input type="submit" />
    </form>
    <a href="/login">Login</a>
    `)
})

app.post("/login",(req,res)=>{
  const {email,password} =  req.body 
    // console.log(email);
    if(email && password){
            const user = users.find(user => user.email === email && user.password === password )
        // console.log(user);
        if(user){
            //make jwt token here
            const token=generateJwtToken(user)
            res.cookie("token",token)
            console.log(req.cookies.token);
            
            // req.session.userId = user.id
            return res.redirect("/home")
        }
    }
    res.redirect('/login')
})


app.post("/register",(req,res)=>{
       const newId = users.length + 1
       const {name,email,password} = req.body
       if(name && email && password){
        const user = users.find(user => user.email === email)
        console.log(user);
        if(!user){
            const Newuser = {
                id: newId,
                name: name,
                email: email,
                password:password, ///hashing 
            } 
            users.push(Newuser)
            req.session.userId = newId //new session
            return res.redirect("/home")
        }
        res.redirect("/register",()=>{
            res.send("User Already Exists!")
        })
       }
 })


app.post("/logout",(req,res)=>{
    //delete session
    //redirect to login
        res.clearCookie("token")
        res.redirect('/login')
    }   
)



app.listen(7070,()=>{
    console.log("Server is running on http://localhost:7070")
})