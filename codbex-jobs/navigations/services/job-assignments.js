const navigationData = {
    id: 'job-assignments-navigation',
    label: "Job Assignments",
    view: "job assignments",
    group: "employees",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-jobs/gen/codbex-jobs/ui/JobAssignment/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }