import bcrypt from "bcryptjs";

const hash = await bcrypt.hash("123456", 10)

console.log( hash )
console.log( await bcrypt.compare("123456", "$2b$10$MvunVDaubn7geIlYFuSgBukL3DsEhb0GU/s.3/URXy9H07MdjZH3e" ) )