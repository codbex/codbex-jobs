angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.EmployeeAssignment.JobAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/EmployeeAssignment/JobAssignmentService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {
		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-jobs-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "EmployeeAssignment" && e.view === "JobAssignment" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "EmployeeAssignment" && e.view === "JobAssignment" && e.type === "entity");
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
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-jobs.EmployeeAssignment.EmployeeAssignment.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-jobs.EmployeeAssignment.EmployeeAssignment.clearDetails", function (msg) {
			$scope.$apply(function () {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}, true);

		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

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
			let EmployeeAssignment = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.EmployeeAssignment = EmployeeAssignment;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("JobAssignment", `Unable to count JobAssignment: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				entityApi.search(filter).then(function (response) {
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

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("JobAssignment-details", {
				action: "select",
				entity: entity,
				optionsEmployeeContract: $scope.optionsEmployeeContract,
				optionsOrganization: $scope.optionsOrganization,
				optionsDepartment: $scope.optionsDepartment,
				optionsJobPosition: $scope.optionsJobPosition,
				optionsTeam: $scope.optionsTeam,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("JobAssignment-filter", {
				entity: $scope.filterEntity,
				optionsEmployeeContract: $scope.optionsEmployeeContract,
				optionsOrganization: $scope.optionsOrganization,
				optionsDepartment: $scope.optionsDepartment,
				optionsJobPosition: $scope.optionsJobPosition,
				optionsTeam: $scope.optionsTeam,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("JobAssignment-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "EmployeeAssignment",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsEmployeeContract: $scope.optionsEmployeeContract,
				optionsOrganization: $scope.optionsOrganization,
				optionsDepartment: $scope.optionsDepartment,
				optionsJobPosition: $scope.optionsJobPosition,
				optionsTeam: $scope.optionsTeam,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("JobAssignment-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "EmployeeAssignment",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsEmployeeContract: $scope.optionsEmployeeContract,
				optionsOrganization: $scope.optionsOrganization,
				optionsDepartment: $scope.optionsDepartment,
				optionsJobPosition: $scope.optionsJobPosition,
				optionsTeam: $scope.optionsTeam,
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
		$scope.optionsEmployeeContract = [];
		$scope.optionsOrganization = [];
		$scope.optionsDepartment = [];
		$scope.optionsJobPosition = [];
		$scope.optionsTeam = [];


		$http.get("/services/ts/codbex-contracts/gen/codbex-contracts/api/EmployeeContracts/EmployeeContractService.ts").then(function (response) {
			$scope.optionsEmployeeContract = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Number
				}
			});
		});

		$http.get("/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/OrganizationService.ts").then(function (response) {
			$scope.optionsOrganization = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/DepartmentService.ts").then(function (response) {
			$scope.optionsDepartment = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts").then(function (response) {
			$scope.optionsJobPosition = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Number
				}
			});
		});

		$http.get("/services/ts/codbex-organizations/gen/codbex-organizations/api/Teams/TeamService.ts").then(function (response) {
			$scope.optionsTeam = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsEmployeeContractValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsEmployeeContract.length; i++) {
				if ($scope.optionsEmployeeContract[i].value === optionKey) {
					return $scope.optionsEmployeeContract[i].text;
				}
			}
			return null;
		};
		$scope.optionsOrganizationValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsOrganization.length; i++) {
				if ($scope.optionsOrganization[i].value === optionKey) {
					return $scope.optionsOrganization[i].text;
				}
			}
			return null;
		};
		$scope.optionsDepartmentValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsDepartment.length; i++) {
				if ($scope.optionsDepartment[i].value === optionKey) {
					return $scope.optionsDepartment[i].text;
				}
			}
			return null;
		};
		$scope.optionsJobPositionValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsJobPosition.length; i++) {
				if ($scope.optionsJobPosition[i].value === optionKey) {
					return $scope.optionsJobPosition[i].text;
				}
			}
			return null;
		};
		$scope.optionsTeamValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsTeam.length; i++) {
				if ($scope.optionsTeam[i].value === optionKey) {
					return $scope.optionsTeam[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
