import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { JobApplicationRepository, JobApplicationEntityOptions } from "../../dao/JobOffer/JobApplicationRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-jobs-JobOffer-JobApplication", ["validate"]);

@Controller
class JobApplicationService {

    private readonly repository = new JobApplicationRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: JobApplicationEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            let Offer = parseInt(ctx.queryParameters.Offer);
            Offer = isNaN(Offer) ? ctx.queryParameters.Offer : Offer;

            if (Offer !== undefined) {
                options.$filter = {
                    equals: {
                        Offer: Offer
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
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-jobs/gen/codbex-jobs/api/JobOffer/JobApplicationService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("JobApplication not found");
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
                HttpUtils.sendResponseNotFound("JobApplication not found");
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
        if (entity.Offer === null || entity.Offer === undefined) {
            throw new ValidationError(`The 'Offer' property is required, provide a valid value`);
        }
        if (entity.Status === null || entity.Status === undefined) {
            throw new ValidationError(`The 'Status' property is required, provide a valid value`);
        }
        if (entity.Names === null || entity.Names === undefined) {
            throw new ValidationError(`The 'Names' property is required, provide a valid value`);
        }
        if (entity.Names?.length > 50) {
            throw new ValidationError(`The 'Names' exceeds the maximum length of [50] characters`);
        }
        if (entity.Email === null || entity.Email === undefined) {
            throw new ValidationError(`The 'Email' property is required, provide a valid value`);
        }
        if (entity.Email?.length > 50) {
            throw new ValidationError(`The 'Email' exceeds the maximum length of [50] characters`);
        }
        if (entity.PhoneNumber === null || entity.PhoneNumber === undefined) {
            throw new ValidationError(`The 'PhoneNumber' property is required, provide a valid value`);
        }
        if (entity.PhoneNumber?.length > 20) {
            throw new ValidationError(`The 'PhoneNumber' exceeds the maximum length of [20] characters`);
        }
        if (entity.CV === null || entity.CV === undefined) {
            throw new ValidationError(`The 'CV' property is required, provide a valid value`);
        }
        if (entity.CV?.length > 500) {
            throw new ValidationError(`The 'CV' exceeds the maximum length of [500] characters`);
        }
        if (entity.Comment?.length > 2000) {
            throw new ValidationError(`The 'Comment' exceeds the maximum length of [2000] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
