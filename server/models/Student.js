import pg from "pg"

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "vDesk_DB",
    password: "0000",
    port: 5432
})

const student = {
    auth: {
        async add(
            id, name, email, password, dob, soo, sex, prev_addr, curr_addr, blood_g, geno, height, weight, disability, par_guard_type, par_guard_phone, par_guard_email, par_guard_addr
        ) {
            return await pool.query(
                `INSERT INTO Public."Student"(
                    "Stu_id", "Stu_name", "email", "password", "dateofbirth", "stateoforigin", "sex", "previous_address", "current_address", "blood_group", "genotype", "height", "weight", "disability", "parent_guardian_type", "parent_guardian_phone", "parent_guardian_email", "parent_guardian_address"
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
                )`,
                [id, name, email, password, dob, soo, sex, prev_addr, curr_addr, blood_g, geno, height, weight, disability, par_guard_type, par_guard_phone, par_guard_email, par_guard_addr]
            )
        },

        junior: {
            async add(id, grade_num) {
                return await pool.query(
                    `INSERT INTO Public."Junior"( "Stu_id", "Grade_num") VALUES($1, $2)`,
                    [id, grade_num]
                )
            }
        },

        senior: {
            async add(id, role, dep_code, grade_num) {
                return await pool.query(
                    `INSERT INTO Public."Senior"( "Stu_id", "Role", "Dep_code", "Grade_num") VALUES($1, $2, $3, $4)`,
                    [id, role, dep_code, grade_num]
                )
            }
        }
    }
}

export default student