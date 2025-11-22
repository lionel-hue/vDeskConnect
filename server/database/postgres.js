import pg from "pg"

export const postgres = () => {

    const pool = new pg.Pool({
        user: "postgres",
        host: "localhost",
        database: "vDesk_DB",
        password: "0000",
        port: 5432
    })
}