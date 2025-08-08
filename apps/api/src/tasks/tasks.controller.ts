import {Controller, Request, UsePipes, ValidationPipe, Param, Get, Post, Body, Patch, Delete, UseGuards} from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";
import {TasksService} from "./tasks.service";
import {UpdateTaskDto} from "./update-task.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AdminGuard} from "../auth/admin.guard"

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    //endpoints user

    @Get()
    async findAll(@Request() req){
        return await this.tasksService.findAll(req.user.userId);
    }

    @Get(':id')
    async findOne(@Param("id") id:string, @Request() req){
        return await this.tasksService.findOne(Number(id), req.user.userId);
    }

    @Post()
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}))
    async create(@Body() task: CreateTaskDto, @Request() req){
        return await this.tasksService.createTask(task, req.user.userId);
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}))
    async update(@Param("id") id:string, @Body() data: UpdateTaskDto, @Request() req){
        return await this.tasksService.updateTask(Number(id), req.user.userId, data);
    }

    @Delete(":id")
    async delete(@Param("id") id:string, @Request() req){
        return await this.tasksService.delete(Number(id), req.user.userId);

    }

    //Fin endpoints user

    //Endpoints de admin

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get("admin/all-tasks")
    async findAllTasksforAdmin(){
        return await this.tasksService.findAllTasks();
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Delete("admin/:id")
    async deleteTask(@Param("id") id:string){
        return await this.tasksService.deleteAnyTask(Number(id));
    }





}
