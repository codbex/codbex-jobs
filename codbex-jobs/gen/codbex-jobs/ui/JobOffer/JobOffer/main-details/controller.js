angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-jobs/gen/codbex-jobs/api/JobOffer/JobOfferService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'JobOffer successfully created';
		let propertySuccessfullyUpdated = 'JobOffer successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'JobOffer Details',
			create: 'Create JobOffer',
			update: 'Update JobOffer'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadSelect', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)' });
			$scope.formHeaders.create = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)' });
			$scope.formHeaders.update = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadUpdate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-jobs-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'JobOffer' && e.view === 'JobOffer' && e.type === 'entity');
		});

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

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobOffer.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsJobPosition = [];
				$scope.optionsStatus = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobOffer.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.DateOpened) {
					data.entity.DateOpened = new Date(data.entity.DateOpened);
				}
				if (data.entity.DateClosed) {
					data.entity.DateClosed = new Date(data.entity.DateClosed);
				}
				$scope.entity = data.entity;
				$scope.optionsJobPosition = data.optionsJobPosition;
				$scope.optionsStatus = data.optionsStatus;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobOffer.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsJobPosition = data.optionsJobPosition;
				$scope.optionsStatus = data.optionsStatus;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.JobOffer.JobOffer.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.DateOpened) {
					data.entity.DateOpened = new Date(data.entity.DateOpened);
				}
				if (data.entity.DateClosed) {
					data.entity.DateClosed = new Date(data.entity.DateClosed);
				}
				$scope.entity = data.entity;
				$scope.optionsJobPosition = data.optionsJobPosition;
				$scope.optionsStatus = data.optionsStatus;
				$scope.action = 'update';
			});
		}});

		$scope.serviceJobPosition = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts';
		$scope.serviceStatus = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Entities/JobOfferStatusService.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobOffer.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobOffer.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBOFFER'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBOFFER'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobOffer.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobOffer.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBOFFER'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBOFFER'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-jobs.JobOffer.JobOffer.clearDetails');
		};
		
		//-----------------Dialogs-------------------//
		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};
		
		$scope.createJobPosition = () => {
			Dialogs.showWindow({
				id: 'JobPosition-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createStatus = () => {
			Dialogs.showWindow({
				id: 'JobOfferStatus-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshJobPosition = () => {
			$scope.optionsJobPosition = [];
			$http.get('/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts').then((response) => {
				$scope.optionsJobPosition = response.data.map(e => ({
					value: e.Id,
					text: e.Number
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'JobPosition',
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshStatus = () => {
			$scope.optionsStatus = [];
			$http.get('/services/ts/codbex-jobs/gen/codbex-jobs/api/Entities/JobOfferStatusService.ts').then((response) => {
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
		};

		//----------------Dropdowns-----------------//	
	});