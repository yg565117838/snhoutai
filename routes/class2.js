const router = require('koa-router')(),
    msql = require('../lib/dbclass')

router.get('/add', async ctx => {

    let sql = `select id,c1name from sn_class1`
    let res = await msql.query(sql)
    ctx.render('class2_add',{res})
})

//执行新增
router.get('/addDo', async ctx => {
    let { title,c1id } = ctx.query

    if (title && c1id) {
        let sql = `insert into sn_class2 (c2name,cid) values ('${title}',${c1id})`
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
    let sql = `select c2.id,cid,c1name,c2name from sn_class2 as c2 left join sn_class1 as c1 on (c2.cid=c1.id)`
    let res = await msql.query(sql)

    ctx.render('class2_list', { res })
})

router.get('/del', async ctx => {
    let {id} = ctx.query

    if (id) {

        let sql_child = `select id from sn_class3 where c2id=${id}`
        let res_child = await msql.query(sql_child)
        if(res_child.length == 0){

            let sql = `delete from sn_class2 where id=${id}`
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