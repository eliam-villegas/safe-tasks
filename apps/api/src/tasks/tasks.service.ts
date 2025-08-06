import { Injectable } from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";

@Injectable()
export class TasksService {

    private tasks = [
        {id: 1, title: "Aprender NestJS", done: false},
        {id: 2, title: "Crear Endpoint", done: true},
    ];

    private nextId = 3;

    findAll(){
        return this.tasks;
    }

    findOne(id: number){
        return this.tasks.find((task) => task.id === id);
    }

    createTask(task: CreateTaskDto){
        const newTask = {
            id: this.nextId++,
            ...task,
        };
        this.tasks.push(newTask);
        return newTask;
    }
}
