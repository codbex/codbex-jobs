angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Settings/JobStatusService.ts';
	}])
	.controller('PageController', ($scope, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete JobStatus? This action cannot be undone.',
			deleteTitle: 'Delete JobStatus?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.yes');
			translated.no = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.deleteTitle', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBSTATUS)' });
			translated.deleteConfirm = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.deleteConfirm', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBSTATUS)' });
		});

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-jobs-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Settings' && e.view === 'JobStatus' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'Settings' && e.view === 'JobStatus' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
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
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-jobs.Settings.JobStatus.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.Settings.JobStatus.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.Settings.JobStatus.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = EntityService.search(filter);
				} else {
					request = EntityService.list(offset, limit);
				}
				request.then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBSTATUS'),
						message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToLF', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBSTATUS)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBSTATUS'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCount', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBSTATUS)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'JobStatus-details',
				params: {
					action: 'select',
					entity: entity,
				},
				closeButton: true,
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'JobStatus-filter',
				params: {
					entity: $scope.filterEntity,
				},
				closeButton: true,
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'JobStatus-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false,
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'JobStatus-details',
				params: {
					action: 'update',
					entity: entity,
				},
				closeButton: false,
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
				}]
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then((response) => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-jobs.Settings.JobStatus.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBSTATUS'),
							message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToDelete', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBSTATUS)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

	});