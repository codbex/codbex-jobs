angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-jobs.JobOffer.JobOffer';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-jobs/gen/codbex-jobs/api/JobOffer/JobOfferService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'Extensions', 'messageHub', 'entityApi', function ($scope,  $http, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "JobOffer Details",
			create: "Create JobOffer",
			update: "Update JobOffer"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-jobs-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "JobOffer" && e.view === "JobOffer" && e.type === "entity");
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
				$scope.optionsJobPosition = [];
				$scope.optionsStatus = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.DateOpened) {
					msg.data.entity.DateOpened = new Date(msg.data.entity.DateOpened);
				}
				if (msg.data.entity.DateClosed) {
					msg.data.entity.DateClosed = new Date(msg.data.entity.DateClosed);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsJobPosition = msg.data.optionsJobPosition;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsJobPosition = msg.data.optionsJobPosition;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.DateOpened) {
					msg.data.entity.DateOpened = new Date(msg.data.entity.DateOpened);
				}
				if (msg.data.entity.DateClosed) {
					msg.data.entity.DateClosed = new Date(msg.data.entity.DateClosed);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsJobPosition = msg.data.optionsJobPosition;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.action = 'update';
			});
		});

		$scope.serviceJobPosition = "/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts";
		$scope.serviceStatus = "/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobOfferStatusService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("JobOffer", `Unable to create JobOffer: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("JobOffer", "JobOffer successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("JobOffer", `Unable to update JobOffer: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("JobOffer", "JobOffer successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};
		
		//-----------------Dialogs-------------------//
		
		$scope.createJobPosition = function () {
			messageHub.showDialogWindow("JobPosition-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createStatus = function () {
			messageHub.showDialogWindow("JobOfferStatus-details", {
				action: "create",
				entity: {},
			}, null, false);
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshJobPosition = function () {
			$scope.optionsJobPosition = [];
			$http.get("/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts").then(function (response) {
				$scope.optionsJobPosition = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Number
					}
				});
			});
		};
		$scope.refreshStatus = function () {
			$scope.optionsStatus = [];
			$http.get("/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobOfferStatusService.ts").then(function (response) {
				$scope.optionsStatus = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};

		//----------------Dropdowns-----------------//	
		

	}]);