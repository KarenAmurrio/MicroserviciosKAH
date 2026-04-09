const express = require('express');
const router = express.Router();
const db = require('../db'); // Tu conexión pool de mysql2
const axios = require('axios'); // Para la fase de comunicación posterior

router.post('/', async (req, res) => {
    const { nombre, apellido, ci, cargo, departamento, fecha_ingreso, salario } = req.body;

    // 1. Validación de Campos Obligatorios
    if (!nombre || !apellido || !ci || !cargo || !departamento || !fecha_ingreso || salario === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        // 2. Validación de Salario mayor a cero
        if (parseFloat(salario) <= 0) {
            return res.status(400).json({ error: "El salario debe ser mayor a cero" });
        }

        // 3. Validación de Fecha no futura
        const fechaIngresoDate = new Date(fecha_ingreso);
        const hoy = new Date();
        if (fechaIngresoDate > hoy) {
            return res.status(400).json({ error: "La fecha de ingreso no puede ser futura" });
        }

        // 4. Validación de CI único
        const [existente] = await db.query('SELECT id FROM empleados WHERE ci = ?', [ci]);
        if (existente.length > 0) {
            return res.status(400).json({ error: "El CI ya está registrado" });
        }

        // Si todo está bien, insertar
        const query = `INSERT INTO empleados (nombre, apellido, ci, cargo, departamento, fecha_ingreso, salario) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [nombre, apellido, ci, cargo, departamento, fecha_ingreso, salario]);

        res.status(201).json({
            id: result.insertId,
            ...req.body,
            activo: true
        });

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor", details: error.message });
    }
});

// LISTAR EMPLEADOS (con filtro opcional por departamento)
router.get('/', async (req, res) => {
    const { departamento } = req.query;
    try {
        let query = 'SELECT * FROM empleados WHERE activo = true';
        let params = [];

        if (departamento) {
            query += ' AND departamento = ?';
            params.push(departamento);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BAJA LÓGICA (No borra, solo desactiva)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('UPDATE empleados SET activo = false WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Empleado no encontrado" });
        
        res.json({ message: "Empleado dado de baja exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /empleados/:id/proyectos
router.get('/:id/proyectos', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verificar que el empleado exista en MySQL
        const [rows] = await db.query(
            'SELECT * FROM empleados WHERE id = ? AND activo = true', 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado o inactivo' });
        }

        const empleado = rows[0];

        // 2. Consultar al servicio GraphQL (Proyectos)
        // Usamos la URL de localhost por ahora, luego Docker la cambiará
        const graphqlUrl = 'http://proyectos-service:3002/graphql';

        const graphqlQuery = {
            query: `
                query GetProyectosByEmpleado($empId: String!) {
                    proyectosPorEmpleado(empleadoId: $empId) {
                        id
                        nombre
                        estado
                        fechaInicio
                        presupuesto
                    }
                }
            `,
            variables: {
                empId: id.toString()
            }
        };

        const response = await axios.post(graphqlUrl, graphqlQuery);
        
        // Extraemos los proyectos de la respuesta de Apollo
        const proyectos = response.data.data.proyectosPorEmpleado;

        // 3. Retornar respuesta combinada
        res.json({
            empleado,
            proyectos
        });

    } catch (error) {
        console.error('Error en la integración:', error.message);
        res.status(500).json({ 
            error: 'Error al obtener proyectos del empleado',
            details: error.message 
        });
    }
});

module.exports = router;