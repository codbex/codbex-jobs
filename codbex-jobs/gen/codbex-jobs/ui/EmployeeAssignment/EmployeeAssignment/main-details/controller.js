angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.EmployeeAssignment.EmployeeAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/EmployeeAssignment/EmployeeAssignmentService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "EmployeeAssignment Details",
			create: "Create EmployeeAssignment",
			update: "Update EmployeeAssignment"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-jobs-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "EmployeeAssignment" && e.view === "EmployeeAssignment" && e.type === "entity");
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
				$scope.optionsEmployee = [];
				$scope.optionsTeam = [];
				$scope.optionsJobRole = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsTeam = msg.data.optionsTeam;
				$scope.optionsJobRole = msg.data.optionsJobRole;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsTeam = msg.data.optionsTeam;
				$scope.optionsJobRole = msg.data.optionsJobRole;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsTeam = msg.data.optionsTeam;
				$scope.optionsJobRole = msg.data.optionsJobRole;
				$scope.action = 'update';
			});
		});

		$scope.serviceEmployee = "/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts";
		$scope.serviceTeam = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Teams/TeamService.ts";
		$scope.serviceJobRole = "/services/ts/codbex-companies/gen/codbex-companies/api/Companies/JobRoleService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("EmployeeAssignment", `Unable to create EmployeeAssignment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("EmployeeAssignment", "EmployeeAssignment successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("EmployeeAssignment", `Unable to update EmployeeAssignment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("EmployeeAssignment", "EmployeeAssignment successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);