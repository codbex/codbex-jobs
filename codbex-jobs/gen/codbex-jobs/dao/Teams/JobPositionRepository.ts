import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

export interface JobPositionEntity {
    readonly Id: number;
    Number?: string;
    Role?: number;
    Status?: number;
    Type?: number;
    Team?: number;
    DateOpened?: Date;
    DateClosed?: Date;
    DaysOpened?: number;
}

export interface JobPositionCreateEntity {
    readonly Role?: number;
    readonly Status?: number;
    readonly Type?: number;
    readonly Team?: number;
    readonly DateOpened?: Date;
    readonly DateClosed?: Date;
}

export interface JobPositionUpdateEntity extends JobPositionCreateEntity {
    readonly Id: number;
}

export interface JobPositionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Number?: string | string[];
            Role?: number | number[];
            Status?: number | number[];
            Type?: number | number[];
            Team?: number | number[];
            DateOpened?: Date | Date[];
            DateClosed?: Date | Date[];
            DaysOpened?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            Role?: number | number[];
            Status?: number | number[];
            Type?: number | number[];
            Team?: number | number[];
            DateOpened?: Date | Date[];
            DateClosed?: Date | Date[];
            DaysOpened?: number | number[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            Role?: number;
            Status?: number;
            Type?: number;
            Team?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            DaysOpened?: number;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            Role?: number;
            Status?: number;
            Type?: number;
            Team?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            DaysOpened?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            Role?: number;
            Status?: number;
            Type?: number;
            Team?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            DaysOpened?: number;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            Role?: number;
            Status?: number;
            Type?: number;
            Team?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            DaysOpened?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            Role?: number;
            Status?: number;
            Type?: number;
            Team?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            DaysOpened?: number;
        };
    },
    $select?: (keyof JobPositionEntity)[],
    $sort?: string | (keyof JobPositionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobPositionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobPositionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobPositionUpdateEntityEvent extends JobPositionEntityEvent {
    readonly previousEntity: JobPositionEntity;
}

export class JobPositionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_JOBPOSITION",
        properties: [
            {
                name: "Id",
                column: "JOBPOSITION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Number",
                column: "JOBPOSITION_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Role",
                column: "JOBPOSITION_ROLE",
                type: "INTEGER",
            },
            {
                name: "Status",
                column: "JOBPOSITION_STATUS",
                type: "INTEGER",
            },
            {
                name: "Type",
                column: "JOBPOSITION_TYPE",
                type: "INTEGER",
            },
            {
                name: "Team",
                column: "JOBPOSITION_TEAM",
                type: "INTEGER",
            },
            {
                name: "DateOpened",
                column: "JOBPOSITION_DATEOPENED",
                type: "DATE",
            },
            {
                name: "DateClosed",
                column: "JOBPOSITION_DATECLOSED",
                type: "DATE",
            },
            {
                name: "DaysOpened",
                column: "JOBPOSITION_DAYSOPENED",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobPositionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobPositionEntityOptions): JobPositionEntity[] {
        return this.dao.list(options).map((e: JobPositionEntity) => {
            EntityUtils.setDate(e, "DateOpened");
            EntityUtils.setDate(e, "DateClosed");
            return e;
        });
    }

    public findById(id: number): JobPositionEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "DateOpened");
        EntityUtils.setDate(entity, "DateClosed");
        return entity ?? undefined;
    }

    public create(entity: JobPositionCreateEntity): number {
        EntityUtils.setLocalDate(entity, "DateOpened");
        EntityUtils.setLocalDate(entity, "DateClosed");
        // @ts-ignore
        (entity as JobPositionEntity).Number = new NumberGeneratorService().generate(26);
        if (entity.DaysOpened === undefined || entity.DaysOpened === null) {
            (entity as JobPositionEntity).DaysOpened = 0;
        }
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_JOBPOSITION",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBPOSITION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobPositionUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "DateOpened");
        // EntityUtils.setLocalDate(entity, "DateClosed");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_JOBPOSITION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBPOSITION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobPositionCreateEntity | JobPositionUpdateEntity): number {
        const id = (entity as JobPositionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobPositionUpdateEntity);
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
            table: "CODBEX_JOBPOSITION",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBPOSITION_ID",
                value: id
            }
        });
    }

    public count(options?: JobPositionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_JOBPOSITION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobPositionEntityEvent | JobPositionUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-Teams-JobPosition", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-Teams-JobPosition").send(JSON.stringify(data));
    }
}
