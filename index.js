
var {Task, Property} = require("./types.js");

var express = require("express");

var {buildSchema} = require("graphql");

var app = express();

var cors = require("cors");

var graphqlHttp = require("express-graphql");

var exemplefierService = require("./exemplefierService.js");

var schema = buildSchema(`

input PropertyInput {
key:String,
value:String,
type:String,
options:[String]
}

input TaskInput {
properties:[PropertyInput],
id:Int!
}

type Property {
key:String!,
value:String,
type:String,
options:[String]
}

type SubgraphDetails {
taskId:Int!,
description:String
}

type Task {
id: Int!,
taskList:[SubgraphDetails],
properties:[Property]
}

type UpdateStatus {
message:String,
status:Int
}

type Query {
getTask(id:String!, taskId:Int): Task,
getAllTaskIds: [String]
}

type Mutation {
updateValues(id:String!, task:TaskInput!) : UpdateStatus
duplicateEntry(id:String!, taskId:Int!) : UpdateStatus
}

`);

var root = {
    getAllTaskIds: exemplefierService.getAllGraphIds, 
    getTask: async ({id, taskId}) => exemplefierService.getGraph(id, taskId),
    updateValues : async ({id, task}) => exemplefierService.updateGraph(id, task),
    duplicateEntry: async ({id, taskId}) => exemplefierService.duplicateEntry(id, taskId)
};

app.use("/graph", cors(), graphqlHttp({schema: schema, rootValue:root, graphiql:true}));
app.listen(8082);

