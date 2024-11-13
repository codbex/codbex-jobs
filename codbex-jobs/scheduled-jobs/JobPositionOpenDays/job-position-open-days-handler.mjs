import { JobPositionOpenDaysService } from './JobPositionOpenDaysService';

import { JobPositionRepository } from "codbex-jobs/gen/codbex-jobs/dao/Teams/JobPositionRepository";

const JobPositionDao = new JobPositionRepository();

const jobPositions = JobPositionDao.findAll();

jobPositions.forEach((jobPosition) => {

    if (jobPosition.DateClosed == null) {

        jobPosition.DaysOpened = jobPosition.DaysOpened + 1;

        const newJobPosition = {
            "id": jobPosition.Id,
            "days": jobPosition.DaysOpened
        }

        JobPositionOpenDaysService.updateJobPosition(newJobPosition);
    }

});
