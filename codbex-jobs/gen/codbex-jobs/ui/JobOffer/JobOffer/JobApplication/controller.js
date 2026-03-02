angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-jobs/gen/codbex-jobs/api/JobOffer/JobApplicationService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete JobApplication? This action cannot be undone.',
			deleteTitle: 'Delete JobApplication?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.yes');
			translated.no = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.deleteTitle', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)' });
			translated.deleteConfirm = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.deleteConfirm', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)' });
		});
		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-jobs-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'JobOffer' && e.view === 'JobApplication' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'JobOffer' && e.view === 'JobApplication' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					selectedMainEntityKey: 'Offer',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id,
					selectedMainEntityKey: 'Offer',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobOffer.entitySelected', handler: (data) => {
			resetPagination();
			$scope.selectedMainEntityId = data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobOffer.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobApplication.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobApplication.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobApplication.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobApplication.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			let Offer = $scope.selectedMainEntityId;
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
			filter.$filter.equals.Offer = Offer;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				EntityService.search(filter).then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION'),
						message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToLF', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCount', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'JobApplication-details',
				params: {
					action: 'select',
					entity: entity,
					optionsStatus: $scope.optionsStatus,
				},
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'JobApplication-filter',
				params: {
					entity: $scope.filterEntity,
					optionsStatus: $scope.optionsStatus,
				},
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'JobApplication-details',
				params: {
					action: 'create',
					entity: {
						'Offer': $scope.selectedMainEntityId
					},
					selectedMainEntityKey: 'Offer',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsStatus: $scope.optionsStatus,
				},
				closeButton: false
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'JobApplication-details',
				params: {
					action: 'update',
					entity: entity,
					selectedMainEntityKey: 'Offer',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsStatus: $scope.optionsStatus,
			},
				closeButton: false
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.Id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-jobs.JobOffer.JobApplication.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION'),
							message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToDelete', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)', message: message }),
							type: AlertTypes.Error,
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsStatus = [];


		$http.get('/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobApplicationStatusService.ts').then((response) => {
			$scope.optionsStatus = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Status',
				message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.optionsStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsStatus.length; i++) {
				if ($scope.optionsStatus[i].value === optionKey) {
					return $scope.optionsStatus[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
