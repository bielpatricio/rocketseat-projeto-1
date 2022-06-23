const express = require("express");
const { uuid, isUuid } = require("uuidv4");
const cors = require('cors');

const app = express();

app.use(cors({
  // origin: 'http://localhost:3000'
}))
app.use(express.json());

const projects = [];

function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel);

  return next(); //se nao retornar o next, o middleware interrompe totalmente a requisicao
}

function validateProjectId(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid project id" });
  }
  return next();
}

app.use(logRequests);
app.use("/projects/:id", validateProjectId);

app.get("/projects", (req, res) => {
  const { title } = req.query;

  const results = title
    ? projects.filter((project) => project.title.includes(title))
    : projects;

  return res.json(results);
});

app.post("/projects", (req, res) => {
  const { title, owner } = req.body;
  const project = { id: uuid(), title, owner };

  projects.push(project);

  return res.json(project); //sempre apenas o criado
});

app.put("/projects/:id", (req, res) => {
  const { id } = req.params;
  const { title, owner } = req.body;

  const projectIndex = projects.findIndex((project) => project.id === id);

  if (projectIndex < 0) {
    return res.status(404).json({ error: "project not found" });
  }

  const project = {
    id,
    title,
    owner,
  };

  projects[projectIndex] = project;

  return res.json(project);
});

app.delete("/projects/:id", (req, res) => {
  const { id } = req.params;

  const projectIndex = projects.findIndex((project) => project.id === id);

  if (projectIndex < 0) {
    return res.status(404).json({ error: "project not found" });
  }
  projects.splice(projectIndex, 1);

  return res.status(204).send();
});

app.listen(3334, () => {
  console.log("🚀 Server is running on port 3334");
});
