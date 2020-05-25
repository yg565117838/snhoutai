const router = require('koa-router')(),
       msql = require('../lib/dbclass'),
       sha1 = require('sha1'),
       class1 = require('./class1'),
       class2 = require('./class2'),
       class3 = require('./class3'),
       product = require('./product')

//守卫
router.use(async(ctx,next)=>{

    //正则表达式
    let rexg = /^[a-z]{5}$/

    if(ctx.url.includes('login') || ctx.url.includes('loginDO')){
        await next()
    }else{
        if(!rexg.test(ctx.session.admin)){
            ctx.redirect('admin/login')
        }else{
            await next()
        }
    }
})

router.get('/',ctx=>{
    ctx.render('admin',{uname:ctx.session.admin})
})

router.get('/login',ctx=>{
    ctx.render('login')
})

router.post('/loginDo',async ctx=>{
    let {username,pwd} = ctx.request.body

    let password = sha1(sha1(pwd)).substring(3,30)

    let sql = `select username from sn_admin where username='${username}' and pwd='${password}'`
    let res = await msql.query(sql)


    if(res.length>0){
        ctx.session.admin = username
        ctx.redirect('/admin')
    }else{
        ctx.body = '登录失败'
    }

})

//退出
router.get('/exit',ctx=>{
    ctx.session.admin = ''

    ctx.redirect('/admin/login')
})
//一级分类管理
router.use('/class1',class1)

//2级分类管理
router.use('/class2',class2)

//3级分类管理
router.use('/class3',class3)

//产品管理
router.use('/product',product)

//404
router.get('*',ctx=>{
    ctx.body = '页面不存在'
})
module.exports = router.routes()