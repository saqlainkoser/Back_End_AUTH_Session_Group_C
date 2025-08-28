const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const app = express()

const {
  PORT = 3000,
  JWT_SECRET = 'supersecret',   // use env var in production
  JWT_EXPIRES = '2h'           // token expiry
} = process.env

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()) // if you want JSON body parsing

// Dummy users DB
const users = [
  { id: 1, name: 'Alex',   email: 'alex@gmail.com',   password: 'secret' },
  { id: 2, name: 'Max',    email: 'max@gmail.com',    password: 'secret' },
  { id: 3, name: 'Hagard', email: 'hagard@gmail.com', password: 'secret' }
]

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email }, // payload
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )
}

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // "Bearer <token>"

  if (!token) return res.status(401).send('Access denied. No token provided.')

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid or expired token.')
    req.user = user // attach decoded user data to request
    next()
  })
}

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome!</h1>
    <a href='/login'>Login</a>
    <a href='/register'>Register</a>
    <p>Use Postman or frontend to send Authorization header with JWT for /home</p>
  `)
})

app.get('/home', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  res.send(`
    <h1>Home</h1>
    <p>Name: ${user.name}</p>
    <p>Email: ${user.email}</p>
  `)
})

app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form method='post' action='/login'>
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Password' required />
      <input type='submit' />
    </form>
  `)
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email && u.password === password)

  if (!user) return res.status(401).send('Invalid credentials')

  const token = generateToken(user)
  res.json({ message: "Login successful", token })
})

app.get('/register', (req, res) => {
  res.send(`
    <h1>Register</h1>
    <form method='post' action='/register'>
      <input name='name' placeholder='Name' required />
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Password' required />
      <input type='submit' />
    </form>
  `)
})

app.post('/register', (req, res) => {
  const { name, email, password } = req.body
  if (users.some(u => u.email === email)) {
    return res.status(400).send('User already exists')
  }

  const newUser = { id: users.length + 1, name, email, password }
  users.push(newUser)

  const token = generateToken(newUser)
  res.json({ message: "Registration successful", token })
})

// "Logout" in JWT world = client just deletes token
app.post('/logout', (req, res) => {
  // No server session to destroy; tell client to delete its token
  res.json({ message: "Logout successful. Please delete the token on client." })
})

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))
