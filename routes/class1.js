const router = require('koa-router')(),
    msql = require('../lib/dbclass')

router.get('/add', ctx => {
    ctx.render('class1_add')
})

//执行新增
router.get('/addDo', async ctx => {
    let { title } = ctx.query

    if (title) {
        let sql = `insert into sn_class1 (c1name) values ('${title}')`
        let res = await msql.query(sql)

        if (res.affectedRows > 0) {
            ctx.body = 'success'
        } else {
            ctx.body = 'fail'
        }
    } else {
        ctx.body = '缺少参数'
    }
})
//列表
router.get('/list', async ctx => {
    let sql = `select id,c1name from sn_class1`
    let res = await msql.query(sql)

    ctx.render('class1_list', { res })
})

router.get('/del', async ctx => {
    let {id} = ctx.query

    if (id) {

        let sql_child = `select id from sn_class2 where cid=${id}`
        let res_child = await msql.query(sql_child)
        if(res_child.length == 0){

            let sql = `delete from sn_class1 where id=${id}`
            let res = await msql.query(sql)
            if (res.affectedRows > 0) {
                ctx.body = 'success'
            } else {
                ctx.body = 'fail'
            }
        }else{
            ctx.body = 'fail2'
        }

    }else{
        ctx.body = 'fail'
    }
})

module.exports = router.routes()