import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface JobAssignmentEntity {
    readonly Id: number;
    Number?: string;
    JobTitle?: string;
    HireDate?: Date;
    Organization?: number;
    Department?: number;
    Manager?: number;
    JobStatus?: number;
}

export interface JobAssignmentCreateEntity {
    readonly JobTitle?: string;
    readonly HireDate?: Date;
    readonly Organization?: number;
    readonly Department?: number;
    readonly Manager?: number;
    readonly JobStatus?: number;
}

export interface JobAssignmentUpdateEntity extends JobAssignmentCreateEntity {
    readonly Id: number;
}

export interface JobAssignmentEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Number?: string | string[];
            JobTitle?: string | string[];
            HireDate?: Date | Date[];
            Organization?: number | number[];
            Department?: number | number[];
            Manager?: number | number[];
            JobStatus?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            JobTitle?: string | string[];
            HireDate?: Date | Date[];
            Organization?: number | number[];
            Department?: number | number[];
            Manager?: number | number[];
            JobStatus?: number | number[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            JobTitle?: string;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            JobTitle?: string;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            JobTitle?: string;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            JobTitle?: string;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            JobTitle?: string;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
    },
    $select?: (keyof JobAssignmentEntity)[],
    $sort?: string | (keyof JobAssignmentEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobAssignmentEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobAssignmentEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobAssignmentUpdateEntityEvent extends JobAssignmentEntityEvent {
    readonly previousEntity: JobAssignmentEntity;
}

export class JobAssignmentRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_JOBDETAILS",
        properties: [
            {
                name: "Id",
                column: "JOBDETAILS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Number",
                column: "JOBDETAILS_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "JobTitle",
                column: "JOBDETAILS_JOBTITLE",
                type: "VARCHAR",
            },
            {
                name: "HireDate",
                column: "JOBDETAILS_HIREDATE",
                type: "DATE",
            },
            {
                name: "Organization",
                column: "JOBDETAILS_ORGANIZATION",
                type: "INTEGER",
            },
            {
                name: "Department",
                column: "JOBDETAILS_DEPARTMENT",
                type: "INTEGER",
            },
            {
                name: "Manager",
                column: "JOBDETAILS_MANAGER",
                type: "INTEGER",
            },
            {
                name: "JobStatus",
                column: "JOBDETAILS_JOBSTATUS",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobAssignmentRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobAssignmentEntityOptions): JobAssignmentEntity[] {
        return this.dao.list(options).map((e: JobAssignmentEntity) => {
            EntityUtils.setDate(e, "HireDate");
            return e;
        });
    }

    public findById(id: number): JobAssignmentEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "HireDate");
        return entity ?? undefined;
    }

    public create(entity: JobAssignmentCreateEntity): number {
        EntityUtils.setLocalDate(entity, "HireDate");
        // @ts-ignore
        (entity as JobAssignmentEntity).Number = new NumberGeneratorService().generate(25);
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_JOBDETAILS",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBDETAILS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobAssignmentUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "HireDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_JOBDETAILS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBDETAILS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobAssignmentCreateEntity | JobAssignmentUpdateEntity): number {
        const id = (entity as JobAssignmentUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobAssignmentUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_JOBDETAILS",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBDETAILS_ID",
                value: id
            }
        });
    }

    public count(options?: JobAssignmentEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_JOBDETAILS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobAssignmentEntityEvent | JobAssignmentUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-entities-JobAssignment", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-entities-JobAssignment").send(JSON.stringify(data));
    }
}
