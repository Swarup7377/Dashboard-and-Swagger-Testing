let express = require("express");
let app = express();
let cors = require("cors");
let bodyParser = require("body-parser");
let port = process.env.PORT || 3001;
let mongo = require("mongodb");
let mongodb = mongo.MongoClient;
let mongoUrl = "mongodb://localhost:27017";
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//static file path
app.use(express.static(__dirname+'/public'));
//html file path
app.set('views','./src/views');
//view engine
app.set('view engine','ejs');

//Health Check
app.get("/health", (req, res) => {
  res.send("Heart Beat Ok");
});

app.get('/',async(req,res)=>{
    try {
        const client = await mongodb.connect(mongoUrl);
        const dbObj = client.db("dashBoard");
        const output=await dbObj.collection("adminUser").find({}).toArray();
        res.status(200).render('index',{data:output});
        client.close(); // Close the MongoDB connection
      } catch (err) {
        console.log(err);
        res.status(500).send("Error occurred");
      }
})

app.get("/new", (req, res) => {
    res.status(200).render('forms');
  });

//get User
app.get("/users", async (req, res) => {
  let query = {};
  if (req.query.city && req.query.role) {
    query = { city: req.query.city, role: req.query.role, isactive: true };
  } else if (req.query.city) {
    query = { city: req.query.city, isactive: true };
  } else if (req.query.role) {
    query = { role: req.query.role, isactive: true };
  } else if (req.query.isactive) {
    let isactive = req.query.isactive;
    if (isactive == "false") {
      isactive = false;
    } else {
      isactive = true;
    }
    query = { isactive };
  } else {
    query = {
      isactive: true,
    };
  }
  try {
    const client = await mongodb.connect(mongoUrl);
    const dbObj = client.db("dashBoard");
    const output = await dbObj.collection("adminUser").find(query).toArray();
    res.status(200).send(output);
    client.close(); // Close the MongoDB connection
  } catch (err) {
    console.log(err);
    res.status(500).send("Error occurred");
  }
});

//get Perticular User
app.get("/user/:id", async (req, res) => {
  let id = new mongo.ObjectId(req.params.id);
  try {
    const client = await mongodb.connect(mongoUrl);
    const dbObj = client.db("dashBoard");
    const output = await dbObj
      .collection("adminUser")
      .find({ _id: id })
      .toArray();
    res.status(200).send(output);
    client.close(); // Close the MongoDB connection
  } catch (err) {
    console.log(err);
    res.status(500).send("Error occurred");
  }
});

//add User
app.post("/addUser", async (req, res) => {
    let data={
        name:req.body.name,
        city:req.body.city,
        phone:req.body.phone,
        role:req.body.role?req.body.role:"User",
        isactive:true
    }
  try {
    const client = await mongodb.connect(mongoUrl);
    const dbObj = client.db("dashBoard");
    await dbObj.collection("adminUser").insertOne(data);
    res.redirect('/');
    client.close(); // Close the MongoDB connection
  } catch (err) {
    console.log(err);
    res.status(500).send("Error occurred");
  }
});

//Update User
app.put("/updateUser", async (req, res) => {
  try {
    const client = await mongodb.connect(mongoUrl);
    const dbObj = client.db("dashBoard");
    await dbObj
      .collection("adminUser")
      .updateOne({ _id: new mongo.ObjectId(req.body._id)},
      {
        $set:{
            name:req.body.name,
            city:req.body.city,
            phone:req.body.phone,
            role:req.body.role,
            isactive:true
        }
      });
    res.status(200).send("Data Updated");
    client.close(); // Close the MongoDB connection
  } catch (err) {
    console.log(err);
    res.status(500).send("Error occurred");
  }
});

//hard Delete User
app.delete("/deleteUser/:id", async (req, res) => {
    let id = new mongo.ObjectId(req.params.id);
    try {
        const client = await mongodb.connect(mongoUrl);
        const dbObj = client.db("dashBoard");
        const result = await dbObj.collection("adminUser").deleteOne({ _id: id });
        
        if (result.deletedCount === 1) {
            res.status(200).send('User Removed');
        } else {
            res.status(404).send('User Not Found');
        }

        client.close(); // Close the MongoDB connection
    } catch (err) {
        console.log(err);
        res.status(500).send("Error occurred");
    }
});


  //User Aeactivated
  app.put("/deactivateUser", async (req, res) => {
    try {
      const client = await mongodb.connect(mongoUrl);
      const dbObj = client.db("dashBoard");
      await dbObj
        .collection("adminUser")
        .updateOne({ _id: new mongo.ObjectId(req.body._id)},
        {
          $set:{
              isactive:false
          }
        });
      res.status(200).send("User Deactivated");
      client.close(); // Close the MongoDB connection
    } catch (err) {
      console.log(err);
      res.status(500).send("Error occurred");
    }
  });

  //User Activated
  app.put("/activateUser", async (req, res) => {
    try {
      const client = await mongodb.connect(mongoUrl);
      const dbObj = client.db("dashBoard");
      await dbObj
        .collection("adminUser")
        .updateOne({ _id: new mongo.ObjectId(req.body._id)},
        {
          $set:{
              isactive:true
          }
        });
      res.status(200).send("User Activated");
      client.close(); // Close the MongoDB connection
    } catch (err) {
      console.log(err);
      res.status(500).send("Error occurred");
    }
  });


app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
