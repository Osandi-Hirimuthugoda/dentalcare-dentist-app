import bcrypt from "bcryptjs";

const run = async () => {
  const hash = await bcrypt.hash("admin123", 10);
  console.log("Admin password hash:\n", hash);
};

run();
