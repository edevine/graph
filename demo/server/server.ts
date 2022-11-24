import Koa from 'koa';
import serve from 'koa-static';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const staticPath = path.join(dirname, '../static');

const app = new Koa();
const PORT = process.env.PORT || 8080;

app.use(serve(staticPath));
app.listen(PORT);
