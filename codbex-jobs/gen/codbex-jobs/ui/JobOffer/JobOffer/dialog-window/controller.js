angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-jobs/gen/codbex-jobs/api/JobOffer/JobOfferService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
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

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			if (params.entity.DateOpened) {
				params.entity.DateOpened = new Date(params.entity.DateOpened);
			}
			if (params.entity.DateClosed) {
				params.entity.DateClosed = new Date(params.entity.DateClosed);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsJobPosition = params.optionsJobPosition;
			$scope.optionsStatus = params.optionsStatus;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobOffer.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBOFFER'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobOffer.entityUpdated', data: response.data });
				$scope.cancel();
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBOFFER'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToUpdate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBOFFER)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceJobPosition = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts';
		
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
		$scope.serviceStatus = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Entities/JobOfferStatusService.ts';
		
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

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'JobOffer-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});