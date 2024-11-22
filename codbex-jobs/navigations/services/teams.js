const navigationData = {
    id: 'teams-navigation',
    label: "Teams",
    view: "Teams",
    group: "employees",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-jobs/gen/codbex-jobs/ui/Teams/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }