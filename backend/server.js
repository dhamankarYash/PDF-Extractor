// const express = require('express');
// const multer = require('multer');
// const { spawn } = require('child_process');
// const path = require('path');
// const cors = require('cors'); // Add CORS for frontend-backend communication

// const app = express();
// const upload = multer({ dest: 'uploads/' }); // Adjust the destination as needed

// app.use(cors());
// app.use(express.json());
// // Multer storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Directory to save uploaded files
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
//     },
// });

// app.post('/upload', (req, res) => {
//     upload.single('file')(req, res, (err) => {
//         if (err) {
//             if (err instanceof multer.MulterError) {
//                 console.error('Multer Error:', err.message);
//                 return res.status(400).send(`Multer Error: ${err.message}`);
//             }
//             console.error('Unexpected Error:', err.message);
//             return res.status(500).send(`Unexpected Error: ${err.message}`);
//         }
//         if (!req.file) {
//             return res.status(400).send('No file uploaded.');
//         }
//         res.send({
//             message: 'File uploaded successfully',
//             file: req.file,
//         });
//     });
// });

// const port = 5000;
// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

// const express = require('express');
// const multer = require('multer');
// const { spawn } = require('child_process');
// const path = require('path');
// const cors = require('cors');

// const app = express();
// const upload = multer({ dest: 'uploads/' });

// app.use(cors());
// app.use(express.json());

// // Multer storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Directory to save uploaded files
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
//     },
// });

// app.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//     }

//     // Pass the file to the Python script
//     const pythonProcess = spawn('python', ['extract_data.py', req.file.path]);

//     let dataString = '';

//     pythonProcess.stdout.on('data', (data) => {
//         dataString += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//         console.error(`Python script error: ${data}`);
//     });

//     pythonProcess.on('close', (code) => {
//         if (code === 0) {
//             res.json(JSON.parse(dataString));
//         } else {
//             res.status(500).send('Error extracting data from the PDF.');
//         }
//     });
// });

// const port = 5000;
// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

// New code
const express = require("express")
const multer = require("multer")
const { spawn } = require("child_process")
const path = require("path")
const cors = require("cors")

const app = express()

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed!"), false)
    }
  },
})

app.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err)
      return res.status(400).json({ error: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." })
    }

    console.log("File uploaded:", req.file.path)

    const pythonProcess = spawn("python", [path.join(__dirname, "extract_data.py"), req.file.path])

    let dataString = ""
    let errorString = ""

    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString()
      console.log("Python output:", data.toString())
    })

    pythonProcess.stderr.on("data", (data) => {
      errorString += data.toString()
      console.error("Python error:", data.toString())
    })

    pythonProcess.on("close", (code) => {
      console.log("Python process exited with code:", code)

      if (code === 0 && dataString) {
        try {
          const jsonData = JSON.parse(dataString)
          console.log("Parsed data:", jsonData)
          res.json(jsonData)
        } catch (error) {
          console.error("JSON parsing error:", error)
          res.status(500).json({
            error: "Error parsing extracted data.",
            details: error.message,
          })
        }
      } else {
        console.error("Python script error:", errorString)
        res.status(500).json({
          error: "Error extracting data from the PDF.",
          details: errorString,
        })
      }
    })
  })
})

const port = 5000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})



