angular.module('longest-time-to-fill-job-position', ['ideUI', 'ideView'])
    .controller('LongestTimeToFillJobPosition', ['$scope', '$http', function ($scope, $http) {
        $scope.state = {
            isBusy: true,
            error: false,
            busyText: "Loading...",
        };

        $scope.today = new Date().toDateString();
        $scope.currentMonth = new Date().getMonth();
        $scope.currentYear = new Date().getFullYear();

        const jobsServiceUrl = "/services/ts/codbex-jobs/widgets/api/JobsService.ts/JobPositionData";

        $http.get(jobsServiceUrl)
            .then(function (response) {
                const allJobPositions = response.data.allJobPositions;

                let longestOpenJobPosition = 0;

                allJobPositions.forEach((jobPosition) => {

                    if (jobPosition.Status == 2 && jobPosition.DaysOpened >= longestOpenJobPosition) {
                        longestOpenJobPosition = jobPosition.DaysOpened;
                    }

                });

                $scope.days = longestOpenJobPosition;

            })
            .catch(function (error) {
                $scope.state.error = true;
                $scope.state.isBusy = false;
                console.error('Error fetching data:', error);
            })
            .finally(function () {
                $scope.state.isBusy = false;
            });
    }]);