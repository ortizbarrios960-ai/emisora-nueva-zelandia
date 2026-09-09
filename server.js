const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

const requests = [];

app.post("/api/requests", (req, res) => {
  const { name, song } = req.body;

  if (!song || !song.trim()) {
    return res.status(400).json({ error: "Falta el nombre de la canción." });
  }

  const request = {
    id: Date.now(),
    name: name?.trim() || "Anónimo",
    song: song.trim(),
    status: "Pendiente",
    createdAt: new Date().toISOString()
  };

  requests.push(request);

  res.json({
    success: true,
    request
  });
});

app.get("/api/requests", (req, res) => {
  res.json(requests);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
