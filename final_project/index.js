const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { users } = require('./router/auth_users.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
if (req.session.authorization) {
    let token = req.session.authorization['accessToken'];

    // Verify JWT token
    jwt.verify(token, "access", (err, user) => {
        if (!err) {
            req.user = user;
            next(); // Proceed to the next middleware
        } else {
            return res.status(403).json({ message: "User not authenticated" });
        }
    });
} else {
    return res.status(403).json({ message: "User not logged in" });
}
});

// Login route implementation
app.post('/customer/login', (req, res) => {
    const { username, password } = req.body;  // Extract username and password from request body

    // Validate if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the user exists
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if password matches
    if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token if credentials are valid
    const accessToken = jwt.sign({ username: user.username }, "access", { expiresIn: '1h' });

    // Store the JWT in the session
    req.session.authorization = { accessToken };

    // Respond with success message and the token
    return res.status(200).json({ message: "Login successful", token: accessToken });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
//commit these
