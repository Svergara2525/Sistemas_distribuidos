const { Level } = require("level");
const db1 = new Level("./db1");
const db2 = new Level("./db2");
const db3 = new Level("./db3");

db1.put("1", "Cambiago", function (error) {});
db1.put("2", "Saintes", function (error) {});
db1.put("3", "Bhubaneswar", function (error) {});
db1.put("4", "B.S.D.", function (error) {});
db1.put("5", "Dover", function (error) {});
db1.put("6", "Moorsele", function (error) {});
db1.put("7", "Tulsa", function (error) {});
db1.put("8", "Kungälv", function (error) {});
db1.put("9", "Eugene", function (error) {});
db1.put("10", "Linlithgow", function (error) {});

db2.put("1", "Nedlands", function (error) {});
db2.put("2", "MabomprŽ", function (error) {});
db2.put("3", "Langenburg", function (error) {});
db2.put("4", "Edmonton", function (error) {});
db2.put("5", "Villers-sur-Semois", function (error) {});
db2.put("6", "Lac-Serent", function (error) {});
db2.put("7", "Hartlepool", function (error) {});
db2.put("8", "Salzburg", function (error) {});
db2.put("9", "LiŽge", function (error) {});
db2.put("10", "Chaudfontaine", function (error) {});

db3.put("1", "valor_1", function (error) {});
db3.put("2", "valor_2", function (error) {});
db3.put("3", "valor_3", function (error) {});
db3.put("4", "valor_4", function (error) {});
db3.put("5", "valor_5", function (error) {});
db3.put("6", "valor_6", function (error) {});
db3.put("7", "valor_7", function (error) {});
db3.put("8", "valor_8", function (error) {});
db3.put("9", "valor_9", function (error) {});
db3.put("10", "valor_10", function (error) {});
