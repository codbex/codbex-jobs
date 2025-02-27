angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.Teams.JobPosition';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {
		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-jobs-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Teams" && e.view === "JobPosition" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Teams" && e.view === "JobPosition" && e.type === "entity");
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
		messageHub.onDidReceiveMessage("codbex-organizations.Teams.Team.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-organizations.Teams.Team.clearDetails", function (msg) {
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
			let Team = $scope.selectedMainEntityId;
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
			filter.$filter.equals.Team = Team;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("JobPosition", `Unable to count JobPosition: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("JobPosition", `Unable to list/filter JobPosition: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.DateOpened) {
							e.DateOpened = new Date(e.DateOpened);
						}
						if (e.DateClosed) {
							e.DateClosed = new Date(e.DateClosed);
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
			messageHub.showDialogWindow("JobPosition-details", {
				action: "select",
				entity: entity,
				optionsRole: $scope.optionsRole,
				optionsStatus: $scope.optionsStatus,
				optionsType: $scope.optionsType,
				optionsTeam: $scope.optionsTeam,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("JobPosition-filter", {
				entity: $scope.filterEntity,
				optionsRole: $scope.optionsRole,
				optionsStatus: $scope.optionsStatus,
				optionsType: $scope.optionsType,
				optionsTeam: $scope.optionsTeam,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("JobPosition-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "Team",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsRole: $scope.optionsRole,
				optionsStatus: $scope.optionsStatus,
				optionsType: $scope.optionsType,
				optionsTeam: $scope.optionsTeam,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("JobPosition-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "Team",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsRole: $scope.optionsRole,
				optionsStatus: $scope.optionsStatus,
				optionsType: $scope.optionsType,
				optionsTeam: $scope.optionsTeam,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete JobPosition?',
				`Are you sure you want to delete JobPosition? This action cannot be undone.`,
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
							messageHub.showAlertError("JobPosition", `Unable to delete JobPosition: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsRole = [];
		$scope.optionsStatus = [];
		$scope.optionsType = [];
		$scope.optionsTeam = [];


		$http.get("/services/ts/codbex-companies/gen/codbex-companies/api/Companies/JobRoleService.ts").then(function (response) {
			$scope.optionsRole = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobStatusService.ts").then(function (response) {
			$scope.optionsStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobTypeService.ts").then(function (response) {
			$scope.optionsType = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
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

		$scope.optionsRoleValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsRole.length; i++) {
				if ($scope.optionsRole[i].value === optionKey) {
					return $scope.optionsRole[i].text;
				}
			}
			return null;
		};
		$scope.optionsStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsStatus.length; i++) {
				if ($scope.optionsStatus[i].value === optionKey) {
					return $scope.optionsStatus[i].text;
				}
			}
			return null;
		};
		$scope.optionsTypeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsType.length; i++) {
				if ($scope.optionsType[i].value === optionKey) {
					return $scope.optionsType[i].text;
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
