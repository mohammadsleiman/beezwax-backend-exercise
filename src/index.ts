import express, { Express, Request, Response } from "express";
import knex from "knex";
import { join } from "path";
const dbHelper = require ('./helper.ts');

const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./db/transponders.db",
  },
  useNullAsDefault: true,
});

const app: Express = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running at https://localhost:${port}`);
});

app.get('/all', (req: Request, res: Response)=>{
  db.select('*').from('transponders').then((data)=>{
    res.send(data)
  }) 
})
app.get('/addnew', (req: Request, res: Response)=>{
  db.insert({id: 13, name: 'n'}).into('transponders').then((data)=>{
    res.send([{message: "success"}])}
  ).catch((error:any)=>[res.status(500).json({message: "it aint work"})])
})
//GET all transponder data with child transponders included
app.get("/transponders", (req: Request,res: Response)=>{
//db.raw('INSERT INTO transponders (id, name) VALUES (13, "n")');

  Promise.all([dbHelper.getTransponderRootsIds(),dbHelper.getTransponderData(), dbHelper.getTransponderRelationsData()])
  .then((data:any)=>{
    var transponderRootsIds = data[0], transponderData = data[1], transponderRelations = data[2]
    var transponderRoots = dbHelper.getTransponderRootsWithChildren(transponderData, transponderRelations, transponderRootsIds);
    var resObj = {transponders: transponderRoots}
    res.send(resObj)
  })
  .catch((error:any)=>{res.status(500).json({message: "error cannot get transponders"})})
});

//GET count of all transponders if no Id parameter
//GET count of transponder children if valid Id parameter is given
app.get("/count/:id?", (req: Request,res: Response)=>{
  if(req.params.id == null){
    //Gets Count of Transponders in transponders table
    dbHelper.getTransponderCount()
    .then((transponderCount:any)=>{
      let result = {"count": transponderCount[0]['count(*)']}
      res.send(result);
    })
    .catch((error:any)=>{res.status(500).json({message: "error cannot get total count"})})
  } else {
    var paramId = parseInt(req.params.id, 10);
    
    //Checks transponder id validity in transponders table
    dbHelper.getTransponderDataById(paramId)
    .then((matchingId:any)=>{
      if(matchingId != null){

        //Gets transponder child count in transponder_relations table
        dbHelper.getTransponderChildCountById(paramId)
        .then((childCount: any)=>{
          let result = {"count": childCount[0]['count(*)']}
          res.send(result);
        })
        .catch((error: any)=>{res.status(500).json({message: `error while finding child count for transponder with id: ${paramId}` })})
      } else { res.status(404).json({message: `cannot find transponder with id: ${paramId}`})}
    }) 
    .catch((error: any)=>{res.status(500).json({message: `error while finding child count for transponder with id: ${paramId}` })})
  }
})
