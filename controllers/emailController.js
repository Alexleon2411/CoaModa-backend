const  transport = require('../config/emailConfig.js')

const sendEmail = (req, res) => {
  const { name, email, phone, cart } = req.body;
  if (!name || !email || !phone || !cart) {
    return res.status(400).send('Todos los campos son requeridos');
  }
  console.log('desde sent email ')
 // el siguiente map se ejecuta para poder dividir los podructos y de esta manera enviarla en el correo
  let cartDetails = cart.map(item => `
    Nombre del Producto: ${item.name}
    Precio: ${item.price}
    Cantidad: ${item.quantity}
    Categoría: ${item.category}
    Disponibilidad: ${item.availability}
    Imagen: ${item.image}
  `).join('\n');

  const mailOptions = {
    from: '"Maddison Foo Koch 👻" <licett0103@gmail.com>', // sender address
    to: 'aleeleon2424@gmail.com',
    subject: 'Nueva compra',
    text: `
      Nombre: ${name}
      Email: ${email}
      Teléfono: ${phone}
      Carrito:
      ${cartDetails}
    `,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('hay un error en las credenciales:', error)
      return res.status(500).send(error.toString());
    }
    res.status(200).send('Email enviado: ' + info.messageId);
  });
};

module.exports = {
  sendEmail,
};
