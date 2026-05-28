require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = process.env.QUEUE_NAME || 'email_queue';

async function simulateWelcomeEmail(student) {
    console.log(`[Consumer] Enviando correo de BIENVENIDA a: ${student.email} (${student.name}) para el curso "${student.course}"...`);
    await new Promise(r => setTimeout(r, 1500));
    console.log(`[Consumer] Correo de bienvenida enviado a ${student.email}`);
}

async function simulateWaitlistEmail(student) {
    console.log(`[Consumer] Enviando notificación de LISTA DE ESPERA a: ${student.email} (${student.name}) para el curso "${student.course}"...`);
    await new Promise(r => setTimeout(r, 1500));
    console.log(`[Consumer] Notificación de lista de espera enviada a ${student.email}`);
}

async function startConsumer() {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    
    channel.prefetch(1);
    console.log(`[Consumer] Esperando mensajes en la cola "${QUEUE}"...`);
    
    channel.consume(QUEUE, async (msg) => {
        if (msg === null) return;
        
        try {
            const content = JSON.parse(msg.content.toString());
            console.log('\n[Consumer] Mensaje recibido:', content);
            
            if (content.type === 'NEW_STUDENT' && content.student) {
                await simulateWelcomeEmail(content.student);
                channel.ack(msg);
            } else if (content.type === 'WAITLIST' && content.student) {
                await simulateWaitlistEmail(content.student);
                channel.ack(msg);
            } else {
                console.warn('[Consumer] Tipo desconocido o formato inválido. Descartando.');
                channel.ack(msg);
            }
        } catch (err) {
            console.error('[Consumer] Error procesando el mensaje:', err.message);
            channel.nack(msg, false, true); 
        }
    }, { noAck: false });
}

startConsumer().catch(err => {
    console.error('[Consumer] Error al iniciar:', err.message);
    process.exit(1);
});