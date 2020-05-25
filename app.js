const Koa = require('koa'),
    router = require('koa-router')(),
    render = require('koa-art-template'),
    path = require('path'),
    static = require('koa-static'),
    koaBody = require('koa-body'),
    session = require('koa-session'),
    admin = require('./routes/admin')
    sha1 = require('sha1'),
    api = require('./routes/api'),
    cors = require('koa2-cors')
    

 
/////////////////////////////////////////////////////

//实例化对象
const app = new Koa(),
    server = require('http').createServer(app.callback()),
    io = require('socket.io')(server)
//全局变量
global.uploadedFileName = ''

//配置静态资源
// app.use(static('statics'))
app.use(static(path.join(__dirname, 'statics')))

//配置模板
render(app, {
    root: path.join(__dirname, 'views'),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production'
});

//配置koaBody
app.use(koaBody({
    multipart: true
}))

//配置session
app.keys = ['some secret hurr'];

const CONFIG = {
    key: 'koa.sess',
    /** (string) cookie key (default is koa.sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true,
    /** (boolean) can overwrite or not (default true) */
    httpOnly: true,
    /** (boolean) httpOnly or not (default true) */
    signed: true,
    /** (boolean) signed or not (default true) */
    rolling: false,
    /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false,
    /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    secure: false,
    /** (boolean) secure cookie*/
    sameSite: null,
    /** (string) session cookie sameSite options (default null, don't set it) */
};

app.use(session(CONFIG, app));

//配合CORS
app.use(cors({
    origin: function(ctx) {
      if (ctx.url === '/test') {
        return false;
      }
      return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept','Token'],
  }));

  //创建socket连接
  io.on('connection',(socket)=>{
      socket.on('message',(msg)=>{
          console.log('接受前端message:'+msg);
          io.emit('message','来自服务器端的消息')
      })

      //监听链接断开
      socket.on('disconnect',()=>{
          console.log('连接断开')
      })
  })
/////////////////////////////////////////////////////
//首页
router.get('/', ctx => {
    ctx.body = 'HomePage!'
})


//后台管理系统
router.use('/admin',admin)

//
router.use('/api',api)

router.get('/socket',async ctx=>{

    let {title} = ctx.query
    io.emit('message',title)

    ctx.body = 'xxxxxxxxxxxxx'
})

router.get('/sendmsg',ctx=>{
    ctx.render('sendmsg')
})

/////////////////////////////////////////////////////

//配置路由
app
    .use(router.routes())
    .use(router.allowedMethods())

//监听服务器
server.listen(3030, () => {
    console.log('run at*3030')
})