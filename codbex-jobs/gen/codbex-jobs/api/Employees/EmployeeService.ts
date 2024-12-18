import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { EmployeeRepository, EmployeeEntityOptions } from "../../dao/Employees/EmployeeRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-jobs-Employees-Employee", ["validate"]);

@Controller
class EmployeeService {

    private readonly repository = new EmployeeRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: EmployeeEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-jobs/gen/codbex-jobs/api/Employees/EmployeeService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("Employee not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("Employee not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private validateEntity(entity: any): void {
        if (entity.FirstName === null || entity.FirstName === undefined) {
            throw new ValidationError(`The 'FirstName' property is required, provide a valid value`);
        }
        if (entity.FirstName?.length > 50) {
            throw new ValidationError(`The 'FirstName' exceeds the maximum length of [50] characters`);
        }
        if (entity.MiddleName?.length > 50) {
            throw new ValidationError(`The 'MiddleName' exceeds the maximum length of [50] characters`);
        }
        if (entity.LastName === null || entity.LastName === undefined) {
            throw new ValidationError(`The 'LastName' property is required, provide a valid value`);
        }
        if (entity.LastName?.length > 50) {
            throw new ValidationError(`The 'LastName' exceeds the maximum length of [50] characters`);
        }
        if (entity.Name?.length > 70) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [70] characters`);
        }
        if (entity.BirthDate === null || entity.BirthDate === undefined) {
            throw new ValidationError(`The 'BirthDate' property is required, provide a valid value`);
        }
        if (entity.EGN === null || entity.EGN === undefined) {
            throw new ValidationError(`The 'EGN' property is required, provide a valid value`);
        }
        if (entity.EGN?.length > 10) {
            throw new ValidationError(`The 'EGN' exceeds the maximum length of [10] characters`);
        }
        if (entity.Gender === null || entity.Gender === undefined) {
            throw new ValidationError(`The 'Gender' property is required, provide a valid value`);
        }
        if (entity.Nationality === null || entity.Nationality === undefined) {
            throw new ValidationError(`The 'Nationality' property is required, provide a valid value`);
        }
        if (entity.MartialStatus === null || entity.MartialStatus === undefined) {
            throw new ValidationError(`The 'MartialStatus' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
