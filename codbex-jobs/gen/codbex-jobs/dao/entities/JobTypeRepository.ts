import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface JobTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface JobTypeCreateEntity {
    readonly Name?: string;
}

export interface JobTypeUpdateEntity extends JobTypeCreateEntity {
    readonly Id: number;
}

export interface JobTypeEntityOptions {
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
    $select?: (keyof JobTypeEntity)[],
    $sort?: string | (keyof JobTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobTypeUpdateEntityEvent extends JobTypeEntityEvent {
    readonly previousEntity: JobTypeEntity;
}

export class JobTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_JOBTYPE",
        properties: [
            {
                name: "Id",
                column: "JOBTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "JOBTYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobTypeEntityOptions): JobTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): JobTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: JobTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_JOBTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_JOBTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobTypeCreateEntity | JobTypeUpdateEntity): number {
        const id = (entity as JobTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobTypeUpdateEntity);
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
            table: "CODBEX_JOBTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: JobTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_JOBTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobTypeEntityEvent | JobTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-entities-JobType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-entities-JobType").send(JSON.stringify(data));
    }
}
