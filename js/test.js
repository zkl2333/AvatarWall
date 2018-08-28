/**
 * 测试函数
 * @param  {} n 向页面插入测试信息的个数
 * @param  {} s 每次插入的间隔
 */
function test(n, s) {
	if (n != undefined && s != undefined) {
		var timesRun = 0
		// 产生数组并打乱
		// 测试图片
		var img = ['./img/1.jpg', './img/2.jpeg', './img/3.jpeg', './img/4.jpg', './img/5.jpg', './img/6.jpg', './img/7.jpg', './img/8.png']
		// 创建定时器，重复执行timesRun次，延时s
		var interval = setInterval(function () {
			console.log("添加", timesRun, "个")
			if (timesRun === n) {
				// 清除定时器
				clearInterval(interval)
				console.log("结束")
			}
			var src = img[Math.floor(Math.random() * img.length) % img.length]
			var ani = 'imgAnimation'
			// 插入图片
			wall.addImg(src, timesRun, imgXYarr[timesRun % imgXYarr.length].x, imgXYarr[timesRun % imgXYarr.length].y)
			timesRun += 1
		}, s)
	} else {
		console.log('缺少参数')
	}
	return this
}