//  express npm i express

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
// create an instance of express

const app = express();
// ---------------------------------------------------
// req la ulla body la data vanthu json data nu  post request ku theriyum(postmanla) atha vanthu nodejs programku solanum json data athan anupurom nu
// athuku express middleware payn padutha porom app.use koduthalya oru middle ware payn padutha porom nu arhom antha middle wware la json datava deecode pani eduthikanumnu  solanum
// athuku express modul la dot vacha json oru function call pananum itha function oru middleware tharum atha than express ku anupurom
app.use(cors());
app.use(express.json());

// ---------------------------------------------------

// to define a route
// app la get method onu irukum athu get route uruvakum
// 1st parameter oru URI
// 2nd parameter oru callback function ithula 2 argument 1 req and 2 res
// res la send method call pani data va pass pana mudium
// / vanthu root URL == localhost 3000(port)

// ---------------------------------------------------
// testing purpose
// app.get("/", (req, res) => {
//   res.send("Hello world");
// });

// ---------------------------------------------------
// sample in memory storage for todo items

// let todos = []; //data does not presists
// intha data prsist a irukathu once server stop and restart panum pothu athuku todos variable ku bathil mongo db ya payn padutha porom
// ---------------------------------------------------
// 1 connecting mongoDB to install package mongogs
//"Mongoose is an object data modeling (ODM) library for Node.js, simplifying the process of managing data in a database.
// mongoose module la connect method iruku  athulla conection string a pass panaporom
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("data base is connected"))
  .catch((err) => console.log(err));
// ---------------------------------------------------
// 2 schema a uruvakanum itha vachu than mongoose kuripita collection ulla data ava insert panum
// schema va creat panarathuku schema object creat pananum athuku mongoose la schema nu class onu irukuthu antha constructor ulla object pass pana porom
// object la input feilds with datatypes
// ---------------------------------------------------

// Schema: Defines the structure and validation rules for data in a database.
// Model: Represents data and provides an interface to interact with the database.
// View: Displays data to the user in a user interface.
// Controller: Handles user input and updates the model and view accordingly.
// ---------------------------------------------------

const todoSchema = new mongoose.Schema({
  title: {
    // validating in mongodb data base
    required: true,
    type: String,
  },
  description: String,
});
// ---------------------------------------------------
// 3 creating model
// inga module name Todo nu singularla kodukuromathukana plural vanthu todos nu database la store agum collection name
const todoModel = mongoose.model("Todo", todoSchema);
// creat new todo

app.post("/todo", async (req, res) => {
  // req object la ulla body parameter acces panrom
  // nama anupur input data eleam body parameter la than kadikum
  const { title, description } = req.body;
  // ---------------------------------------------------

  //   new todo list create pana porom

  // const newTodo = {
  //   // id uniqu a than irikanum
  //   id: todos.length + 1,
  //   title,
  //   description,
  // };

  // todos.push(newTodo);
  //   test for new items inserted

  // console.log(todos);
  // ---------------------------------------------------
  // creating item in mongodb
  try {
    let newTodo = new todoModel({ title, description });
    // save method ethuku na constructor la kodutha document pathivu saiya poguthu ithu vanthu prommise adipadaila than insert saiuthu athu nala try catch block
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    console.log(err);
    // res.status kodutha send() o json() o payan paduthanum thapa feild name kodutha ex title pathila name kodutha error varum
    res.status(500).json({ message: err.message });
  }
  // ---------------------------------------------------

  //Intha request kana respons anupanum
  // res object ull a status method iruku
});

// ---------------------------------------------------
// intha items elam edukurathukana api saiya porom
// get all items
// ithoda uri vanthu todos uri onu request method vera vera
// uri ku post request pochuna puthu request uruvaka pormnu artham get request poshuna data va vanga porom nu artham
app.get("/todo", async (req, res) => {
  // inth callback function al request respons parameter kidaikum
  // collection ulla ela documents a rduka  tdomodel payn paduthaporom
  try {
    let todo = await todoModel.find(); //todmodel la find method iruku antha method call pana ella datavum kadichidum itnta method prommise return pana kudiya method athunala async function mathurom
    res.json(todo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});
// ---------------------------------------------------
// write api for updating the  todi items
// :id kodutha parameters nu soluvom
app.put("/todo/:id", async (req, res) => {
  // (data base operation nadakuthu athu nala ethavathu error varum atah try catch block kulla poduvom)
  // Converting circular structure to JSON inta {error} kana karanom vanthu nama  dtaabase method payan padithirkom  (todoModel.findByIdAndUpdate) athuvanthu asynchronous valya saiuthu prommise return pana kudiya method athu nala wait pananum
  try {
    // accessing the parameter id
    const id = req.params.id;
    const { title, description } = req.body;
    // findByIdAndUpdate function ulla 1st argument vanthus id and 2nd argument vanthu documunt (athavthu puthu valuesor edit pana value) ithta function intha value va update pani mudicha piragu document kodukum atha variable a store pani vachikalam
    const updataedTod = await todoModel.findByIdAndUpdate(
      id,
      {
        // intha code la id kandipidichu update paniduthu athu update panithu palaya datava tha n kodukum
        // puthisa update pana values than venum na  athuku 3 thu parameter a obect le options kodukalam new:true kodutha palaya datava anupama puthu data va anupum
        title,
        description,
      },
      { new: true }
    );
    // ipo intha id ilaynan updataedTod la document irukathu athuku pathila null value than irukum
    // updataedTod vathu null iruku thratha nama !updataedTod nu mention panalam
    if (!updataedTod) {
      return res.status(404).json({ message: "todos not found" });
    }

    res.status(200).json(updataedTod);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});
// ---------------------------------------------------
// write a api for delete the data
app.delete("/todo/:id", async (req, res) => {
  // req, res (parameters)
  // /tpdos/:id - URI
  try {
    const id = req.params.id;
    await todoModel.findByIdAndDelete(id);
    // status(204) ena arthomna valya vetrigarama mudichache vera content ethuvum return pana porathu kidayathu nu arthom [The server successfully processed the request, but is not returning any content.]
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});
// ---------------------------------------------------

// start the server

// 1st port number thave athula than application run aga poguthu
// athu vanthu reserverd port number a iruka kudathu

// app la listen method irukum athula 1st argumenta  port number kodukanu 2 callback function kodukalam
// frontend and backend same port la run aga kudathu
const port = 8000;
app.listen(process.env.PORT || 3001, () => {
  console.log(`server is running at http://127.0.0.1:${port}`);
});
// ---------------------------------------------------
// npm i nodemon and  npx nodemon
