import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface JobDetailsEntity {
    readonly Id: number;
    JobTitle?: string;
    HireDate?: Date;
    Department?: number;
    Manager?: number;
    JobStatus?: number;
}

export interface JobDetailsCreateEntity {
    readonly JobTitle?: string;
    readonly HireDate?: Date;
    readonly Department?: number;
    readonly Manager?: number;
    readonly JobStatus?: number;
}

export interface JobDetailsUpdateEntity extends JobDetailsCreateEntity {
    readonly Id: number;
}

export interface JobDetailsEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            JobTitle?: string | string[];
            HireDate?: Date | Date[];
            Department?: number | number[];
            Manager?: number | number[];
            JobStatus?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            JobTitle?: string | string[];
            HireDate?: Date | Date[];
            Department?: number | number[];
            Manager?: number | number[];
            JobStatus?: number | number[];
        };
        contains?: {
            Id?: number;
            JobTitle?: string;
            HireDate?: Date;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
        greaterThan?: {
            Id?: number;
            JobTitle?: string;
            HireDate?: Date;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            JobTitle?: string;
            HireDate?: Date;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
        lessThan?: {
            Id?: number;
            JobTitle?: string;
            HireDate?: Date;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            JobTitle?: string;
            HireDate?: Date;
            Department?: number;
            Manager?: number;
            JobStatus?: number;
        };
    },
    $select?: (keyof JobDetailsEntity)[],
    $sort?: string | (keyof JobDetailsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobDetailsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobDetailsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobDetailsUpdateEntityEvent extends JobDetailsEntityEvent {
    readonly previousEntity: JobDetailsEntity;
}

export class JobDetailsRepository {

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
        this.dao = daoApi.create(JobDetailsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobDetailsEntityOptions): JobDetailsEntity[] {
        return this.dao.list(options).map((e: JobDetailsEntity) => {
            EntityUtils.setDate(e, "HireDate");
            return e;
        });
    }

    public findById(id: number): JobDetailsEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "HireDate");
        return entity ?? undefined;
    }

    public create(entity: JobDetailsCreateEntity): number {
        EntityUtils.setLocalDate(entity, "HireDate");
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

    public update(entity: JobDetailsUpdateEntity): void {
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

    public upsert(entity: JobDetailsCreateEntity | JobDetailsUpdateEntity): number {
        const id = (entity as JobDetailsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobDetailsUpdateEntity);
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

    public count(options?: JobDetailsEntityOptions): number {
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

    private async triggerEvent(data: JobDetailsEntityEvent | JobDetailsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-entities-JobDetails", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-entities-JobDetails").send(JSON.stringify(data));
    }
}
