angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.Teams.JobPosition';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', 'entityApi', function ($scope, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "JobPosition Details",
			create: "Create JobPosition",
			update: "Update JobPosition"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;

			if (params.entity.DateOpened) {
				params.entity.DateOpened = new Date(params.entity.DateOpened);
			}
			if (params.entity.DateClosed) {
				params.entity.DateClosed = new Date(params.entity.DateClosed);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsRole = params.optionsRole;
			$scope.optionsStatus = params.optionsStatus;
			$scope.optionsType = params.optionsType;
			$scope.optionsTeam = params.optionsTeam;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("JobPosition", `Unable to create JobPosition: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("JobPosition", "JobPosition successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("JobPosition", `Unable to update JobPosition: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("JobPosition", "JobPosition successfully updated");
			});
		};

		$scope.serviceRole = "/services/ts/codbex-companies/gen/codbex-companies/api/Companies/JobRoleService.ts";
		$scope.serviceStatus = "/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobStatusService.ts";
		$scope.serviceType = "/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobTypeService.ts";
		$scope.serviceTeam = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Teams/TeamService.ts";

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("JobPosition-details");
		};

	}]);