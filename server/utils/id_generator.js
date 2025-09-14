const generator = {

    id() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
        let id = '';
        for (let i = 0; i < 9; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    },

    auth_code() {
        const val = Math.round(Math.random()*999999).toString()
        return  val <= 99999 ? this.auth_code() : val
    }
};

export default generator;