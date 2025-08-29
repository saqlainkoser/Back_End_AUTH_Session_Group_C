const express = require("express");
const session = require("express-session")
const bodyParser = require("body-parser")



const app = express();

app.use(bodyParser.urlencoded({extended:true}))

//session config
app.use(
    session({
        name:"sid",
        resave:false,
        saveUninitialized :false,
        secret: "secret",
        //config the cookie
        rolling:false, //imp
        cookie:{
        //    maxAge: 1000 * 10 ,
           expires : new Date(Date.now() + 1000 * 50) //50 sec 
        //    sameSite: true,
        //    secure : false,
        //    httpOnly : true 
        }
    })
)


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
    if(!req.session.userId){
        res.redirect('/login')
    }
    else{
        next()
    }
}

const redirectHome = (req,res,next)=>{
    if(req.session.userId){
        res.redirect("/home")
    }
    else{
        next()
    }
}
 

app.get("/",(req,res)=>{
    const {userId} = req.session
    res.send(`
    <h1>Welcome!</h1>
    ${userId ? `
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
    const {userId} = req.session
    const user = users.find(user => user.id == userId)
    console.log(user);
res.send(`
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
        <li>Name:${user.name}</li>
        <li>Email:${user.email}</li>
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
            req.session.userId = user.id
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
    req.session.destroy(err =>{
        if(err){
            return res.redirect('/home')
        }
        res.clearCookie("sid")
        res.redirect('/login')
    }
    )
})



app.listen(7070,()=>{
    console.log("Server is running on http://localhost:7070")
})





// https://exam.testpad.chitkarauniversity.edu.in/test/25cs025-fa1-g

// code - 7802