const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));

// Session setup
app.use(session({
    secret: 'topic-3', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Hardcoded users
const USERS = {
    'mike': 'admin',
    'alice': 'normal',
    'steve': 'normal' 
};

// Login form
app.get('/login', (req, res) => {
    res.send(`
        <h2>Login</h2>
        <form method="POST" action="/login">
            Username: <input name="username" type="text" />
            <button type="submit">Login</button>
        </form>
    `);
});

// Login logic
app.post('/login', (req, res) => {
    const {username} = req.body;
    const role = USERS[username];
    
    if (!role) {
        return res.status(403).send('User does not exist.');
    }

    req.session.user = {
        name: username,
        role: role
    };

    res.redirect('/');
});


// Home
app.get('/', (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.redirect('/login');
    }
    if(user.role == 'admin'){
        res.send(`
            <h1>Welcome, ${user.name}</h1>
            <p>Your current role is: <strong>${user.role}</strong></p>
            <a href="/step1">Upgrade Role</a>
        `);
    }
    else if(user.role == 'normal'){
        res.send(`
            <h1>Welcome, ${user.name}</h1>
            <p>Your current role is: <strong>${user.role}</strong></p>
        `);
    }

    
});

// // Step 1: Only admins can pass
// app.get('/step1', (req, res) => {
//     const user = req.session.user;

//     if (!user || user.role !== 'admin') {
//         return res.status(403).send('Access Denied. Admins only.');
//     }

//     res.sendFile(path.join(__dirname, 'views', 'step1.html'));
// });
// app.post('/step1', (req, res) => {
//     const username = req.body.name;
//     req.session.user = { name: username};

//     res.redirect('/step2');
// });

// Step 1: 
app.get('/step1', (req, res) => {
    const user = req.session.user;
    console.log(req.session.user)

    if (!user || user.role !== 'admin') {
        return res.status(403).send('Access Denied. Admins only.');
    }
    res.sendFile(path.join(__dirname, 'views', 'step1.html'));
});

app.post('/step1', (req, res) => {
    
    const user = req.session.user;
    // if (!user || user.role !== 'admin') {
    //     return res.status(403).send('Access Denied. Admins only.');
    // }
    console.log(user)
    
    const username = req.body.username;
    console.log(username)
    res.cookie('username', username);
    console.log(req.cookies)
    // req.session.user.name = username;
    res.redirect('/step2');
});

// Step 2: 
app.get('/step2', (req, res) => {
    // if (!user || user.role !== 'admin') {
    //     return res.status(403).send('Access Denied. Admins only.');
    // }
    res.sendFile(path.join(__dirname, 'views', 'step2.html'));
    console.log(req.session.user)
});
app.post('/step2', (req, res) => {
    const role = req.body.role;
    res.cookie('role', role);
   
    res.redirect('/complete');
});


app.get('/complete', (req, res) => {
    const {username, role} = req.cookies
    res.send(`
        <h1>Account Summary</h1>
        <p>Username: <b>${username}</b></p>
        <p>Role: <b>${role}</b></p>
        ${role === 'admin' ? '<p style="color:red;">🏆 You are an admin!</p>' : ''}
        <form method="GET" action="/logout">
            <button type="submit">Login</button>
        </form>
    `);
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.listen(port, () => {
    console.log(`Lab running at http://localhost:${port}`);
});
