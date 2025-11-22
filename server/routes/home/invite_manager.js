    // routes/invite_manager.js - UPDATED WITH DYNAMIC ADMIN ID
import { Router } from "express";
import invite_code from "../../models/InviteCode.js";
import generator from "../../utils/id_generator.js";

const invite_manager_router = Router();

// Get all invite codes with pagination and filtering
invite_manager_router.get('/all_invite_codes', async (req, res) => {
    try {
        console.log('🔍 GET /all_invite_codes - Query params:', req.query);
        
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            user_type = 'all', 
            usage = 'all', 
            expiry = 'all',
            admin_id // Get admin_id from query params
        } = req.query;

        // Use the provided admin_id or fallback to authenticated user
        const actualAdminId = admin_id || req.user?.id || 1;
        
        console.log('👤 Using admin_id:', actualAdminId);

        if (!actualAdminId) {
            return res.status(400).json({
                success: false,
                message: 'Admin ID is required'
            });
        }

        const filters = {
            user_type,
            usage,
            expiry
        };

        console.log('🔄 Fetching codes with filters:', { actualAdminId, page, limit, search, filters });

        // Get paginated results
        const result = await invite_code.main.get_codes(
            actualAdminId, 
            parseInt(page), 
            parseInt(limit), 
            search, 
            filters
        );

        console.log('✅ Database result rows:', result.rows.length);

        // Get total count for pagination
        const countResult = await invite_code.main.get_total_count(actualAdminId, search, filters);
        const totalCount = parseInt(countResult.rows[0].count);

        console.log('📊 Total count:', totalCount);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalCount,
                hasNext: (parseInt(page) * parseInt(limit)) < totalCount,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('❌ Error fetching invite codes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invite codes',
            error: error.message
        });
    }
});

// Generate new invite code
invite_manager_router.post('/generate', async (req, res) => {
    try {
        console.log('🔧 POST /generate - Request body:', req.body);
        
        const { user_type, admin_id } = req.body;
        
        // Use the provided admin_id or fallback to authenticated user
        const actualAdminId = admin_id || req.user?.id || 1;
        
        console.log('👤 Using admin_id for generation:', actualAdminId);

        if (!actualAdminId) {
            return res.status(400).json({
                success: false,
                message: 'Admin ID is required'
            });
        }

        if (!user_type) {
            return res.status(400).json({
                success: false,
                message: 'User type is required'
            });
        }

        // Generate unique code
        const prefix = user_type === 'teacher' ? 'TCH' : 'STD';
        const randomPart = generator();
        const code = `${prefix}-${randomPart}`;

        console.log('🎯 Generated code:', code);

        const code_data = {
            id: Date.now(), // You might want to use UUID or sequence instead
            code,
            user_type,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            used_by: null,
            used_at: null,
            admin_id: actualAdminId
        };

        console.log('💾 Saving code data:', code_data);

        const result = await invite_code.main.create_code(code_data);
        
        console.log('✅ Code created successfully:', result.rows[0]);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error generating invite code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate invite code',
            error: error.message
        });
    }
});

// Regenerate invite code
invite_manager_router.post('/:id/regenerate', async (req, res) => {
    try {
        console.log('🔄 POST /regenerate - Params:', req.params, 'Body:', req.body);
        
        const { id } = req.params;
        const { user_type, admin_id } = req.body;
        
        // Use the provided admin_id or fallback to authenticated user
        const actualAdminId = admin_id || req.user?.id || 1;
        
        console.log('👤 Using admin_id for regeneration:', actualAdminId);

        // Generate new code
        const newCode = `${user_type === 'teacher' ? 'TCH' : 'STD'}-${generator()}`;
        
        console.log('🎯 Regenerating code:', { id, newCode, admin_id: actualAdminId });
        
        const result = await invite_code.main.regenerate_code(id, newCode);
        
        if (result.rows.length === 0) {
            console.log('❌ Code not found for regeneration:', id);
            return res.status(404).json({
                success: false,
                message: 'Invite code not found'
            });
        }

        console.log('✅ Code regenerated successfully:', result.rows[0]);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error regenerating invite code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate invite code',
            error: error.message
        });
    }
});

// Delete invite code
invite_manager_router.delete('/:id', async (req, res) => {
    try {
        console.log('🗑️ DELETE /:id - Params:', req.params);
        
        const { id } = req.params;
        
        console.log('🎯 Deleting code:', id);
        
        const result = await invite_code.main.delete_code(id);
        
        console.log('✅ Code deleted successfully');
        
        res.json({
            success: true,
            message: 'Invite code deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting invite code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete invite code',
            error: error.message
        });
    }
});

export default invite_manager_router;