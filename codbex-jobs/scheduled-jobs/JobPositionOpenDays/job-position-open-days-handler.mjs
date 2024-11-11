import { JobPositionOpenDaysService } from './JobPositionOpenDaysService';

import { JobPositionRepository } from "codbex-jobs/gen/codbex-jobs/dao/Teams/JobPositionRepository";

const JobPositionDao = new JobPositionRepository();

const jobPositions = JobPositionDao.findAll();

jobPositions.forEach((jobPosition) => {

    if (!jobPosition.DateClosed) {

        jobPosition.DaysOpened = jobPosition.DaysOpened + 1;
        JobPositionOpenDaysService.savePayroll(payroll);
    }

});
