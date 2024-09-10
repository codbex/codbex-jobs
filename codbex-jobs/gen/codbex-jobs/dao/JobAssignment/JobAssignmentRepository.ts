import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface JobAssignmentEntity {
    readonly Id: number;
    Number?: string;
    Contract?: number;
    HireDate?: Date;
    Organization?: number;
    Department?: number;
    Team?: number;
    Manager?: number;
    JobPosition?: number;
}

export interface JobAssignmentCreateEntity {
    readonly Contract?: number;
    readonly HireDate?: Date;
    readonly Organization?: number;
    readonly Department?: number;
    readonly Team?: number;
    readonly Manager?: number;
    readonly JobPosition?: number;
}

export interface JobAssignmentUpdateEntity extends JobAssignmentCreateEntity {
    readonly Id: number;
}

export interface JobAssignmentEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Number?: string | string[];
            Contract?: number | number[];
            HireDate?: Date | Date[];
            Organization?: number | number[];
            Department?: number | number[];
            Team?: number | number[];
            Manager?: number | number[];
            JobPosition?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            Contract?: number | number[];
            HireDate?: Date | Date[];
            Organization?: number | number[];
            Department?: number | number[];
            Team?: number | number[];
            Manager?: number | number[];
            JobPosition?: number | number[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            Contract?: number;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Team?: number;
            Manager?: number;
            JobPosition?: number;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            Contract?: number;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Team?: number;
            Manager?: number;
            JobPosition?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            Contract?: number;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Team?: number;
            Manager?: number;
            JobPosition?: number;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            Contract?: number;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Team?: number;
            Manager?: number;
            JobPosition?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            Contract?: number;
            HireDate?: Date;
            Organization?: number;
            Department?: number;
            Team?: number;
            Manager?: number;
            JobPosition?: number;
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
                name: "Contract",
                column: "JOBDETAILS_CONTRACT",
                type: "INTEGER",
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
                name: "Team",
                column: "JOBDETAILS_TEAM",
                type: "INTEGER",
            },
            {
                name: "Manager",
                column: "JOBDETAILS_MANAGER",
                type: "INTEGER",
            },
            {
                name: "JobPosition",
                column: "JOBDETAILS_JOBPOSITION",
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
        (entity as JobAssignmentEntity).Number = new NumberGeneratorService().generate(27);
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
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-JobAssignment-JobAssignment", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-JobAssignment-JobAssignment").send(JSON.stringify(data));
    }
}