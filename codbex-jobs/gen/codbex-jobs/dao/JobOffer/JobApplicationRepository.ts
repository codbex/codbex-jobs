import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface JobApplicationEntity {
    readonly Id: number;
    Offer?: number;
    Status?: number;
    Names?: string;
    Email?: string;
    PhoneNumber?: string;
    CV?: string;
    Comment?: string;
}

export interface JobApplicationCreateEntity {
    readonly Offer?: number;
    readonly Status?: number;
    readonly Names?: string;
    readonly Email?: string;
    readonly PhoneNumber?: string;
    readonly CV?: string;
    readonly Comment?: string;
}

export interface JobApplicationUpdateEntity extends JobApplicationCreateEntity {
    readonly Id: number;
}

export interface JobApplicationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Offer?: number | number[];
            Status?: number | number[];
            Names?: string | string[];
            Email?: string | string[];
            PhoneNumber?: string | string[];
            CV?: string | string[];
            Comment?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Offer?: number | number[];
            Status?: number | number[];
            Names?: string | string[];
            Email?: string | string[];
            PhoneNumber?: string | string[];
            CV?: string | string[];
            Comment?: string | string[];
        };
        contains?: {
            Id?: number;
            Offer?: number;
            Status?: number;
            Names?: string;
            Email?: string;
            PhoneNumber?: string;
            CV?: string;
            Comment?: string;
        };
        greaterThan?: {
            Id?: number;
            Offer?: number;
            Status?: number;
            Names?: string;
            Email?: string;
            PhoneNumber?: string;
            CV?: string;
            Comment?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Offer?: number;
            Status?: number;
            Names?: string;
            Email?: string;
            PhoneNumber?: string;
            CV?: string;
            Comment?: string;
        };
        lessThan?: {
            Id?: number;
            Offer?: number;
            Status?: number;
            Names?: string;
            Email?: string;
            PhoneNumber?: string;
            CV?: string;
            Comment?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Offer?: number;
            Status?: number;
            Names?: string;
            Email?: string;
            PhoneNumber?: string;
            CV?: string;
            Comment?: string;
        };
    },
    $select?: (keyof JobApplicationEntity)[],
    $sort?: string | (keyof JobApplicationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobApplicationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobApplicationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobApplicationUpdateEntityEvent extends JobApplicationEntityEvent {
    readonly previousEntity: JobApplicationEntity;
}

export class JobApplicationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_JOBAPPLICATION",
        properties: [
            {
                name: "Id",
                column: "JOBAPPLICATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Offer",
                column: "JOBAPPLICATION_JOBOFFER",
                type: "INTEGER",
            },
            {
                name: "Status",
                column: "JOBAPPLICATION_STATUS",
                type: "INTEGER",
            },
            {
                name: "Names",
                column: "JOBAPPLICATION_NAMES",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "JOBAPPLICATION_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "PhoneNumber",
                column: "JOBAPPLICATION_PHONENUMBER",
                type: "VARCHAR",
            },
            {
                name: "CV",
                column: "JOBAPPLICATION_CV",
                type: "VARCHAR",
            },
            {
                name: "Comment",
                column: "JOBAPPLICATION_COMMENT",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobApplicationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobApplicationEntityOptions): JobApplicationEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): JobApplicationEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: JobApplicationCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_JOBAPPLICATION",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBAPPLICATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobApplicationUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_JOBAPPLICATION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBAPPLICATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobApplicationCreateEntity | JobApplicationUpdateEntity): number {
        const id = (entity as JobApplicationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobApplicationUpdateEntity);
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
            table: "CODBEX_JOBAPPLICATION",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBAPPLICATION_ID",
                value: id
            }
        });
    }

    public count(options?: JobApplicationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_JOBAPPLICATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobApplicationEntityEvent | JobApplicationUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-JobOffer-JobApplication", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-JobOffer-JobApplication").send(JSON.stringify(data));
    }
}
