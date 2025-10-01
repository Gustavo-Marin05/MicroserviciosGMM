import dotenv from 'dotenv';
dotenv.config();

import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = process.env.QUEUE_NAME || 'email_queue';

async function simulateEmailSending(user) {
  // Aquí simulas la lógica de envío de correo.
  console.log(`Simulando envío de correo a: ${user.email} (nombre: ${user.name})`);
  // Simula latencia de envío
  await new Promise(r => setTimeout(r, 1500));
  console.log(`Correo "enviado" a ${user.email} (simulado)`);
}

async function startConsumer() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    
    // Prefetch para distribuir carga entre consumidores
    channel.prefetch(1);

    console.log('Esperando mensajes en la cola:', QUEUE);

    channel.consume(QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('Mensaje recibido:', content);

          if (content.type === 'NEW_USER' && content.user) {
            await simulateEmailSending(content.user);
            channel.ack(msg); // Confirmamos que procesamos bien
          } else {
            console.log('Mensaje con tipo desconocido, ack y descartar');
            channel.ack(msg);
          }
        } catch (err) {
          console.error('Error procesando mensaje:', err);
          // requeue = false para no bloquear
          channel.nack(msg, false, false);
        }
      }
    }, { noAck: false });

  } catch (err) {
    console.error('Error en consumer', err);
    process.exit(1);
  }
}

startConsumer();
