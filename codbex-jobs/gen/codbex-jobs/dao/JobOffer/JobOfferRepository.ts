import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface JobOfferEntity {
    readonly Id: number;
    JobPosition?: number;
    DaysOpened?: number;
    DateOpened?: Date;
    DateClosed?: Date;
    Status?: number;
}

export interface JobOfferCreateEntity {
    readonly JobPosition?: number;
    readonly DateOpened?: Date;
    readonly DateClosed?: Date;
    readonly Status?: number;
}

export interface JobOfferUpdateEntity extends JobOfferCreateEntity {
    readonly Id: number;
}

export interface JobOfferEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            JobPosition?: number | number[];
            DaysOpened?: number | number[];
            DateOpened?: Date | Date[];
            DateClosed?: Date | Date[];
            Status?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            JobPosition?: number | number[];
            DaysOpened?: number | number[];
            DateOpened?: Date | Date[];
            DateClosed?: Date | Date[];
            Status?: number | number[];
        };
        contains?: {
            Id?: number;
            JobPosition?: number;
            DaysOpened?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            Status?: number;
        };
        greaterThan?: {
            Id?: number;
            JobPosition?: number;
            DaysOpened?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            Status?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            JobPosition?: number;
            DaysOpened?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            Status?: number;
        };
        lessThan?: {
            Id?: number;
            JobPosition?: number;
            DaysOpened?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            Status?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            JobPosition?: number;
            DaysOpened?: number;
            DateOpened?: Date;
            DateClosed?: Date;
            Status?: number;
        };
    },
    $select?: (keyof JobOfferEntity)[],
    $sort?: string | (keyof JobOfferEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobOfferEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobOfferEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobOfferUpdateEntityEvent extends JobOfferEntityEvent {
    readonly previousEntity: JobOfferEntity;
}

export class JobOfferRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_JOBOFFER",
        properties: [
            {
                name: "Id",
                column: "JOBOFFER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "JobPosition",
                column: "JOBOFFER_JOBPOSITION",
                type: "INTEGER",
            },
            {
                name: "DaysOpened",
                column: "JOBOFFER_DAYSOPENED",
                type: "INTEGER",
            },
            {
                name: "DateOpened",
                column: "JOBOFFER_DATEOPENED",
                type: "DATE",
            },
            {
                name: "DateClosed",
                column: "JOBOFFER_DATECLOSED",
                type: "DATE",
            },
            {
                name: "Status",
                column: "JOBOFFER_STATUS",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobOfferRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobOfferEntityOptions): JobOfferEntity[] {
        return this.dao.list(options).map((e: JobOfferEntity) => {
            EntityUtils.setDate(e, "DateOpened");
            EntityUtils.setDate(e, "DateClosed");
            return e;
        });
    }

    public findById(id: number): JobOfferEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "DateOpened");
        EntityUtils.setDate(entity, "DateClosed");
        return entity ?? undefined;
    }

    public create(entity: JobOfferCreateEntity): number {
        EntityUtils.setLocalDate(entity, "DateOpened");
        EntityUtils.setLocalDate(entity, "DateClosed");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_JOBOFFER",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBOFFER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobOfferUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "DateOpened");
        // EntityUtils.setLocalDate(entity, "DateClosed");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_JOBOFFER",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBOFFER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobOfferCreateEntity | JobOfferUpdateEntity): number {
        const id = (entity as JobOfferUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobOfferUpdateEntity);
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
            table: "CODBEX_JOBOFFER",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBOFFER_ID",
                value: id
            }
        });
    }

    public count(options?: JobOfferEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_JOBOFFER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobOfferEntityEvent | JobOfferUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-JobOffer-JobOffer", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-JobOffer-JobOffer").send(JSON.stringify(data));
    }
}
