require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = process.env.QUEUE_NAME || 'email_queue';
const PORT = process.env.PORT || 3000;

let channel;

async function initRabbit() {
    const conn = await amqp.connect(RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`[Producer] Conectado a RabbitMQ | cola: "${QUEUE}"`);
    process.on('SIGINT', async () => {
        await channel.close();
        await conn.close();
        process.exit(0);
    });
}

async function startServer() {
    await initRabbit();
    const app = express();
    const students = [];

    app.use(bodyParser.json());

    app.post('/register', async (req, res) => {
        const { name, email, cell, course } = req.body;
        if (!name || !email || !cell || !course) {
            return res.status(400).json({ error: 'Campos requeridos: name, email, cell, course' });
        }

        const student = { 
            id: Date.now(), 
            name, 
            email, 
            cell, 
            course,
            createdAt: new Date().toISOString() 
        };
        
        students.push(student);
        const isFull = course.toLowerCase().includes('lleno');
        const eventType = isFull ? 'WAITLIST' : 'NEW_STUDENT';
        const payload = { type: eventType, student };
    
        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), { persistent: true });
        console.log(`[Producer] Mensaje publicado (${eventType}):`, payload);
        
        return res.status(201).json({ ok: true, student });
    });

    app.get('/students', (_req, res) => res.json(students));

    app.listen(PORT, () => {
        console.log(`[Producer] API en http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error('[Producer] Error al iniciar:', err.message);
    process.exit(1);
});