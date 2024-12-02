import { JobPositionRepository as JobPositionDao } from "codbex-jobs/gen/codbex-jobs/dao/Teams/JobPositionRepository";
import { Controller, Get } from "sdk/http";

@Controller
class JobsService {

    private readonly jobPositionDao;

    constructor() {
        this.jobPositionDao = new JobPositionDao();
    }

    @Get("/JobPositionData")
    public JobPositionData() {
        const allJobPositions = this.jobPositionDao.findAll();

        return {
            allJobPositions: allJobPositions
        };
    }

    @Get("/JobPositionsCount")
    public JobPositionsCount() {

        const openJobPositions = this.jobPositionDao.findAll({
            $filter: {
                equals: {
                    Status: 2
                }
            }
        });

        return {
            count: openJobPositions.length
        };
    }

}