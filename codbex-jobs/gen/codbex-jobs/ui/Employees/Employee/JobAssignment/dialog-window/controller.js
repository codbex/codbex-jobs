angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Employees/JobAssignmentService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'JobAssignment successfully created';
		let propertySuccessfullyUpdated = 'JobAssignment successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'JobAssignment Details',
			create: 'Create JobAssignment',
			update: 'Update JobAssignment'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadSelect', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)' });
			$scope.formHeaders.create = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)' });
			$scope.formHeaders.update = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.formHeadUpdate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;

			if (params.entity.StartDate) {
				params.entity.StartDate = new Date(params.entity.StartDate);
			}
			if (params.entity.EndDate) {
				params.entity.EndDate = new Date(params.entity.EndDate);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsEmployee = params.optionsEmployee;
			$scope.optionsOrganization = params.optionsOrganization;
			$scope.optionsDepartment = params.optionsDepartment;
			$scope.optionsJobPosition = params.optionsJobPosition;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-jobs.Employees.JobAssignment.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCreate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)', message: message }),
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
				Dialogs.postMessage({ topic: 'codbex-jobs.Employees.JobAssignment.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToUpdate', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceEmployee = '/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts';
		$scope.serviceOrganization = '/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/OrganizationService.ts';
		$scope.serviceDepartment = '/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/DepartmentService.ts';
		$scope.serviceJobPosition = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Teams/JobPositionService.ts';

		$scope.$watch('entity.Organization', function (newValue, oldValue) {
			if (newValue !== undefined && newValue !== null) {
				$http.get($scope.serviceOrganization + '/' + newValue).then((response) => {
					let valueFrom = response.data.Id;
					$http.post('/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/DepartmentService.ts/search', {
						$filter: {
							equals: {
								Organization: valueFrom
							}
						}
					}).then((response) => {
						$scope.optionsDepartment = response.data.map(e => ({
							value: e.Id,
							text: e.Name
						}));
						if ($scope.action !== 'select' && newValue !== oldValue) {
							if ($scope.optionsDepartment.length == 1) {
								$scope.entity.Department = $scope.optionsDepartment[0].value;
							} else {
								$scope.entity.Department = undefined;
							}
						}
					}, (error) => {
						console.error(error);
					});
				}, (error) => {
					console.error(error);
				});
			}
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
			Dialogs.closeWindow({ id: 'JobAssignment-details' });
		};
	});