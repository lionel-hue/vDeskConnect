// utils/searchUtils.js
export const searchDashboardData = (searchTerm, dashboardData) => {
    if (!searchTerm.trim()) {
        return {
            stats: dashboardData.stats,
            overviewCards: dashboardData.overviewCards,
            activities: dashboardData.activities,
            teachers: dashboardData.teachers
        };
    }

    const term = searchTerm.toLowerCase().trim();
    const results = {
        stats: [],
        overviewCards: [],
        activities: [],
        teachers: []
    };

    // Search in stats cards
    results.stats = dashboardData.stats.filter(stat => 
        stat.label.toLowerCase().includes(term) ||
        stat.number.toString().includes(term) ||
        (stat.searchTerms && stat.searchTerms.some(st => st.toLowerCase().includes(term)))
    );

    // Search in overview cards
    results.overviewCards = dashboardData.overviewCards.filter(card => {
        const matchesTitle = card.title.toLowerCase().includes(term);
        const matchesSearchTerms = card.searchTerms && card.searchTerms.some(st => st.toLowerCase().includes(term));
        const matchesChartData = card.chartData && JSON.stringify(card.chartData).toLowerCase().includes(term);
        const matchesTableData = card.tableData && card.tableData.some(row => 
            Object.values(row).some(value => 
                value.toString().toLowerCase().includes(term)
            )
        );
        
        return matchesTitle || matchesSearchTerms || matchesChartData || matchesTableData;
    });

    // Search in activities
    results.activities = dashboardData.activities.filter(activity => 
        activity.content.toLowerCase().includes(term) ||
        activity.time.toLowerCase().includes(term) ||
        (activity.searchTerms && activity.searchTerms.some(st => st.toLowerCase().includes(term)))
    );

    // Search in teacher table
    results.teachers = dashboardData.teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(term) ||
        teacher.grade.toLowerCase().includes(term) ||
        teacher.subject.toLowerCase().includes(term) ||
        teacher.email.toLowerCase().includes(term)
    );

    return results;
};

export const shouldShowElement = (element, searchTerm, searchResults, elementType) => {
    if (!searchTerm.trim()) return true;

    switch (elementType) {
        case 'stat-card':
            return searchResults.stats.some(stat => 
                stat.label === element.label && stat.number === element.number
            );
        case 'overview-card':
            return searchResults.overviewCards.some(card => card.title === element.title);
        case 'activity-item':
            return searchResults.activities.some(activity => 
                activity.content === element.content && activity.time === element.time
            );
        case 'teacher-row':
            return searchResults.teachers.some(teacher => 
                teacher.name === element.name
            );
        default:
            return true;
    }
};