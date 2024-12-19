angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.JobAssignment.JobAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/JobAssignment/JobAssignmentService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = "select";

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-jobs-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "JobAssignment" && e.view === "JobAssignment" && (e.type === "page" || e.type === undefined));
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
		//-----------------Custom Actions-------------------//

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		function resetPagination() {
			$scope.dataReset = true;
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.selectedEntity = null;
				$scope.action = "select";
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			refreshData();
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
			if (!filter) {
				filter = {};
			}
			$scope.selectedEntity = null;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("JobAssignment", `Unable to count JobAssignment: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				filter.$offset = ($scope.dataPage - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				if ($scope.dataReset) {
					filter.$offset = 0;
					filter.$limit = $scope.dataPage * $scope.dataLimit;
				}

				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("JobAssignment", `Unable to list/filter JobAssignment: '${response.message}'`);
						return;
					}
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}

					response.data.forEach(e => {
						if (e.HireDate) {
							e.HireDate = new Date(e.HireDate);
						}
					});

					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				});
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.postMessage("entitySelected", {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsEmployeeContract: $scope.optionsEmployeeContract,
				optionsOrganization: $scope.optionsOrganization,
				optionsDepartment: $scope.optionsDepartment,
				optionsJobPosition: $scope.optionsJobPosition,
				optionsTeam: $scope.optionsTeam,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			$scope.action = "create";

			messageHub.postMessage("createEntity", {
				entity: {},
				optionsEmployeeContract: $scope.optionsEmployeeContract,
				optionsOrganization: $scope.optionsOrganization,
				optionsDepartment: $scope.optionsDepartment,
				optionsJobPosition: $scope.optionsJobPosition,
				optionsTeam: $scope.optionsTeam,
			});
		};

		$scope.updateEntity = function () {
			$scope.action = "update";
			messageHub.postMessage("updateEntity", {
				entity: $scope.selectedEntity,
				optionsEmployeeContract: $scope.optionsEmployeeContract,
				optionsOrganization: $scope.optionsOrganization,
				optionsDepartment: $scope.optionsDepartment,
				optionsJobPosition: $scope.optionsJobPosition,
				optionsTeam: $scope.optionsTeam,
			});
		};

		$scope.deleteEntity = function () {
			let id = $scope.selectedEntity.Id;
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
						refreshData();
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
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
