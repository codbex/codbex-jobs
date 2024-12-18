angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.Employees.Employee';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.BirthDateFrom) {
				params.entity.BirthDateFrom = new Date(params.entity.BirthDateFrom);
			}
			if (params?.entity?.BirthDateTo) {
				params.entity.BirthDateTo = new Date(params.entity.BirthDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsGender = params.optionsGender;
			$scope.optionsNationality = params.optionsNationality;
			$scope.optionsMartialStatus = params.optionsMartialStatus;
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
			if (entity.FirstName) {
				filter.$filter.contains.FirstName = entity.FirstName;
			}
			if (entity.MiddleName) {
				filter.$filter.contains.MiddleName = entity.MiddleName;
			}
			if (entity.LastName) {
				filter.$filter.contains.LastName = entity.LastName;
			}
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.BirthDateFrom) {
				filter.$filter.greaterThanOrEqual.BirthDate = entity.BirthDateFrom;
			}
			if (entity.BirthDateTo) {
				filter.$filter.lessThanOrEqual.BirthDate = entity.BirthDateTo;
			}
			if (entity.EGN) {
				filter.$filter.contains.EGN = entity.EGN;
			}
			if (entity.Gender !== undefined) {
				filter.$filter.equals.Gender = entity.Gender;
			}
			if (entity.Nationality !== undefined) {
				filter.$filter.equals.Nationality = entity.Nationality;
			}
			if (entity.MartialStatus !== undefined) {
				filter.$filter.equals.MartialStatus = entity.MartialStatus;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Employee-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);