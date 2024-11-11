import { update } from "sdk/db";

export interface JobPosition {
    readonly id: number,
    readonly days: number
}

export class JobPositionOpenDaysService {

    public static updateJobPosition(jobPositionData: JobPosition) {
        const sql = `UPDATE "CODBEX_JOBPOSITION" SET "JOBPOSITION_DAYSOPENED" = ? WHERE "JOBPOSITION_ID" = ?`;
        const queryParameters = [jobPositionData.days, jobPositionData.id];
        update.execute(sql, queryParameters);
    }

}