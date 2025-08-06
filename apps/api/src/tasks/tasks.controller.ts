import { Controller, UsePipes, ValidationPipe,Param, Get, Post, Body } from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";
import {TasksService} from "./tasks.service";

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Get()
    findAll(){
        return this.tasksService.findAll();
    }

    @Get(':id')
    findOne(@Param("id") id:string){
        return this.tasksService.findOne(Number(id));
    }

    @Post()
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}))
    create(@Body() task: CreateTaskDto){
        return this.tasksService.createTask(task);
    }

}
