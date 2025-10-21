// utils/searchUtils.js

// Dashboard-specific search function
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

// Invite Manager-specific search function
export const searchInviteManagerData = (searchTerm, inviteManagerData) => {
    if (!searchTerm.trim()) {
        return {
            sections: ['generate-codes', 'view-invites', 'usage-analytics'],
            invites: inviteManagerData.invites,
            generatedCode: inviteManagerData.generatedCode
        };
    }

    const term = searchTerm.toLowerCase().trim();
    const results = {
        sections: [],
        invites: [],
        generatedCode: null
    };

    // Search in generated code
    if (inviteManagerData.generatedCode) {
        const codeMatches = inviteManagerData.generatedCode.code.toLowerCase().includes(term);
        const userTypeMatches = inviteManagerData.generatedCode.userType.toLowerCase().includes(term);
        const dateMatches = 
            formatDate(inviteManagerData.generatedCode.createdAt).toLowerCase().includes(term) ||
            formatDate(inviteManagerData.generatedCode.expiresAt).toLowerCase().includes(term);
        
        if (codeMatches || userTypeMatches || dateMatches) {
            results.sections.push('generate-codes');
            results.generatedCode = inviteManagerData.generatedCode;
        }
    }

    // Search in invites
    results.invites = inviteManagerData.invites.filter(invite => 
        invite.code.toLowerCase().includes(term) ||
        (invite.used_by && invite.used_by.toLowerCase().includes(term)) ||
        invite.user_type.toLowerCase().includes(term) ||
        formatDate(invite.created_at).toLowerCase().includes(term) ||
        formatDate(invite.expires_at).toLowerCase().includes(term) ||
        (invite.used_at && formatDate(invite.used_at).toLowerCase().includes(term))
    );

    if (results.invites.length > 0) {
        results.sections.push('view-invites');
    }

    // Search in analytics (stats and chart data)
    const totalCodes = inviteManagerData.invites.length;
    const activeCodes = inviteManagerData.invites.filter(i => !i.used && i.expires_at >= new Date()).length;
    const usageRate = totalCodes > 0 ? Math.round((inviteManagerData.invites.filter(i => i.used).length / totalCodes) * 100) : 0;
    const expiredCodes = inviteManagerData.invites.filter(i => i.expires_at < new Date() && !i.used).length;

    const analyticsMatches = 
        'analytics'.includes(term) ||
        'statistics'.includes(term) ||
        'usage'.includes(term) ||
        'chart'.includes(term) ||
        totalCodes.toString().includes(term) ||
        activeCodes.toString().includes(term) ||
        usageRate.toString().includes(term) ||
        expiredCodes.toString().includes(term);

    if (analyticsMatches) {
        results.sections.push('usage-analytics');
    }

    // If no specific section matches but search term is generic, show all sections
    if (results.sections.length === 0 && (
        term.includes('invite') || 
        term.includes('code') || 
        term.includes('generate') ||
        term.includes('manager')
    )) {
        results.sections = ['generate-codes', 'view-invites', 'usage-analytics'];
        results.invites = inviteManagerData.invites;
        results.generatedCode = inviteManagerData.generatedCode;
    }

    return results;
};

// Unified shouldShowElement function that works for both components
export const shouldShowElement = (element, searchTerm, searchResults, elementType) => {
    if (!searchTerm.trim()) return true;

    switch (elementType) {
        // Dashboard element types
        case 'stat-card':
            return searchResults.stats && searchResults.stats.some(stat => 
                stat.label === element.label && stat.number === element.number
            );
        case 'overview-card':
            return searchResults.overviewCards && searchResults.overviewCards.some(card => card.title === element.title);
        case 'activity-item':
            return searchResults.activities && searchResults.activities.some(activity => 
                activity.content === element.content && activity.time === element.time
            );
        case 'teacher-row':
            return searchResults.teachers && searchResults.teachers.some(teacher => 
                teacher.name === element.name
            );
        
        // Invite Manager element types
        case 'invite-row':
            return searchResults.invites && searchResults.invites.some(invite => invite.id === element.id);
        case 'generated-code':
            return searchResults.generatedCode !== null;
        case 'invite-section':
            return searchResults.sections && searchResults.sections.includes(element);
            
        default:
            return true;
    }
};

// Helper function for date formatting (used by both components)
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};