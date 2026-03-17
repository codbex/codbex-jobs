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
		$scope.optionsStatus = params.optionsStatus;
		$scope.optionsType = params.optionsType;
		$scope.optionsTeam = params.optionsTeam;
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
		if (entity.Role !== undefined) {
			filter.$filter.equals.Role = entity.Role;
		}
		if (entity.Status !== undefined) {
			filter.$filter.equals.Status = entity.Status;
		}
		if (entity.Type !== undefined) {
			filter.$filter.equals.Type = entity.Type;
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
		if (entity.DaysOpened !== undefined) {
			filter.$filter.equals.DaysOpened = entity.DaysOpened;
		}
		if (entity.Team !== undefined) {
			filter.$filter.equals.Team = entity.Team;
		}
		Dialogs.postMessage({ topic: 'codbex-jobs.Teams.JobPosition.entitySearch', data: {
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
		Dialogs.closeWindow({ id: 'JobPosition-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});