// routes/invite_manager.js
import { Router } from "express";
import invite_code from "../../models/InviteCode.js";
import generator from "../../utils/id_generator.js";

const invite_manager_router = Router();

// Get all invite codes with pagination and filtering
invite_manager_router.get('/all_invite_codes', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            user_type = 'all', 
            usage = 'all', 
            expiry = 'all' 
        } = req.query;

        // TODO: Get admin_id from authenticated user session
        const admin_id = 1; // Replace with actual admin_id from auth

        const filters = {
            user_type,
            usage,
            expiry
        };

        // Get paginated results
        const result = await invite_code.main.get_codes(
            admin_id, 
            parseInt(page), 
            parseInt(limit), 
            search, 
            filters
        );

        // Get total count for pagination
        const countResult = await invite_code.main.get_total_count(admin_id, search, filters);
        const totalCount = parseInt(countResult.rows[0].count);

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
        console.error('Error fetching invite codes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invite codes'
        });
    }
});

// Generate new invite code
invite_manager_router.post('/generate', async (req, res) => {
    try {
        const { user_type } = req.body;
        
        // TODO: Get admin_id from authenticated user session
        const admin_id = 1; // Replace with actual admin_id from auth

        // Generate unique code
        const prefix = user_type === 'teacher' ? 'TCH' : 'STD';
        const randomPart = generator();
        const code = `${prefix}-${randomPart}`;

        const code_data = {
            id: Date.now(), // You might want to use UUID or sequence instead
            code,
            user_type,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            used_by: null,
            used_at: null,
            admin_id
        };

        const result = await invite_code.main.create_code(code_data);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error generating invite code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate invite code'
        });
    }
});

// Regenerate invite code
invite_manager_router.post('/:id/regenerate', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Generate new code
        const newCode = `${req.body.user_type === 'teacher' ? 'TCH' : 'STD'}-${generator()}`;
        
        const result = await invite_code.main.regenerate_code(id, newCode);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invite code not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error regenerating invite code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate invite code'
        });
    }
});

// Delete invite code
invite_manager_router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await invite_code.main.delete_code(id);
        
        res.json({
            success: true,
            message: 'Invite code deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting invite code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete invite code'
        });
    }
});

export default invite_manager_router;