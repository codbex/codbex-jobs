angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.Employees.JobAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/Employees/JobAssignmentService.ts";
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

			if (params.entity.StartDate) {
				params.entity.StartDate = new Date(params.entity.StartDate);
			}
			if (params.entity.EndDate) {
				params.entity.EndDate = new Date(params.entity.EndDate);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsEmployee = params.optionsEmployee;
			$scope.optionsOrganization = params.optionsOrganization;
			$scope.optionsDepartment = params.optionsDepartment;
			$scope.optionsJobPosition = params.optionsJobPosition;
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

		$scope.serviceEmployee = "/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts";
		$scope.serviceOrganization = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/OrganizationService.ts";
		$scope.serviceDepartment = "/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/DepartmentService.ts";
		$scope.serviceJobPosition = "/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts";

		$scope.$watch('entity.Organization', function (newValue, oldValue) {
			if (newValue !== undefined && newValue !== null) {
				entityApi.$http.get($scope.serviceOrganization + '/' + newValue).then(function (response) {
					let valueFrom = response.data.Id;
					entityApi.$http.post("/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/DepartmentService.ts/search", {
						$filter: {
							equals: {
								Organization: valueFrom
							}
						}
					}).then(function (response) {
						$scope.optionsDepartment = response.data.map(e => {
							return {
								value: e.Id,
								text: e.Name
							}
						});
						if ($scope.action !== 'select' && newValue !== oldValue) {
							if ($scope.optionsDepartment.length == 1) {
								$scope.entity.Department = $scope.optionsDepartment[0].value;
							} else {
								$scope.entity.Department = undefined;
							}
						}
					});
				});
			}
		});

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("JobAssignment-details");
		};

	}]);