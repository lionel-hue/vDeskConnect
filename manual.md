📋 IMPORTANT CONSIDERATIONS & BEST PRACTICES:

Critical Points to Maintain:

1. Mobile Overview Logic:
   - Overview section should be hidden on mobile in both sidebar and dashboard
   - Dashboard defaults to 'activity' on mobile  
   - Sidebar removes 'overview' option on mobile

2. Component-Specific Styling:
   - All CSS classes should be prefixed with component name
   - Avoid global styles that might conflict
   - Use BEM methodology for complex components

3. Chart Lifecycle Management:
   - Don't destroy charts during search operations
   - Reinitialize charts only when necessary
   - Preserve chart state during component updates
   - Always destroy charts before recreating on same canvas

4. Route Structure:
   - Use nested routes (/dashboard/*, /invite-manager/*) for main sections
   - Handle route parameters consistently using useParams()
   - Maintain proper navigation flow between sections
   - Use useLocation() for path-based logic

5. Scroll-to-Section Logic:
   - Must work for both Dashboard and InviteManager
   - Use both ID and data-section attributes for fallback
   - Include proper timeouts for DOM readiness
   - Add location.pathname as dependency for route changes

6. Modal State Management:
   - Use proper conditional rendering for modals
   - Implement click-outside-to-close functionality
   - Manage modal state with React state hooks
   - Ensure CSS class names match between JSX and CSS files

7. Search Integration:
   - Preserve component state during search
   - Don't destroy/recreate elements unnecessarily
   - Maintain chart and canvas integrity

8. Performance Considerations:
   - Use useMemo for expensive computations
   - Implement proper cleanup in useEffect
   - Avoid unnecessary re-renders
   - Use useRef for DOM elements and chart instances

9. CSS Architecture:
   - Each component has its own CSS file
   - Modal component has general modal styles
   - Component-specific modals use component-prefixed styles
   - No style conflicts between components

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