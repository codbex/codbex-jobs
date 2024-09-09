angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.entities.JobRole';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobRoleService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', 'entityApi', function ($scope, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "JobRole Details",
			create: "Create JobRole",
			update: "Update JobRole"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					$scope.errorMessage = `Unable to create JobRole: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("JobRole", "JobRole successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					$scope.errorMessage = `Unable to update JobRole: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("JobRole", "JobRole successfully updated");
			});
		};

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("JobRole-details");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);