const express = require('express');
const router = express.Router();
const Libro = require('../models/Libro');

router.get('/', async (req, res) => {
    const libros = await Libro.find();
    res.json(libros);
});

router.post('/', async (req, res) => {
    try{
        const nuevoLibro = new Libro(req.body);
        await nuevoLibro.save();
        res.status(201).json(nuevoLibro);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const libroActualizado = await Libro.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(libroActualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Libro.findByIdAndDelete(req.params.id);
        res.json({ message: 'Libro eliminado' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;