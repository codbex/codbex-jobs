import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { JobAssignmentRepository, JobAssignmentEntityOptions } from "../../dao/Employees/JobAssignmentRepository";
import { user } from "sdk/security"
import { ForbiddenError } from "../utils/ForbiddenError";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

const validationModules = await Extensions.loadExtensionModules("codbex-jobs-Employees-JobAssignment", ["validate"]);

@Controller
class JobAssignmentService {

    private readonly repository = new JobAssignmentRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const options: JobAssignmentEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            let Employee = parseInt(ctx.queryParameters.Employee);
            Employee = isNaN(Employee) ? ctx.queryParameters.Employee : Employee;

            if (Employee !== undefined) {
                options.$filter = {
                    equals: {
                        Employee: Employee
                    }
                };
            }

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.checkPermissions("write");
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-jobs/gen/codbex-jobs/api/Employees/JobAssignmentService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            this.checkPermissions("read");
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            this.checkPermissions("read");
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            this.checkPermissions("read");
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("JobAssignment not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            this.checkPermissions("write");
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
            this.checkPermissions("write");
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("JobAssignment not found");
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

    private checkPermissions(operationType: string) {
        if (operationType === "read" && !(user.isInRole("codbex-jobs.Employees.JobAssignmentReadOnly") || user.isInRole("codbex-jobs.Employees.JobAssignmentFullAccess"))) {
            throw new ForbiddenError();
        }
        if (operationType === "write" && !user.isInRole("codbex-jobs.Employees.JobAssignmentFullAccess")) {
            throw new ForbiddenError();
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Number?.length > 20) {
            throw new ValidationError(`The 'Number' exceeds the maximum length of [20] characters`);
        }
        if (entity.StartDate === null || entity.StartDate === undefined) {
            throw new ValidationError(`The 'StartDate' property is required, provide a valid value`);
        }
        if (entity.Employee === null || entity.Employee === undefined) {
            throw new ValidationError(`The 'Employee' property is required, provide a valid value`);
        }
        if (entity.Organization === null || entity.Organization === undefined) {
            throw new ValidationError(`The 'Organization' property is required, provide a valid value`);
        }
        if (entity.Department === null || entity.Department === undefined) {
            throw new ValidationError(`The 'Department' property is required, provide a valid value`);
        }
        if (entity.JobPosition === null || entity.JobPosition === undefined) {
            throw new ValidationError(`The 'JobPosition' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
