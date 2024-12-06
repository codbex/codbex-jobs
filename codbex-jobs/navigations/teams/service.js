const navigationData = {
    id: 'teams-navigation',
    label: "Teams",
    group: "company",
    order: 300,
    link: "/services/web/codbex-jobs/gen/codbex-jobs/ui/Teams/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }