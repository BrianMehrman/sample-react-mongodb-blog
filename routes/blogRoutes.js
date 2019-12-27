const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const redis = require("redis");
const util = require("util");
const cleanCache = require("../middlewares/cleanCache");

const redisUrl = "redis://127.0.0.1:6379";
const redisClient = redis.createClient(redisUrl);
redisClient.get = util.promisify(redisClient.get);

const Blog = mongoose.model("Blog");

module.exports = app => {
  app.get("/api/blogs/:id", requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get("/api/blogs", requireLogin, async (req, res) => {
    const { id: userId } = req.user;
    const blogs = await Blog.find({ _user: userId }).cache({ key: userId });

    res.send(blogs);
  });

  app.post("/api/blogs", requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
