const router = require('koa-router')(),
    msql = require('../lib/dbclass'),
    helper = require('../utils/helper'),
    path = require('path'),
    fs = require('fs')

router.get('/add', async ctx => {

    let sql = `select id,c1name from sn_class1`
    let res = await msql.query(sql)

    ctx.render('class3_add', { res })
})

//执行新增
router.get('/addDo', async ctx => {
    let { c1id, c2id, title } = ctx.query
    if (title && c1id && c2id) {
        let sql = `insert into sn_class3 (c1id,c2id,c3name,poster) values (${c1id},${c2id},'${title}','${global.uploadedFileName}')`
        let res = await msql.query(sql)

        if (res.affectedRows > 0) {
            global.uploadedFileName = ''
            ctx.body = 'success'
        } else {
            ctx.body = 'fail'
        }
    } else {
        ctx.body = '缺少参数'
    }
})

router.post('/upload', ctx => {
    let file = ctx.request.files.file

    let res = helper.upload(file)

    ctx.body = res

})

//获取二级分类数据
router.get('/getclass2', async ctx => {
    let { c1id } = ctx.query

    let sql = `select id,c2name from sn_class2 where cid=${c1id}`
    let res = await msql.query(sql)

    let option = '<option value="">请选择二级分类</option>'
    for (let i = 0; i < res.length; i++) {
        option += '<option value="' + res[i].id + '">' + res[i].c2name + '</option>'
    }

    ctx.body = option
})


//列表
router.get('/list', async ctx => {
    let sql = `select c3.id,c1id,c2id,c1name,c2name,c3name,poster from sn_class3 as c3,sn_class2 as c2,sn_class1 as c1 where c3.c2id=c2.id and c3.c1id=c1.id`
    let res = await msql.query(sql)
    ctx.render('class3_list', { res })
})

router.get('/del', async ctx => {
    let { id } = ctx.query


    if (id) {

        let sql_child = `select id from sn_product where c3id=${id}`
        let res_child = await msql.query(sql_child)
        if(res_child.length == 0){
            //删除图片
            let sql_poster = `select poster from sn_class3 where id=${id} limit 1`
            let res_poster = await msql.query(sql_poster)
            if (res_poster[0].poster && res_poster[0].poster != '') {
                let poster = res_poster[0].poster
                console.log(poster)
                let fullPathPoster = path.join(__dirname.slice(0, -6), 'statics/upload/' + poster)
                let isExistPoster = fs.existsSync(fullPathPoster)
                if (isExistPoster) {
                    fs.unlinkSync(fullPathPoster)
                }
            }
            let sql = `delete from sn_class3 where id=${id}`
            let res = await msql.query(sql)
            if (res.affectedRows > 0) {
                ctx.body = 'success'
            } else {
                ctx.body = 'fail'
            }
        }else{
            ctx.body = 'fail2'
        }
    } else {
        ctx.body = 'fail'
    }
})

module.exports = router.routes()