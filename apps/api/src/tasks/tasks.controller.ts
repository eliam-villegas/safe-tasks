import { Controller, UsePipes, ValidationPipe, Get, Post, Body } from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";

@Controller('tasks')
export class TasksController {

    @Get()
    findAll(){
        return [ {id: 1, title: "Aprender NestJS", done: false},
                 {id: 2, title: "Crear Endpoint", done: true},
        ];
    }

    @Post()
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}))
    create(@Body() task: CreateTaskDto){
        return {
            message: "Tarea válida",
            data: task,
        };
    }

}
