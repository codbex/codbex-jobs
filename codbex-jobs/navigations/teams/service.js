const navigationData = {
    id: 'teams-navigation',
    label: "Teams",
    group: "employees",
    order: 1000,
    link: "/services/web/codbex-jobs/gen/codbex-jobs/ui/Teams/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }