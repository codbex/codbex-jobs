const navigationData = {
    id: 'employee-assignments-navigation',
    label: "Employee Assignments",
    group: "employees",
    order: 600,
    link: "/services/web/codbex-jobs/gen/codbex-jobs/ui/EmployeeAssignment/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }