angular.module('open-job-positions', ['ideUI', 'ideView'])
    .controller('OpenJobPositions', ['$scope', '$http', function ($scope, $http) {
        $scope.state = {
            isBusy: true,
            error: false,
            busyText: "Loading...",
        };

        $scope.today = new Date().toDateString();
        $scope.currentMonth = new Date().getMonth();
        $scope.currentYear = new Date().getFullYear();

        const jobsServiceUrl = "/services/ts/codbex-jobs/widgets/api/JobsService.ts/JobPositionsCount";

        $http.get(jobsServiceUrl)
            .then(function (response) {
                $scope.jobPositions = response.data.count;
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