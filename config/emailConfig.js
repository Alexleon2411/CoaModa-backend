const  nodemailer = require('nodemailer')

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false,
  auth: {
    user: "19846511791919",
    pass: "da833077154e7e"
  }
});

module.exports = transport
