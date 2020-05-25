const router = require('koa-router')(),
    msql = require('../lib/dbclass'),
    helper = require('../utils/helper'),
    path = require('path'),
    fs = require('fs')


router.get('/add', async ctx => {

    //获取一级分类
    let sql = `select id,c1name from sn_class1`
    let res = await msql.query(sql)

    ctx.render('product_add', { res })
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

//获取三级分类数据
router.get('/getclass3', async ctx => {
    let { c2id } = ctx.query

    let sql = `select id,c3name from sn_class3 where c2id=${c2id}`
    let res = await msql.query(sql)

    let option = '<option value="">请选择三级分类</option>'
    for (let i = 0; i < res.length; i++) {
        option += '<option value="' + res[i].id + '">' + res[i].c3name + '</option>'
    }
    ctx.body = option
})

router.post('/upload', ctx => {
    let file = ctx.request.files.file

    let res = helper.upload(file)

    ctx.body = res

})



//执行新增
router.post('/submint', async ctx => {
    let { class1, class2, class3, title, price, comment, desc } = ctx.request.body
    let dt = new Date().getTime()

    let fileData = ctx.request.files.photos


    if (class1 && class2 && class3 && title) {
        let sql = `insert into sn_product (c1id,c2id,c3id,title,price,comment,poster,descript,dt) values
         (${class1},${class2},${class3},'${title}',${price},'${comment}','${global.uploadedFileName}','${desc}',${dt})`
        let res = await msql.query(sql)

        if (res.affectedRows > 0) {
            global.uploadedFileName = ''

            ctx.body = 'success'
            let tmpArr = []
            let pid = res.insertId;
            for (let i = 0; i < fileData.length; i++) {
                let fname = helper.upload(fileData[i], i, 'multiple')
                tmpArr.push(fname)
            }

            if (tmpArr.length > 0) {
                let values = ''
                for (let j = 0; j < tmpArr.length; j++) {
                    values += `(${pid},'${tmpArr[j]}'),`
                }
                values = values.substring(0, values.length - 1)

                let sql2 = `insert into sn_productimg (pid,url) values ${values}`

                let res2 = await msql.query(sql2)
            }
        } else {
            ctx.body = 'fail'
        }
    } else {
        ctx.body = '缺少参数'
    }
})

//列表
router.get('/list', async ctx => {
    let sql = `select p.id,p.title,p.c1id,p.c2id,p.c3id,c1name,c2name,c3name,p.poster from sn_product as p left join sn_class3 as c3 on (p.c3id=c3.id) 
        left join sn_class2 as c2 on (p.c2id=c2.id) left join sn_class1 as c1 on (p.c1id=c1.id)`
    let res = await msql.query(sql)
    ctx.render('product_list', { res })
})


router.get('/del', async ctx => {
    let { id } = ctx.query

    if (id) {
        //删除图片
        let sql_img = `select url from sn_productimg where pid=${id}`
        let res_img = await msql.query(sql_img)
        if (res_img.length > 0) {
            for (let i = 0; i < res_img.length; i++) {
                let fileName = res_img[i].url
                let fullPath = path.join(__dirname.slice(0, -6), 'statics/upload/' + fileName)

                let isExist = fs.existsSync(fullPath)
                if (isExist) {
                    fs.unlinkSync(fullPath)
                }
            }
        }

        let sql_poster = `select poster from sn_product where id=${id} limit 1`
        let res_poster = await msql.query(sql_poster)
        if(res_poster[0].poster && res_poster[0].poster != ''){
            let poster = res_poster[0].poster
            let fullPathPoster = path.join(__dirname.slice(0, -6), 'statics/upload/' + poster)
            let isExistPoster = fs.existsSync(fullPathPoster)
            if (isExistPoster) {
                fs.unlinkSync(fullPathPoster)
            }
        }


        //删除数据
        let sql_data1 = `delete from sn_productimg where pid=${id}`
        let res1 = await msql.query(sql_data1)
        let sql_data2 = `delete from sn_product where id=${id}`
        let res2 = await msql.query(sql_data2)

        if (res2.affectedRows > 0) {
            ctx.body = 'success'
        } else {
            ctx.body = 'fail'
        }
    }else{
        ctx.body = 'fail'
    }
})


module.exports = router.routes()