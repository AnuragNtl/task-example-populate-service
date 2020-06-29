var fetch = require("node-fetch");

const GRAPH_SERVICE_ENDPOINT = "http://localhost:8080/graph"

const GRAPH_GET_PATH = GRAPH_SERVICE_ENDPOINT + "/";
const GRAPH_UPDATE_PATH = GRAPH_SERVICE_ENDPOINT + "/";

const {Task, Property, UpdateStatus} = require("./types.js");

function ExemplefierService() {

}

function getSelectedTask(task, taskId, taskOf) {
    if(taskId == task.id) {
        return {selectedTask: task, taskOf : taskOf};
    }
    if(task.taskList) {
        let selectedTasks = task.taskList.map(subtask => getSelectedTask(subtask, taskId, task)).filter(subtask => subtask != null);
            if(selectedTasks[0]) return selectedTasks[0];
        }
    return null;
}

ExemplefierService.prototype.getGraphResponse = async function(id) {
    let response = await fetch(GRAPH_GET_PATH + id);
    let data = await response.json();
    console.log("Graph response :  ", data);
    return data;
}

ExemplefierService.prototype.getGraph = async function(id, taskId) {

    let data = await this.getGraphResponse(id);
    let selectedTask = data;
    if(taskId) {
        selectedTask = getSelectedTask(data, taskId);
        selectedTask = selectedTask.selectedTask;
    }
    console.log("Selected task is " + JSON.stringify(selectedTask));
    if(selectedTask == null) return null;
    let task = new Task(selectedTask);
    console.log("Got graph : " + JSON.stringify(task));
    return task;
}

ExemplefierService.prototype.getAllGraphIds = async function() {
    let response = await fetch(GRAPH_SERVICE_ENDPOINT)
    let data = await response.json();
    return data;
}

ExemplefierService.prototype.updateGraphChanges = async function(id, oldGraph) {

    let response = await fetch(GRAPH_UPDATE_PATH + id, {
	method: 'put',
	body: JSON.stringify(oldGraph),
	headers: {'Content-Type': 'application/json'}
    });
    let data = await response.json();
    return {data, status: response.status};

}

ExemplefierService.prototype.fetchSelectedItem = function(oldGraph, taskId) {

    let selectedItem = getSelectedTask(oldGraph, taskId);
    if(selectedItem == null) throw "No item with id " + taskId + " found";
    return selectedItem;
}

ExemplefierService.prototype.convertPropertyToItsType = function(value, type) {

    switch(type) {

        case 'boolean': return value == "true";
        case 'number': return parseFloat(value);
        default: return value.toString();
    }


}

ExemplefierService.prototype.updateGraph = async function(id, task) {

    console.log("updating task " + id + " " + JSON.stringify(task));
    let oldGraph = await this.getGraphResponse(id);
    let selectedItem = this.fetchSelectedItem(oldGraph, task.id);
    selectedItem = selectedItem.selectedTask;
    task.properties.forEach(p => {
        p.value = this.convertPropertyToItsType(p.value, p.type);
        if(p.options) {
            selectedItem[p.key] = { value: p.value, options: p.options };
        } else {
            selectedItem[p.key] = p.value
        }
    });
    let {data, status} = await this.updateGraphChanges(id, oldGraph);
    return new UpdateStatus(JSON.stringify(data), status);
}

function randomIdsForAllSubtasks(task) {

    task = Object.assign({}, task);
    task.id = parseInt(Math.random() * 10000 + 1000);
    if(task.taskList) {
        task.taskList = task.taskList.map( subtask => randomIdsForAllSubtasks(subtask));
    }
    return task;

}

ExemplefierService.prototype.duplicateEntry = async function(id, taskId) {
    
    let oldGraph = await this.getGraphResponse(id);
    let selectedItem = this.fetchSelectedItem(oldGraph, taskId);
    let selectedTask = selectedItem.selectedTask;
    let taskOf = selectedItem.taskOf;
    if(!taskOf) throw "No task to contain the duplicate";
    let clonedTask = randomIdsForAllSubtasks(selectedTask);
    console.log(JSON.stringify(clonedTask));
    if(clonedTask.taskList == null) {
        clonedTask.taskList = [];
    }
    taskOf.taskList.push(clonedTask);
    let {data, status} = await this.updateGraphChanges(id, oldGraph);
    return new UpdateStatus(JSON.stringify(data), status);
    
}


module.exports = new ExemplefierService();

