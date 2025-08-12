import { IsBoolean, IsNotEmpty, IsString} from 'class-validator';

// Un DTO (Data Transfer Object sirve para transformar inputs en outputs deseados
// En este caso se utiliza para validar que es un String no vacio en el campo de title
// Y en done se asegura que es de tipo boolean.

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsBoolean()
    done: boolean;
}