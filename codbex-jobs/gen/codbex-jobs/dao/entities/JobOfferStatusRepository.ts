import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface JobOfferStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface JobOfferStatusCreateEntity {
    readonly Name?: string;
}

export interface JobOfferStatusUpdateEntity extends JobOfferStatusCreateEntity {
    readonly Id: number;
}

export interface JobOfferStatusEntityOptions {
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
    $select?: (keyof JobOfferStatusEntity)[],
    $sort?: string | (keyof JobOfferStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobOfferStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobOfferStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobOfferStatusUpdateEntityEvent extends JobOfferStatusEntityEvent {
    readonly previousEntity: JobOfferStatusEntity;
}

export class JobOfferStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_JOBOFFERSTATUS",
        properties: [
            {
                name: "Id",
                column: "JOBOFFERSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "JOBOFFERSTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobOfferStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobOfferStatusEntityOptions): JobOfferStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): JobOfferStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: JobOfferStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_JOBOFFERSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBOFFERSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobOfferStatusUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_JOBOFFERSTATUS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBOFFERSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobOfferStatusCreateEntity | JobOfferStatusUpdateEntity): number {
        const id = (entity as JobOfferStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobOfferStatusUpdateEntity);
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
            table: "CODBEX_JOBOFFERSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBOFFERSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: JobOfferStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_JOBOFFERSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobOfferStatusEntityEvent | JobOfferStatusUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-entities-JobOfferStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-entities-JobOfferStatus").send(JSON.stringify(data));
    }
}
