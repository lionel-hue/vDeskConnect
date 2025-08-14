import pg from "pg"
import generator from "../utils/id_generator.js"

const pool = new pg.Pool({
    user : "postgres",
    host : "localhost",
    database : "vDesk_DB",
    password : "0000",
    port : 5432
})

const student = {

    auth : {

        async add_new (name){
            return await pool.query(`INSERT INTO Public."Student"( "Stu_id", "Stu_name") VALUES( '${generator()}', '${name}')`)
        }
    }

} 

export default student