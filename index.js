import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
const app = express();
import fs from "fs";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
  },
});
//muleter configuration
const upload = multer({ storage: storage });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5137"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(
  express.json({
    limit: "16kb",
    extended: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.json({
    message: "Success",
  });
});

app.post("/upload", upload.single("file"), (req, res) => {
  const lessionId = uuidv4();
  const videoPath = req.file.path;
  const outputPath = path.join(__dirname, "uploads", "courses", lessionId);
  const hlsPath = path.join(outputPath, "index.m3u8");
  console.log(hlsPath);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const ffmpegCommand = `ffmpeg -i ${videoPath} -c:v libx264 -c:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(`exec error: ${error.message}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    const videoUrl = `http://localhost:3000/uploads/courses/${lessionId}/index.m3u8`;

    res.json({
      message: "Video Converted to HLS Format",
      videoUrl: videoUrl,
      lessionId: lessionId,
    });
  });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
