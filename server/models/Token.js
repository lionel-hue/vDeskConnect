import { postgres } from "../database/postgres.js"


const token = {
    auth: {

            async get_token(used_by) {
                return postgres.pool.query(`SELECT * FROM Public."Token" WHERE used_by = $1 AND NOT used  AND expires_at > NOW();`, [used_by])
            },

            async use_token(user_id, used_at) {
                return postgres.pool.query(`UPDATE Public."Token" SET used = TRUE, used_at = $1 WHERE used_by = $2`, [used_at, user_id])
            },

            async build_token(id, token, user_type, exipres_at, used_by) {
                return postgres.pool.query(` 
                    INSERT INTO public."Token"(id, "token", "user_type", "expires_at", "used_by" ) VALUES( $1, $2, $3, $4, $5 ); 
                    `, [id, token, user_type, exipres_at, used_by])
            }
        }
}

export default token