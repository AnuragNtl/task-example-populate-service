class Property {

    constructor(k, v, t, o) {
        this.k = k;
        this.v = v;
        this.t = t;
        this.o = o;
    }

    key() {
        return this.k;
    }

    value() {
        return this.v;
    }
    
    type() {
        return this.t;
    }

    options() {
        return this.o;
    }
};

class Task {

    constructor(data) {
        this.tasks = [];
        if(data) {
            if(data.taskList) {
                data.taskList.forEach(item => {
                    if(typeof(item) != "object") return;
                    this.tasks.push(new SubgraphDetails(parseInt(item.id), item.description));
                });
            }
            this.propertyList = [];
            for(let i in data)
                if(typeof(data[i]) != "object" && i != "id")
                    this.propertyList.push(new Property(i, data[i], typeof(data[i])));
                else if(i != "taskList") {
                    if(Array.isArray(data[i]) && data[i].length > 0)
                        this.propertyList.push(new Property(i, data[i][0], typeof(data[i]), data[i]));
                    else if(data[i].options && data[i].value) 
                        this.propertyList.push(new Property(i, data[i].value, typeof(data[i]), data[i].options));
                }
            this.id = parseInt(data.id);
        }
    }

    taskList() {
        return this.tasks;
    }

    properties() {
        return this.propertyList;
    }

    id() {
        return this.id;
    }

};

class UpdateStatus {

    constructor(m, s) {
        this.m = m;
        this.s = s;
    }

    message() {

        return this.m;
    }

    status() {

        return this.s;
    }
};

class SubgraphDetails {

    constructor(i,d) {

        this.i = i;
        if(d) {
            this.d = d;
        } else {
            this.d = "Id = " + i;
        }
    }

    taskId() {

        return this.i;
    }

    description() {
        return this.d;
    }
};


module.exports = { Property: Property, Task: Task, UpdateStatus: UpdateStatus};

