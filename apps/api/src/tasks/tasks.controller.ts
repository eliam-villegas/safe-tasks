import {
    Controller,
    Request,
    UsePipes,
    ValidationPipe,
    Param,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    UseGuards,
    Query, Req
} from '@nestjs/common';
import {CreateTaskDto} from "./dto/create-task.dto";
import {TasksService} from "./tasks.service";
import {UpdateTaskDto} from "./dto/update-task.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AdminGuard} from "../auth/admin.guard"
import {ListTasksDto} from "./dto/list-task.dto";

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    //endpoints user

    @Get()
    findAll(@Query() q: ListTasksDto, @Req() req: any) {
        console.log("[findAll user] sub=", req.user.sub);
        return this.tasksService.findAll(req.user.sub, q);
    }

    @Get(':id')
    async findOne(@Param("id") id:string, @Request() req){
        return await this.tasksService.findOne(Number(id), req.user.sub);
    }

    @Post()
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}))
    async create(@Body() task: CreateTaskDto, @Request() req){
        return await this.tasksService.createTask(task, req.user.sub);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() data: UpdateTaskDto,
        @Req() req: any,
    ) {
        return this.tasksService.updateTask(Number(id), req.user.sub, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: any) {
        return this.tasksService.deleteTask(Number(id), req.user.sub);
    }

    //Fin endpoints user

    //Endpoints de admin

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get("admin/all-tasks")
    async findAllTasksforAdmin(@Query() q: ListTasksDto, @Req() req: any) {
        console.log("[findAll admin] sub=", req.user.sub);
        return await this.tasksService.findAllTasks();
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Delete("admin/:id")
    async deleteTask(@Param("id") id:string){
        return await this.tasksService.deleteAnyTask(Number(id));
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch('admin/:id')
    updateAny(@Param('id') id: string, @Body() dto: UpdateTaskDto){
        return this.tasksService.updateAny(Number(id), dto);
    }
}
