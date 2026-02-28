// models/InviteCode.js
import { postgres } from "../database/postgres.js"


const invite_code = {
    auth: {
        async verify_invite(code) {
            return postgres.pool.query(`SELECT * FROM Public."InviteCode" WHERE code = $1 AND NOT used AND expires_at > NOW();`, [code])
        },

        async use_invite_code(code) {
            return postgres.pool.query(`UPDATE Public."InviteCode" SET used = TRUE WHERE code = $1`, [code])
        }
    },

    main: {
        async get_codes(admin_id, page = 1, limit = 10, search = '', filters = {}) {
            const offset = (page - 1) * limit;
            let query = `SELECT * FROM Public."InviteCode" WHERE admin_id = $1`;
            let params = [admin_id];
            let paramCount = 1;

            // Add search filter
            if (search) {
                paramCount++;
                query += ` AND (code ILIKE $${paramCount} OR used_by ILIKE $${paramCount})`;
                params.push(`%${search}%`);
            }

            // Add user_type filter
            if (filters.user_type && filters.user_type !== 'all') {
                paramCount++;
                query += ` AND user_type = $${paramCount}`;
                params.push(filters.user_type);
            }

            // Add usage filter
            if (filters.usage && filters.usage !== 'all') {
                paramCount++;
                if (filters.usage === 'used') {
                    query += ` AND used = true`;
                } else if (filters.usage === 'unused') {
                    query += ` AND used = false`;
                }
            }

            // Add expiry filter
            if (filters.expiry && filters.expiry !== 'all') {
                if (filters.expiry === 'expired') {
                    query += ` AND expires_at < NOW()`;
                } else if (filters.expiry === 'valid') {
                    query += ` AND expires_at >= NOW()`;
                }
            }

            // Add ordering and pagination
            query += ` ORDER BY 
                CASE WHEN used_by IS NULL THEN 1 ELSE 0 END, 
                used_by ASC, 
                created_at DESC 
                LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            
            params.push(limit, offset);

            return postgres.pool.query(query, params);
        },

        async get_total_count(admin_id, search = '', filters = {}) {
            let query = `SELECT COUNT(*) FROM Public."InviteCode" WHERE admin_id = $1`;
            let params = [admin_id];
            let paramCount = 1;

            // Add search filter
            if (search) {
                paramCount++;
                query += ` AND (code ILIKE $${paramCount} OR used_by ILIKE $${paramCount})`;
                params.push(`%${search}%`);
            }

            // Add user_type filter
            if (filters.user_type && filters.user_type !== 'all') {
                paramCount++;
                query += ` AND user_type = $${paramCount}`;
                params.push(filters.user_type);
            }

            // Add usage filter
            if (filters.usage && filters.usage !== 'all') {
                if (filters.usage === 'used') {
                    query += ` AND used = true`;
                } else if (filters.usage === 'unused') {
                    query += ` AND used = false`;
                }
            }

            // Add expiry filter
            if (filters.expiry && filters.expiry !== 'all') {
                if (filters.expiry === 'expired') {
                    query += ` AND expires_at < NOW()`;
                } else if (filters.expiry === 'valid') {
                    query += ` AND expires_at >= NOW()`;
                }
            }

            return postgres.pool.query(query, params);
        },

        async create_code(code_data) {
            const { id, code, user_type, expires_at, used_by, used_at, admin_id } = code_data;
            return postgres.pool.query(
                `INSERT INTO Public."InviteCode" (id, code, user_type, expires_at, used_by, used_at, admin_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [id, code, user_type, expires_at, used_by, used_at, admin_id]
            );
        },

        async regenerate_code(id, new_code) {
            return postgres.pool.query(
                `UPDATE Public."InviteCode" 
                 SET code = $1, created_at = NOW(), expires_at = NOW() + INTERVAL '7 days', used = false, used_by = NULL, used_at = NULL 
                 WHERE id = $2 RETURNING *`,
                [new_code, id]
            );
        },

        async delete_code(id) {
            return postgres.pool.query(`DELETE FROM Public."InviteCode" WHERE id = $1`, [id]);
        }
    }
}

export default invite_code;