const navigationData = {
    id: 'job-assignments-navigation',
    label: "Job Assignments",
    group: "employees",
    order: 600,
    link: "/services/web/codbex-jobs/gen/codbex-jobs/ui/JobAssignment/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }