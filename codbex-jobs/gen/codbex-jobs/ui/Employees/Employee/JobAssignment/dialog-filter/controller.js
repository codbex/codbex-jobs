angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		if (params?.entity?.StartDateFrom) {
			params.entity.StartDateFrom = new Date(params.entity.StartDateFrom);
		}
		if (params?.entity?.StartDateTo) {
			params.entity.StartDateTo = new Date(params.entity.StartDateTo);
		}
		if (params?.entity?.EndDateFrom) {
			params.entity.EndDateFrom = new Date(params.entity.EndDateFrom);
		}
		if (params?.entity?.EndDateTo) {
			params.entity.EndDateTo = new Date(params.entity.EndDateTo);
		}
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
		$scope.optionsEmployee = params.optionsEmployee;
		$scope.optionsOrganization = params.optionsOrganization;
		$scope.optionsDepartment = params.optionsDepartment;
		$scope.optionsJobPosition = params.optionsJobPosition;
	}

	$scope.filter = () => {
		let entity = $scope.entity;
		const filter = {
			$filter: {
				equals: {
				},
				notEquals: {
				},
				contains: {
				},
				greaterThan: {
				},
				greaterThanOrEqual: {
				},
				lessThan: {
				},
				lessThanOrEqual: {
				}
			},
		};
		if (entity.Id !== undefined) {
			filter.$filter.equals.Id = entity.Id;
		}
		if (entity.Number) {
			filter.$filter.contains.Number = entity.Number;
		}
		if (entity.StartDateFrom) {
			filter.$filter.greaterThanOrEqual.StartDate = entity.StartDateFrom;
		}
		if (entity.StartDateTo) {
			filter.$filter.lessThanOrEqual.StartDate = entity.StartDateTo;
		}
		if (entity.EndDateFrom) {
			filter.$filter.greaterThanOrEqual.EndDate = entity.EndDateFrom;
		}
		if (entity.EndDateTo) {
			filter.$filter.lessThanOrEqual.EndDate = entity.EndDateTo;
		}
		if (entity.Employee !== undefined) {
			filter.$filter.equals.Employee = entity.Employee;
		}
		if (entity.Organization !== undefined) {
			filter.$filter.equals.Organization = entity.Organization;
		}
		if (entity.Department !== undefined) {
			filter.$filter.equals.Department = entity.Department;
		}
		if (entity.JobPosition !== undefined) {
			filter.$filter.equals.JobPosition = entity.JobPosition;
		}
		Dialogs.postMessage({ topic: 'codbex-jobs.Employees.JobAssignment.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'JobAssignment-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});