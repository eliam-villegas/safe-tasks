import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import {NotFoundException} from "@nestjs/common";

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe("findAll", () =>{
    let service: TasksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TasksService],
        }).compile();

        service = module.get<TasksService>(TasksService);
    });

    it("should return the list of tasks", async () => {
        jest.spyOn(service["prisma"].task, "findMany").mockResolvedValue([{
            id: 1,
            title: "Tarea mock",
            done: false,
        }]);
        const result = await service.findAll();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);
        expect(result[0].title).toBe("Tarea mock");
    });

});

describe("findOne", () =>{
    let service: TasksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TasksService],
        }).compile();

        service = module.get<TasksService>(TasksService);
    });

    it("should return a empty array of the tasks", async () => {
        jest.spyOn(service["prisma"].task, "findUnique").mockResolvedValue(null);
        await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

});
