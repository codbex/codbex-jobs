angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.JobAssignment.JobAssignment';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.HireDateFrom) {
				params.entity.HireDateFrom = new Date(params.entity.HireDateFrom);
			}
			if (params?.entity?.HireDateTo) {
				params.entity.HireDateTo = new Date(params.entity.HireDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsEmployeeContract = params.optionsEmployeeContract;
			$scope.optionsOrganization = params.optionsOrganization;
			$scope.optionsDepartment = params.optionsDepartment;
			$scope.optionsJobPosition = params.optionsJobPosition;
			$scope.optionsTeam = params.optionsTeam;
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Number) {
				filter.$filter.contains.Number = entity.Number;
			}
			if (entity.EmployeeContract !== undefined) {
				filter.$filter.equals.EmployeeContract = entity.EmployeeContract;
			}
			if (entity.Organization !== undefined) {
				filter.$filter.equals.Organization = entity.Organization;
			}
			if (entity.Department !== undefined) {
				filter.$filter.equals.Department = entity.Department;
			}
			if (entity.HireDateFrom) {
				filter.$filter.greaterThanOrEqual.HireDate = entity.HireDateFrom;
			}
			if (entity.HireDateTo) {
				filter.$filter.lessThanOrEqual.HireDate = entity.HireDateTo;
			}
			if (entity.JobPosition !== undefined) {
				filter.$filter.equals.JobPosition = entity.JobPosition;
			}
			if (entity.Team !== undefined) {
				filter.$filter.equals.Team = entity.Team;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("JobAssignment-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);