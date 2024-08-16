const  express =  require('express')
const  bodyParser = require('body-parser')
const  emailRoutes = require('./routes/emailRoutes.js')
const  cors = require('cors')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const app = express();
const port = 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://coa-moda-alexleon2411s-projects.vercel.app'], // URL del frontend
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


function enviarWhatsAppAlerta(compra) {
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
  URL: https://coa-moda-alexleon2411s-projects.vercel.app/admin/ventas?tlf=${tlf}
  `;
    console.log(`el mensaje es : ${mensaje}`);
    client.messages
    .create({
        body: mensaje,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: process.env.MI_WHATSAPP_NUMBER,
    })
    .then(message => console.log(message.sid))
    .catch((error) => console.error('Error al enviar mensaje:', error));
}


app.post('/realizar-compra', (req, res) => {
  const compra = req.body;
  enviarWhatsAppAlerta(compra);
  res.send({ mensaje: 'Compra realizada con éxito' });
});


app.use('/', emailRoutes);
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
