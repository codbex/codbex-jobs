import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface JobRoleEntity {
    readonly Id: number;
    Name?: string;
}

export interface JobRoleCreateEntity {
    readonly Name?: string;
}

export interface JobRoleUpdateEntity extends JobRoleCreateEntity {
    readonly Id: number;
}

export interface JobRoleEntityOptions {
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
    $select?: (keyof JobRoleEntity)[],
    $sort?: string | (keyof JobRoleEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobRoleEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobRoleEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobRoleUpdateEntityEvent extends JobRoleEntityEvent {
    readonly previousEntity: JobRoleEntity;
}

export class JobRoleRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_JOBROLE",
        properties: [
            {
                name: "Id",
                column: "JOBROLE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "JOBROLE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobRoleRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobRoleEntityOptions): JobRoleEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): JobRoleEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: JobRoleCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_JOBROLE",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBROLE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobRoleUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_JOBROLE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBROLE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobRoleCreateEntity | JobRoleUpdateEntity): number {
        const id = (entity as JobRoleUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobRoleUpdateEntity);
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
            table: "CODBEX_JOBROLE",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBROLE_ID",
                value: id
            }
        });
    }

    public count(options?: JobRoleEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_JOBROLE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobRoleEntityEvent | JobRoleUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-entities-JobRole", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-entities-JobRole").send(JSON.stringify(data));
    }
}
