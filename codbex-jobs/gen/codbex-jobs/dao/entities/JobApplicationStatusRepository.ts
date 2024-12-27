import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface JobApplicationStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface JobApplicationStatusCreateEntity {
    readonly Name?: string;
}

export interface JobApplicationStatusUpdateEntity extends JobApplicationStatusCreateEntity {
    readonly Id: number;
}

export interface JobApplicationStatusEntityOptions {
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
    $select?: (keyof JobApplicationStatusEntity)[],
    $sort?: string | (keyof JobApplicationStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobApplicationStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobApplicationStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobApplicationStatusUpdateEntityEvent extends JobApplicationStatusEntityEvent {
    readonly previousEntity: JobApplicationStatusEntity;
}

export class JobApplicationStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_JOBAPPLICATIONSTATUS",
        properties: [
            {
                name: "Id",
                column: "JOBAPPLICATIONSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "JOBAPPLICATIONSTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobApplicationStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobApplicationStatusEntityOptions): JobApplicationStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): JobApplicationStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: JobApplicationStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_JOBAPPLICATIONSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBAPPLICATIONSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobApplicationStatusUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_JOBAPPLICATIONSTATUS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBAPPLICATIONSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobApplicationStatusCreateEntity | JobApplicationStatusUpdateEntity): number {
        const id = (entity as JobApplicationStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobApplicationStatusUpdateEntity);
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
            table: "CODBEX_JOBAPPLICATIONSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBAPPLICATIONSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: JobApplicationStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_JOBAPPLICATIONSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobApplicationStatusEntityEvent | JobApplicationStatusUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-entities-JobApplicationStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-entities-JobApplicationStatus").send(JSON.stringify(data));
    }
}
