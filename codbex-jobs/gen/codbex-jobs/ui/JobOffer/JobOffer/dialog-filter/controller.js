angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.JobOffer.JobOffer';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DateOpenedFrom) {
				params.entity.DateOpenedFrom = new Date(params.entity.DateOpenedFrom);
			}
			if (params?.entity?.DateOpenedTo) {
				params.entity.DateOpenedTo = new Date(params.entity.DateOpenedTo);
			}
			if (params?.entity?.DateClosedFrom) {
				params.entity.DateClosedFrom = new Date(params.entity.DateClosedFrom);
			}
			if (params?.entity?.DateClosedTo) {
				params.entity.DateClosedTo = new Date(params.entity.DateClosedTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsJobPosition = params.optionsJobPosition;
			$scope.optionsStatus = params.optionsStatus;
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
			if (entity.JobPosition !== undefined) {
				filter.$filter.equals.JobPosition = entity.JobPosition;
			}
			if (entity.DaysOpened !== undefined) {
				filter.$filter.equals.DaysOpened = entity.DaysOpened;
			}
			if (entity.DateOpenedFrom) {
				filter.$filter.greaterThanOrEqual.DateOpened = entity.DateOpenedFrom;
			}
			if (entity.DateOpenedTo) {
				filter.$filter.lessThanOrEqual.DateOpened = entity.DateOpenedTo;
			}
			if (entity.DateClosedFrom) {
				filter.$filter.greaterThanOrEqual.DateClosed = entity.DateClosedFrom;
			}
			if (entity.DateClosedTo) {
				filter.$filter.lessThanOrEqual.DateClosed = entity.DateClosedTo;
			}
			if (entity.Status !== undefined) {
				filter.$filter.equals.Status = entity.Status;
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
			messageHub.closeDialogWindow("JobOffer-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);