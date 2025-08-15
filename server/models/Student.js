import pg from "pg"
import generator from "../utils/id_generator.js"

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "vDesk_DB",
    password: "0000",
    port: 5432
})

const student = {

    auth: {

        async add_new(id, name, email) {
            return await pool.query(`INSERT INTO Public."Student"( "Stu_id", "Stu_name", "email") VALUES( '${id}', '${name}', '${email}')`)
        },

        junior: {
            async add_new(id, grade_num) {
                return await pool.query(`INSERT INTO Public."Junior"( "Stu_id", "Grade_num") VALUES( '${id}', '${grade_num}')`)
            }
        },

        senior: {
            async add_new(id, role, dep_code, grade_num) {
                return await pool.query(`INSERT INTO Public."Senior"( "Stu_id", "Role", "Dep_code", Grade_num") VALUES( '${id}', '${role}', '${dep_code}', '${grade_num}')`)
            }
        }

    }
}

export default student