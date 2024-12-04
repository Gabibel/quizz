const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const datab = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '' ,
    database: 'quizzdatabase'
});

datab.connect((err) => {
    if (err) {
        console.error('error connecting:', err);
        process.exit(1);
    }
    console.log('connected');

    const createDatabaseQuery = 'CREATE DATABASE IF NOT EXISTS my_database';
    datab.query(createDatabaseQuery, (err) => {
        if (err) {
            console.error('error creation', err);
            process.exit(1);
        }
        console.log('Database created');

        datab.changeUser({ database: 'quizzdatabase' }, (err) => {
            if (err) {
                console.error('error selection', err);
                process.exit(1);
            }

        });
    });
});

app.post('/add', (req, res) => {
    const { name, email } = req.body;
    const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
    datab.query(query, [name, email], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'User add.', id: result.insertId });
    });
});

app.get('/records', (req, res) => {
    const query = 'SELECT * FROM users';
    datab.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json(results);
    });
});

app.get('/record/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE id = ?';
    datab.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ message: 'User didn t found.' });
            return;
        }
        res.status(200).json(result[0]);
    });
});

app.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    datab.query(query, [name, email, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User didn t found.' });
            return;
        }
        res.status(200).json({ message: 'User updated .' });
    });
});

app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = ?';
    datab.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User didn t find.' });
            return;
        }
        res.status(200).json({ message: 'User delete.' });
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`server http://localhost:${PORT}`);
});
