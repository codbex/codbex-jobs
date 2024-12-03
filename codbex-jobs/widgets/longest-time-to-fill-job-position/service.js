const widgetData = {
    id: 'longest-time-to-fill-job-position',
    label: 'Longest time to fill job position',
    link: '/services/web/codbex-jobs/widgets/longest-time-to-fill-job-position/index.html',
    redirectViewId: 'teams-navigation',
    size: "small"
};

function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = getWidget;
}

export { getWidget }