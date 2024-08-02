const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const middleware = require("./src/utils/middleware");
const cors = require("cors");
require("./src/model/dbConnection");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");

const usersRouter = require("./src/routes/user.routes");
const partnersRouter = require("./src/routes/partner.routes");
const campaignsRouter = require("./src/routes/campaign.routes");

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(middleware.errorHandler);
app.use(middleware.requestLogger);

app.use("/api/users", usersRouter);
app.use("/api/partners", partnersRouter);
app.use("/api/campaigns", campaignsRouter);

app.use(middleware.unknownEndpoint);

module.exports = app;
