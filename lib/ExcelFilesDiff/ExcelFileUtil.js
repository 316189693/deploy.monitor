let fs = require('fs');
const csvtojsonV2=require("csvtojson/v2");
let XLSX = require('xlsx');
let XLSX_Writer = require('xlsx-writestream');
let csvStringify = require("csv-stringify");
const path = require('path');
const excelSuffixs = ['.xls', '.csv', '.xlsx'];
const csvParse = require('csv-parse');
const tabDelimilter = "\t";

 class ExcelFileUtil {
    constructor() {
    }


     // 将文件夹下面的所有excel转化为json，子目录的不会， excel需要有共同的列名
     async  transferExcelFilesUnderFolderToJson(folderPath){
         let fileNames = await this.getExcelFileNameArrayUnderFolder(folderPath);
         if (!fileNames) {
             return [];
         }
         let rst = await this.transferExcelFilesIntojson(folderPath,fileNames);
         return rst;
     }

     // 将jsonary写入csv文件, hasHead等于true会输出excel列名
     async writeJsonToCSV(jsonAry, hasHead, absoluteFilePath){
         let headers = [];
         let lines = [];
         if (hasHead) {
             for( let key in jsonAry[0]) {
                 headers.push(key);
             }
             lines = jsonAry.map((line) => {
                 return Object.values(line);
         });
             lines.splice(0, 0, headers);
         } else {
             lines = jsonAry;
         }

         let rst = await this.writeCsv2File(absoluteFilePath, lines);
         if (rst == 0) {
             console.log("write json to csv error!")
             return 0;
         }
         return 1;
     }

    // only get first level files Excel name, subfolder will ignored
    getExcelFileNameArrayUnderFolder(folderPath) {
        return new Promise((resolve, reject) => {
            fs.readdir(folderPath, function (errs, files) {
                if (errs) {
                    console.log("getExcelFileNameArrayUnderFolder fail:");
                    console.log(errs);
                  resolve([]);
                }
                let excelFileNameAry = files.filter((f) => {
                    // filter folder
                    if (f.lastIndexOf(".") == -1) {
                        return false;
                    }
                    let fileSuffix = f.substring(f.lastIndexOf("."));
                    let findRst = excelSuffixs.find((excelSuffix) => {return excelSuffix == fileSuffix;});
                    return findRst;
                });
                resolve(excelFileNameAry);
            });
        });
    }

    async transferExcelFilesIntojson(folderPath, fileNames) {
        if (!fileNames || fileNames.length <= 0) {
            return [];
        }
        let rst = [];
        for (let i=0; i < fileNames.length; i++) {
            let json = await this.transferExcelFileIntoJson(path.join(folderPath, fileNames[i]));
            json.forEach((item)=>{rst.push(item);});
        }
        return rst;
    }

     transferExcelFileIntoJson(absoluteFilePath) {
         if(absoluteFilePath.lastIndexOf(".csv") != -1) {
             return  this.readCSVFileIntoJson(absoluteFilePath);
         }
         return  this.readXLSXOrXlsFileIntoJson(absoluteFilePath);
     }

     async readCSVFileIntoJson(absoluteFilePath){
         let delimiter = "";
         let skip = false;
         let ary = await csvtojsonV2({}).fromFile(absoluteFilePath).preRawData((fileline)=>{
             if(!skip) {
             let delimeters=[",", "|", "\t", ";", ":"];
             let count = 0;
             let rtn = ",";
             delimeters.forEach(function (delim) {
                 var delimCount = fileline.split(delim).length;
                 if (delimCount > count) {
                     rtn = delim;
                     count = delimCount;
                 }
             });

             delimiter = rtn;
             skip = true;
             }


             return fileline;

         });
         // 如果是制表符为分隔符的excel文件，默认当成从三星下载下来的， 在做一次处理， 不然生成的json是乱码
         if (delimiter == tabDelimilter){
             ary = await this.readCSVFileIntoJsonSplitByTab(absoluteFilePath);
         }
         return ary;
     }

    async readCSVFileIntoJsonSplitByTab(absoluteFilePath) {
         let data = fs.readFileSync(absoluteFilePath, 'ucs2');
         let ary = await this.parseCsv(data, tabDelimilter);
         if (ary.length <= 1) {
             return [];
         }
         let headers = ary[0];
         let res = ary.slice(1).map((line) => {
             let result = {};
         for (var i = 0; i < headers.length; i++) {
             result[headers[i]] = line[i];
         }
         return result;
     });
         return res;
     }

     parseCsv(data, delimiter) {
         return new Promise((resolve) => {
         csvParse(data, {delimiter: delimiter,relax:true, relax_column_count:true}, function(err, output) {
                  if (err) {
                      resolve([]);
                  } else {
                       resolve(output);
                  }
                 });
            });
     }

    readXLSXOrXlsFileIntoJson(absoluteFilePath) {
        return new Promise((resolve,reject) => {
            fs.readFile(absoluteFilePath, (errs, rst) => {
            if (errs){
                console.log("readXLSXOrXlsFileIntoJson fail:");
                console.log(errs);
                resolve([]);
            }
            resolve(this.PaseXlsx(rst));
            });
        });
    }

     PaseXlsx(data){
         let workbook = XLSX.read(data, {type:'buffer'});
         let sheet_name_list = workbook.SheetNames;
         let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
         return xlData;
     }

     writeCsv2File(absoluteFilePath, csvData){
         return new Promise((resolve) => {
             csvStringify(csvData, function(err, data){
                 if (err) {
                     resolve(0);
                 } else {
                     fs.writeFileSync(absoluteFilePath, data);
                     resolve(1);
                 }
             });
     });
     }
}

module.exports = ExcelFileUtil;

