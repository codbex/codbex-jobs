angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		if (params?.entity?.DateOpenedFrom) {
			params.entity.DateOpenedFrom = new Date(params.entity.DateOpenedFrom);
		}
		if (params?.entity?.DateOpenedTo) {
			params.entity.DateOpenedTo = new Date(params.entity.DateOpenedTo);
		}
		if (params?.entity?.DateClosedFrom) {
			params.entity.DateClosedFrom = new Date(params.entity.DateClosedFrom);
		}
		if (params?.entity?.DateClosedTo) {
			params.entity.DateClosedTo = new Date(params.entity.DateClosedTo);
		}
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
		$scope.optionsJobPosition = params.optionsJobPosition;
		$scope.optionsStatus = params.optionsStatus;
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
		if (entity.JobPosition !== undefined) {
			filter.$filter.equals.JobPosition = entity.JobPosition;
		}
		if (entity.DaysOpened !== undefined) {
			filter.$filter.equals.DaysOpened = entity.DaysOpened;
		}
		if (entity.DateOpenedFrom) {
			filter.$filter.greaterThanOrEqual.DateOpened = entity.DateOpenedFrom;
		}
		if (entity.DateOpenedTo) {
			filter.$filter.lessThanOrEqual.DateOpened = entity.DateOpenedTo;
		}
		if (entity.DateClosedFrom) {
			filter.$filter.greaterThanOrEqual.DateClosed = entity.DateClosedFrom;
		}
		if (entity.DateClosedTo) {
			filter.$filter.lessThanOrEqual.DateClosed = entity.DateClosedTo;
		}
		if (entity.Status !== undefined) {
			filter.$filter.equals.Status = entity.Status;
		}
		Dialogs.postMessage({ topic: 'codbex-jobs.JobOffer.JobOffer.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		Dialogs.triggerEvent('codbex-jobs.JobOffer.JobOffer.clearDetails');
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'JobOffer-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});