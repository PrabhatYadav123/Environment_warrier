require("dotenv").config();

const { verifyInstagramConnection } = require("./instagram");

verifyInstagramConnection().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
});
