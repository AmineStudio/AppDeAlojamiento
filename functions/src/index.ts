import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";

// Este es el punto de entrada de tu Backend.
// Aquí añadiremos la integración de Stripe y el envío de correos más adelante.

export const helloWorld = onRequest((request, response) => {
  logger.info("Hola desde Mila Backend!", {structuredData: true});
  response.send("¡El backend de Mila está funcionando!");
});
