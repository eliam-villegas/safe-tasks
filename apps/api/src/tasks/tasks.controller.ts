import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('tasks')
export class TasksController {

    @Get()
    findAll(){
        return [ {id: 1, title: "Aprender NestJS", done: false},
                 {id: 2, title: "Crear Endpoint", done: true},
        ];
    }

    @Post()
    create(@Body() task: any){
        return {
            message: "Tarea recibida",
            data: task,
        };
    }

}
