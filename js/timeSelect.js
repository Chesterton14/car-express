let timeselect = (points, Begin, End) => {

    Begin =Begin.replace('/','-');
    Begin =Begin.replace('/','-');
    End =End.replace('/','-');
    End =End.replace('/','-');
    //console.log(points, Begin, End)
    var dateBegin = Begin;
    var dateEnd = End;
    //从原始数组中查询符合条件的坐标点。
    var pointsLen = points.length;
    var searchRes = []; //用来装符合条件的坐标信息。

    //满足条件的放上去。
    for (var i = 0; i < pointsLen; i++) {
        if (dateDiff(points[i].time, dateBegin) > 0 && dateDiff(points[i].time, dateEnd) < 0) {
            searchRes.push(points[i]);
        }
    }
    Array.prototype.unique = function(key) {
        var arr = this;
        var n = [arr[0]];
        for (var i = 1; i < arr.length; i++) {
            if (key === undefined) {
                if (n.indexOf(arr[i]) == -1) n.push(arr[i]);
            } else {
                inner: {
                    var has = false;
                    for (var j = 0; j < n.length; j++) {
                        if (arr[i][key] == n[j][key]) {
                            has = true;
                            break inner;
                        }
                    }
                }
                if (!has) {
                    n.push(arr[i]);
                }
            }
        }
        return n;
    }
    return searchRes.unique('lat');
    //求时间差的方法
    function dateDiff(date1, date2) {
        var type1 = typeof date1,
            type2 = typeof date2;
        if (type1 == 'string')
            date1 = stringToTime(date1);
        else if (date1.getTime)
            date1 = date1.getTime();
        if (type2 == 'string')
            date2 = stringToTime(date2);
        else if (date2.getTime)
            date2 = date2.getTime();
        return (date1 - date2) / 1000; //结果是秒
    }

    //字符串转成Time(dateDiff)所需方法
    function stringToTime(string) {
        var f = string.split(' ', 2);
        var d = (f[0] ? f[0] : '').split('-', 3);
        var t = (f[1] ? f[1] : '').split(':', 3);
        return (new Date(
            parseInt(d[0], 10) || null,
            (parseInt(d[1], 10) || 1) - 1,
            parseInt(d[2], 10) || null,
            parseInt(t[0], 10) || null,
            parseInt(t[1], 10) || null,
            parseInt(t[2], 10) || null
        )).getTime();
    }

}
module.exports=timeselect
