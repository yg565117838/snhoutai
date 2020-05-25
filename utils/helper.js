const path = require('path'),
      fs = require('fs')



const helper = {
    host:'http://localhost:3030',
    upload: function (file,index=0,tag='') {
        let newFileName = new Date().getTime() + index

        let splitArr = file.name.split('.')
        let extension = splitArr[splitArr.length - 1]
        let newFullPath = 'statics/upload/' + newFileName + '.' + extension

        let readStream = fs.createReadStream(file.path)

        let writeStream = fs.createWriteStream(newFullPath)

        let res = readStream.pipe(writeStream)
        if(tag == 'multiple'){
            return newFileName+'.'+extension
        }else{
            if(res.path){
                global.uploadedFileName = newFileName+'.'+extension
        
                return 1
            }else{
                return 0
            }
        }
    }

}

module.exports = helper