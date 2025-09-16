import pg from "pg"

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "vDesk_DB",
    password: "0000",
    port: 5432
})

const general = {
    auth : {
        
        async verify_invite(code){
            return pool.query(`SELECT * FROM Public."InviteCode" WHERE code = $1 AND NOT used  AND expires_at > NOW();`,[code])
        },

        async use_invite_code(code){
            return pool.query(`UPDATE Public."InviteCode" SET used = TRUE WHERE code = $1`, [code])
        },

        async verify_token(code){
            return pool.query(`SELECT * FROM Public."Token" WHERE code = $1 AND NOT used  AND expires_at > NOW();`,[code])
        },

        async use_token(code){
            return pool.query(`UPDATE Public."Token" SET used = TRUE WHERE code = $1`, [code])
        }
    }
}

export default general