import pg from "pg"

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "vDesk_DB",
    password: "0000",
    port: 5432
})

const general = {
    auth: {

        invite: {

            async verify_invite(code) {
                return pool.query(`SELECT * FROM Public."InviteCode" WHERE code = $1 AND NOT used  AND expires_at > NOW();`, [code])
            },

            async use_invite_code(code) {
                return pool.query(`UPDATE Public."InviteCode" SET used = TRUE WHERE code = $1`, [code])
            }
        },

        token: {

            async get_token(used_by) {
                return pool.query(`SELECT * FROM Public."Token" WHERE used_by = $1 AND NOT used  AND expires_at > NOW();`, [used_by])
            },

            async use_token(user_id, used_at) {
                return pool.query(`UPDATE Public."Token" SET used = TRUE, used_at = $1 WHERE used_by = $2`, [used_at, user_id])
            },

            async build_token(id, token, user_type, exipres_at, used_by) {
                return pool.query(` 
                    INSERT INTO public."Token"(id, "token", "user_type", "expires_at", "used_by" ) VALUES( $1, $2, $3, $4, $5 ); 
                    `, [id, token, user_type, exipres_at, used_by])
            }
        }

    }
}

export default general