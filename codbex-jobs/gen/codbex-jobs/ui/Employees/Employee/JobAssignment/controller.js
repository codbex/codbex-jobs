angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-jobs/gen/codbex-jobs/api/Employees/JobAssignmentService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete JobAssignment? This action cannot be undone.',
			deleteTitle: 'Delete JobAssignment?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.yes');
			translated.no = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-jobs:codbex-jobs-model.defaults.deleteTitle', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)' });
			translated.deleteConfirm = LocaleService.t('codbex-jobs:codbex-jobs-model.messages.deleteConfirm', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)' });
		});
		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-jobs-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Employees' && e.view === 'JobAssignment' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'Employees' && e.view === 'JobAssignment' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					selectedMainEntityKey: 'Employee',
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
					selectedMainEntityKey: 'Employee',
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
		Dialogs.addMessageListener({ topic: 'codbex-employees.Employees.Employee.entitySelected', handler: (data) => {
			resetPagination();
			$scope.selectedMainEntityId = data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-employees.Employees.Employee.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.Employees.JobAssignment.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.Employees.JobAssignment.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.Employees.JobAssignment.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-jobs.Employees.JobAssignment.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			let Employee = $scope.selectedMainEntityId;
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
			filter.$filter.equals.Employee = Employee;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				EntityService.search(filter).then((response) => {
					response.data.forEach(e => {
						if (e.StartDate) {
							e.StartDate = new Date(e.StartDate);
						}
						if (e.EndDate) {
							e.EndDate = new Date(e.EndDate);
						}
					});

					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT'),
						message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToLF', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT'),
					message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToCount', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)', message: message }),
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
				id: 'JobAssignment-details',
				params: {
					action: 'select',
					entity: entity,
					optionsEmployee: $scope.optionsEmployee,
					optionsOrganization: $scope.optionsOrganization,
					optionsDepartment: $scope.optionsDepartment,
					optionsJobPosition: $scope.optionsJobPosition,
				},
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'JobAssignment-filter',
				params: {
					entity: $scope.filterEntity,
					optionsEmployee: $scope.optionsEmployee,
					optionsOrganization: $scope.optionsOrganization,
					optionsDepartment: $scope.optionsDepartment,
					optionsJobPosition: $scope.optionsJobPosition,
				},
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'JobAssignment-details',
				params: {
					action: 'create',
					entity: {
						'Employee': $scope.selectedMainEntityId
					},
					selectedMainEntityKey: 'Employee',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsEmployee: $scope.optionsEmployee,
					optionsOrganization: $scope.optionsOrganization,
					optionsDepartment: $scope.optionsDepartment,
					optionsJobPosition: $scope.optionsJobPosition,
				},
				closeButton: false
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'JobAssignment-details',
				params: {
					action: 'update',
					entity: entity,
					selectedMainEntityKey: 'Employee',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsEmployee: $scope.optionsEmployee,
					optionsOrganization: $scope.optionsOrganization,
					optionsDepartment: $scope.optionsDepartment,
					optionsJobPosition: $scope.optionsJobPosition,
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
						Dialogs.triggerEvent('codbex-jobs.Employees.JobAssignment.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT'),
							message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToDelete', { name: '$t(codbex-jobs:codbex-jobs-model.t.JOBASSIGNMENT)', message: message }),
							type: AlertTypes.Error,
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsEmployee = [];
		$scope.optionsOrganization = [];
		$scope.optionsDepartment = [];
		$scope.optionsJobPosition = [];


		$http.get('/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts').then((response) => {
			$scope.optionsEmployee = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Employee',
				message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$http.get('/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/OrganizationService.ts').then((response) => {
			$scope.optionsOrganization = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Organization',
				message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$http.get('/services/ts/codbex-organizations/gen/codbex-organizations/api/Organizations/DepartmentService.ts').then((response) => {
			$scope.optionsDepartment = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Department',
				message: LocaleService.t('codbex-jobs:codbex-jobs-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

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

		$scope.optionsEmployeeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsEmployee.length; i++) {
				if ($scope.optionsEmployee[i].value === optionKey) {
					return $scope.optionsEmployee[i].text;
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
		//----------------Dropdowns-----------------//
	});
