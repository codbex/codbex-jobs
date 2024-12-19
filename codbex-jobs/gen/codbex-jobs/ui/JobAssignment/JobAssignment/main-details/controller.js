angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.JobAssignment.JobAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/JobAssignment/JobAssignmentService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

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

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-jobs-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "JobAssignment" && e.view === "JobAssignment" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsEmployeeContract = [];
				$scope.optionsOrganization = [];
				$scope.optionsDepartment = [];
				$scope.optionsJobPosition = [];
				$scope.optionsTeam = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.HireDate) {
					msg.data.entity.HireDate = new Date(msg.data.entity.HireDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsEmployeeContract = msg.data.optionsEmployeeContract;
				$scope.optionsOrganization = msg.data.optionsOrganization;
				$scope.optionsDepartment = msg.data.optionsDepartment;
				$scope.optionsJobPosition = msg.data.optionsJobPosition;
				$scope.optionsTeam = msg.data.optionsTeam;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsEmployeeContract = msg.data.optionsEmployeeContract;
				$scope.optionsOrganization = msg.data.optionsOrganization;
				$scope.optionsDepartment = msg.data.optionsDepartment;
				$scope.optionsJobPosition = msg.data.optionsJobPosition;
				$scope.optionsTeam = msg.data.optionsTeam;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.HireDate) {
					msg.data.entity.HireDate = new Date(msg.data.entity.HireDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsEmployeeContract = msg.data.optionsEmployeeContract;
				$scope.optionsOrganization = msg.data.optionsOrganization;
				$scope.optionsDepartment = msg.data.optionsDepartment;
				$scope.optionsJobPosition = msg.data.optionsJobPosition;
				$scope.optionsTeam = msg.data.optionsTeam;
				$scope.action = 'update';
			});
		});

		$scope.serviceEmployeeContract = "/services/ts/codbex-contracts/gen/codbex-contracts/api/EmployeeContracts/EmployeeContractService.ts";
		$scope.serviceOrganization = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/OrganizationService.ts";
		$scope.serviceDepartment = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/DepartmentService.ts";
		$scope.serviceJobPosition = "/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts";
		$scope.serviceTeam = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Teams/TeamService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("JobAssignment", `Unable to create JobAssignment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("JobAssignment", "JobAssignment successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("JobAssignment", `Unable to update JobAssignment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("JobAssignment", "JobAssignment successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);