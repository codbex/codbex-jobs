angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.entities.JobAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobAssignmentService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-jobs-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "entities" && e.view === "JobAssignment" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "entities" && e.view === "JobAssignment" && e.type === "entity");
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{},
				null,
				true,
				action
			);
		};

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

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("JobAssignment", `Unable to count JobAssignment: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = entityApi.search(filter);
				} else {
					request = entityApi.list(offset, limit);
				}
				request.then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("JobAssignment", `Unable to list/filter JobAssignment: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.HireDate) {
							e.HireDate = new Date(e.HireDate);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("JobAssignment-details", {
				action: "select",
				entity: entity,
				optionsManager: $scope.optionsManager,
				optionsJobStatus: $scope.optionsJobStatus,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("JobAssignment-filter", {
				entity: $scope.filterEntity,
				optionsManager: $scope.optionsManager,
				optionsJobStatus: $scope.optionsJobStatus,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("JobAssignment-details", {
				action: "create",
				entity: {},
				optionsManager: $scope.optionsManager,
				optionsJobStatus: $scope.optionsJobStatus,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("JobAssignment-details", {
				action: "update",
				entity: entity,
				optionsManager: $scope.optionsManager,
				optionsJobStatus: $scope.optionsJobStatus,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete JobAssignment?',
				`Are you sure you want to delete JobAssignment? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("JobAssignment", `Unable to delete JobAssignment: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsManager = [];
		$scope.optionsJobStatus = [];


		$http.get("/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts").then(function (response) {
			$scope.optionsManager = response.data.map(e => {
				return {
					value: e.Id,
					text: e.FirstName
				}
			});
		});

		$http.get("/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobStatusService.ts").then(function (response) {
			$scope.optionsJobStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsManagerValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsManager.length; i++) {
				if ($scope.optionsManager[i].value === optionKey) {
					return $scope.optionsManager[i].text;
				}
			}
			return null;
		};
		$scope.optionsJobStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsJobStatus.length; i++) {
				if ($scope.optionsJobStatus[i].value === optionKey) {
					return $scope.optionsJobStatus[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
