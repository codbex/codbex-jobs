import { update } from "sdk/db";

export interface JobPosition {
    readonly id: number,
    readonly days: number
}

export interface JobOffer {
    readonly id: number,
    readonly days: number
}

export class CountOpenDaysService {

    public static updateJobPosition(jobPositionData: JobPosition) {
        const sql = `UPDATE "CODBEX_JOBPOSITION"
         SET "JOBPOSITION_DAYSOPENED" = (?) 
         WHERE "JOBPOSITION_ID" = (?)`;
        const queryParameters = [jobPositionData.days, jobPositionData.id];
        update.execute(sql, queryParameters);
    }

    public static updateJobOffer(jobOfferData: JobOffer) {
        const sql = `UPDATE "CODBEX_JOBOFFER"
         SET "JOBOFFER_DAYSOPENED" = (?) 
         WHERE "JOBOFFER_ID" = (?)`;
        const queryParameters = [jobOfferData.days, jobOfferData.id];
        update.execute(sql, queryParameters);
    }

}