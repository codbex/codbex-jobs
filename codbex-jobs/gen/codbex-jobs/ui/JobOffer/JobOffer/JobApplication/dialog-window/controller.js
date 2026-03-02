angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-jobs/gen/codbex-jobs/api/JobOffer/JobApplicationService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'JobApplication successfully created';
		let propertySuccessfullyUpdated = 'JobApplication successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'JobApplication Details',
			create: 'Create JobApplication',
			update: 'Update JobApplication'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadSelect', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)' });
			$scope.formHeaders.create = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)' });
			$scope.formHeaders.update = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadUpdate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsStatus = params.optionsStatus;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobApplication.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobApplication.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToUpdate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBAPPLICATION)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceStatus = '/services/ts/codbex-jobs/gen/codbex-jobs/api/entities/JobApplicationStatusService.ts';

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
			Dialogs.closeWindow({ id: 'JobApplication-details' });
		};
	});