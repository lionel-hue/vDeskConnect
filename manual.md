📋 IMPORTANT CONSIDERATIONS & BEST PRACTICES:

Critical Points to Maintain:

    Mobile Overview Logic:

        Overview section should be hidden on mobile in both sidebar and dashboard

        Dashboard defaults to 'activity' on mobile

        Sidebar removes 'overview' option on mobile

    Component-Specific Styling:

        All CSS classes should be prefixed with component name

        Avoid global styles that might conflict

        Use BEM methodology for complex components

    Chart Lifecycle Management:

        Don't destroy charts during search operations

        Reinitialize charts only when necessary

        Preserve chart state during component updates

        Always destroy charts before recreating on same canvas

    Route Structure:

        Use nested routes (/dashboard/, /invite-manager/) for main sections

        Handle route parameters consistently using useParams()

        Maintain proper navigation flow between sections

        Use useLocation() for path-based logic

    Scroll-to-Section Logic:

        Must work for both Dashboard and InviteManager

        Use both ID and data-section attributes for fallback

        Include proper timeouts for DOM readiness

        Add location.pathname as dependency for route changes

    Modal State Management:

        Use proper conditional rendering for modals

        Implement click-outside-to-close functionality

        Manage modal state with React state hooks

        Ensure CSS class names match between JSX and CSS files

    Search Integration:

        Preserve component state during search

        Don't destroy/recreate elements unnecessarily

        Maintain chart and canvas integrity

        Handle search errors gracefully with try-catch blocks

        Provide safe fallbacks when search functions fail

    API Integration & Data Fetching:

        Implement proper loading states for all async operations

        Handle API errors gracefully with user feedback

        Provide fallback mock data when APIs are unavailable

        Use proper cleanup for API calls in useEffect

        Implement retry mechanisms for failed requests

        Maintain local state synchronization with backend

    Performance Considerations:

        Use useMemo for expensive computations (filtering, searching)

        Implement proper cleanup in useEffect

        Avoid unnecessary re-renders

        Use useRef for DOM elements and chart instances

        Debounce search inputs to reduce API calls

        Implement pagination for large datasets

    Error Handling & Resilience:

        Wrap API calls in try-catch blocks

        Provide user-friendly error messages

        Maintain functionality with fallback data

        Handle network failures gracefully

        Validate API responses before using data

    State Management:

        Keep local state in sync with backend data

        Implement optimistic updates for better UX

        Handle concurrent modifications properly

        Maintain data consistency across components

    CSS Architecture:

        Each component has its own CSS file

        Modal component has general modal styles

        Component-specific modals use component-prefixed styles

        No style conflicts between components

Testing Checklist:

✅ Modal opens/closes properly in InviteManager
✅ Dashboard routes work: /dashboard, /dashboard/overview, /dashboard/activity
✅ InviteManager routes work: /invite-manager, /invite-manager/generate-codes, /invite-manager/view-invites, /invite-manager/usage-analytics
✅ Overview section hidden on mobile, visible on desktop
✅ Charts don't disappear during search
✅ Sidebar navigation works correctly
✅ No CSS conflicts between components
✅ No chart canvas reuse errors in console
✅ Modal overlay click-outside works
✅ Modal escape key close works
✅ Scroll-to-section works for all subsections in both Dashboard and InviteManager
✅ API error handling works without breaking UI
✅ Loading states display during data fetching
✅ Search functionality works without crashing components
✅ Filter combinations work correctly (user type + status + expiry)
✅ Fallback to mock data when API is unavailable
✅ Date parsing works correctly in filtering logic
✅ Component survives search function failures
✅ All CRUD operations have proper error handling
✅ State updates correctly after API operations

New API Endpoints to Implement:

    GET /api/invites - Fetch all invite codes with optional filtering

    POST /api/invites/generate - Generate new invite code

    POST /api/invites/{id}/regenerate - Regenerate specific code

    DELETE /api/invites/{id} - Delete specific code

Security Considerations:

    Validate all API inputs on backend

    Implement proper authentication for API endpoints

    Sanitize search inputs to prevent injection

    Rate limit API endpoints to prevent abuse

Performance Optimizations Needed:

    Implement pagination for large invite code datasets

    Add debouncing to search inputs (300ms delay)

    Cache frequently accessed data

    Use compression for API responses

    Implement client-side caching for better UX