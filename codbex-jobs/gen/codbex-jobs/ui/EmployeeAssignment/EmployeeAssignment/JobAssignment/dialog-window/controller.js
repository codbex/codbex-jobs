angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.EmployeeAssignment.JobAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/EmployeeAssignment/JobAssignmentService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', 'entityApi', function ($scope, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "JobAssignment Details",
			create: "Create JobAssignment",
			update: "Update JobAssignment"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;

			if (params.entity.HireDate) {
				params.entity.HireDate = new Date(params.entity.HireDate);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsEmployeeContract = params.optionsEmployeeContract;
			$scope.optionsOrganization = params.optionsOrganization;
			$scope.optionsDepartment = params.optionsDepartment;
			$scope.optionsJobPosition = params.optionsJobPosition;
			$scope.optionsTeam = params.optionsTeam;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("JobAssignment", `Unable to create JobAssignment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("JobAssignment", "JobAssignment successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("JobAssignment", `Unable to update JobAssignment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("JobAssignment", "JobAssignment successfully updated");
			});
		};

		$scope.serviceEmployeeContract = "/services/ts/codbex-contracts/gen/codbex-contracts/api/EmployeeContracts/EmployeeContractService.ts";
		$scope.serviceOrganization = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/OrganizationService.ts";
		$scope.serviceDepartment = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/DepartmentService.ts";
		$scope.serviceJobPosition = "/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts";
		$scope.serviceTeam = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Teams/TeamService.ts";

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("JobAssignment-details");
		};

	}]);