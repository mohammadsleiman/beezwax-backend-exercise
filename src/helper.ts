import knex from "knex";

const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./db/transponders.db",
  },
  useNullAsDefault: true,
});

module.exports = {
    getTransponderRootsWithChildren,
    getTransponderData,
    getTransponderDataById,
    getTransponderCount,
    getTransponderChildCountById,
    getTransponderRootsIds,
    getTransponderRelationsData,
};

//Add 'child' property to transponders
function addTransponderChildrenField(transponderData: any){
    for(var i = 0; i<transponderData.length; i++){
        transponderData[i]['children'] = [];
    }
    return(transponderData);
}

//Create map of transponder id to index of corresponding transponder in transponder data (array)
//Makes lookup of transponder in transponderData array O(1)
function getTransponderIdtoIndexMap(transponderData: any){
    var transponderIdIndex: any = {};
    for(var i = 0; i<transponderData.length; i++){
        transponderIdIndex[transponderData[i].id] = i;
    }
    return transponderIdIndex;
}

//Iterates over relationships in 'transponderRelation' and adds child transponder data to parent transponders
function getTranspondersWithChildren(transponderData:any,  transponderRelations: any ){
    transponderData = addTransponderChildrenField(transponderData);
    var transponderIdIndex = getTransponderIdtoIndexMap(transponderData);
    for(var i = 0; i< transponderRelations.length; i++ ){
        var parentId = transponderRelations[i]["parentId"], childId = transponderRelations[i]["childId"];
        var parentTransponder = transponderData[transponderIdIndex[parentId]], childTransponder = transponderData[transponderIdIndex[childId]];
        parentTransponder["children"].push(childTransponder);
    }
    return transponderData;
}

//Filters transponders by given id's
function getTranspondersByIds(transponderData: any, transponderIds: any){
    var transponderIdIndex:any = getTransponderIdtoIndexMap(transponderData);
    var transponders:any = [];
    for(var i = 0; i < transponderIds.length; i++){
        var transponderId = transponderIds[i].id;
        if(transponderId in transponderIdIndex){
            transponders.push(transponderData[transponderIdIndex[transponderId]]);
        }
    }
    return transponders;
}

//Gets all transponders with children included in O(n + m), (n is number of transponders in transponders table, m is number of relationships in transponder_relations table)
//Recursive method accessing DB for children is O(nlogn), n visits of tree, O(logn) lookup time for ID's in SQL according to online
function getTransponderRootsWithChildren(transponderData: any, transponderRelations: any, transponderRootsIds: any){
    //Adds children property with array of children to transponders
    var transpondersWithChildren = getTranspondersWithChildren(transponderData, transponderRelations);
   
    //Iterates over roots in 'transponderRootsIds' and adds root transponders to 'transponderRoots'
    var transponderRoots = getTranspondersByIds(transpondersWithChildren, transponderRootsIds);
    return transponderRoots;
}

//Gets count of all transponders in transponders table
async function getTransponderCount(){
    const transponderCount = await db
        .count()
        .from('transponders');
    return transponderCount;
}

//Gets transponder with specified Id in transponders table
async function getTransponderDataById(id: Number){
    const transponderData = await db.select('*')
        .first()
        .from('transponders')
        .where('id', '=', `${id}`);
    return transponderData;
}

//Gets count of transponder children with specified Id in transponders table
async function getTransponderChildCountById(id: Number){
    const transponderChildCount = await db.count()
        .from('transponder_relations')
        .where('transponder_relations.parentId', '=' , `${id}`);
    return transponderChildCount;
}

//Gets id's of transponders with no parent transponder (roots)
//Filters out transponders in transponders table with matching id's in 'child' column of transponders_relations table
async function getTransponderRootsIds(){
    const transponderRoots = await db
    .select('id')
    .from(
        db
        .select('id', 'name')
        .where('id', 'not in', db.select('childId').from('transponder_relations'))
        .from('transponders')
        .as('roots'));
    return transponderRoots;
}

//Gets all transponders in transponders table
async function getTransponderData(){
    const transponderData = await db
    .select('*')
    .from('transponders');
    return transponderData;
}

//Gets all parent-child pairs in transponder_relations table
async function getTransponderRelationsData(){
    const transponderRelationsData = await db
    .select('*')
    .from('transponder_relations');
    return transponderRelationsData;
}