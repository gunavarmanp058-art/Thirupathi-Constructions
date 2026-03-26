const pool = require('./src/config/db');
async function check() {
    try {
        const [rows] = await pool.query("SELECT * FROM machines");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
