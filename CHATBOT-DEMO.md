# Demo de chatbot IA RehabPod
Rama de prueba: feature/rehabpod-ai-chatbot. No modifica la web ni la app publicadas.
Archivos:
- sitio/chatbot-demo.html: interfaz HTML/CSS/JS, sin React (la web comercial usa HTML).
- api/rehabpod-chat.js: endpoint Node.js para Vercel.
Configuración Vercel: agregar variable secreta OPENAI_API_KEY y opcional OPENAI_MODEL. Opcional CHAT_ALLOWED_ORIGIN para restringir el origen. Nunca escribir la clave en HTML, GitHub o código público.
La API de OpenAI se factura por uso independientemente de ChatGPT Plus. Antes de publicar, establecer límites de gasto y agregar rate limiting persistente (el límite en memoria incluido es solo para demostración y no es suficiente en producción serverless). También configurar protecciones contra abuso y revisar privacidad/consentimiento.
Para probar tras desplegar en un entorno de vista previa de Vercel, visitar /chatbot-demo.html si la raíz del proyecto es sitio; si el root del proyecto es la raíz del repo, configurar el despliegue para que /api/rehabpod-chat sea accesible junto a la página.
No fusionar a main hasta verificar despliegue, presupuesto, accesibilidad, funcionamiento y medidas de seguridad.
