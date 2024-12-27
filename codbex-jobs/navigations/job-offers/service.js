const navigationData = {
    id: 'job-offers-navigation',
    label: "Job Offers",
    group: "employees",
    order: 600,
    link: "/services/web/codbex-jobs/gen/codbex-jobs/ui/JobOffer/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }