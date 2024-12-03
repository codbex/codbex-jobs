const widgetData = {
    id: 'open-job-positions',
    label: 'Open Job Positions',
    link: '/services/web/codbex-jobs/widgets/open-job-positions/index.html',
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