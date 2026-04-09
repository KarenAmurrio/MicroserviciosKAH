require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone'); // Cambiamos esto
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const PORT = parseInt(process.env.PORT) || 3002;

async function startServer() {
    // 1. Configuración del servidor
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    // 2. Conexión a MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rrhh_proyectos';
    await mongoose.connect(mongoUri)
        .then(() => console.log('✅ Conectado a MongoDB'))
        .catch(err => console.error('❌ Error MongoDB:', err));

    // 3. Iniciar servidor independiente (esto evita el lío de express4)
    const { url } = await startStandaloneServer(server, {
        listen: { port: PORT },
    });

    console.log(`🚀 Servicio Proyectos listo en: ${url}graphql`);
}

startServer();