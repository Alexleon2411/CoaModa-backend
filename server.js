const  express =  require('express')
const  bodyParser = require('body-parser')
const  emailRoutes = require('./routes/emailRoutes.js')
const  cors = require('cors')
const dotenv = require('dotenv')

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config(); // Esto cargará las variables de entorno normales en Vercel
}

const app = express();
const port = 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://buhu-coa.vercel.app'], // URL del frontend
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type'],
  credentials: true,  // Encabezados permitidos
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


function rejoinSandbox() {
  client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER, // Número de la sandbox
    to: process.env.MI_WHATSAPP_NUMBER, // Tu número de WhatsApp
    body: 'join nearby-energy', // Asegúrate de reemplazar <tu-código-sandbox> con el código real
  })
  .then(message => console.log('Reconectado a la sandbox:', message.sid))
  .catch(error => console.error('Error al reconectar a la sandbox:', error));
}

// Ejecutar la reconexión cada 3 días (259200000 ms)
setInterval(rejoinSandbox, 259200000);


async function enviarWhatsAppAlerta(compra) {
  const { cliente, total, tlf, articulos } = compra;

  let cartDetails = articulos
    .map(
      (item) => `
    Nombre del Producto: ${item.name}
    Precio: ${item.price}
    Cantidad: ${item.quantity}
    Categoría: ${item.category}
    Disponibilidad: ${item.availability}
    Imagen: ${item.image}
  `
    )
    .join('\n');
  const mensaje = `
  ¡Nueva compra realizada!
  Cliente: ${cliente}
  Telefono: ${tlf}
  Total: $${total}
  Artículos: ${cartDetails}
  URL: https://buhu-coa.vercel.app/admin/ventas?tlf=${tlf}
  `;
    client.messages
    .create({
        body: mensaje,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: process.env.MI_WHATSAPP_NUMBER,
    })
    .then(message => {
      console.log(message.sid);
      return true;

    })
    .catch((error) => {
      console.error('Error al enviar mensaje:', error);
      return false;
    });
}


app.post('/realizar-compra', async(req, res)   => {
  const compra = req.body;
  const response = await enviarWhatsAppAlerta(compra);
  res.send({ mensaje: 'Compra realizada con éxito', response });
});

app.use('/', emailRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// esta funcion va de ultima porque si se coloca anter interfiere con la conexion de las demas apis
app.use('/', (req,res) => {
  const htmlRequest = `
  <html>
    <heade>
      <title>NodeJS y express en vercel </title>
    </heade>
    <body>
      <h1> Soy un projecto de node js </h1>
    </body>
  </html>
  `
  res.send(htmlRequest);
})
