const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

const requests = [];

/* =========================
   SEGURIDAD DEL ADMIN
========================= */

function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"];

  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({
      error: "La clave de administrador no está configurada."
    });
  }

  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      error: "No autorizado."
    });
  }

  next();
}


/* =========================
   SOLICITUDES PÚBLICAS
========================= */

app.post("/api/requests", (req, res) => {
  const { name, song, dedication } = req.body;

  if (!song || !song.trim()) {
    return res.status(400).json({
      error: "Falta el nombre de la canción."
    });
  }

  const request = {
    id: Date.now().toString(),
    name: name?.trim() || "Anónimo",
    song: song.trim(),
    dedication: dedication?.trim() || "",
    status: "pendiente",
    createdAt: new Date().toISOString()
  };

  requests.push(request);

  res.json({
    success: true,
    request
  });
});


/* =========================
   ADMINISTRACIÓN PROTEGIDA
========================= */

app.get("/api/requests", adminAuth, (req, res) => {
  res.json(requests);
});


app.patch("/api/requests/:id", adminAuth, (req, res) => {

  const request = requests.find(
    x => x.id === req.params.id
  );

  if (!request) {
    return res.status(404).json({
      error: "Solicitud no encontrada."
    });
  }

  request.status =
    req.body.status || request.status;

  res.json({
    success: true,
    request
  });
});


app.delete("/api/requests/:id", adminAuth, (req, res) => {

  const index = requests.findIndex(
    x => x.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Solicitud no encontrada."
    });
  }

  requests.splice(index, 1);

  res.json({
    success: true
  });
});


/* =========================
   SERVIDOR
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Servidor funcionando en el puerto ${PORT}`
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
