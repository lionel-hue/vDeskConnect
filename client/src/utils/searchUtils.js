// utils/searchUtils.js
export const searchDashboardData = (searchTerm, dashboardData) => {
    if (!searchTerm.trim()) {
        return dashboardData;
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
    results.overviewCards = dashboardData.overviewCards.filter(card => 
        card.title.toLowerCase().includes(term) ||
        (card.searchTerms && card.searchTerms.some(st => st.toLowerCase().includes(term))) ||
        // Search in chart data
        (card.chartData && JSON.stringify(card.chartData).toLowerCase().includes(term)) ||
        // Search in table data
        (card.tableData && card.tableData.some(row => 
            Object.values(row).some(value => 
                value.toString().toLowerCase().includes(term)
            )
        ))
    );

    // Search in activities
    results.activities = dashboardData.activities.filter(activity => 
        activity.content.toLowerCase().includes(term) ||
        activity.time.toLowerCase().includes(term)
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
                activity.content === element.content
            );
        case 'teacher-row':
            return searchResults.teachers.some(teacher => 
                teacher.name === element.name
            );
        default:
            return true;
    }
};