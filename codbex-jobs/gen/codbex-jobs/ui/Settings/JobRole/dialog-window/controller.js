angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Settings/JobRoleService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'JobRole successfully created';
		let propertySuccessfullyUpdated = 'JobRole successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'JobRole Details',
			create: 'Create JobRole',
			update: 'Update JobRole'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadSelect', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBROLE)' });
			$scope.formHeaders.create = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBROLE)' });
			$scope.formHeaders.update = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadUpdate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBROLE)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBROLE)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBROLE)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.Settings.JobRole.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBROLE'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBROLE)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.Settings.JobRole.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBROLE'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToUpdate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBROLE)', message: message });
				});
				console.error('EntityService:', error);
			});
		};


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
			Dialogs.closeWindow({ id: 'JobRole-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});