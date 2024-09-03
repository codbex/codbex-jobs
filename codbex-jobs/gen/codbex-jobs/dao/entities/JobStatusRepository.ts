import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface JobStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface JobStatusCreateEntity {
    readonly Name?: string;
}

export interface JobStatusUpdateEntity extends JobStatusCreateEntity {
    readonly Id: number;
}

export interface JobStatusEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof JobStatusEntity)[],
    $sort?: string | (keyof JobStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobStatusUpdateEntityEvent extends JobStatusEntityEvent {
    readonly previousEntity: JobStatusEntity;
}

export class JobStatusRepository {

    private static readonly DEFINITION = {
        table: "JOBSTATUS",
        properties: [
            {
                name: "Id",
                column: "JOBSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "JOBSTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobStatusEntityOptions): JobStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): JobStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: JobStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "JOBSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobStatusUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "JOBSTATUS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobStatusCreateEntity | JobStatusUpdateEntity): number {
        const id = (entity as JobStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobStatusUpdateEntity);
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
            table: "JOBSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: JobStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "JOBSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobStatusEntityEvent | JobStatusUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-entities-JobStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-entities-JobStatus").send(JSON.stringify(data));
    }
}
