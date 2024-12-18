import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface EmployeeEntity {
    readonly Id: number;
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    Name?: string;
    BirthDate?: Date;
    EGN?: string;
    Gender?: number;
    Nationality?: number;
    MartialStatus?: number;
}

export interface EmployeeCreateEntity {
    readonly FirstName?: string;
    readonly MiddleName?: string;
    readonly LastName?: string;
    readonly BirthDate?: Date;
    readonly EGN?: string;
    readonly Gender?: number;
    readonly Nationality?: number;
    readonly MartialStatus?: number;
}

export interface EmployeeUpdateEntity extends EmployeeCreateEntity {
    readonly Id: number;
}

export interface EmployeeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            FirstName?: string | string[];
            MiddleName?: string | string[];
            LastName?: string | string[];
            Name?: string | string[];
            BirthDate?: Date | Date[];
            EGN?: string | string[];
            Gender?: number | number[];
            Nationality?: number | number[];
            MartialStatus?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            FirstName?: string | string[];
            MiddleName?: string | string[];
            LastName?: string | string[];
            Name?: string | string[];
            BirthDate?: Date | Date[];
            EGN?: string | string[];
            Gender?: number | number[];
            Nationality?: number | number[];
            MartialStatus?: number | number[];
        };
        contains?: {
            Id?: number;
            FirstName?: string;
            MiddleName?: string;
            LastName?: string;
            Name?: string;
            BirthDate?: Date;
            EGN?: string;
            Gender?: number;
            Nationality?: number;
            MartialStatus?: number;
        };
        greaterThan?: {
            Id?: number;
            FirstName?: string;
            MiddleName?: string;
            LastName?: string;
            Name?: string;
            BirthDate?: Date;
            EGN?: string;
            Gender?: number;
            Nationality?: number;
            MartialStatus?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            FirstName?: string;
            MiddleName?: string;
            LastName?: string;
            Name?: string;
            BirthDate?: Date;
            EGN?: string;
            Gender?: number;
            Nationality?: number;
            MartialStatus?: number;
        };
        lessThan?: {
            Id?: number;
            FirstName?: string;
            MiddleName?: string;
            LastName?: string;
            Name?: string;
            BirthDate?: Date;
            EGN?: string;
            Gender?: number;
            Nationality?: number;
            MartialStatus?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            FirstName?: string;
            MiddleName?: string;
            LastName?: string;
            Name?: string;
            BirthDate?: Date;
            EGN?: string;
            Gender?: number;
            Nationality?: number;
            MartialStatus?: number;
        };
    },
    $select?: (keyof EmployeeEntity)[],
    $sort?: string | (keyof EmployeeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface EmployeeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<EmployeeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface EmployeeUpdateEntityEvent extends EmployeeEntityEvent {
    readonly previousEntity: EmployeeEntity;
}

export class EmployeeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_EMPLOYEE",
        properties: [
            {
                name: "Id",
                column: "EMPLOYEE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "FirstName",
                column: "EMPLOYEE_FIRSTNAME",
                type: "VARCHAR",
            },
            {
                name: "MiddleName",
                column: "EMPLOYEE_MIDDLENAME",
                type: "VARCHAR",
            },
            {
                name: "LastName",
                column: "EMPLOYEE_LASTNAME",
                type: "VARCHAR",
            },
            {
                name: "Name",
                column: "EMPLOYEE_NAME",
                type: "VARCHAR",
            },
            {
                name: "BirthDate",
                column: "EMPLOYEE_BIRTHDATE",
                type: "DATE",
            },
            {
                name: "EGN",
                column: "EMPLOYEE_EGN",
                type: "VARCHAR",
            },
            {
                name: "Gender",
                column: "EMPLOYEE_GENDER",
                type: "INTEGER",
            },
            {
                name: "Nationality",
                column: "EMPLOYEE_NATIONALITY",
                type: "INTEGER",
            },
            {
                name: "MartialStatus",
                column: "EMPLOYEE_MARTIALSTATUS",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(EmployeeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: EmployeeEntityOptions): EmployeeEntity[] {
        return this.dao.list(options).map((e: EmployeeEntity) => {
            EntityUtils.setDate(e, "BirthDate");
            return e;
        });
    }

    public findById(id: number): EmployeeEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "BirthDate");
        return entity ?? undefined;
    }

    public create(entity: EmployeeCreateEntity): number {
        EntityUtils.setLocalDate(entity, "BirthDate");
        // @ts-ignore
        (entity as EmployeeEntity).Name = entity["FirstName"] + " " + entity["LastName"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: EmployeeUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "BirthDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: EmployeeCreateEntity | EmployeeUpdateEntity): number {
        const id = (entity as EmployeeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as EmployeeUpdateEntity);
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
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: id
            }
        });
    }

    public count(options?: EmployeeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_EMPLOYEE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: EmployeeEntityEvent | EmployeeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-jobs-Employees-Employee", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-jobs-Employees-Employee").send(JSON.stringify(data));
    }
}
