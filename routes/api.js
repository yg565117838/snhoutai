const router = require('koa-router')(),
    msql = require('../lib/dbclass'),
    helper = require('../utils/helper'),
    path = require('path'),
    fs = require('fs'),
    addtoken = require('../token/addtoken')
    gettoken = require('../token/gettoken')

router.get('/getclass', async ctx => {
    let sql = `select id,c1name from sn_class1`
    let res = await msql.query(sql)
    ctx.body = res
})

router.get('/getclass23', async ctx => {

    let dataList = []

    let { id } = ctx.query
    let sql_class2 = `select id,c2name from sn_class2 where cid=${id}`
    let res_class2 = await msql.query(sql_class2)

    //遍历class2
    for (let i = 0; i < res_class2.length; i++) {
        let c2id = res_class2[i].id

        let c2name = res_class2[i].c2name

        let sql_class3 = `select id,c3name,poster from sn_class3 where c2id=${c2id}`
        let res_class3 = await msql.query(sql_class3)
        for(let j=0;j<res_class3.length;j++){
            res_class3[j].poster = helper.host + '/upload/' + res_class3[j].poster
        }
        dataList.push({ class2Title: c2name, class3: res_class3 })
    }

    ctx.body = dataList
})



router.get('/product', async ctx => {
    let { id } = ctx.query

    let sql = `select id,title,price,comment,poster from sn_product where c3id=${id}`
    let res = await msql.query(sql)
    for(let i=0;i<res.length;i++){
        res[i].poster = helper.host + '/upload/' + res[i].poster
    }
    ctx.body = res
})

router.get('/productlist', async ctx => {
    let { id } = ctx.query

    let sql = `select id,title,price,comment,poster,descript from sn_product where id=${id}`
    let res = await msql.query(sql)
    for(let i=0;i<res.length;i++){
        res[i].poster = helper.host + '/upload/' + res[i].poster
    }
    ctx.body = res
})

router.get('/productimg', async ctx => {
    let { id } = ctx.query

    let sql = `select id,url from sn_productimg where pid=${id}`
    let res = await msql.query(sql)
    for(let i=0;i<res.length;i++){
        res[i].url = helper.host + '/upload/' + res[i].url
    }
    ctx.body = res
})

//注册
router.post('/reg',async ctx=>{
    let {uname,pwd,tel} = ctx.request.body.params

    if(uname && pwd){
        let sql = `insert into sn_user (username,password,tel) values ('${uname}','${pwd}','${tel}')`
        let res = await msql.query(sql)
        if(res.affectedRows > 0){
            ctx.body = 'success'
        }else{
            ctx.body = 'fail'
        }
    }
})

router.post('/checklogin',async ctx=>{
    let {u,p} = ctx.request.body.params

    if(u && p){
        let sql = `select id from sn_user where username='${u}' and password='${p}'`
        let res = await msql.query(sql)
        if(res.length>0){
            //创建token
            let tk = addtoken({username:u,id:res[0].id})
            ctx.body = {
                tk,
                user:u,
                code:1,
                status:200
            }

        }else{
            ctx.body = {
                code:0,
                status:500
            }
        }
    }else {
        ctx.body = {
            code:0,
            status:550
        }
    }
})

router.get('/check',async ctx=>{
    //获取请求头
    let token = ctx.headers.token
    if(token.length >0){
        let res = gettoken(token)
        if(res && res.exp <= new Date().getTime()/1000){
            ctx.body = {
                msg:'失败,过期',
                code:0
            }
        }else{
            ctx.body = {
                msg:'失败,过期',
                code:1
            }
        }
    }else{
        ctx.body = {
            msg:'失败，无token',
            code:0
        }
    }
})

router.get('/search', async ctx=>{
    //接受搜索值
    let {keywords} = ctx.query
    let sql = `select id,title from sn_product where title like '%${keywords}%'`
    let res = await msql.query(sql)
    ctx.body = res
})


module.exports = router.routes()