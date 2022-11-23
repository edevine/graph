import Koa from 'koa';

const app = new Koa();

const PORT = process.env.PORT || 8080;

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(PORT);
