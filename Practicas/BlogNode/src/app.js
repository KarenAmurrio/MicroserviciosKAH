//Librerias
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

//
const Post = require('./models/Post')

//
const app = express();
const path = require('path');
const { findByIdAndDelete } = require("../../../Tareas/Tarea 1/src/models/libro");

//Configuracion de la app
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// If 'public' is inside 'src'
app.use(express.static(path.join(__dirname, 'public')));

//Conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/BlogNode')
    .then(()=>console.log('Conectado a PostNode'))
    .catch(err  => console.log('Error de conexion', err));

//Rutas
//obtener
app.get("/", async (req, res) =>{
    const posts = await Post.find();
    res.render("index", {posts});
});
//create
app.get("/posts/new", async (req, res)=>{
    res.render("create");
});
app.post("/posts", async(req, res)=>{
    const {titulo, usuario, contenido} = req.body;
    await Post.create({titulo, usuario, contenido})
    res.redirect("/");
});
//read
app.get("/posts/:id", async (req,res)=>{
    const post = await Post.findById(req.params.id);
    res.render("show", { post })
});

//update
app.get("/posts/:id/edit", async(req, res)=>{
    const post = await Post.findById(req.params.id);
    res.render("edit", { post })
});

app.put("/posts/:id", async(req, res)=>{
    const {titulo, usuario, contenido} = req.body;
    await Post.findByIdAndUpdate(req.params.id,{titulo,usuario,contenido});
    res.redirect("/")
});

//delete
app.delete("/posts/:id", async(req, res)=>{
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/")
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});