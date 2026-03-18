const db = require('../db');

exports.getAll = (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

exports.getById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err,
        results) => {
            if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({
            mensaje: 'No encontrado'
        });
        res.json(results[0]);
    });
};


exports.create = (req, res) => {
    const { nombre, email, edad, telefono } = req.body;

    if (!email) return res.status(400).json({ transaccion: false, mensaje: 'El email es obligatorio', data: null });
    if (edad <= 0) return res.status(400).json({ transaccion: false, mensaje: 'La edad debe ser mayor a 0', data: null });

    db.query(
        'INSERT INTO usuarios (nombre, email, edad, telefono) VALUES (?, ?, ?, ?)',
        [nombre, email, edad, telefono],
        (err, result) => {
            if (err) return res.status(500).json({ transaccion: false, mensaje: err.message, data: null });

            res.status(201).json({
                transaccion: true,
                mensaje: "Usuario creado con éxito",
                data: { id: result.insertId }
            });
        }
    );
};

exports.update = (req, res) => {
    const { id } = req.params;
    const { nombre, email, edad, telefono } = req.body;
    db.query(
        'UPDATE usuarios SET nombre=?, email=?, edad=? , telefono=? WHERE id=?', [nombre, email, edad, telefono, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: 'Actualizado correctamente' });
        }
    );
};

exports.delete = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id=?', [id], (err, result) => {
        if (err) return res.status(500).json({ transaccion: false, mensaje: err.message, data: null });

        res.json({
            transaccion: true,
            mensaje: 'Eliminado correctamente',
            data: { id_eliminado: id }
        });
    });
};

exports.getAll = (req, res) => {

    const { edad, page = 1, limit = 5 } = req.query;

    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM usuarios';
    let params = [];

    if (edad) {
        query += ' WHERE edad = ?';
        params.push(edad);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({
                transaccion: false,
                mensaje: err.message,
                data: null
            });
        }

        res.json({
            transaccion: true,
            mensaje: "Usuarios obtenidos correctamente",
            data: results
        });
    });
};