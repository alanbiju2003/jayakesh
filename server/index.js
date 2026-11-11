const app = require("./app");
const db = require("./db");

const PORT = Number(process.env.PORT || 3000);

db.initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=====================================================`);
      console.log(`🌿 Jayakesh Kerala Hair Oil Server Running`);
      console.log(`   Storefront : http://localhost:${PORT}`);
      console.log(`   Admin Panel: http://localhost:${PORT}/admin`);
      console.log(`   Database   : ${db.getStorageInfo().driver.toUpperCase()}`);
      console.log(`=====================================================`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
