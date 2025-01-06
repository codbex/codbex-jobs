import { CountOpenDaysService } from './CountOpenDaysService';

import { JobPositionRepository } from "codbex-jobs/gen/codbex-jobs/dao/Teams/JobPositionRepository";
import { JobOfferRepository } from "codbex-jobs/gen/codbex-jobs/dao/JobOffer/JobOfferRepository";

const JobPositionDao = new JobPositionRepository();
const JobOfferDao = new JobOfferRepository();

const jobPositions = JobPositionDao.findAll();
const jobOffers = JobOfferDao.findAll();

jobPositions.forEach((jobPosition) => {

    if (jobPosition.DateClosed == null) {

        jobPosition.DaysOpened = jobPosition.DaysOpened + 1;

        const newJobPosition = {
            "id": jobPosition.Id,
            "days": jobPosition.DaysOpened
        }

        CountOpenDaysService.updateJobPosition(newJobPosition);
    }

});

jobOffers.forEach((jobOffer) => {

    if (jobOffer.DateClosed == null) {

        jobOffer.DaysOpened = jobOffer.DaysOpened + 1;

        const newJobOffer = {
            "id": jobOffer.Id,
            "days": jobOffer.DaysOpened
        }

        CountOpenDaysService.updateJobOffer(newJobOffer);
    }

});
