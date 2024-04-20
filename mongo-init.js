db.auth("root", "password");
db = db.getSiblingDB("WarehouseManager");
db.createUser({
  user: "WarehouseManagerUser",
  pwd: "password",
  roles: [{ role: "readWrite", db: "WarehouseManager" }],
});
db.createCollection("test");
