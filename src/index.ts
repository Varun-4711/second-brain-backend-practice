import express from "express";
import Routes from "./routesV1";

const app = express();
const port = 3000;

app.use(express.json());

// Mounting routes under /api/v1
app.use("/api/v1",Routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
