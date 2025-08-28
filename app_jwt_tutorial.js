const express = require("express")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

const app = express()

app.use(cookieParser())

app.get("/",(req,res)=>{
    //making cookie 
    const token =jwt.sign({name:"shaan"},"supersecret")
    res.cookie("token",token)
    console.log(req.cookies.token)
    res.send("My JWT TOKEN")
})

app.listen(8000,()=>{
    console.log("http://localhost:8000");
})

