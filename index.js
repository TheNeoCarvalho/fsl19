const express = require("express");
const bodyParser = require("body-parser");
const sqlite = require("sqlite");

var jwt = require("jsonwebtoken");

const app = express();
const dbConnection = sqlite.open("banco.sqlite", {
  Promise
});

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.get("/", async (req, res) => {
  const db = await dbConnection;
  const categoriasDb = await db.all("SELECT * FROM categoria");
  const vagas = await db.all("SELECT * FROM vaga");

  const categorias = categoriasDb.map(cat => {
    return {
      ...cat,
      vagas: vagas.filter(vaga => vaga.categoria === cat.id)
    };
  });
  res.render("home", {
    categorias
  });
});

app.get("/vagas", (req, res) => {
  res.render("vaga");
});

app.get("/vagas/:id", async (req, res) => {
  let id = req.params.id;
  const db = await dbConnection;
  const vaga = await db.get(`SELECT * FROM vaga WHERE id = ${id}`);
  res.render("vaga", {
    vaga
  });
});

app.get("/admin", async (req, res) => {
  const db = await dbConnection;
  const vagas = await db.all("SELECT * FROM vaga");
  res.render("adm/home", {
    vagas
  });
});

app.get("/admin/vagas", async (req, res) => {
  const db = await dbConnection;
  const vagas = await db.all("SELECT * FROM vaga");
  res.render("adm/vagas", {
    vagas
  });
});

app.get("/admin/categorias", async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all("SELECT * FROM categoria");
  res.render("adm/categorias", {
    categorias
  });
});

app.get("/admin/vagas/delete/:id", async (req, res) => {
  let id = req.params.id;
  const db = await dbConnection;
  await db.run(`DELETE FROM vaga WHERE id = ${id}`);
  res.redirect("/admin/vagas");
});

app.get("/admin/categorias/delete/:id", async (req, res) => {
  let id = req.params.id;
  const db = await dbConnection;
  await db.run(`DELETE FROM categoria WHERE id = ${id}`);
  res.redirect("/admin/categorias");
});

app.get("/admin/vagas/nova", async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all("SELECT * FROM categoria");
  res.render("adm/cadastroVagas", {
    categorias
  });
});

app.post("/admin/vagas/nova", async (req, res) => {
  let { titulo, categoria, descricao } = req.body;
  const db = await dbConnection;
  await db.run(
    `INSERT INTO vaga (titulo, descricao, categoria) VALUES ('${titulo}', '${descricao}', ${categoria});`
  );
  res.redirect("/admin/vagas");
});

app.get("/admin/categorias/nova", (req, res) => {
  res.render("adm/cadastroCategoria");
});

app.post("/admin/categorias/nova", async (req, res) => {
  let { categoria } = req.body;
  const db = await dbConnection;
  await db.run(`INSERT INTO categoria (categoria) VALUES ('${categoria}');`);
  res.redirect("/admin/categorias");
});

app.get("/admin/vagas/update/:id", async (req, res) => {
  let { id } = req.params;
  const db = await dbConnection;
  const vaga = await db.get(`SELECT * FROM vaga WHERE id = ${id};`);
  let cat = vaga.categoria;
  const categoria = await db.get(`SELECT * FROM categoria WHERE id = ${cat};`);
  res.render("adm/atualizaVagas", {
    vaga,
    categoria
  });
});

app.post("/admin/vagas/update/:id", async (req, res) => {
  let { id, titulo, categoria, descricao } = req.body;
  let idUrl = req.params.id;
  const db = await dbConnection;
  await db.run(
    `UPDATE vaga SET titulo= '${titulo}', descricao = '${descricao}' WHERE id = ${id};`
  );
  res.redirect("/admin/vagas");
});

app.get("/admin/categorias/update/:id", async (req, res) => {
  let { id } = req.params;
  const db = await dbConnection;
  const categoria = await db.get(`SELECT * FROM categoria WHERE id = ${id};`);
  res.render("adm/atualizaCategorias", {
    categoria
  });
});

app.post("/admin/categorias/update/:id", async (req, res) => {
  let { id, categoria } = req.body;
  let idUrl = req.params.id;
  const db = await dbConnection;
  await db.run(
    `UPDATE categoria SET categoria = '${categoria}' WHERE id = ${id};`
  );
  res.redirect("/admin/categorias");
});

const init = async () => {
  const db = await dbConnection;
  await db.run(
    `CREATE TABLE IF NOT EXISTS categoria (id INTEGER PRIMARY KEY, categoria TEXT);`
  );
  await db.run(
    `CREATE TABLE IF NOT EXISTS vaga (id INTEGER PRIMARY KEY, titulo TEXT, descricao TEXT, categoria INTEGER);`
  );
  // await db.run(
  //   `CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY, nome TEXT, curso TEXT);`
  // );
  // await db.run(
  //   `CREATE TABLE IF NOT EXISTS empresas (id INTEGER PRIMARY KEY, nome TEXT);`
  // );

  //await db.run(
  //   `INSERT INTO alunos (nome, curso) VALUES ('Henri Enrique Pinheiro', 'Informática');`
  // );

  // await db.run(`INSERT INTO empresas (nome) VALUES ('W&C Digital');`);
};

init();

app.listen(port, () => {
  console.log("Server is Up in port ");
});
