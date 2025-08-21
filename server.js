const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/send-email", upload.fields([
  { name: "passportPhoto" },
  { name: "passportCopy" },
  { name: "drivingLicense" }
]), async (req, res) => {
  const { name, surname, email, phone, country , countryB, jobType, message } = req.body;
  const passportPhoto = req.files["passportPhoto"]?.[0];
  const passportCopy = req.files["passportCopy"]?.[0];
  const drivingLicense = req.files["drivingLicense"]?.[0];

  res.status(200).json({ message: "Documents received, sending email..." });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"${name} ${surname}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: "Job Document Submission",
    text: `Name: ${name}\nSurname: ${surname}\nEmail: ${email}\n Phone: ${phone}\n Country : ${country}\n Country : ${countryB}\n Job Type: ${jobType}\n Message : ${message}\n\nPlease find the attached documents.`,
    html: `<p>Name: ${name}</p>
           <p>Surname: ${surname}</p>
           <p>Email: ${email}</p>
            <p>Phone: ${phone}</p>
           <p>Country  (Basic Package): ${countryB}</p>
           <p>Country (Premium Package) : ${country}</p>
           <p>Job Type: ${jobType}</p>
            <p>Message: ${message}</p>
           <p>Please find the attached documents.</p>`,
    attachments: [
      {
        filename: passportPhoto.originalname,
        content: passportPhoto.buffer
      },
      {
        filename: passportCopy.originalname,
        content: passportCopy.buffer
      },
      {
        filename: drivingLicense.originalname,
        content: drivingLicense.buffer
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
